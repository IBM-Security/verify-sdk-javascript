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
const config_1 = require("./config");
const Errors_1 = require("./errors/Errors");
const enums_1 = require("./helpers/enums");
const utils_1 = __importDefault(require("./helpers/utils"));
const { AUTHENTICATOR_CONTEXT_ERROR, DEFAULT_POLLING_DELAY, DEFAULT_POLLING_ATTEMPTS } = config_1.AppConfig;
class AuthenticatorContext {
    constructor(oauth) {
        if (!oauth) {
            throw new Errors_1.VerifyError(AUTHENTICATOR_CONTEXT_ERROR, 'Oauth parameter is required');
        }
        this.oauth = oauth;
        this.config = this.oauth.getConfig();
        if (this.config.flowType === enums_1.EFlowTypes.ImplicitFlow) {
            this.token = this._fetchToken();
        }
    }
    _fetchToken() {
        return this.oauth.fetchToken();
    }
    _isAuthenticated(token) {
        return this.oauth.isAuthenticated(token);
    }
    _handleResponse(options, token) {
        return this.oauth.handleResponse(options, token);
    }
    authenticators(tokenObj) {
        const token = tokenObj || this.token;
        if (!token) {
            return Promise.reject(new Errors_1.VerifyError(AUTHENTICATOR_CONTEXT_ERROR, 'token is a required parameter'));
        }
        const path = `${this.config.tenantUrl}/v1.0/authenticators`;
        const options = {
            method: enums_1.EMethods.GET,
            url: path
        };
        return this._handleResponse(options, token);
    }
    initiateAuthenticator(dataObj, tokenObj) {
        if (arguments.length < 2 && this.config.flowType !== enums_1.EFlowTypes.ImplicitFlow) {
            return Promise.reject(new Errors_1.VerifyError(AUTHENTICATOR_CONTEXT_ERROR, 'initiateAuthenticator(dataObj, token), 2 parameters are required ' + arguments.length + ' were given'));
        }
        if (!dataObj) {
            return Promise.reject(new Errors_1.VerifyError(AUTHENTICATOR_CONTEXT_ERROR, 'dataObj cannot be null'));
        }
        let options = {};
        let path = `${this.config.tenantUrl}/v1.0/authenticators/initiation`;
        if (dataObj.hasOwnProperty('qrcodeInResponse') && dataObj.qrcodeInResponse) {
            path = `${path}?qrcodeInResponse=true`;
            options.accept = enums_1.ERequestHeaders.ImagePNG;
        }
        let data = {
            owner: dataObj.owner || null,
            clientId: this.config.registrationProfileId,
            accountName: dataObj.accountName || 'Default Account'
        };
        let token = tokenObj || this.token;
        options = {
            method: enums_1.EMethods.POST,
            url: path,
            data: JSON.stringify(data)
        };
        return this._handleResponse(options, token);
    }
    createVerification(authenticatorId, formData, tokenObj) {
        if (arguments.length < 3 && this.config.flowType !== enums_1.EFlowTypes.ImplicitFlow) {
            return Promise.reject(new Errors_1.VerifyError(AUTHENTICATOR_CONTEXT_ERROR, 'createVerification(authenticatorId, formData, token), 3 parameters are required ' + arguments.length + ' were given'));
        }
        if (!formData) {
            return Promise.reject(new Errors_1.VerifyError(AUTHENTICATOR_CONTEXT_ERROR, 'formData is a required parameter'));
        }
        const token = tokenObj || this.token;
        const path = `${this.config.tenantUrl}/v1.0/authenticators/${authenticatorId}/verifications`;
        const data = {
            transactionData: {
                message: formData.txMessage || ' ',
                originIpAddress: formData.originIpAddress || ' ',
                originUserAgent: formData.originUserAgent || ' ',
                additionalData: formData.txAdditionalData
            },
            pushNotification: {
                title: formData.title || ' ',
                send: formData.send,
                message: formData.pushMessage || ' '
            },
            authenticationMethods: [{
                    id: formData.methodId,
                    methodType: 'signature'
                }],
            logic: 'OR',
            expiresIn: formData.expires || 120
        };
        let options = {
            method: enums_1.EMethods.POST,
            url: path,
            data: data
        };
        return this._handleResponse(options, token);
    }
    viewVerifications(authenticatorId, tokenObj) {
        if (arguments.length < 2 && this.config.flowType !== enums_1.EFlowTypes.ImplicitFlow) {
            return Promise.reject(new Errors_1.VerifyError(AUTHENTICATOR_CONTEXT_ERROR, 'viewVerifications(authenticatorId, token), 2 parameters are required ' + arguments.length + ' were given'));
        }
        const token = tokenObj || this.token;
        const path = `${this.config.tenantUrl}/v1.0/authenticators/${authenticatorId}/verifications`;
        const options = {
            method: enums_1.EMethods.GET,
            url: path
        };
        return this._handleResponse(options, token);
    }
    viewVerification(authenticatorId, transactionId, tokenObj) {
        if (arguments.length < 3 && this.config.flowType !== enums_1.EFlowTypes.ImplicitFlow) {
            return Promise.reject(new Errors_1.VerifyError(AUTHENTICATOR_CONTEXT_ERROR, 'viewVerification(authenticatorId, transactionId, token), 3 parameters are required ' + arguments.length + ' were given'));
        }
        const token = tokenObj || this.token;
        const path = `${this.config.tenantUrl}/v1.0/authenticators/${authenticatorId}/verifications/${transactionId}`;
        const options = {
            method: enums_1.EMethods.GET,
            url: path
        };
        return this._handleResponse(options, token);
    }
    pollVerification(authenticatorId, transactionId, tokenObj, delay, attempts) {
        return __awaiter(this, void 0, void 0, function* () {
            let _tokenObj = tokenObj;
            let _attempts = attempts || DEFAULT_POLLING_ATTEMPTS;
            const _delay = delay || DEFAULT_POLLING_DELAY;
            let tokenRefreshed = false;
            while (_attempts > 0) {
                try {
                    let payload = yield this.viewVerification(authenticatorId, transactionId, tokenObj);
                    if (payload.token) {
                        tokenRefreshed = true;
                        _tokenObj = payload.token;
                    }
                    if (payload.response.state !== 'PENDING' || payload.response.state !== 'SENDING') {
                        return Promise.resolve({ state: payload.response.state, token: tokenRefreshed ? _tokenObj : null });
                    }
                    yield utils_1.default.sleep(_delay);
                }
                catch (error) {
                    return Promise.reject(error);
                }
                _attempts--;
            }
            return Promise.reject(new Errors_1.VerifyError('number of polling attempts exceeded'));
        });
    }
    enabled(authenticatorId, enabled, tokenObj) {
        if (arguments.length < 3 && this.config.flowType !== enums_1.EFlowTypes.ImplicitFlow) {
            return Promise.reject(new Errors_1.VerifyError(AUTHENTICATOR_CONTEXT_ERROR, 'enabled(authenticatorId, enabled, token), 3 parameters are required ' + arguments.length + ' were given'));
        }
        const token = tokenObj || this.token;
        const path = `${this.config.tenantUrl}/v1.0/authenticators/${authenticatorId}`;
        const options = {
            method: enums_1.EMethods.PATCH,
            url: path,
            data: [{
                    path: '/enabled',
                    value: enabled,
                    op: 'replace'
                }],
            contentType: 'application/json-patch+json'
        };
        return this._handleResponse(options, token);
    }
    deleteAuthenticator(authenticatorId, tokenObj) {
        if (arguments.length < 2 && this.config.flowType !== enums_1.EFlowTypes.ImplicitFlow) {
            return Promise.reject(new Errors_1.VerifyError(AUTHENTICATOR_CONTEXT_ERROR, 'deleteAuthenticator(authenticatorId, token), 2 parameters are required ' + arguments.length + ' were given'));
        }
        const token = tokenObj || this.token;
        const path = `${this.config.tenantUrl}/v1.0/authenticators/${authenticatorId}`;
        const options = {
            method: enums_1.EMethods.DELETE,
            url: path,
            data: false
        };
        return this._handleResponse(options, token);
    }
    methodEnabled(id, enabled, tokenObj) {
        if (arguments.length < 3 && this.config.flowType !== enums_1.EFlowTypes.ImplicitFlow) {
            return Promise.reject(new Errors_1.VerifyError(AUTHENTICATOR_CONTEXT_ERROR, 'methodEnabled(id, enabled, token), 3 parameters are required ' + arguments.length + ' were given'));
        }
        const token = tokenObj || this.token;
        const path = `${this.config.tenantUrl}/v1.0/authnmethods/signatures/${id}`;
        const options = {
            method: enums_1.EMethods.PATCH,
            url: path,
            data: [{
                    path: '/enabled',
                    value: enabled,
                    op: 'replace'
                }],
            contentType: 'application/json-patch+json'
        };
        return this._handleResponse(options, token);
    }
    methods(authenticatorId, tokenObj) {
        if (arguments.length < 2 && this.config.flowType !== enums_1.EFlowTypes.ImplicitFlow) {
            return Promise.reject(new Errors_1.VerifyError(AUTHENTICATOR_CONTEXT_ERROR, 'methods(authenticatorId, token), 2 parameters are required ' + arguments.length + ' were given'));
        }
        const token = tokenObj || this.token;
        const encodedValue = encodeURIComponent(`attributes/authenticatorId="${authenticatorId}"`);
        const path = `${this.config.tenantUrl}/v1.0/authnmethods/signatures?search=${encodedValue}`;
        const options = {
            method: enums_1.EMethods.GET,
            url: path
        };
        return this._handleResponse(options, token);
    }
}
exports.default = AuthenticatorContext;
//# sourceMappingURL=AuthenticatorContext.js.map