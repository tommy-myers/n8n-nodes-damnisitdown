import type {
	IDataObject,
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

const BASE = 'https://damnisitdown.com';

export class DamnIsItDown implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Damn Is It Down',
		name: 'damnIsItDown',
		icon: {
			light: 'file:../../icons/damnisitdown.svg',
			dark: 'file:../../icons/damnisitdown.dark.svg',
		},
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["service"]}}',
		description: 'Check the live status of a service on Damn Is It Down',
		defaults: { name: 'Damn Is It Down' },
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [{ name: 'damnIsItDownApi', required: true }],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Check Status',
						value: 'checkStatus',
						action: 'Check a service status',
						description: 'Look up the live status of a service',
					},
				],
				default: 'checkStatus',
			},
			{
				displayName: 'Service Name or ID',
				name: 'service',
				type: 'options',
				typeOptions: { loadOptionsMethod: 'getServices' },
				default: '',
				required: true,
				description:
					'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
			},
		],
	};

	methods = {
		loadOptions: {
			async getServices(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const data = (await this.helpers.httpRequestWithAuthentication.call(
					this,
					'damnIsItDownApi',
					{
						method: 'GET',
						url: `${BASE}/api/v1/integrations/services`,
						json: true,
					},
				)) as { services?: Array<{ id?: string; slug?: string; name?: string }> };
				return (data.services || []).map((s) => ({
					name: s.name || s.slug || '',
					value: s.id || s.slug || '',
				}));
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const out: INodeExecutionData[] = [];
		for (let i = 0; i < items.length; i++) {
			const service = (this.getNodeParameter('service', i) as string).trim().toLowerCase();
			if (!service || service === '*') {
				throw new NodeOperationError(this.getNode(), 'Pick one service to check.', {
					itemIndex: i,
				});
			}
			try {
				const data = (await this.helpers.httpRequestWithAuthentication.call(
					this,
					'damnIsItDownApi',
					{
						method: 'GET',
						url: `${BASE}/api/v1/status/${encodeURIComponent(service)}`,
						json: true,
					},
				)) as IDataObject;
				out.push({ json: data, pairedItem: { item: i } });
			} catch (error) {
				if (this.continueOnFail()) {
					out.push({ json: { error: (error as Error).message }, pairedItem: { item: i } });
					continue;
				}
				throw new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });
			}
		}
		return [out];
	}
}
