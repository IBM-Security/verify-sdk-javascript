import qs from 'query-string';
import {
	VerifyError,
	AbstractMethodNotImplementedError,
	InvalidOAuthConfigurationError,
	NotAvailableError,
	DeveloperError
} from './errors/Errors';
import StorageHandler from './helpers/StorageHandler';
import {
	AppConfig
} from './config';
import apiRequest from './helpers/apiRequest';
import utils from './helpers/utils';
import { EFlowTypes, EGrantTypes, EMethods, ETokens } from './helpers/enums';
import { IApiRequest, IDeviceFlow, IError, IOAuthConfig, IRequestData, IResponse, IROPCFlow, IToken, ITokenProps } from './helpers';
/**
 * @class OAuthContext
 * Uses Factory pattern to create the appropriate class instance based on the flowType
 */
class OAuthContext {
	constructor(config: IOAuthConfig) {
		if (!config) {
			throw new InvalidOAuthConfigurationError('Config parameter is required');
		}
		if (!config.flowType) {
			throw new InvalidOAuthConfigurationError('flowType property is required in config settings');
		}
		if (!config.clientId) {
			throw new InvalidOAuthConfigurationError('clientId property is required in config settings');
		}
		if (!(config.tenantUrl && utils.isUrl(config.tenantUrl))) {
			throw new InvalidOAuthConfigurationError('a valid tenantUrl property is required in config settings');
		}
		if (!config.scope) {
			throw new InvalidOAuthConfigurationError('scope property is required in config settings');
		}
		// if (!config.responseType) {
		// 	throw new InvalidOAuthConfigurationError('responseType property is required in config settings');
		// }
		switch (config.flowType) {
		case EFlowTypes.ImplicitFlow:
			return new ImplicitFlow(config);
		case EFlowTypes.AuthoriztionCodeFlow:
			return new AuthorizationCodeFlow(config);
		case EFlowTypes.DeviceFlow:
			return new DeviceFlow(config);
		case EFlowTypes.ROPCFlow:
			return new ROPCFlow(config);
		default:
			const flowTypes = Object.values(EFlowTypes).map((value) => ` "${value}"`);
			throw new InvalidOAuthConfigurationError(`"${config.flowType}" flowType not valid. Valid flow types are: ${flowTypes}`);
		}
	}
}

/**
 * @abstract
 * @class FlowAbstract
 * An abstract class that defines an OAuthFlow and the operations
 */
class FlowAbstract {
	config: IOAuthConfig;
	constructor(config: IOAuthConfig) {
		// cannot instantiate abstract class
		if (new.target === FlowAbstract) {
			throw new TypeError('Cannot instantiate FlowAbstract directly');
		}
		this.config = config;
	}

	/**
	 * @abstract
	 * @function isValidConfig Validates the config of an OAuthContext instance
	 * @returns {boolean} Boolean indicating whether the config is valid
	 * Abstract parent method throws AbstractMethodNotImplementedError()
	 */
	isValidConfig(): AbstractMethodNotImplementedError | InvalidOAuthConfigurationError | boolean {
		throw new AbstractMethodNotImplementedError();
	}

	/**
	 * @function logout Revokes a user's current access token
	 * @param {string} path path
	 * @param {object} token The token to be revoked containing access_token, refresh_token ...
	 * @returns {Promise<object>} Response object from revoking the token
	 */
	logout(path: string, token: IToken): Promise<any> {
		// path and token supplied
		if (arguments.length === 2 && !this.isToken(token)) {
			return Promise.reject(new VerifyError(AppConfig.TOKEN_ERROR, 'Token parameter is not a valid token'));
		}
		// no path but a 'token' provided
		if (arguments.length === 1 && !this.isToken(path)) {
			return Promise.reject(new VerifyError(AppConfig.TOKEN_ERROR, 'Token parameter is not a valid token'));
		}

		try {
			return this.revokeToken(token, ETokens.AccessToken);
		} catch (error) {
			return Promise.reject(error);
		}
	}

	/**
	 * @function getConfig Gets the config of the current OAuthContext instance
	 * @returns {object} The config object containing clientId, redirectUri, flowType, ...
	 */

