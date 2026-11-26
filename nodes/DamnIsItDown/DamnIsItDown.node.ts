import type {
	IDataObject,
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodeListSearchResult,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import { BASE, searchServices, serviceLocator, serviceSlug } from './services';

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
		subtitle: '={{$parameter["operation"] + ": " + ($parameter["service"].value || $parameter["service"])}}',
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
			serviceLocator(false, ''),
		],
	};

	methods = {
		listSearch: {
			async searchServices(
				this: ILoadOptionsFunctions,
				filter?: string,
			): Promise<INodeListSearchResult> {
				return await searchServices.call(this, filter, false);
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const out: INodeExecutionData[] = [];
		for (let i = 0; i < items.length; i++) {
			const service = serviceSlug(this.getNodeParameter('service', i));
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
