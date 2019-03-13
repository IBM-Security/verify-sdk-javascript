import {AppConfig} from './config';
import VerifyError from './errors/VerifyError';
import utils from './helpers/utils';

const {
  AUTHENTICATOR_CONTEXT_ERROR,
  DEFAULT_POLLING_DELAY,
  DEFAULT_POLLING_ATTEMPTS
} = AppConfig;

function AuthenticatorContext(oauth) {
  if (!oauth) {
      throw new VerifyError(AUTHENTICATOR_CONTEXT_ERROR, 'Oauth parameter is required');
  }
  this.oauth = oauth;
  this.config = this.oauth.getConfig();
  if (this.config.flowType === 'Implicit'){
    this.token = this._fetchToken();
  }
}


AuthenticatorContext.prototype._fetchToken = function(){
  return this.oauth.fetchToken();
};
AuthenticatorContext.prototype._isAuthenticated = function(token){
  return this.oauth.isAuthenticated(token);
};
AuthenticatorContext.prototype._handleResponse = function(options, token){
  return this.oauth.handleResponse(options, token);
};

/**
 * The Authenticator object provides properties and methods to view
 * device information and remove methods
 * @param {object} tokenObj containing access_token, refresh_token ...
 */
AuthenticatorContext.prototype.authenticators = function(tokenObj) {
  let token = tokenObj || this.token;
  if (!token) {
      return Promise.reject(new VerifyError(AUTHENTICATOR_CONTEXT_ERROR, 'token is a required parameter'));
  }
  let path = `${this.config.tenantUrl}/v1.0/authenticators`;
  let options = {
    method: 'GET',
    url: path
  };

  return this._handleResponse(options, token);
};

/**
 * @function initiateAuthenticator
 * Initiates a new authenticator that the client can or enter manually using a mobile device.
 * This method returns base64 encoded data representing a QR code.
 * @param {object} dataObj containing a user friendly name for the registration.
 * @param {object} tokenObj containing access_token, refresh_token ...
 */
AuthenticatorContext.prototype.initiateAuthenticator = function(dataObj, tokenObj) {
  if (arguments.length < 2 && this.config.flowType !== 'Implicit' ) {
      return Promise.reject(new VerifyError(AUTHENTICATOR_CONTEXT_ERROR, 'initiateAuthenticator(dataObj, token), 2 parameters are required ' + arguments.length + ' were given'));
  }

  if (!dataObj) {
      return Promise.reject(new VerifyError(AUTHENTICATOR_CONTEXT_ERROR, 'dataObj cannot be null'));
  }

  let options = {};
  let qrcodeParam = '?qrcodeInResponse=';
  let path = `${this.config.tenantUrl}/v1.0/authenticators/initiation`;

  if (dataObj.hasOwnProperty('qrcodeInResponse') && dataObj.qrcodeInResponse === true){
      qrcodeParam = `${qrcodeParam}true`;
      path = `${path}${qrcodeParam}`;
      options.accept = 'image/png';
  }

  let token = tokenObj || this.token;
  options = {
    method: 'POST',
    url: path,
    data: {
        owner: dataObj.owner || null,
        clientId: this.config.registrationProfileId,
        accountName: dataObj.accountName || 'Default Account'
    }
  };
  return this._handleResponse(options, token);
};


/**
 * @function createVerification function creates a transaction and sends a push notification to the associated authenticator.
 * @param {string} authenticatorId Creates a new verification for the registered authenticator.
 * @param {object} formData  a JSON payload that specifies the verification transaction data
 * @param {object} tokenObj containing access_token, refresh_token ...
 */
