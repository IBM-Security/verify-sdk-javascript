import '@babel/polyfill';
import qs from 'query-string';
import VerifyError from './errors/VerifyError';
import StorageHandler from './helpers/StorageHandler';
import { AppConfig } from './config';
import apiRequest from './helpers/apiRequest';
import utils from './helpers/utils';

const {
	OAUTH_CONTEXT_CONFIG_SETTINGS_ERROR,
	OAUTH_CONTEXT_API_ERROR,
	TOKEN_ERROR
} = AppConfig;
/**
 *
 * @param {object} config users configuration settings to kick off
 * OAuth implicit flow
 */
function OAuthContext(config) {
	if (!config) {
		throw new VerifyError(OAUTH_CONTEXT_CONFIG_SETTINGS_ERROR, 'Config parameter is required');
	}
	//Verify config settings
	if (!config.clientId) {
		throw new VerifyError(OAUTH_CONTEXT_CONFIG_SETTINGS_ERROR, 'clientId property is required');
	}
	if (!config.tenantUrl) {
		throw new VerifyError(OAUTH_CONTEXT_CONFIG_SETTINGS_ERROR, 'Tenant URL is required');
	}
	if (!config.redirectUri && config.flowType !== 'client_credentials') {
		throw new VerifyError(OAUTH_CONTEXT_CONFIG_SETTINGS_ERROR, 'A redirect URL is required');
	}
	if (!config.responseType && config.flowType !== 'client_credentials') {
		throw new VerifyError(OAUTH_CONTEXT_CONFIG_SETTINGS_ERROR, 'Response Type required');
	}
	if (!config.scope) {
		throw new VerifyError(OAUTH_CONTEXT_CONFIG_SETTINGS_ERROR, 'scope Property not set in Config settings');
	}
	if (config.flowType === 'AZN' && !config.clientSecret) {
		throw new VerifyError(OAUTH_CONTEXT_CONFIG_SETTINGS_ERROR, 'Client Secret is required for the AZN code flow');
	}

	if (!(config.flowType === 'Implicit' || config.flowType === 'AZN' || config.flowType === 'client_credentials')) {
		throw new VerifyError(OAUTH_CONTEXT_CONFIG_SETTINGS_ERROR, 'Check the flowType property in your configuration object is correct. Supported Values: "Implicit", "AZN", "client_credentials"');
	}

	if (config.flowType === 'Implicit') {
		if (utils.isNode()) {
			throw new VerifyError(OAUTH_CONTEXT_CONFIG_SETTINGS_ERROR, 'Implicit flow not supported in Node');
		}
		if (!config.storageType) {
			throw new VerifyError(OAUTH_CONTEXT_CONFIG_SETTINGS_ERROR, 'storageType property not set.');
		}
		this.storageHandler = new StorageHandler(config.storageType);
	}

	this.config = config;
}

/**
 * @function isAuthenticated to check current users access_token or refresh_token to
 * determine if they are still valid.
 * @param {object} token the token object with access_token, refreshToken etc.
 */
OAuthContext.prototype.isAuthenticated = async function(token) {
	try {
		let payload = await this.introspectToken(token);
		return payload.response.active === true;
	} catch (error) {
		return Promise.reject(error);
	}
};

/**
 * @function introspectToken to inspect an OIDC token.
 * @param {object} token token object to introspect
 */
OAuthContext.prototype.introspectToken = function(tokenObj) {
	let token = tokenObj || this.token;
	if (!utils.isToken(tokenObj)) {
		return Promise.reject(new VerifyError(TOKEN_ERROR, 'Token parameter is not a valid token'));
	}

	let path = `${this.config.tenantUrl}/v1.0/endpoint/default/introspect`;

	let data = {
		client_id: this.config.clientId,
		client_secret: this.config.clientSecret,
		token: token.access_token
	};

	let encodedData = qs.stringify(data);

	let options = {
		method: 'POST',
		url: path,
		contentType: 'application/x-www-form-urlencoded',
		data: encodedData
	};

	return this.handleResponse(options, token);
};

/**
 * @function userinfo API to get the user information that is associated with the token parameter
 * @param {object} tokenObj token object with access_token property.
 */
OAuthContext.prototype.userinfo = function(tokenObj) {
	let token = tokenObj || this.token;

	if (!utils.isToken(token)) {
		return Promise.reject(new VerifyError(TOKEN_ERROR, 'Token parameter is not a valid token'));
	}


	let path = `${this.config.tenantUrl}/v1.0/endpoint/default/userinfo`;

	let options = {
		method: 'POST',
		url: path,
		contentType: 'application/x-www-form-urlencoded',
		data: qs.stringify(token.access_token)
	};

	return this.handleResponse(options, token);
};


/**
 * @function fetchToken Used for implicit flow to return the accessToken stored in browser.
 */
