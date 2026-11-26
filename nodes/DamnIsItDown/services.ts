import type {
	ILoadOptionsFunctions,
	INodeListSearchResult,
	INodePropertyOptions,
} from 'n8n-workflow';

export const BASE = 'https://damnisitdown.com';

type ServiceRow = { id?: string; slug?: string; name?: string };

type ServicesResponse = {
	any?: { id?: string; name?: string };
	services?: ServiceRow[];
};

/** Accept both a resourceLocator value and a pre-0.1.3 string. */
export function serviceSlug(param: unknown): string {
	if (typeof param === 'string') return param.trim().toLowerCase();
	if (param && typeof param === 'object' && 'value' in (param as object)) {
		const value = (param as { value?: unknown }).value;
		if (typeof value === 'string') return value.trim().toLowerCase();
	}
	return '';
}

function optionFor(s: ServiceRow): INodePropertyOptions {
	const slug = s.slug || s.id || '';
	return { name: s.name || slug, value: slug };
}

async function fetchServices(ctx: ILoadOptionsFunctions): Promise<ServicesResponse | null> {
	try {
		const creds = await ctx.getCredentials('damnIsItDownApi').catch(() => null);
		if (!creds) return null;
		return (await ctx.helpers.httpRequestWithAuthentication.call(ctx, 'damnIsItDownApi', {
			method: 'GET',
			url: `${BASE}/api/v1/integrations/services`,
			json: true,
		})) as ServicesResponse;
	} catch {
		// Missing credential (editor race) or a failed request: show an empty
		// list instead of "Error fetching options".
		return null;
	}
}

export async function getServiceOptions(
	this: ILoadOptionsFunctions,
	includeAny: boolean,
): Promise<INodePropertyOptions[]> {
	const data = await fetchServices(this);
	if (!data) return [];
	const rest = (data.services || []).map(optionFor);
	if (!includeAny) return rest;
	const any = {
		name: (data.any && data.any.name) || 'Any service we track',
		value: (data.any && data.any.id) || '*',
	};
	return [any, ...rest];
}

export async function searchServices(
	this: ILoadOptionsFunctions,
	filter: string | undefined,
	includeAny: boolean,
): Promise<INodeListSearchResult> {
	const options = await getServiceOptions.call(this, includeAny);
	const q = (filter || '').trim().toLowerCase();
	const results = (
		q
			? options.filter(
					(s) =>
						s.name.toLowerCase().includes(q) || String(s.value).toLowerCase().includes(q),
				)
			: options
	).map((s) => ({ name: s.name, value: String(s.value) }));
	return { results };
}

export const serviceLocator = (includeAny: boolean, defaultValue: string) => ({
	displayName: 'Service',
	name: 'service',
	type: 'resourceLocator' as const,
	default: { mode: 'list', value: defaultValue },
	required: true,
	description: includeAny
		? 'Pick a service from the list, choose Any service we track, or enter a slug like github'
		: 'Pick a service from the list, or enter a slug like github',
	modes: [
		{
			displayName: 'From List',
			name: 'list',
			type: 'list' as const,
			placeholder: 'Select a service',
			typeOptions: {
				searchListMethod: includeAny ? 'searchServicesIncludingAny' : 'searchServices',
				searchable: true,
			},
		},
		{
			displayName: 'Slug',
			name: 'slug',
			type: 'string' as const,
			placeholder: 'github',
		},
	],
});