	getConfig(): IOAuthConfig {
		return this.config;
	}

	/**
	 * @function isAuthenticated Checks whether a token is still valid
	 * @param {object} token The token to be checked for active status containing access_token, refresh_token ...
	 * @returns {Promise<boolean>} Boolean indicating whether the token is active
	 */
	async isAuthenticated(token: IToken): Promise<boolean> {
		try {
			const payload = await this.introspectToken(token);
			return this.config.flowType === EFlowTypes.ImplicitFlow ? payload.active : payload.response.active;
		} catch (error) {
			return Promise.reject(error);
		}
	}

	/**
	 * @function introspectToken Introspects a token for more information
	 * @param {object} token The token to be inspected containing access_token, refresh_token ...
	 * @returns {Promise<object>} Response object with information about the supplied token
	 */
	introspectToken(token: IToken) {
		if (!this.isToken(token)) {
			return Promise.reject(new VerifyError(AppConfig.TOKEN_ERROR, 'Token parameter is not a valid token'));
		}

		const path: string = `${this.config.tenantUrl}/v1.0/endpoint/default/introspect`;

		const data = {
			client_id: this.config.clientId,
			client_secret: this.config.clientSecret,
			token: token.access_token
		} as IRequestData;

		const encodedData: string = qs.stringify(data);

		const options: IApiRequest = {
			method: EMethods.POST,
			url: path,
			contentType: 'application/x-www-form-urlencoded',
			data: encodedData
		};

		return this.handleResponse(options, token);
	}

	/**
	 * @function userInfo Retrieves user information associated with the given token
	 * @param {object} token The associated token to inspect the user information of containing access_token, refresh_token ...
	 * @returns {Promise<object>} Response object with information about the user of the supplied token
	 */
	userInfo(token: IToken): Promise<any> {
		if (!this.isToken(token)){
			return Promise.reject(new VerifyError(AppConfig.TOKEN_ERROR, 'Token parameter is not a valid token'));
		}

		const path: string = `${this.config.tenantUrl}/v1.0/endpoint/default/userinfo`;

		const options: IApiRequest = {
			method: EMethods.POST,
			url: path,
			contentType: 'application/x-www-form-urlencoded',
			data: qs.stringify({
				access_token: token.access_token
			})
		};

		return this.handleResponse(options, token);
	}

	/**
	 * @function isToken Validates a token
	 * @param {object} token The token to check containing access_token, refresh_token ...
	 * @returns {boolean} Boolean indicating whether the token is valid
	 */
	isToken(token: any ): boolean {
		return !(!token || !token.access_token);
	}

	/**
	 * @function revokeToken Revokes a token
	 * @param {object} token The token to be revoked containing access_token, refresh_token ...
	 * @param {string} tokenType The type of token - 'access_token' or 'refresh_token'
	 * @returns {Promise<object>} Response object from revoking the token
	 */
	revokeToken(token: IToken, tokenType: string) {
		const path: string = `${this.config.tenantUrl}/v1.0/endpoint/default/revoke`;

		if (arguments.length < 2) {
			throw new VerifyError(AppConfig.OAUTH_CONTEXT_API_ERROR, 'revokeToken(token, tokenType), 2 parameters are required ' + arguments.length + ' were given');
		}

		if (!token) {
			throw new VerifyError(AppConfig.OAUTH_CONTEXT_API_ERROR, 'token cannot be null');
		}

		if (!(tokenType === ETokens.AccessToken || tokenType === ETokens.RefreshToken)) {
			throw new VerifyError(AppConfig.OAUTH_CONTEXT_API_ERROR, `Parameter: ${tokenType} is invalid.\n Supported values are "access_token" or "refresh_token`);
		}

		const expireToken: string = tokenType === ETokens.AccessToken ? token.access_token : token.refresh_token;

		const data = {
			client_id: this.config.clientId,
			client_secret: this.config.clientSecret,
			token: expireToken
		} as IRequestData;

		const encodedData: string = qs.stringify(data);

		const options: IApiRequest = {
			method: EMethods.POST,
			contentType: 'application/x-www-form-urlencoded',
			url: path,
			data: encodedData
		};

		// token is not required, but handleResponse will throw error without it
		return this.handleResponse(options, token);
	}