OAuthContext.prototype.fetchToken = function() {
	if (this.config.flowType === 'Implicit') {
		try {
			let accessToken = JSON.parse(this.storageHandler.getStorage('token'));
			return accessToken;
		} catch (error) {
			return null;
		}
	} else {
		throw new VerifyError(OAUTH_CONTEXT_API_ERROR, 'fetchToken() can only be used with Implicit flow');
	}
};

/**
 * @function getConfig
 * expose config object for AuthenticatorContext.
 */
OAuthContext.prototype.getConfig = function() {
	return this.config;
};


/**
 * @param {string} path Optional string to redirect user after accessToken has expired
 * Defaults to index page.
 */
OAuthContext.prototype.logout = async function(path, token) {
	// clear storage and redirect to home page
	if (this.config.flowType === 'Implicit') {
		let accessToken = this.fetchToken();
		await this.revokeToken(accessToken, 'access_token');
		await this.storageHandler.clearStorage();
		await window.location.replace(path || '/');
	} else {
		// path and token supplied
		if (arguments.length === 2 && !utils.isToken(token)) {
			Promise.reject(new VerifyError(TOKEN_ERROR, 'not a valid token.'));
		}
		// no path but a 'token' provided
		if (arguments.length === 1 && !utils.isToken(path)) {
			Promise.reject(new VerifyError(TOKEN_ERROR, 'not a valid token.'));
		}

		if (arguments.length === 2) {
			this.revokeToken(token, 'access_token');
		} else {
			this.revokeToken(path, 'access_token');
		}
	}
};

/**
 * @function revokeToken used to revoke valid tokens.
 * @param {object} token the Token object containing access_token, refresh_token etc...
 * @param {string} tokenType the token type to be revoked "access_token" or "refresh_token".
 */
OAuthContext.prototype.revokeToken = function(token, tokenType) {
	let path = `${this.config.tenantUrl}/v1.0/endpoint/default/revoke`;
	let expireToken;
	let encodedData;
	let options;

	if (arguments.length < 2) {
		throw new VerifyError(OAUTH_CONTEXT_API_ERROR, 'revokeToken(token, tokenType), 2 parameters are required ' + arguments.length + ' were given');
	}

	if (!token) {
		throw new VerifyError(OAUTH_CONTEXT_API_ERROR, 'token cannot be null');
	}

	if (!(tokenType === 'access_token' || tokenType === 'refresh_token')) {
		throw new VerifyError(OAUTH_CONTEXT_API_ERROR, `Parameter: ${tokenType} is invalid.\n Supported values are "access_token" or "refresh_token`);
	}

	expireToken = tokenType === 'access_token' ? token.access_token : token.refresh_token;

	let data = {
		client_id: this.config.clientId,
		client_secret: this.config.clientSecret,
		token: expireToken
	};

	encodedData = qs.stringify(data);

	options = {
		method: 'POST',
		contentType: 'application/x-www-form-urlencoded',
		url: path,
		data: encodedData
	};

	// token is not required, but handleResponse will throw error without it
	return this.handleResponse(options, token);
};

/**
 *
 * @param {string} hashString the url hash fragment
 * return url hash fragment as an object
 */
OAuthContext.prototype._parseUrlHash = function(hashString) {
	let parsedHash = qs.parse(hashString);
	return parsedHash;
};

/**
 * @function setSession Used for Implicit flow. Creates a session for the SDK to manage the access token
 * validity for the given user. Clears browser storage on access token expiry.
 */
OAuthContext.prototype._setSession = function() {
	if (utils.isNode()) {
		throw new VerifyError(OAUTH_CONTEXT_API_ERROR, '_setSession() is not supported in Node');
	}
	const expiresAt = JSON.parse(this.storageHandler.getStorage('token')).expires_in;
	const clockSkew = AppConfig.DEFAULT_CLOCK_SKEW;
	const delay = expiresAt - (Date.now() - clockSkew);

	if (delay > 0) {
		setTimeout(() => {
			this.session = false;
			this.storageHandler.clearStorage();
		}, delay);
	}
};

/**
 *
 * @param {string} params
 * @function getToken to make api request to Cloud Identity Authorization server
 * to retrieve access_token, refresh_token, grant_id...
 */
OAuthContext.prototype.getToken = function(params) {
	if (this.config.flowType === 'Implicit') {
		throw new VerifyError(OAUTH_CONTEXT_API_ERROR, 'getToken() cannot be used with Implicit flow');
	}
	if (!params) {
		// change message
		throw new VerifyError(OAUTH_CONTEXT_API_ERROR, 'getToken(params), Params are required');
	}

	let query;
	let _params = params;

	if (this.config.flowType === 'client_credentials') {
		query = _params;
	} else {
		query = params.substring(params.indexOf('?'));
	}


	let data = typeof query === 'object' ? query : qs.parse(query);
	let path = `${this.config.tenantUrl}/v1.0/endpoint/default/token`;

	if (this.config.flowType === 'client_credentials') {
		data.grant_type = this.config.flowType;
	} else {
		data.redirect_uri = this.config.redirectUri;
		data.grant_type = 'authorization_code';
	}

	data.client_id = this.config.clientId;
	data.client_secret = this.config.clientSecret;
	data.scope = this.config.scope;

	let encodedData = qs.stringify(data);

	let options = {
		method: 'POST',
		url: path,
		contentType: 'application/x-www-form-urlencoded',
		data: encodedData
	};

	return apiRequest(options);
};

