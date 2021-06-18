"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const query_string_1 = __importDefault(require("query-string"));
const Errors_1 = require("./errors/Errors");
const StorageHandler_1 = __importDefault(require("./helpers/StorageHandler"));
const config_1 = require("./config");
const apiRequest_1 = __importDefault(require("./helpers/apiRequest"));
const utils_1 = __importDefault(require("./helpers/utils"));
const enums_1 = require("./helpers/enums");
class OAuthContext {
    constructor(config) {
        if (!config) {
            throw new Errors_1.InvalidOAuthConfigurationError('Config parameter is required');
        }
        if (!config.flowType) {
            throw new Errors_1.InvalidOAuthConfigurationError('flowType property is required in config settings');
        }
        if (!config.clientId) {
            throw new Errors_1.InvalidOAuthConfigurationError('clientId property is required in config settings');
        }
        if (!(config.tenantUrl && utils_1.default.isUrl(config.tenantUrl))) {
            throw new Errors_1.InvalidOAuthConfigurationError('a valid tenantUrl property is required in config settings');
        }
        if (!config.scope) {
            throw new Errors_1.InvalidOAuthConfigurationError('scope property is required in config settings');
        }
        switch (config.flowType) {
            case enums_1.EFlowTypes.ImplicitFlow:
                return new ImplicitFlow(config);
            case enums_1.EFlowTypes.AuthoriztionCodeFlow:
                return new AuthorizationCodeFlow(config);
            case enums_1.EFlowTypes.DeviceFlow:
                return new DeviceFlow(config);
            case enums_1.EFlowTypes.ROPCFlow:
                return new ROPCFlow(config);
            default:
                const flowTypes = Object.values(enums_1.EFlowTypes).map((value) => ` "${value}"`);
                throw new Errors_1.InvalidOAuthConfigurationError(`"${config.flowType}" flowType not valid. Valid flow types are: ${flowTypes}`);
        }
    }
}
class FlowAbstract {
    constructor(config) {
        if (new.target === FlowAbstract) {
            throw new TypeError('Cannot instantiate FlowAbstract directly');
        }
        this.config = config;
    }
    isValidConfig() {
        throw new Errors_1.AbstractMethodNotImplementedError();
    }
    logout(path, token) {
        if (arguments.length === 2 && !this.isToken(token)) {
            return Promise.reject(new Errors_1.VerifyError(config_1.AppConfig.TOKEN_ERROR, 'Token parameter is not a valid token'));
        }
        if (arguments.length === 1 && !this.isToken(path)) {
            return Promise.reject(new Errors_1.VerifyError(config_1.AppConfig.TOKEN_ERROR, 'Token parameter is not a valid token'));
        }
        try {
            return this.revokeToken(token, enums_1.ETokens.AccessToken);
        }
        catch (error) {
            return Promise.reject(error);
        }
    }
    getConfig() {
        return this.config;
    }
    isAuthenticated(token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payload = yield this.introspectToken(token);
                return this.config.flowType === enums_1.EFlowTypes.ImplicitFlow ? payload.active : payload.response.active;
            }
            catch (error) {
                return Promise.reject(error);
            }
        });
    }
    introspectToken(token) {
        if (!this.isToken(token)) {
            return Promise.reject(new Errors_1.VerifyError(config_1.AppConfig.TOKEN_ERROR, 'Token parameter is not a valid token'));
        }
        const path = `${this.config.tenantUrl}/v1.0/endpoint/default/introspect`;
        const data = {
            client_id: this.config.clientId,
            client_secret: this.config.clientSecret,
            token: token.access_token
        };
        const encodedData = query_string_1.default.stringify(data);
        const options = {
            method: enums_1.EMethods.POST,
            url: path,
            contentType: 'application/x-www-form-urlencoded',
            data: encodedData
        };
        return this.handleResponse(options, token);
    }
    userInfo(token) {
        if (!this.isToken(token)) {
            return Promise.reject(new Errors_1.VerifyError(config_1.AppConfig.TOKEN_ERROR, 'Token parameter is not a valid token'));
        }
        const path = `${this.config.tenantUrl}/v1.0/endpoint/default/userinfo`;
        const options = {
            method: enums_1.EMethods.POST,
            url: path,
            contentType: 'application/x-www-form-urlencoded',
            data: query_string_1.default.stringify({
                access_token: token.access_token
            })
        };
        return this.handleResponse(options, token);
    }
    isToken(token) {
        return !(!token || !token.access_token);
    }
    revokeToken(token, tokenType) {
        const path = `${this.config.tenantUrl}/v1.0/endpoint/default/revoke`;
        if (arguments.length < 2) {
            throw new Errors_1.VerifyError(config_1.AppConfig.OAUTH_CONTEXT_API_ERROR, 'revokeToken(token, tokenType), 2 parameters are required ' + arguments.length + ' were given');
        }
        if (!token) {
            throw new Errors_1.VerifyError(config_1.AppConfig.OAUTH_CONTEXT_API_ERROR, 'token cannot be null');
        }
        if (!(tokenType === enums_1.ETokens.AccessToken || tokenType === enums_1.ETokens.RefreshToken)) {
            throw new Errors_1.VerifyError(config_1.AppConfig.OAUTH_CONTEXT_API_ERROR, `Parameter: ${tokenType} is invalid.\n Supported values are "access_token" or "refresh_token`);
        }
        const expireToken = tokenType === enums_1.ETokens.AccessToken ? token.access_token : token.refresh_token;
        const data = {
            client_id: this.config.clientId,
            client_secret: this.config.clientSecret,
            token: expireToken
        };
        const encodedData = query_string_1.default.stringify(data);
        const options = {
            method: enums_1.EMethods.POST,
            contentType: 'application/x-www-form-urlencoded',
            url: path,
            data: encodedData
        };
        return this.handleResponse(options, token);
    }
    _parseUrlHash(hash) {
        return query_string_1.default.parse(hash);
    }
    getToken(params) {
        const { data, path } = params;
        if (!((data && typeof data === 'object' && data.constructor === Object) || ((data && typeof data === 'string' && data.includes('?'))))) {
            throw new Errors_1.VerifyError(config_1.AppConfig.OAUTH_CONTEXT_API_ERROR, 'getToken(params), Params must contain data object or query string');
        }
        data.client_id = this.config.clientId;
        data.client_secret = this.config.clientSecret;
        data.scope = this.config.scope;
        let encodedData = query_string_1.default.stringify(data);
        let options = {
            method: enums_1.EMethods.POST,
            url: path,
            contentType: 'application/x-www-form-urlencoded',
            data: encodedData
        };
        return apiRequest_1.default(options);
    }
    refreshToken(token) {
        if (!token.hasOwnProperty(enums_1.ETokens.RefreshToken)) {
            return Promise.reject(new Errors_1.VerifyError(config_1.AppConfig.OAUTH_CONTEXT_API_ERROR, 'token has no refresh_token property'));
        }
        const path = `${this.config.tenantUrl}/v1.0/endpoint/default/token`;
        const data = {
            refresh_token: token.refresh_token,
            client_id: this.config.clientId,
            client_secret: this.config.clientSecret,
            grant_type: enums_1.ETokens.RefreshToken,
            scope: this.config.scope
        };
        const encodedData = query_string_1.default.stringify(data);
        const options = {
            method: enums_1.EMethods.POST,
            url: path,
            contentType: 'application/x-www-form-urlencoded',
            data: encodedData
        };
        return apiRequest_1.default(options);
    }
    _authorize(options) {
        return this._buildUrl(options);
    }
    _buildUrl(options) {
        return (options.tenantUrl +
            '/oidc/endpoint/default/authorize?' +
            query_string_1.default.stringify({
                client_id: options.clientId,
                redirect_uri: options.redirectUri,
                scope: options.scope,
                response_type: options.responseType,
                state: utils_1.default.randomString(16),
                nonce: utils_1.default.randomString(16)
            }));
    }
    handleResponse(options, tokenObj) {
        return __awaiter(this, arguments, void 0, function* () {
            if (arguments.length < 2) {
                return Promise.reject(new Errors_1.VerifyError(config_1.AppConfig.OAUTH_CONTEXT_API_ERROR, 'handleResponse(options, token), 2 parameters are required ' + arguments.length + ' were given'));
            }
            if (!this.isToken(tokenObj)) {
                return Promise.reject(new Errors_1.VerifyError(config_1.AppConfig.TOKEN_ERROR, 'Token parameter is not a valid token'));
            }
            const token = tokenObj;
            let payload = {
                response: null,
                token: {}
            };
            try {
                const response = yield apiRequest_1.default(options, token.access_token);
                payload.response = response;
                if (this.config.flowType === enums_1.EFlowTypes.ImplicitFlow) {
                    return Promise.resolve(response);
                }
                return Promise.resolve(payload);
            }
            catch (error) {
                if (error.status === 401 && utils_1.default.isNode()) {
                    if (!token.refresh_token) {
                        return Promise.reject(new Errors_1.VerifyError(config_1.AppConfig.OAUTH_CONTEXT_API_ERROR, 'access_token expired and refresh_token not found'));
                    }
                    let newToken = yield this.refreshToken(token);
                    let originalRequest = yield apiRequest_1.default(options, newToken.access_token);
                    payload = {
                        response: originalRequest,
                        token: newToken
                    };
                    return Promise.resolve(payload);
                }
                return Promise.reject(error);
            }
        });
    }
}
class ImplicitFlow extends FlowAbstract {
    constructor(config) {
        super(config);
        this.isValidConfig();
        this.session = false;
        this.storageHandler = StorageHandler_1.default(config.storageType);
    }
    isValidConfig() {
        if (utils_1.default.isNode()) {
            throw new Errors_1.InvalidOAuthConfigurationError('Implicit flow is not supported in Node');
        }
        if (!this.config.storageType) {
            throw new Errors_1.InvalidOAuthConfigurationError('storageType property is required in config settings for Implicit flow');
        }
        if (!(this.config.redirectUri && utils_1.default.isUrl(this.config.redirectUri))) {
            throw new Errors_1.InvalidOAuthConfigurationError('a valid redirectUri property is required in config settings');
        }
        return true;
    }
    refreshToken() {
        throw new Errors_1.NotAvailableError();
    }
    fetchToken() {
        try {
            return JSON.parse(this.storageHandler.getStorage('token'));
        }
        catch (error) {
            return error;
        }
    }
    _setSession() {
        const expiresAt = JSON.parse(this.storageHandler.getStorage('token')).expires_in;
        const clockSkew = config_1.AppConfig.DEFAULT_CLOCK_SKEW;
        const delay = expiresAt - (Date.now() - clockSkew);
        if (delay > 0) {
            setTimeout(() => {
                this.session = false;
                this.storageHandler.clearStorage();
            }, delay);
        }
    }
    login() {
        return this._authorize(this.config);
    }
    logout(path) {
        return __awaiter(this, void 0, void 0, function* () {
            const accessToken = yield this.fetchToken();
            if (typeof accessToken === 'string') {
                yield this.revokeToken(accessToken, enums_1.ETokens.AccessToken);
            }
            yield this.storageHandler.clearStorage();
            yield window.location.replace(path || '/');
        });
    }
    handleCallback() {
        let urlObj;
        const errorCheck = RegExp('#error');
        const hash = window.location.hash;
        urlObj = typeof hash === 'object' ? hash : this._parseUrlHash(hash);
        return new Promise((reject) => {
            if (errorCheck.test(hash)) {
                reject(urlObj);
            }
            else {
                this.storageHandler.setStorage(urlObj);
                this._setSession();
                window.location.hash = '';
            }
        });
    }
}
class AuthorizationCodeFlow extends FlowAbstract {
    constructor(config) {
        super(config);
        this.isValidConfig();
        this.config.flowType = enums_1.EFlowTypes.AuthoriztionCodeFlow;
    }
    isValidConfig() {
        if (!(this.config.redirectUri && utils_1.default.isUrl(this.config.redirectUri))) {
            throw new Errors_1.InvalidOAuthConfigurationError('a valid redirectUri property is required in config settings');
        }
        if (!this.config.responseType) {
            throw new Errors_1.InvalidOAuthConfigurationError('responseType property is required in config settings');
        }
        return true;
    }
    getToken(params) {
        let query = '';
        if (typeof params === 'string' && params.includes('?')) {
            query = params.substring(params.indexOf('?'));
        }
        if (!params) {
            throw new Errors_1.VerifyError(config_1.AppConfig.OAUTH_CONTEXT_CONFIG_SETTINGS_ERROR, 'getToken(params), Params are required');
        }
        if (!(params && typeof params === 'string' && params.includes('?'))) {
            throw new Errors_1.VerifyError(config_1.AppConfig.OAUTH_CONTEXT_API_ERROR, 'getToken(params), Params must contain data object or query string');
        }
        const data = typeof params === 'object' ? params : query_string_1.default.parse(query);
        const path = `${this.config.tenantUrl}/v1.0/endpoint/default/token`;
        data.redirect_uri = this.config.redirectUri;
        data.grant_type = enums_1.EGrantTypes.Authorization_Grant_Type;
        data.client_id = this.config.clientId;
        data.client_secret = this.config.clientSecret;
        data.scope = this.config.scope;
        const encodedData = query_string_1.default.stringify(data);
        const options = {
            method: enums_1.EMethods.POST,
            url: path,
            contentType: 'application/x-www-form-urlencoded',
            data: encodedData
        };
        return apiRequest_1.default(options);
    }
    authenticate() {
        return new Promise((resolve) => {
            resolve(this._authorize(this.config));
        });
    }
    refreshToken(token) {
        return super.refreshToken(token);
    }
}
class DeviceFlow extends FlowAbstract {
    constructor(config) {
        super(config);
        this.isValidConfig();
        this.POLLING_TIME = 5000;
        this.config.grantType = enums_1.EGrantTypes.Device;
    }
    isValidConfig() {
        if (!this.config.clientSecret) {
            throw new Errors_1.InvalidOAuthConfigurationError('clientSecret property is required in config settings for  Code flow');
        }
        return true;
    }
    authorize() {
        const authServerPath = `${this.config.tenantUrl}/oidc/endpoint/default/device_authorization`;
        const data = {
            client_id: this.config.clientId,
            scope: this.config.scope
        };
        const encodedData = query_string_1.default.stringify(data);
        const options = {
            method: 'POST',
            url: authServerPath,
            contentType: 'application/x-www-form-urlencoded',
            data: encodedData
        };
        return apiRequest_1.default(options);
    }
    pollTokenApi(deviceCode, duration = this.POLLING_TIME) {
        return __awaiter(this, void 0, void 0, function* () {
            if (duration < this.POLLING_TIME) {
                return Promise.reject(new Errors_1.DeveloperError('The device made an attempt within [5] seconds. This request will not be processed.'));
            }
            if (!deviceCode) {
                return Promise.reject(new Errors_1.DeveloperError('No device code value provided.'));
            }
            const path = `${this.config.tenantUrl}/v1.0/endpoint/default/token`;
            let response;
            let data = {
                client_id: this.config.clientId,
                client_secret: this.config.clientSecret,
                grant_type: enums_1.EGrantTypes.Device,
                device_code: deviceCode
            };
            let error = {};
            while (error.messageId !== enums_1.ETokens.ExpiredToken && !response) {
                try {
                    response = yield this.getToken({ data, path });
                    break;
                }
                catch (e) {
                    error = e;
                }
                yield utils_1.default.sleep(duration);
            }
            if (response) {
                return Promise.resolve(response);
            }
            return Promise.reject(error.messageDescription);
        });
    }
    refreshToken(token) {
        return super.refreshToken(token);
    }
}
class ROPCFlow extends FlowAbstract {
    constructor(config) {
        super(config);
        this.isValidConfig();
    }
    isValidConfig() {
        return true;
    }
    login(username, password) {
        if (!username || !password) {
            return Promise.reject(new Errors_1.DeveloperError('username and password params are required'));
        }
        const path = `${this.config.tenantUrl}/v1.0/endpoint/default/token`;
        const data = {
            client_id: this.config.clientId,
            client_secret: this.config.clientSecret,
            username: username,
            password: password,
            grant_type: enums_1.EGrantTypes.ROPC,
            scope: this.config.scope
        };
        const encodedData = query_string_1.default.stringify(data);
        const options = {
            method: enums_1.EMethods.POST,
            url: path,
            contentType: 'application/x-www-form-urlencoded',
            data: encodedData
        };
        return apiRequest_1.default(options);
    }
    refreshToken(token) {
        return super.refreshToken(token);
    }
}
exports.default = OAuthContext;
//# sourceMappingURL=OAuthContext.js.map