	/**
	 * @function parseUrlHash Parses a url hash string into an object
	 * @param {string} hash The hash to be parsed
	 * @returns {object} The object representation of the hash string
	 */
	_parseUrlHash(hash: string): {[key: string]: string} {
		return qs.parse(hash);
	}

	/**
	 * @function getToken Makes an api request to the ISV Authorization server
	 * to retrieve access_token, refresh_token, grant_id... used for NodeJS applications that can
	 * store secure credentials
	 * @param {object} params Required data and url path to token EP to retrieve a OAuth 2.0 Bearer Token.
	 * @returns {Promise<object>} Response object containing access token
	 */
	getToken(params: any) {
		const {
			data,
			path
		} = params;
		if (!((data && typeof data === 'object' && data.constructor === Object) || ((data && typeof data === 'string' && data.includes('?'))))) {
			throw new VerifyError(AppConfig.OAUTH_CONTEXT_API_ERROR, 'getToken(params), Params must contain data object or query string');
		}

		data.client_id = this.config.clientId;
		data.client_secret = this.config.clientSecret;
		data.scope = this.config.scope;

		let encodedData: string = qs.stringify(data);

		let options: IApiRequest = {
			method: EMethods.POST,
			url: path,
			contentType: 'application/x-www-form-urlencoded',
			data: encodedData
		};

		return apiRequest(options);
	}

	/**
	 * @abstract
	 * @function refreshToken Refreshes a token if it has expired
	 * @param {object} token The token object to be refreshed containing access_token, refresh_token ...
	 * @returns {Promise<object|void>} Response object from refreshing the token
	 */
	refreshToken(token: IToken): Promise<any> | void  | NotAvailableError {
		if (!token.hasOwnProperty(ETokens.RefreshToken)) {
			return Promise.reject(new VerifyError(AppConfig.OAUTH_CONTEXT_API_ERROR, 'token has no refresh_token property'));
		}

		const path = `${this.config.tenantUrl}/v1.0/endpoint/default/token`;
		const data: IRequestData = {
			refresh_token: token.refresh_token,
			client_id: this.config.clientId,
			client_secret: this.config.clientSecret,
			grant_type: ETokens.RefreshToken,
			scope: this.config.scope
		};

		const encodedData: string = qs.stringify(data);

		const options: IApiRequest = {
			method: EMethods.POST,
			url: path,
			contentType: 'application/x-www-form-urlencoded',
			data: encodedData
		};

		return apiRequest(options);
	}

	/**
	 * @function authorize Builds authorization URL using provided config
	 * @param {object} options Config object with clientId, redirectUri, scope and responseType to authorize against
	 * @returns {string} Authorization URL
	 */
	_authorize(options: IOAuthConfig) {
		return this._buildUrl(options);
	}

	/**
	 * @function buildUrl Constructs authorization URL given provided options
	 * @param {object} options Config object with clientId, redirectUri, scope and responseType
	 * @returns {string} Authorization URL
	 */
	_buildUrl(options: IOAuthConfig) {
		return (
			options.tenantUrl +
				'/oidc/endpoint/default/authorize?' +
				qs.stringify({
					client_id: options.clientId,
					redirect_uri: options.redirectUri,
					scope: options.scope,
					response_type: options.responseType,
					state: utils.randomString(16),
					nonce: utils.randomString(16)
				})
		);
	}