/**
 * @function refreshToken
 * @param {string} refreshToken required refresh_token string.
 * Refresh access token when token has expired.
 * Used for AZN flow only.
 */
OAuthContext.prototype.refreshToken = function(token) {
	if (this.config.flowType === 'Implicit') {
		return Promise.reject(new VerifyError(OAUTH_CONTEXT_API_ERROR, 'Implicit flow does not support refresh token'));
	}

	if (!token.hasOwnProperty('refresh_token')) {
		return Promise.reject(new VerifyError(OAUTH_CONTEXT_API_ERROR, 'refresh_token is a required parameter'));
	}

	let path = `${this.config.tenantUrl}/v1.0/endpoint/default/token`;
	let data = {
		refresh_token: token.refresh_token,
		client_id: this.config.clientId,
		client_secret: this.config.clientSecret,
		grant_type: 'refresh_token',
		scope: this.config.scope
	};

	let encodedData = qs.stringify(data);

	let options = {
		method: 'POST',
		url: path,
		contentType: 'application/x-www-form-urlencoded',
		data: encodedData
	};

	return apiRequest(options);
};

OAuthContext.prototype._authorize = function(options) {
	return this._buildUrl(options);
};

/**
 * @function login
 * used for implicit grant to retrieve url
 * and additional params to send user-agent to Cloud Identity login
 * screen to authenticate with the authorization server.
 */
OAuthContext.prototype.login = function() {
	let url = this._authorize(this.config);
	return url;
};


/**
 * buildUrl method
 * @param {object} opts configuration object used to create a url to the authorize endpoint
 * for SSO implicit flow
 */
OAuthContext.prototype._buildUrl = function(opts) {
	return (
		opts.tenantUrl +
		'/oidc/endpoint/default/authorize?' +
		qs.stringify({
			client_id: opts.clientId,
			redirect_uri: opts.redirectUri,
			scope: opts.scope,
			response_type: opts.responseType,
			state: utils.randomString(16),
			nonce: utils.randomString(16)
		})
	);
};

/**
/** Authorization code flow (AZN)
 * @function authenticate construct url to enable authentication for user.
 */
OAuthContext.prototype.authenticate = function() {
	return new Promise(
		function(resolve) {
			resolve(this._authorize(this.config));
		}.bind(this)
	);
};


/**
 *
 * @param {string} hashString the url hash fragment
 * return url hash fragment as an object
 */
OAuthContext.prototype._parseHash = function(hashString) {
	let parsedHash = qs.parse(hashString);
	return parsedHash;
};

/**
 * @function handleResponse method handles the api request to Cloud Identity
 * @param {object} options Object containing the endpoint params. [method, url ...etc]
 * @param {object} token the token object containing access_token, refresh_token etc.
 */
OAuthContext.prototype.handleResponse = async function(options, tokenObj) {
	if (arguments.length < 2) {
		throw new VerifyError(OAUTH_CONTEXT_API_ERROR, 'handleResponse(options, token), 2 parameters are required ' + arguments.length + ' were given');
	}
	if (!utils.isToken(tokenObj)) {
		return Promise.reject(new VerifyError(TOKEN_ERROR, 'not a valid token'));
	}

	let token = tokenObj;
	//Define empty payload object
	let payload = {
		response: null,
		token: null
	};

	try {
		let response = await apiRequest(options, token.access_token);
		payload.response = response;
		if (this.config.flowType === 'Implicit') {
			return Promise.resolve(response);
		}
		return Promise.resolve(payload);
	} catch (error) {
		if (error.status === 401 && utils.isNode()) {
			// validate 'token' has refresh_token
			if (!token.refresh_token) {
				return Promise.reject(new VerifyError(OAUTH_CONTEXT_API_ERROR, 'access_token expired and refresh_token not found'));
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
};

/**
 * @function handleCallback required for implicit flow to handle the authentication / authorization transaction from Cloud Identity
 * and to store the access_token and expires_in values to browser storage.
 */
OAuthContext.prototype.handleCallback = function() {
	if (utils.isNode()) {
		throw new VerifyError(OAUTH_CONTEXT_API_ERROR, 'handleCallback() is only for Implicit flow');
	}
	let urlObj;
	let errorCheck = RegExp('#error');
	let hash = window.location.hash;

	urlObj = typeof hash === 'object' ? hash : this._parseUrlHash(hash);

	return new Promise(function(reject) {
		if (errorCheck.test(hash)) {
			reject(urlObj);
		} else {
			this.storageHandler.setStorage(urlObj);
			this._setSession();
			// remove url
			window.location.hash = '';
		}
	}.bind(this));
};

export default OAuthContext;