AuthenticatorContext.prototype.createVerification = function(authenticatorId, formData, tokenObj) {
  if (arguments.length < 3 && this.config.flowType !== 'Implicit') {
    return Promise.reject(new VerifyError(AUTHENTICATOR_CONTEXT_ERROR, 'createVerification(authenticatorId, formData, token), 3 parameters are required ' + arguments.length + ' were given'));
  }
  
  if (!formData) {
    return Promise.reject(new VerifyError(AUTHENTICATOR_CONTEXT_ERROR, 'formData is a required parameter'));
  }
  
  let token = tokenObj || this.token;
  let path = `${this.config.tenantUrl}/v1.0/authenticators/${authenticatorId}/verifications`;

  let data = {
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
    method: 'POST',
    url: path,
    data: data
  };

  return this._handleResponse(options, token);
};


/**
 * @function viewVerifications Retrieve the list of verification transactions.
 * @param {string} authenticatorId The authenticator registration identifier.
 * @param {object} tokenObj containing access_token, refresh_token ...
 */
AuthenticatorContext.prototype.viewVerifications = function(authenticatorId, tokenObj) {
  if (arguments.length < 2 && this.config.flowType !== 'Implicit' ) {
    return Promise.reject(new VerifyError(AUTHENTICATOR_CONTEXT_ERROR, 'viewVerifications(authenticatorId, token), 2 parameters are required ' + arguments.length + ' were given'));
  }
  
  let token = tokenObj || this.token;
  let path = `${this.config.tenantUrl}/v1.0/authenticators/${authenticatorId}/verifications`;
  let options = {
    method: 'GET',
    url: path
  };
  return this._handleResponse(options, token);
};

/**
 * @function viewVerification Retrieve a specific verification transaction that is associated with an authenticator registration.
 * @param {string} authenticatorId The authenticator registration identifier.
 * @param {string} transactionId The verification transaction identifier.
 * @param {object} tokenObj containing access_token, refresh_token ...
 */
AuthenticatorContext.prototype.viewVerification = function(authenticatorId, transactionId, tokenObj){
      if (arguments.length < 3 && this.config.flowType !== 'Implicit' ) {
        return Promise.reject(new VerifyError(AUTHENTICATOR_CONTEXT_ERROR, 'viewVerification(authenticatorId, transactionId, token), 3 parameters are required ' + arguments.length + ' were given'));
      }
      
  let token = tokenObj || this.token;
  let path = `${this.config.tenantUrl}/v1.0/authenticators/${authenticatorId}/verifications/${transactionId}`;
  let options = {
    method: 'GET',
    url: path
  };
  return this._handleResponse(options, token);
};

/**
 * @function pollVerification recursive function that polls a given transaction id for a state change
 * @param {string} authenticatorId authenticator id
 * @param {object} transactionId transaction id
 * @param {object} tokenObj containing access_token, refresh_token ...
 * @param {object} delay delay between polls
 * @param {object} attempts how many times to poll
 */
AuthenticatorContext.prototype.pollVerification =  async function(authenticatorId, transactionId, tokenObj, delay, attempts) {
  let _tokenObj = tokenObj;
  let _attempts = attempts || DEFAULT_POLLING_ATTEMPTS;
  let _delay = delay || DEFAULT_POLLING_DELAY;

  let tokenRefreshed = false;

  while (_attempts > 0){
    try {
      let payload = await this.viewVerification(authenticatorId, transactionId, tokenObj);

      // token was refreshed
      if (payload.token) {
        tokenRefreshed = true;
        _tokenObj = payload.token;
      }

      // 'PENDING' is default value
      if (payload.response.state !== 'PENDING' || payload.response.state !== 'SENDING') {
        return Promise.resolve({state: payload.response.state, token: tokenRefreshed ? _tokenObj : null});
      }

      await utils.sleep(_delay);
      } catch (error) {
        return Promise.reject(error);
      }

      _attempts --;
    }

    return Promise.reject(new VerifyError('number of polling attempts exceeded'));
};

/**
 * @function enabled function to update attributes of a specific authenticator registration for
 * IBM Verify instances or custom mobile authenticators that are built from the IBM Verify SDK.
 * @param {string} authenticatorId Id of authenticated device
 * @param {boolean} enabled boolean to enable/disable enrolled method
 * @param {object} tokenObj containing access_token, refresh_token ...
 */