	/**
	 * @function handleResponse Makes a request and refreshes token if token is expired
	 * @param {object} options Request object containing url path, method, responseType, accept, data to make a valid apiRequest
	 * @param {object} tokenObj Token object containing access_token, refresh_token ... used to make the request
	 * @returns {object} Response object from the request
	 */
	async handleResponse(options: IApiRequest, tokenObj: IToken): Promise<any> {
		if (arguments.length < 2) {
			return Promise.reject(new VerifyError(AppConfig.OAUTH_CONTEXT_API_ERROR, 'handleResponse(options, token), 2 parameters are required ' + arguments.length + ' were given'));
		}
		if (!this.isToken(tokenObj)) {
			return Promise.reject(new VerifyError(AppConfig.TOKEN_ERROR, 'Token parameter is not a valid token'));
		}

		const token: IToken = tokenObj;
		// Define empty payload object
		let payload = {
			response: null,
			token: {} as IToken
		} as IResponse;

		try {
			const response: Promise<any> = await apiRequest(options, token.access_token);
			payload.response = response;
			if (this.config.flowType === EFlowTypes.ImplicitFlow) {
				return Promise.resolve(response);
			}
			return Promise.resolve(payload);
		} catch (error: any) {
			if (error.status === 401 && utils.isNode()) {
				// validate 'token' has refresh_token
				if (!token.refresh_token) {
					return Promise.reject(new VerifyError(AppConfig.OAUTH_CONTEXT_API_ERROR, 'access_token expired and refresh_token not found'));
				}
				let newToken = await this.refreshToken(token);
				let originalRequest = await apiRequest(options, newToken.access_token);
				payload = {
					response: originalRequest,
					token: newToken
				};
				return Promise.resolve(payload);
			}
			return Promise.reject(error);
		}
	}
}

/**
 * @class ImplicitFlow
 */
class ImplicitFlow extends FlowAbstract {
	storageHandler: any;
	session: boolean;
	constructor(config: IOAuthConfig) {
		super(config);
		this.isValidConfig();
		this.session = false;
		this.storageHandler = StorageHandler(config.storageType as Storage) as any;
	}

	/**
	 * @function isValidConfig Validates the config of an ImplicitFlow instance
	 * @returns {boolean} Boolean indicating whether the config is valid
	 * Throws error if no storageType in config or instantiating ImplicitFlow in NodeJS
	 */
	isValidConfig(): InvalidOAuthConfigurationError | boolean {
		if (utils.isNode()) {
			throw new InvalidOAuthConfigurationError('Implicit flow is not supported in Node');
		}
		if (!this.config.storageType) {
			throw new InvalidOAuthConfigurationError('storageType property is required in config settings for Implicit flow');
		}
		if (!(this.config.redirectUri && utils.isUrl(this.config.redirectUri))) {
			throw new InvalidOAuthConfigurationError('a valid redirectUri property is required in config settings');
		}
		return true;
	}

	/**
	 * @function refreshToken Refreshes the token if it has expired
	 * @param {object} token The token object containing access_token, refresh_token ...
	 * @returns {Promise<void>} Throws NotAvailableError() as refresh_token is not available in Implicit Flow
	 */
	refreshToken(): NotAvailableError {
		throw new NotAvailableError();
	}

	/**
	 * @function fetchToken Retrieves the token object from storage
	 * @returns {object|void} Token object found in storage or throws error
	 */
	fetchToken() {
		try {
			return JSON.parse(this.storageHandler.getStorage('token'));
		} catch (error) {
			return error;
		}
	}

	/**
	 * @function setSession Sets the session expiration according to the expiration of the stored token
	 * The token will be cleared from storage once it expires and the session will end.
	 * @returns {void}
	 */
	_setSession() {
		const expiresAt = JSON.parse(this.storageHandler.getStorage('token')).expires_in;
		const clockSkew: number = AppConfig.DEFAULT_CLOCK_SKEW;
		// const clockSkew: number = 10;
		const delay: number = expiresAt - (Date.now() - clockSkew);

		if (delay > 0) {
			setTimeout(() => {
				this.session = false;
				this.storageHandler.clearStorage();
			}, delay);
		}
	}

	/**
	 * @function login Builds a login URL to authorize against using the instance's config
	 * @returns {string} Authorization URL
	 */
	login() {
		return this._authorize(this.config);
	}

	/**
	 * @function logout Redirects user after accessToken has expired.
	 * @params {string} path Optional path to redirect to, defaults to index page.
	 */
	async logout(path: string) {
		const accessToken: IToken = await this.fetchToken();

		if (typeof accessToken === 'string'){
			await this.revokeToken(accessToken, ETokens.AccessToken);
		}

		await this.storageHandler.clearStorage();
		await window.location.replace(path || '/');
	}

