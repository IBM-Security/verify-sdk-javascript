import { ISDKConfig } from './helpers';

const AppConfig: ISDKConfig =  {
	DEFAULT_CLOCK_SKEW : 300,
	HTTP_ERROR : 'Http Error',
	OAUTH_CONTEXT_CONFIG_SETTINGS_ERROR : 'OAuthContext Configuration Error',
	OAUTH_CONTEXT_API_ERROR : 'OAuthContext API Error',
	AUTHENTICATOR_CONTEXT_ERROR : 'AuthenticatorContext Error',
	TOKEN_ERROR : 'Token Error',
	DEFAULT_POLLING_ATTEMPTS: 60,
	DEFAULT_POLLING_DELAY: 2000
};

export {
	AppConfig
};