AuthenticatorContext.prototype.enabled = function(authenticatorId, enabled, tokenObj) {
  if (arguments.length < 3  && this.config.flowType !== 'Implicit') {
    return Promise.reject(new VerifyError(AUTHENTICATOR_CONTEXT_ERROR, 'enabled(authenticatorId, enabled, token), 3 parameters are required ' + arguments.length + ' were given'));
  }
  
  let token = tokenObj || this.token;
  let path = `${this.config.tenantUrl}/v1.0/authenticators/${authenticatorId}`;
  let options = {
    method: 'PATCH',
    url: path,
    data: [{
      path: '/enabled',
      value: enabled,
      op: 'replace'
    }],
    contentType: 'application/json-patch+json'
  };

  return this._handleResponse(options, token);
};

/**
 * @function deleteAuthenticator function to delete a specific authenticator registration for IBM Verify instances or
 * custom mobile authenticators that are built from the IBM Verify SDK.
 * @param {string} authenticatorId Id of authenticated device to be deleted.
 * @param {object} tokenObj containing access_token, refresh_token ...
 */
AuthenticatorContext.prototype.deleteAuthenticator = function(authenticatorId, tokenObj) {
  if (arguments.length < 2  && this.config.flowType !== 'Implicit') {
    return Promise.reject(new VerifyError(AUTHENTICATOR_CONTEXT_ERROR, 'deleteAuthenticator(authenticatorId, token), 2 parameters are required ' + arguments.length + ' were given'));
  }
  
  let token = tokenObj || this.token;
  let path = `${this.config.tenantUrl}/v1.0/authenticators/${authenticatorId}`;
  let options = {
    method: 'DELETE',
    url: path,
    data: false
  };
  return this._handleResponse(options, token);
};

/**
 * @function methodEnabled Gets or sets the current status of the method.
 * @param {string} id The signature enrollment identifier
 * @param {boolean} enabled Enable / Disable enrolled signature method.
 * @param {object} tokenObj containing access_token, refresh_token ...
 */
AuthenticatorContext.prototype.methodEnabled = function(id, enabled, tokenObj) {
  if (arguments.length < 3  && this.config.flowType !== 'Implicit') {
    return Promise.reject(new VerifyError(AUTHENTICATOR_CONTEXT_ERROR, 'methodEnabled(id, enabled, token), 3 parameters are required ' + arguments.length + ' were given'));
  }
  
  let token = tokenObj || this.token;
  let path = `${this.config.tenantUrl}/v1.0/authnmethods/signatures/${id}`;
  let options = {
    method: 'PATCH',
    url: path,
    data: [{
      path: '/enabled',
      value: enabled,
      op: 'replace'
    }],
    contentType: 'application/json-patch+json'
  };

  return this._handleResponse(options, token);
};

/**
 * @function methods Gets an array of method objects containing all the enrolled methods for a given authenticator.
 * @param {string} authenticatorId unique ID of registered authenticator
 * @param {object} tokenObj containing access_token, refresh_token ...
 */
AuthenticatorContext.prototype.methods = function(authenticatorId, tokenObj) {
  if (arguments.length < 2  && this.config.flowType !== 'Implicit') {
    return Promise.reject(new VerifyError(AUTHENTICATOR_CONTEXT_ERROR, 'methods(authenticatorId, token), 2 parameters are required ' + arguments.length + ' were given'));
  }
  
  let token = tokenObj || this.token;
  let encodedValue = encodeURIComponent(`attributes/authenticatorId="${authenticatorId}"`);
  let path = `${this.config.tenantUrl}/v1.0/authnmethods/signatures?search=${encodedValue}`;
  let options = {
    method: 'GET',
    url: path
  };

  return this._handleResponse(options, token);
};

export default AuthenticatorContext;
