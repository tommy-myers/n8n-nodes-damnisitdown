import type {
	IHookFunctions,
	JsonObject,
	ILoadOptionsFunctions,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData,
} from 'n8n-workflow';
import { NodeApiError, NodeConnectionTypes } from 'n8n-workflow';

const BASE = 'https://damnisitdown.com';

export class DamnIsItDownTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Damn Is It Down Trigger',
		name: 'damnIsItDownTrigger',
		icon: {
			light: 'file:../../icons/damnisitdown.svg',
			dark: 'file:../../icons/damnisitdown.dark.svg',
		},
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description: 'Starts a workflow when Damn Is It Down confirms an outage or a recovery',
		defaults: { name: 'Damn Is It Down Trigger' },
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'damnIsItDownApi', required: true }],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				options: [
					{
						name: 'Service Goes Down (Confirmed)',
						value: 'down',
						description: 'When our checks confirm an outage',
					},
					{
						name: 'Service Recovers',
						value: 'recovered',
						description: 'When a confirmed outage recovers',
					},
				],
				default: 'down',
				required: true,
				description: 'Which alert should start the workflow. Early warnings are not sent.',
			},
			{
				displayName: 'Service Name or ID',
				name: 'service',
				type: 'options',
				typeOptions: { loadOptionsMethod: 'getServices' },
				default: '*',
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
				)) as {
					any?: { id?: string; name?: string };
					services?: Array<{ id?: string; slug?: string; name?: string }>;
				};
				const any = {
					name: (data.any && data.any.name) || 'Any service we track',
					value: (data.any && data.any.id) || '*',
				};
				const rest = (data.services || []).map((s) => ({
					name: s.name || s.slug || '',
					value: s.id || s.slug || '',
				}));
				return [any, ...rest];
			},
		},
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const data = this.getWorkflowStaticData('node');
				return typeof data.webhookId === 'string' && data.webhookId.length > 0;
			},
			async create(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');
				const event = this.getNodeParameter('event') as string;
				const service = this.getNodeParameter('service') as string;
				const response = (await this.helpers.httpRequestWithAuthentication.call(
					this,
					'damnIsItDownApi',
					{
						method: 'POST',
						url: `${BASE}/api/v1/integrations/hooks`,
						body: { platform: 'n8n', event, hook_url: webhookUrl, service },
						json: true,
					},
				)) as { id?: string };
				if (!response.id) return false;
				const data = this.getWorkflowStaticData('node');
				data.webhookId = response.id;
				return true;
			},
			async delete(this: IHookFunctions): Promise<boolean> {
				const data = this.getWorkflowStaticData('node');
				const id = data.webhookId;
				if (typeof id !== 'string' || !id) return true;
				try {
					await this.helpers.httpRequestWithAuthentication.call(this, 'damnIsItDownApi', {
						method: 'DELETE',
						url: `${BASE}/api/v1/integrations/hooks/${encodeURIComponent(id)}`,
						json: true,
					});
				} catch (error) {
					// A hook we already removed (404) is fine; anything else should surface.
					const status = (error as { httpCode?: string; statusCode?: number }) || {};
					if (String(status.httpCode ?? status.statusCode ?? '') !== '404') {
						throw new NodeApiError(this.getNode(), error as JsonObject);
					}
				}
				delete data.webhookId;
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const body = this.getBodyData();
		return { workflowData: [this.helpers.returnJsonArray(body)] };
	}
}