	/**
	 * @function handleCallback Stores token into sessionStorage
	 * @returns {Promise<void>} Promise rejection if error
	 */

	handleCallback() {
		let urlObj: Object | string;
		const errorCheck: RegExp = RegExp('#error');
		const hash: string = window.location.hash;

		urlObj = typeof hash === 'object' ? hash : this._parseUrlHash(hash);

		return new Promise((reject) => {
			if (errorCheck.test(hash)) {
				reject(urlObj);
			} else {
				this.storageHandler.setStorage(urlObj as IToken);
				this._setSession();
				// remove url
				window.location.hash = '';
			}
		});
	}
}

/**
 * @class AuthorizationCodeFlow
 */
class AuthorizationCodeFlow extends FlowAbstract {
	constructor(config: IOAuthConfig) {
		super(config);
		this.isValidConfig();
		this.config.flowType = EFlowTypes.AuthoriztionCodeFlow;
	}

	/**
	 * @function isValidConfig Validates the config of an AuthorizationCodeFlow instance
	 * @returns {boolean} Boolean indicating whether the config is valid
	 * Throws error if no clientSecret in config
	 */
	isValidConfig() {
		if (!(this.config.redirectUri && utils.isUrl(this.config.redirectUri))) {
			throw new InvalidOAuthConfigurationError('a valid redirectUri property is required in config settings');
		}
		if (!this.config.responseType
		) {
			throw new InvalidOAuthConfigurationError('responseType property is required in config settings');
		}

		return true;
	}

	getToken(params: string | ITokenProps) {
		let query: string = '';
		if (typeof params === 'string' && params.includes('?')) {
			query = params.substring(params.indexOf('?'));
		}

		if (!params) {
			throw new VerifyError(AppConfig.OAUTH_CONTEXT_CONFIG_SETTINGS_ERROR, 'getToken(params), Params are required');
		}

		if (!(params && typeof params === 'string' && params.includes('?'))) {
			throw new VerifyError(AppConfig.OAUTH_CONTEXT_API_ERROR, 'getToken(params), Params must contain data object or query string');
		}

		const data: ITokenProps = typeof params === 'object' ? params : qs.parse(query);
		const path: string = `${this.config.tenantUrl}/v1.0/endpoint/default/token`;

		data.redirect_uri = this.config.redirectUri;
		data.grant_type = EGrantTypes.Authorization_Grant_Type;
		data.client_id = this.config.clientId;
		data.client_secret = this.config.clientSecret;
		data.scope = this.config.scope;

		const encodedData: string = qs.stringify(data);

		const options: IApiRequest = {
			method: EMethods.POST,
			url: path,
			contentType: 'application/x-www-form-urlencoded',
			data: encodedData
		};

		return apiRequest(options);
	}

	/**
	 * @function authenticate Returns a URL used to authenticate against using the instance's config
	 * @returns {Promise<string>} Authentication URL
	 */
	authenticate() {
		return new Promise((resolve) => {
			resolve(this._authorize(this.config));
		});
	}

	/**
	 * @function refreshToken Refreshes a token if it has expired
	 * @param {object} token The token object to be refreshed containing access_token, refresh_token ...
	 * @returns {Promise<object|void>} Response object from refreshing the token
	 */
	refreshToken(token: IToken) {
		return super.refreshToken(token);
	}
}

/**
 * @class DeviceFlow
 */
class DeviceFlow extends FlowAbstract {
	POLLING_TIME: number;
	constructor(config: IOAuthConfig) {
		super(config);
		this.isValidConfig();
		this.POLLING_TIME = 5000;
		this.config.grantType = EGrantTypes.Device;
	}

	/**
	 * @function isValidConfig Validates the config of an DeviceFlow instance
	 * @returns {boolean} Boolean indicating whether the config is valid
	 */
	isValidConfig() {
		if (!this.config.clientSecret) {
			throw new InvalidOAuthConfigurationError('clientSecret property is required in config settings for  Code flow');
		}
		return true;
	}

