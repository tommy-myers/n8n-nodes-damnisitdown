import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class DamnIsItDownApi implements ICredentialType {
	name = 'damnIsItDownApi';

	displayName = 'Damn Is It Down API';

	icon: Icon = {
		light: 'file:../icons/damnisitdown.svg',
		dark: 'file:../icons/damnisitdown.dark.svg',
	};

	documentationUrl = 'https://damnisitdown.com/integrations';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description:
				'A Damn Is It Down API key (free keys work). Create one at https://damnisitdown.com/api.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
				'X-API-Key': '={{$credentials.apiKey}}',
				'X-DIID-Client': 'n8n',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://damnisitdown.com',
			url: '/api/v1/integrations/me',
			method: 'GET',
		},
	};
}