	/**
	 * @function authorize used to initiate request at /device_authorize EP with
	 * client id (and scope if provided)
	 * @returns The successful response returned includes a device_code, user_code and verification_uri.
	 * Note: device_code should not be exposed to the user agent.
	 */
	authorize() {
		const authServerPath: string = `${this.config.tenantUrl}/oidc/endpoint/default/device_authorization`;
		const data = {
			client_id: this.config.clientId,
			scope: this.config.scope
		};

		const encodedData: string = qs.stringify(data);

		const options: IApiRequest = {
			method: 'POST',
			url: authServerPath,
			contentType: 'application/x-www-form-urlencoded',
			data: encodedData
		};

		return apiRequest(options);
	}

	/**
	 * @function pollTokenApi Polling the token endpoint of the authorization server
	 * @param {deviceCode} string used for polling the token EP
	 * @param {duration} number Optional, used to set the polling time in milliseconds. Default 5000 milliseconds.
	 * @returns {Promise<object>} Resolved or Rejected promise.
	 */
	async pollTokenApi(deviceCode: string, duration: number = this.POLLING_TIME) {

		if (duration < this.POLLING_TIME) {
			return Promise.reject(new DeveloperError('The device made an attempt within [5] seconds. This request will not be processed.'));
		}

		if (!deviceCode) {
			return Promise.reject(new DeveloperError('No device code value provided.'));
		}
		const path: string = `${this.config.tenantUrl}/v1.0/endpoint/default/token`;
		let response;

		let data = {
			client_id: this.config.clientId,
			client_secret: this.config.clientSecret,
			grant_type: EGrantTypes.Device,
			device_code: deviceCode
		} as IDeviceFlow;

		let error = {} as IError;

		while (error.messageId !== ETokens.ExpiredToken && !response) {
			try {
				response = await this.getToken({ data, path });
				break;
			} catch (e: any) {
				error = e;
			}
			await utils.sleep(duration);
		}

		if (response) {
			return Promise.resolve(response);
		}
		return Promise.reject(error.messageDescription);
	}

	/**
	 * @function refreshToken Refreshes a token if it has expired
	 * @param {object} token The token object to be refreshed containing access_token, refresh_token ...
	 * @returns {Promise<object|void>} Response object from refreshing the token
	 */
	refreshToken(token: IToken){
		return super.refreshToken(token);
	}
}

/**
 * @class ROPCFlow
 */
class ROPCFlow extends FlowAbstract {
	constructor(config: IOAuthConfig) {
		super(config);
		this.isValidConfig();
	}

	/**
	 * @function isValidConfig Validates the config of a DeviceFlow instance
	 * @returns {boolean} Boolean indicating whether the config is valid
	 */
	isValidConfig(): boolean {
		return true;
	}

	/**
	 * @function login Retrieves a token using the supplied credentials
	 * @param {string} username The user's identifier
	 * @param {string} password The user's password
	 * @returns {Promise<object>} Response object from login containing token
	 */
	login(username: string, password: string): Promise<PromiseRejectionEvent> {
		if (!username || !password) {
			return Promise.reject(new DeveloperError('username and password params are required'));
		}

		const path: string = `${this.config.tenantUrl}/v1.0/endpoint/default/token`;

		const data = {
			client_id: this.config.clientId,
			client_secret: this.config.clientSecret,
			username: username,
			password: password,
			grant_type: EGrantTypes.ROPC,
			scope: this.config.scope
		} as IROPCFlow;

		const encodedData: string = qs.stringify(data);

		const options: IApiRequest = {
			method: EMethods.POST,
			url: path,
			contentType: 'application/x-www-form-urlencoded',
			data: encodedData
		};

		return apiRequest(options);
	}

	/**
	 * @function refreshToken Refreshes a token if it has expired
	 * @param {object} token The token object to be refreshed containing access_token, refresh_token ...
	 * @returns {Promise<object|void>} Response object from refreshing the token
	 */
	refreshToken(token: IToken) {
		return super.refreshToken(token);
	}
}

export default OAuthContext;