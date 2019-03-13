"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _config = require("./config");

var _VerifyError = _interopRequireDefault(require("./errors/VerifyError"));

var _utils = _interopRequireDefault(require("./helpers/utils"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var AUTHENTICATOR_CONTEXT_ERROR = _config.AppConfig.AUTHENTICATOR_CONTEXT_ERROR,
    DEFAULT_POLLING_DELAY = _config.AppConfig.DEFAULT_POLLING_DELAY,
    DEFAULT_POLLING_ATTEMPTS = _config.AppConfig.DEFAULT_POLLING_ATTEMPTS;

function AuthenticatorContext(oauth) {
  if (!oauth) {
    throw new _VerifyError.default(AUTHENTICATOR_CONTEXT_ERROR, 'Oauth parameter is required');
  }

  this.oauth = oauth;
  this.config = this.oauth.getConfig();

  if (this.config.flowType === 'Implicit') {
    this.token = this._fetchToken();
  }
}

AuthenticatorContext.prototype._fetchToken = function () {
  return this.oauth.fetchToken();
};

AuthenticatorContext.prototype._isAuthenticated = function (token) {
  return this.oauth.isAuthenticated(token);
};

AuthenticatorContext.prototype._handleResponse = function (options, token) {
  return this.oauth.handleResponse(options, token);
};
/**
 * The Authenticator object provides properties and methods to view
 * device information and remove methods
 * @param {object} tokenObj containing access_token, refresh_token ...
 */


AuthenticatorContext.prototype.authenticators = function (tokenObj) {
  var token = tokenObj || this.token;

  if (!token) {
    return Promise.reject(new _VerifyError.default(AUTHENTICATOR_CONTEXT_ERROR, 'token is a required parameter'));
  }

  var path = "".concat(this.config.tenantUrl, "/v1.0/authenticators");
  var options = {
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


AuthenticatorContext.prototype.initiateAuthenticator = function (dataObj, tokenObj) {
  if (arguments.length < 2 && this.config.flowType !== 'Implicit') {
    return Promise.reject(new _VerifyError.default(AUTHENTICATOR_CONTEXT_ERROR, 'initiateAuthenticator(dataObj, token), 2 parameters are required ' + arguments.length + ' were given'));
  }

  if (!dataObj) {
    return Promise.reject(new _VerifyError.default(AUTHENTICATOR_CONTEXT_ERROR, 'dataObj cannot be null'));
  }

  var options = {};
  var qrcodeParam = '?qrcodeInResponse=';
  var path = "".concat(this.config.tenantUrl, "/v1.0/authenticators/initiation");

  if (dataObj.hasOwnProperty('qrcodeInResponse') && dataObj.qrcodeInResponse === true) {
    qrcodeParam = "".concat(qrcodeParam, "true");
    path = "".concat(path).concat(qrcodeParam);
    options.accept = 'image/png';
  }

  var token = tokenObj || this.token;
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


AuthenticatorContext.prototype.createVerification = function (authenticatorId, formData, tokenObj) {
  if (arguments.length < 3 && this.config.flowType !== 'Implicit') {
    return Promise.reject(new _VerifyError.default(AUTHENTICATOR_CONTEXT_ERROR, 'createVerification(authenticatorId, formData, token), 3 parameters are required ' + arguments.length + ' were given'));
  }

  if (!formData) {
    return Promise.reject(new _VerifyError.default(AUTHENTICATOR_CONTEXT_ERROR, 'formData is a required parameter'));
  }

  var token = tokenObj || this.token;
  var path = "".concat(this.config.tenantUrl, "/v1.0/authenticators/").concat(authenticatorId, "/verifications");
  var data = {
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
  var options = {
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


AuthenticatorContext.prototype.viewVerifications = function (authenticatorId, tokenObj) {
  if (arguments.length < 2 && this.config.flowType !== 'Implicit') {
    return Promise.reject(new _VerifyError.default(AUTHENTICATOR_CONTEXT_ERROR, 'viewVerifications(authenticatorId, token), 2 parameters are required ' + arguments.length + ' were given'));
  }

  var token = tokenObj || this.token;
  var path = "".concat(this.config.tenantUrl, "/v1.0/authenticators/").concat(authenticatorId, "/verifications");
  var options = {
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


AuthenticatorContext.prototype.viewVerification = function (authenticatorId, transactionId, tokenObj) {
  if (arguments.length < 3 && this.config.flowType !== 'Implicit') {
    return Promise.reject(new _VerifyError.default(AUTHENTICATOR_CONTEXT_ERROR, 'viewVerification(authenticatorId, transactionId, token), 3 parameters are required ' + arguments.length + ' were given'));
  }

  var token = tokenObj || this.token;
  var path = "".concat(this.config.tenantUrl, "/v1.0/authenticators/").concat(authenticatorId, "/verifications/").concat(transactionId);
  var options = {
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


AuthenticatorContext.prototype.pollVerification =
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee(authenticatorId, transactionId, tokenObj, delay, attempts) {
    var _tokenObj, _attempts, _delay, tokenRefreshed, payload;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _tokenObj = tokenObj;
            _attempts = attempts || DEFAULT_POLLING_ATTEMPTS;
            _delay = delay || DEFAULT_POLLING_DELAY;
            tokenRefreshed = false;

          case 4:
            if (!(_attempts > 0)) {
              _context.next = 22;
              break;
            }

            _context.prev = 5;
            _context.next = 8;
            return this.viewVerification(authenticatorId, transactionId, tokenObj);

          case 8:
            payload = _context.sent;

            // token was refreshed
            if (payload.token) {
              tokenRefreshed = true;
              _tokenObj = payload.token;
            } // 'PENDING' is default value


            if (!(payload.response.state !== 'PENDING' || payload.response.state !== 'SENDING')) {
              _context.next = 12;
              break;
            }

            return _context.abrupt("return", Promise.resolve({
              state: payload.response.state,
              token: tokenRefreshed ? _tokenObj : null
            }));

          case 12:
            _context.next = 14;
            return _utils.default.sleep(_delay);

          case 14:
            _context.next = 19;
            break;

          case 16:
            _context.prev = 16;
            _context.t0 = _context["catch"](5);
            return _context.abrupt("return", Promise.reject(_context.t0));

          case 19:
            _attempts--;
            _context.next = 4;
            break;

          case 22:
            return _context.abrupt("return", Promise.reject(new _VerifyError.default('number of polling attempts exceeded')));

          case 23:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[5, 16]]);
  }));

  return function (_x, _x2, _x3, _x4, _x5) {
    return _ref.apply(this, arguments);
  };
}();
/**
 * @function enabled function to update attributes of a specific authenticator registration for
 * IBM Verify instances or custom mobile authenticators that are built from the IBM Verify SDK.
 * @param {string} authenticatorId Id of authenticated device
 * @param {boolean} enabled boolean to enable/disable enrolled method
 * @param {object} tokenObj containing access_token, refresh_token ...
 */


AuthenticatorContext.prototype.enabled = function (authenticatorId, enabled, tokenObj) {
  if (arguments.length < 3 && this.config.flowType !== 'Implicit') {
    return Promise.reject(new _VerifyError.default(AUTHENTICATOR_CONTEXT_ERROR, 'enabled(authenticatorId, enabled, token), 3 parameters are required ' + arguments.length + ' were given'));
  }

  var token = tokenObj || this.token;
  var path = "".concat(this.config.tenantUrl, "/v1.0/authenticators/").concat(authenticatorId);
  var options = {
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


AuthenticatorContext.prototype.deleteAuthenticator = function (authenticatorId, tokenObj) {
  if (arguments.length < 2 && this.config.flowType !== 'Implicit') {
    return Promise.reject(new _VerifyError.default(AUTHENTICATOR_CONTEXT_ERROR, 'deleteAuthenticator(authenticatorId, token), 2 parameters are required ' + arguments.length + ' were given'));
  }

  var token = tokenObj || this.token;
  var path = "".concat(this.config.tenantUrl, "/v1.0/authenticators/").concat(authenticatorId);
  var options = {
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


AuthenticatorContext.prototype.methodEnabled = function (id, enabled, tokenObj) {
  if (arguments.length < 3 && this.config.flowType !== 'Implicit') {
    return Promise.reject(new _VerifyError.default(AUTHENTICATOR_CONTEXT_ERROR, 'methodEnabled(id, enabled, token), 3 parameters are required ' + arguments.length + ' were given'));
  }

  var token = tokenObj || this.token;
  var path = "".concat(this.config.tenantUrl, "/v1.0/authnmethods/signatures/").concat(id);
  var options = {
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


AuthenticatorContext.prototype.methods = function (authenticatorId, tokenObj) {
  if (arguments.length < 2 && this.config.flowType !== 'Implicit') {
    return Promise.reject(new _VerifyError.default(AUTHENTICATOR_CONTEXT_ERROR, 'methods(authenticatorId, token), 2 parameters are required ' + arguments.length + ' were given'));
  }

  var token = tokenObj || this.token;
  var encodedValue = encodeURIComponent("attributes/authenticatorId=\"".concat(authenticatorId, "\""));
  var path = "".concat(this.config.tenantUrl, "/v1.0/authnmethods/signatures?search=").concat(encodedValue);
  var options = {
    method: 'GET',
    url: path
  };
  return this._handleResponse(options, token);
};

var _default = AuthenticatorContext;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2xpYi9BdXRoZW50aWNhdG9yQ29udGV4dC5qcyJdLCJuYW1lcyI6WyJBVVRIRU5USUNBVE9SX0NPTlRFWFRfRVJST1IiLCJBcHBDb25maWciLCJERUZBVUxUX1BPTExJTkdfREVMQVkiLCJERUZBVUxUX1BPTExJTkdfQVRURU1QVFMiLCJBdXRoZW50aWNhdG9yQ29udGV4dCIsIm9hdXRoIiwiVmVyaWZ5RXJyb3IiLCJjb25maWciLCJnZXRDb25maWciLCJmbG93VHlwZSIsInRva2VuIiwiX2ZldGNoVG9rZW4iLCJwcm90b3R5cGUiLCJmZXRjaFRva2VuIiwiX2lzQXV0aGVudGljYXRlZCIsImlzQXV0aGVudGljYXRlZCIsIl9oYW5kbGVSZXNwb25zZSIsIm9wdGlvbnMiLCJoYW5kbGVSZXNwb25zZSIsImF1dGhlbnRpY2F0b3JzIiwidG9rZW5PYmoiLCJQcm9taXNlIiwicmVqZWN0IiwicGF0aCIsInRlbmFudFVybCIsIm1ldGhvZCIsInVybCIsImluaXRpYXRlQXV0aGVudGljYXRvciIsImRhdGFPYmoiLCJhcmd1bWVudHMiLCJsZW5ndGgiLCJxcmNvZGVQYXJhbSIsImhhc093blByb3BlcnR5IiwicXJjb2RlSW5SZXNwb25zZSIsImFjY2VwdCIsImRhdGEiLCJvd25lciIsImNsaWVudElkIiwicmVnaXN0cmF0aW9uUHJvZmlsZUlkIiwiYWNjb3VudE5hbWUiLCJjcmVhdGVWZXJpZmljYXRpb24iLCJhdXRoZW50aWNhdG9ySWQiLCJmb3JtRGF0YSIsInRyYW5zYWN0aW9uRGF0YSIsIm1lc3NhZ2UiLCJ0eE1lc3NhZ2UiLCJvcmlnaW5JcEFkZHJlc3MiLCJvcmlnaW5Vc2VyQWdlbnQiLCJhZGRpdGlvbmFsRGF0YSIsInR4QWRkaXRpb25hbERhdGEiLCJwdXNoTm90aWZpY2F0aW9uIiwidGl0bGUiLCJzZW5kIiwicHVzaE1lc3NhZ2UiLCJhdXRoZW50aWNhdGlvbk1ldGhvZHMiLCJpZCIsIm1ldGhvZElkIiwibWV0aG9kVHlwZSIsImxvZ2ljIiwiZXhwaXJlc0luIiwiZXhwaXJlcyIsInZpZXdWZXJpZmljYXRpb25zIiwidmlld1ZlcmlmaWNhdGlvbiIsInRyYW5zYWN0aW9uSWQiLCJwb2xsVmVyaWZpY2F0aW9uIiwiZGVsYXkiLCJhdHRlbXB0cyIsIl90b2tlbk9iaiIsIl9hdHRlbXB0cyIsIl9kZWxheSIsInRva2VuUmVmcmVzaGVkIiwicGF5bG9hZCIsInJlc3BvbnNlIiwic3RhdGUiLCJyZXNvbHZlIiwidXRpbHMiLCJzbGVlcCIsImVuYWJsZWQiLCJ2YWx1ZSIsIm9wIiwiY29udGVudFR5cGUiLCJkZWxldGVBdXRoZW50aWNhdG9yIiwibWV0aG9kRW5hYmxlZCIsIm1ldGhvZHMiLCJlbmNvZGVkVmFsdWUiLCJlbmNvZGVVUklDb21wb25lbnQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7SUFHRUEsMkIsR0FHRUMsaUIsQ0FIRkQsMkI7SUFDQUUscUIsR0FFRUQsaUIsQ0FGRkMscUI7SUFDQUMsd0IsR0FDRUYsaUIsQ0FERkUsd0I7O0FBR0YsU0FBU0Msb0JBQVQsQ0FBOEJDLEtBQTlCLEVBQXFDO0FBQ25DLE1BQUksQ0FBQ0EsS0FBTCxFQUFZO0FBQ1IsVUFBTSxJQUFJQyxvQkFBSixDQUFnQk4sMkJBQWhCLEVBQTZDLDZCQUE3QyxDQUFOO0FBQ0g7O0FBQ0QsT0FBS0ssS0FBTCxHQUFhQSxLQUFiO0FBQ0EsT0FBS0UsTUFBTCxHQUFjLEtBQUtGLEtBQUwsQ0FBV0csU0FBWCxFQUFkOztBQUNBLE1BQUksS0FBS0QsTUFBTCxDQUFZRSxRQUFaLEtBQXlCLFVBQTdCLEVBQXdDO0FBQ3RDLFNBQUtDLEtBQUwsR0FBYSxLQUFLQyxXQUFMLEVBQWI7QUFDRDtBQUNGOztBQUdEUCxvQkFBb0IsQ0FBQ1EsU0FBckIsQ0FBK0JELFdBQS9CLEdBQTZDLFlBQVU7QUFDckQsU0FBTyxLQUFLTixLQUFMLENBQVdRLFVBQVgsRUFBUDtBQUNELENBRkQ7O0FBR0FULG9CQUFvQixDQUFDUSxTQUFyQixDQUErQkUsZ0JBQS9CLEdB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cnQgVmVyaWZ5RXJyb3IgZnJvbSAnLi9lcnJvcnMvVmVyaWZ5RXJyb3InO1xuaW1wb3J0IHV0aWxzIGZyb20gJy4vaGVscGVycy91dGlscyc7XG5cbmNvbnN0IHtcbiAgQVVUSEVOVElDQVRPUl9DT05URVhUX0VSUk9SLFxuICBERUZBVUxUX1BPTExJTkdfREVMQVksXG4gIERFRkFVTFRfUE9MTElOR19BVFRFTVBUU1xufSA9IEFwcENvbmZpZztcblxuZnVuY3Rpb24gQXV0aGVudGljYXRvckNvbnRleHQob2F1dGgpIHtcbiAgaWYgKCFvYXV0aCkge1xuICAgICAgdGhyb3cgbmV3IFZlcmlmeUVycm9yKEFVVEhFTlRJQ0FUT1JfQ09OVEVYVF9FUlJPUiwgJ09hdXRoIHBhcmFtZXRlciBpcyByZXF1aXJlZCcpO1xuICB9XG4gIHRoaXMub2F1dGggPSBvYXV0aDtcbiAgdGhpcy5jb25maWcgPSB0aGlzLm9hdXRoLmdldENvbmZpZygpO1xuICBpZiAodGhpcy5jb25maWcuZmxvd1R5cGUgPT09ICdJbXBsaWNpdCcpe1xuICAgIHRoaXMudG9rZW4gPSB0aGlzLl9mZXRjaFRva2VuKCk7XG4gIH1cbn1cblxuXG5BdXRoZW50aWNhdG9yQ29udGV4dC5wcm90b3R5cGUuX2ZldGNoVG9rZW4gPSBmdW5jdGlvbigpe1xuICByZXR1cm4gdGhpcy5vYXV0aC5mZXRjaFRva2VuKCk7XG59O1xuQXV0aGVudGljYXRvckNvbnRleHQucHJvdG90eXBlLl9pc0F1dGhlbnRpY2F0ZWQgPSBmdW5jdGlvbih0b2tlbil7XG4gIHJldHVybiB0aGlzLm9hdXRoLmlzQXV0aGVudGljYXRlZCh0b2tlbik7XG59O1xuQXV0aGVudGljYXRvckNvbnRleHQucHJvdG90eXBlLl9oYW5kbGVSZXNwb25zZSA9IGZ1bmN0aW9uKG9wdGlvbnMsIHRva2VuKXtcbiAgcmV0dXJuIHRoaXMub2F1dGguaGFuZGxlUmVzcG9uc2Uob3B0aW9ucywgdG9rZW4pO1xufTtcblxuLyoqXG4gKiBUaGUgQXV0aGVudGljYXRvciBvYmplY3QgcHJvdmlkZXMgcHJvcGVydGllcyBhbmQgbWV0aG9kcyB0byB2aWV3XG4gKiBkZXZpY2UgaW5mb3JtYXRpb24gYW5kIHJlbW92ZSBtZXRob2RzXG4gKiBAcGFyYW0ge29iamVjdH0gdG9rZW5PYmogY29udGFpbmluZyBhY2Nlc3NfdG9rZW4sIHJlZnJlc2hfdG9rZW4gLi4uXG4gKi9cbkF1dGhlbnRpY2F0b3JDb250ZXh0LnByb3RvdHlwZS5hdXRoZW50aWNhdG9ycyA9IGZ1bmN0aW9uKHRva2VuT2JqKSB7XG4gIGxldCB0b2tlbiA9IHRva2VuT2JqIHx8IHRoaXMudG9rZW47XG4gIGlmICghdG9rZW4pIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgVmVyaWZ5RXJyb3IoQVVUSEVOVElDQVRPUl9DT05URVhUX0VSUk9SLCAndG9rZW4gaXMgYSByZXF1aXJlZCBwYXJhbWV0ZXInKSk7XG4gIH1cbiAgbGV0IHBhdGggPSBgJHt0aGlzLmNvbmZpZy50ZW5hbnRVcmx9L3YxLjAvYXV0aGVudGljYXRvcnNgO1xuICBsZXQgb3B0aW9ucyA9IHtcbiAgICBtZXRob2Q6ICdHRVQnLFxuICAgIHVybDogcGF0aFxuICB9O1xuXG4gIHJldHVybiB0aGlzLl9oYW5kbGVSZXNwb25zZShvcHRpb25zLCB0b2tlbik7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvbiBpbml0aWF0ZUF1dGhlbnRpY2F0b3JcbiAqIEluaXRpYXRlcyBhIG5ldyBhdXRoZW50aWNhdG9yIHRoYXQgdGhlIGNsaWVudCBjYW4gb3IgZW50ZXIgbWFudWFsbHkgdXNpbmcgYSBtb2JpbGUgZGV2aWNlLlxuICogVGhpcyBtZXRob2QgcmV0dXJucyBiYXNlNjQgZW5jb2RlZCBkYXRhIHJlcHJlc2VudGluZyBhIFFSIGNvZGUuXG4gKiBAcGFyYW0ge29iamVjdH0gZGF0YU9iaiBjb250YWluaW5nIGEgdXNlciBmcmllbmRseSBuYW1lIGZvciB0aGUgcmVnaXN0cmF0aW9uLlxuICogQHBhcmFtIHtvYmplY3R9IHRva2VuT2JqIGNvbnRhaW5pbmcgYWNjZXNzX3Rva2VuLCByZWZyZXNoX3Rva2VuIC4uLlxuICovXG5BdXRoZW50aWNhdG9yQ29udGV4dC5wcm90b3R5cGUuaW5pdGlhdGVBdXRoZW50aWNhdG9yID0gZnVuY3Rpb24oZGF0YU9iaiwgdG9rZW5PYmopIHtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyICYmIHRoaXMuY29uZmlnLmZsb3dUeXBlICE9PSAnSW1wbGljaXQnICkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBWZXJpZnlFcnJvcihBVVRIRU5USUNBVE9SX0NPTlRFWFRfRVJST1IsICdpbml0aWF0ZUF1dGhlbnRpY2F0b3IoZGF0YU9iaiwgdG9rZW4pLCAyIHBhcmFtZXRlcnMgYXJlIHJlcXVpcmVkICcgKyBhcmd1bWVudHMubGVuZ3RoICsgJyB3ZXJlIGdpdmVuJykpO1xuICB9XG5cbiAgaWYgKCFkYXRhT2JqKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IFZlcmlmeUVycm9yKEFVVEhFTlRJQ0FUT1JfQ09OVEVYVF9FUlJPUiwgJ2RhdGFPYmogY2Fubm90IGJlIG51bGwnKSk7XG4gIH1cblxuICBsZXQgb3B0aW9ucyA9IHt9O1xuICBsZXQgcXJjb2RlUGFyYW0gPSAnP3FyY29kZUluUmVzcG9uc2U9JztcbiAgbGV0IHBhdGggPSBgJHt0aGlzLmNvbmZpZy50ZW5hbnRVcmx9L3YxLjAvYXV0aGVudGljYXRvcnMvaW5pdGlhdGlvbmA7XG5cbiAgaWYgKGRhdGFPYmouaGFzT3duUHJvcGVydHkoJ3FyY29kZUluUmVzcG9uc2UnKSAmJiBkYXRhT2JqLnFyY29kZUluUmVzcG9uc2UgPT09IHRydWUpe1xuICAgICAgcXJjb2RlUGFyYW0gPSBgJHtxcmNvZGVQYXJhbX10cnVlYDtcbiAgICAgIHBhdGggPSBgJHtwYXRofSR7cXJjb2RlUGFyYW19YDtcbiAgICAgIG9wdGlvbnMuYWNjZXB0ID0gJ2ltYWdlL3BuZyc7XG4gIH1cblxuICBsZXQgdG9rZW4gPSB0b2tlbk9iaiB8fCB0aGlzLnRva2VuO1xuICBvcHRpb25zID0ge1xuICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgIHVybDogcGF0aCxcbiAgICBkYXRhOiB7XG4gICAgICAgIG93bmVyOiBkYXRhT2JqLm93bmVyIHx8IG51bGwsXG4gICAgICAgIGNsaWVudElkOiB0aGlzLmNvbmZpZy5yZWdpc3RyYXRpb25Qcm9maWxlSWQsXG4gICAgICAgIGFjY291bnROYW1lOiBkYXRhT2JqLmFjY291bnROYW1lIHx8ICdEZWZhdWx0IEFjY291bnQnXG4gICAgfVxuICB9O1xuICByZXR1cm4gdGhpcy5faGFuZGxlUmVzcG9uc2Uob3B0aW9ucywgdG9rZW4pO1xufTtcblxuXG4vKipcbiAqIEBmdW5jdGlvbiBjcmVhdGVWZXJpZmljYXRpb24gZnVuY3Rpb24gY3JlYXRlcyBhIHRyYW5zYWN0aW9uIGFuZCBzZW5kcyBhIHB1c2ggbm90aWZpY2F0aW9uIHRvIHRoZSBhc3NvY2lhdGVkIGF1dGhlbnRpY2F0b3IuXG4gKiBAcGFyYW0ge3N0cmluZ30gYXV0aGVudGljYXRvcklkIENyZWF0ZXMgYSBuZXcgdmVyaWZpY2F0aW9uIGZvciB0aGUgcmVnaXN0ZXJlZCBhdXRoZW50aWNhdG9yLlxuICogQHBhcmFtIHtvYmplY3R9IGZvcm1EYXRhICBhIEpTT04gcGF5bG9hZCB0aGF0IHNwZWNpZmllcyB0aGUgdmVyaWZpY2F0aW9uIHRyYW5zYWN0aW9uIGRhdGFcbiAqIEBwYXJhbSB7b2JqZWN0fSB0b2tlbk9iaiBjb250YWluaW5nIGFjY2Vzc190b2tlbiwgcmVmcmVzaF90b2tlbiAuLi5cbiAqL1xuQXV0aGVudGljYXRvckNvbnRleHQucHJvdG90eXBlLmNyZWF0ZVZlcmlmaWNhdGlvbiA9IGZ1bmN0aW9uKGF1dGhlbnRpY2F0b3JJZCwgZm9ybURhdGEsIHRva2VuT2JqKSB7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMyAmJiB0aGlzLmNvbmZpZy5mbG93VHlwZSAhPT0gJ0ltcGxpY2l0Jykge1xuICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgVmVyaWZ5RXJyb3IoQVVUSEVOVElDQVRPUl9DT05URVhUX0VSUk9SLCAnY3JlYXRlVmVyaWZpY2F0aW9uKGF1dGhlbnRpY2F0b3JJZCwgZm9ybURhdGEsIHRva2VuKSwgMyBwYXJhbWV0ZXJzIGFyZSByZXF1aXJlZCAnICsgYXJndW1lbnRzLmxlbmd0aCArICcgd2VyZSBnaXZlbicpKTtcbiAgfVxuICBcbiAgaWYgKCFmb3JtRGF0YSkge1xuICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgVmVyaWZ5RXJyb3IoQVVUSEVOVElDQVRPUl9DT05URVhUX0VSUk9SLCAnZm9ybURhdGEgaXMgYSByZXF1aXJlZCBwYXJhbWV0ZXInKSk7XG4gIH1cbiAgXG4gIGxldCB0b2tlbiA9IHRva2VuT2JqIHx8IHRoaXMudG9rZW47XG4gIGxldCBwYXRoID0gYCR7dGhpcy5jb25maWcudGVuYW50VXJsfS92MS4wL2F1dGhlbnRpY2F0b3JzLyR7YXV0aGVudGljYXRvcklkfS92ZXJpZmljYXRpb25zYDtcblxuICBsZXQgZGF0YSA9IHtcbiAgICB0cmFuc2FjdGlvbkRhdGE6IHtcbiAgICAgIG1lc3NhZ2U6IGZvcm1EYXRhLnR4TWVzc2FnZSB8fCAnICcsXG4gICAgICBvcmlnaW5JcEFkZHJlc3M6IGZvcm1EYXRhLm9yaWdpbklwQWRkcmVzcyB8fCAnICcsXG4gICAgICBvcmlnaW5Vc2VyQWdlbnQ6IGZvcm1EYXRhLm9yaWdpblVzZXJBZ2VudCB8fCAnICcsXG4gICAgICBhZGRpdGlvbmFsRGF0YTogZm9ybURhdGEudHhBZGRpdGlvbmFsRGF0YVxuICAgIH0sXG4gICAgcHVzaE5vdGlmaWNhdGlvbjoge1xuICAgICAgdGl0bGU6IGZvcm1EYXRhLnRpdGxlIHx8ICcgJyxcbiAgICAgIHNlbmQ6IGZvcm1EYXRhLnNlbmQsXG4gICAgICBtZXNzYWdlOiBmb3JtRGF0YS5wdXNoTWVzc2FnZSB8fCAnICdcbiAgICB9LFxuICAgIGF1dGhlbnRpY2F0aW9uTWV0aG9kczogW3tcbiAgICAgIGlkOiBmb3JtRGF0YS5tZXRob2RJZCxcbiAgICAgIG1ldGhvZFR5cGU6ICdzaWduYXR1cmUnXG4gICAgfV0sXG4gICAgbG9naWM6ICdPUicsXG4gICAgZXhwaXJlc0luOiBmb3JtRGF0YS5leHBpcmVzIHx8IDEyMFxuICB9O1xuXG4gIGxldCBvcHRpb25zID0ge1xuICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgIHVybDogcGF0aCxcbiAgICBkYXRhOiBkYXRhXG4gIH07XG5cbiAgcmV0dXJuIHRoaXMuX2hhbmRsZVJlc3BvbnNlKG9wdGlvbnMsIHRva2VuKTtcbn07XG5cblxuLyoqXG4gKiBAZnVuY3Rpb24gdmlld1ZlcmlmaWNhdGlvbnMgUmV0cmlldmUgdGhlIGxpc3Qgb2YgdmVyaWZpY2F0aW9uIHRyYW5zYWN0aW9ucy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBhdXRoZW50aWNhdG9ySWQgVGhlIGF1dGhlbnRpY2F0b3IgcmVnaXN0cmF0aW9uIGlkZW50aWZpZXIuXG4gKiBAcGFyYW0ge29iamVjdH0gdG9rZW5PYmogY29udGFpbmluZyBhY2Nlc3NfdG9rZW4sIHJlZnJlc2hfdG9rZW4gLi4uXG4gKi9cbkF1dGhlbnRpY2F0b3JDb250ZXh0LnByb3RvdHlwZS52aWV3VmVyaWZpY2F0aW9ucyA9IGZ1bmN0aW9uKGF1dGhlbnRpY2F0b3JJZCwgdG9rZW5PYmopIHtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyICYmIHRoaXMuY29uZmlnLmZsb3dUeXBlICE9PSAnSW1wbGljaXQnICkge1xuICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgVmVyaWZ5RXJyb3IoQVVUSEVOVElDQVRPUl9DT05URVhUX0VSUk9SLCAndmlld1ZlcmlmaWNhdGlvbnMoYXV0aGVudGljYXRvcklkLCB0b2tlbiksIDIgcGFyYW1ldGVycyBhcmUgcmVxdWlyZWQgJyArIGFyZ3VtZW50cy5sZW5ndGggKyAnIHdlcmUgZ2l2ZW4nKSk7XG4gIH1cbiAgXG4gIGxldCB0b2tlbiA9IHRva2VuT2JqIHx8IHRoaXMudG9rZW47XG4gIGxldCBwYXRoID0gYCR7dGhpcy5jb25maWcudGVuYW50VXJsfS92MS4wL2F1dGhlbnRpY2F0b3JzLyR7YXV0aGVudGljYXRvcklkfS92ZXJpZmljYXRpb25zYDtcbiAgbGV0IG9wdGlvbnMgPSB7XG4gICAgbWV0aG9kOiAnR0VUJyxcbiAgICB1cmw6IHBhdGhcbiAgfTtcbiAgcmV0dXJuIHRoaXMuX2hhbmRsZVJlc3BvbnNlKG9wdGlvbnMsIHRva2VuKTtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uIHZpZXdWZXJpZmljYXRpb24gUmV0cmlldmUgYSBzcGVjaWZpYyB2ZXJpZmljYXRpb24gdHJhbnNhY3Rpb24gdGhhdCBpcyBhc3NvY2lhdGVkIHdpdGggYW4gYXV0aGVudGljYXRvciByZWdpc3RyYXRpb24uXG4gKiBAcGFyYW0ge3N0cmluZ30gYXV0aGVudGljYXRvcklkIFRoZSBhdXRoZW50aWNhdG9yIHJlZ2lzdHJhdGlvbiBpZGVudGlmaWVyLlxuICogQHBhcmFtIHtzdHJpbmd9IHRyYW5zYWN0aW9uSWQgVGhlIHZlcmlmaWNhdGlvbiB0cmFuc2FjdGlvbiBpZGVudGlmaWVyLlxuICogQHBhcmFtIHtvYmplY3R9IHRva2VuT2JqIGNvbnRhaW5pbmcgYWNjZXNzX3Rva2VuLCByZWZyZXNoX3Rva2VuIC4uLlxuICovXG5BdXRoZW50aWNhdG9yQ29udGV4dC5wcm90b3R5cGUudmlld1ZlcmlmaWNhdGlvbiA9IGZ1bmN0aW9uKGF1dGhlbnRpY2F0b3JJZCwgdHJhbnNhY3Rpb25JZCwgdG9rZW5PYmope1xuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAzICYmIHRoaXMuY29uZmlnLmZsb3dUeXBlICE9PSAnSW1wbGljaXQnICkge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IFZlcmlmeUVycm9yKEFVVEhFTlRJQ0FUT1JfQ09OVEVYVF9FUlJPUiwgJ3ZpZXdWZXJpZmljYXRpb24oYXV0aGVudGljYXRvcklkLCB0cmFuc2FjdGlvbklkLCB0b2tlbiksIDMgcGFyYW1ldGVycyBhcmUgcmVxdWlyZWQgJyArIGFyZ3VtZW50cy5sZW5ndGggKyAnIHdlcmUgZ2l2ZW4nKSk7XG4gICAgICB9XG4gICAgICBcbiAgbGV0IHRva2VuID0gdG9rZW5PYmogfHwgdGhpcy50b2tlbjtcbiAgbGV0IHBhdGggPSBgJHt0aGlzLmNvbmZpZy50ZW5hbnRVcmx9L3YxLjAvYXV0aGVudGljYXRvcnMvJHthdXRoZW50aWNhdG9ySWR9L3ZlcmlmaWNhdGlvbnMvJHt0cmFuc2FjdGlvbklkfWA7XG4gIGxldCBvcHRpb25zID0ge1xuICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgdXJsOiBwYXRoXG4gIH07XG4gIHJldHVybiB0aGlzLl9oYW5kbGVSZXNwb25zZShvcHRpb25zLCB0b2tlbik7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvbiBwb2xsVmVyaWZpY2F0aW9uIHJlY3Vyc2l2ZSBmdW5jdGlvbiB0aGF0IHBvbGxzIGEgZ2l2ZW4gdHJhbnNhY3Rpb24gaWQgZm9yIGEgc3RhdGUgY2hhbmdlXG4gKiBAcGFyYW0ge3N0cmluZ30gYXV0aGVudGljYXRvcklkIGF1dGhlbnRpY2F0b3IgaWRcbiAqIEBwYXJhbSB7b2JqZWN0fSB0cmFuc2FjdGlvbklkIHRyYW5zYWN0aW9uIGlkXG4gKiBAcGFyYW0ge29iamVjdH0gdG9rZW5PYmogY29udGFpbmluZyBhY2Nlc3NfdG9rZW4sIHJlZnJlc2hfdG9rZW4gLi4uXG4gKiBAcGFyYW0ge29iamVjdH0gZGVsYXkgZGVsYXkgYmV0d2VlbiBwb2xsc1xuICogQHBhcmFtIHtvYmplY3R9IGF0dGVtcHRzIGhvdyBtYW55IHRpbWVzIHRvIHBvbGxcbiAqL1xuQXV0aGVudGljYXRvckNvbnRleHQucHJvdG90eXBlLnBvbGxWZXJpZmljYXRpb24gPSAgYXN5bmMgZnVuY3Rpb24oYXV0aGVudGljYXRvcklkLCB0cmFuc2FjdGlvbklkLCB0b2tlbk9iaiwgZGVsYXksIGF0dGVtcHRzKSB7XG4gIGxldCBfdG9rZW5PYmogPSB0b2tlbk9iajtcbiAgbGV0IF9hdHRlbXB0cyA9IGF0dGVtcHRzIHx8IERFRkFVTFRfUE9MTElOR19BVFRFTVBUUztcbiAgbGV0IF9kZWxheSA9IGRlbGF5IHx8IERFRkFVTFRfUE9MTElOR19ERUxBWTtcblxuICBsZXQgdG9rZW5SZWZyZXNoZWQgPSBmYWxzZTtcblxuICB3aGlsZSAoX2F0dGVtcHRzID4gMCl7XG4gICAgdHJ5IHtcbiAgICAgIGxldCBwYXlsb2FkID0gYXdhaXQgdGhpcy52aWV3VmVyaWZpY2F0aW9uKGF1dGhlbnRpY2F0b3JJZCwgdHJhbnNhY3Rpb25JZCwgdG9rZW5PYmopO1xuXG4gICAgICAvLyB0b2tlbiB3YXMgcmVmcmVzaGVkXG4gICAgICBpZiAocGF5bG9hZC50b2tlbikge1xuICAgICAgICB0b2tlblJlZnJlc2hlZCA9IHRydWU7XG4gICAgICAgIF90b2tlbk9iaiA9IHBheWxvYWQudG9rZW47XG4gICAgICB9XG5cbiAgICAgIC8vICdQRU5ESU5HJyBpcyBkZWZhdWx0IHZhbHVlXG4gICAgICBpZiAocGF5bG9hZC5yZXNwb25zZS5zdGF0ZSAhPT0gJ1BFTkRJTkcnIHx8IHBheWxvYWQucmVzcG9uc2Uuc3RhdGUgIT09ICdTRU5ESU5HJykge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHtzdGF0ZTogcGF5bG9hZC5yZXNwb25zZS5zdGF0ZSwgdG9rZW46IHRva2VuUmVmcmVzaGVkID8gX3Rva2VuT2JqIDogbnVsbH0pO1xuICAgICAgfVxuXG4gICAgICBhd2FpdCB1dGlscy5zbGVlcChfZGVsYXkpO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGVycm9yKTtcbiAgICAgIH1cblxuICAgICAgX2F0dGVtcHRzIC0tO1xuICAgIH1cblxuICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgVmVyaWZ5RXJyb3IoJ251bWJlciBvZiBwb2xsaW5nIGF0dGVtcHRzIGV4Y2VlZGVkJykpO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb24gZW5hYmxlZCBmdW5jdGlvbiB0byB1cGRhdGUgYXR0cmlidXRlcyBvZiBhIHNwZWNpZmljIGF1dGhlbnRpY2F0b3IgcmVnaXN0cmF0aW9uIGZvclxuICogSUJNIFZlcmlmeSBpbnN0YW5jZXMgb3IgY3VzdG9tIG1vYmlsZSBhdXRoZW50aWNhdG9ycyB0aGF0IGFyZSBidWlsdCBmcm9tIHRoZSBJQk0gVmVyaWZ5IFNESy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBhdXRoZW50aWNhdG9ySWQgSWQgb2YgYXV0aGVudGljYXRlZCBkZXZpY2VcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gZW5hYmxlZCBib29sZWFuIHRvIGVuYWJsZS9kaXNhYmxlIGVucm9sbGVkIG1ldGhvZFxuICogQHBhcmFtIHtvYmplY3R9IHRva2VuT2JqIGNvbnRhaW5pbmcgYWNjZXNzX3Rva2VuLCByZWZyZXNoX3Rva2VuIC4uLlxuICovXG5BdXRoZW50aWNhdG9yQ29udGV4dC5wcm90b3R5cGUuZW5hYmxlZCA9IGZ1bmN0aW9uKGF1dGhlbnRpY2F0b3JJZCwgZW5hYmxlZCwgdG9rZW5PYmopIHtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAzICAmJiB0aGlzLmNvbmZpZy5mbG93VHlwZSAhPT0gJ0ltcGxpY2l0Jykge1xuICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgVmVyaWZ5RXJyb3IoQVVUSEVOVElDQVRPUl9DT05URVhUX0VSUk9SLCAnZW5hYmxlZChhdXRoZW50aWNhdG9ySWQsIGVuYWJsZWQsIHRva2VuKSwgMyBwYXJhbWV0ZXJzIGFyZSByZXF1aXJlZCAnICsgYXJndW1lbnRzLmxlbmd0aCArICcgd2VyZSBnaXZlbicpKTtcbiAgfVxuICBcbiAgbGV0IHRva2VuID0gdG9rZW5PYmogfHwgdGhpcy50b2tlbjtcbiAgbGV0IHBhdGggPSBgJHt0aGlzLmNvbmZpZy50ZW5hbnRVcmx9L3YxLjAvYXV0aGVudGljYXRvcnMvJHthdXRoZW50aWNhdG9ySWR9YDtcbiAgbGV0IG9wdGlvbnMgPSB7XG4gICAgbWV0aG9kOiAnUEFUQ0gnLFxuICAgIHVybDogcGF0aCxcbiAgICBkYXRhOiBbe1xuICAgICAgcGF0aDogJy9lbmFibGVkJyxcbiAgICAgIHZhbHVlOiBlbmFibGVkLFxuICAgICAgb3A6ICdyZXBsYWNlJ1xuICAgIH1dLFxuICAgIGNvbnRlbnRUeXBlOiAnYXBwbGljYXRpb24vanNvbi1wYXRjaCtqc29uJ1xuICB9O1xuXG4gIHJldHVybiB0aGlzLl9oYW5kbGVSZXNwb25zZShvcHRpb25zLCB0b2tlbik7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvbiBkZWxldGVBdXRoZW50aWNhdG9yIGZ1bmN0aW9uIHRvIGRlbGV0ZSBhIHNwZWNpZmljIGF1dGhlbnRpY2F0b3IgcmVnaXN0cmF0aW9uIGZvciBJQk0gVmVyaWZ5IGluc3RhbmNlcyBvclxuICogY3VzdG9tIG1vYmlsZSBhdXRoZW50aWNhdG9ycyB0aGF0IGFyZSBidWlsdCBmcm9tIHRoZSBJQk0gVmVyaWZ5IFNESy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBhdXRoZW50aWNhdG9ySWQgSWQgb2YgYXV0aGVudGljYXRlZCBkZXZpY2UgdG8gYmUgZGVsZXRlZC5cbiAqIEBwYXJhbSB7b2JqZWN0fSB0b2tlbk9iaiBjb250YWluaW5nIGFjY2Vzc190b2tlbiwgcmVmcmVzaF90b2tlbiAuLi5cbiAqL1xuQXV0aGVudGljYXRvckNvbnRleHQucHJvdG90eXBlLmRlbGV0ZUF1dGhlbnRpY2F0b3IgPSBmdW5jdGlvbihhdXRoZW50aWNhdG9ySWQsIHRva2VuT2JqKSB7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMiAgJiYgdGhpcy5jb25maWcuZmxvd1R5cGUgIT09ICdJbXBsaWNpdCcpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IFZlcmlmeUVycm9yKEFVVEhFTlRJQ0FUT1JfQ09OVEVYVF9FUlJPUiwgJ2RlbGV0ZUF1dGhlbnRpY2F0b3IoYXV0aGVudGljYXRvcklkLCB0b2tlbiksIDIgcGFyYW1ldGVycyBhcmUgcmVxdWlyZWQgJyArIGFyZ3VtZW50cy5sZW5ndGggKyAnIHdlcmUgZ2l2ZW4nKSk7XG4gIH1cbiAgXG4gIGxldCB0b2tlbiA9IHRva2VuT2JqIHx8IHRoaXMudG9rZW47XG4gIGxldCBwYXRoID0gYCR7dGhpcy5jb25maWcudGVuYW50VXJsfS92MS4wL2F1dGhlbnRpY2F0b3JzLyR7YXV0aGVudGljYXRvcklkfWA7XG4gIGxldCBvcHRpb25zID0ge1xuICAgIG1ldGhvZDogJ0RFTEVURScsXG4gICAgdXJsOiBwYXRoLFxuICAgIGRhdGE6IGZhbHNlXG4gIH07XG4gIHJldHVybiB0aGlzLl9oYW5kbGVSZXNwb25zZShvcHRpb25zLCB0b2tlbik7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvbiBtZXRob2RFbmFibGVkIEdldHMgb3Igc2V0cyB0aGUgY3VycmVudCBzdGF0dXMgb2YgdGhlIG1ldGhvZC5cbiAqIEBwYXJhbSB7c3RyaW5nfSBpZCBUaGUgc2lnbmF0dXJlIGVucm9sbG1lbnQgaWRlbnRpZmllclxuICogQHBhcmFtIHtib29sZWFufSBlbmFibGVkIEVuYWJsZSAvIERpc2FibGUgZW5yb2xsZWQgc2lnbmF0dXJlIG1ldGhvZC5cbiAqIEBwYXJhbSB7b2JqZWN0fSB0b2tlbk9iaiBjb250YWluaW5nIGFjY2Vzc190b2tlbiwgcmVmcmVzaF90b2tlbiAuLi5cbiAqL1xuQXV0aGVudGljYXRvckNvbnRleHQucHJvdG90eXBlLm1ldGhvZEVuYWJsZWQgPSBmdW5jdGlvbihpZCwgZW5hYmxlZCwgdG9rZW5PYmopIHtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAzICAmJiB0aGlzLmNvbmZpZy5mbG93VHlwZSAhPT0gJ0ltcGxpY2l0Jykge1xuICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgVmVyaWZ5RXJyb3IoQVVUSEVOVElDQVRPUl9DT05URVhUX0VSUk9SLCAnbWV0aG9kRW5hYmxlZChpZCwgZW5hYmxlZCwgdG9rZW4pLCAzIHBhcmFtZXRlcnMgYXJlIHJlcXVpcmVkICcgKyBhcmd1bWVudHMubGVuZ3RoICsgJyB3ZXJlIGdpdmVuJykpO1xuICB9XG4gIFxuICBsZXQgdG9rZW4gPSB0b2tlbk9iaiB8fCB0aGlzLnRva2VuO1xuICBsZXQgcGF0aCA9IGAke3RoaXMuY29uZmlnLnRlbmFudFVybH0vdjEuMC9hdXRobm1ldGhvZHMvc2lnbmF0dXJlcy8ke2lkfWA7XG4gIGxldCBvcHRpb25zID0ge1xuICAgIG1ldGhvZDogJ1BBVENIJyxcbiAgICB1cmw6IHBhdGgsXG4gICAgZGF0YTogW3tcbiAgICAgIHBhdGg6ICcvZW5hYmxlZCcsXG4gICAgICB2YWx1ZTogZW5hYmxlZCxcbiAgICAgIG9wOiAncmVwbGFjZSdcbiAgICB9XSxcbiAgICBjb250ZW50VHlwZTogJ2FwcGxpY2F0aW9uL2pzb24tcGF0Y2granNvbidcbiAgfTtcblxuICByZXR1cm4gdGhpcy5faGFuZGxlUmVzcG9uc2Uob3B0aW9ucywgdG9rZW4pO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb24gbWV0aG9kcyBHZXRzIGFuIGFycmF5IG9mIG1ldGhvZCBvYmplY3RzIGNvbnRhaW5pbmcgYWxsIHRoZSBlbnJvbGxlZCBtZXRob2RzIGZvciBhIGdpdmVuIGF1dGhlbnRpY2F0b3IuXG4gKiBAcGFyYW0ge3N0cmluZ30gYXV0aGVudGljYXRvcklkIHVuaXF1ZSBJRCBvZiByZWdpc3RlcmVkIGF1dGhlbnRpY2F0b3JcbiAqIEBwYXJhbSB7b2JqZWN0fSB0b2tlbk9iaiBjb250YWluaW5nIGFjY2Vzc190b2tlbiwgcmVmcmVzaF90b2tlbiAuLi5cbiAqL1xuQXV0aGVudGljYXRvckNvbnRleHQucHJvdG90eXBlLm1ldGhvZHMgPSBmdW5jdGlvbihhdXRoZW50aWNhdG9ySWQsIHRva2VuT2JqKSB7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMiAgJiYgdGhpcy5jb25maWcuZmxvd1R5cGUgIT09ICdJbXBsaWNpdCcpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IFZlcmlmeUVycm9yKEFVVEhFTlRJQ0FUT1JfQ09OVEVYVF9FUlJPUiwgJ21ldGhvZHMoYXV0aGVudGljYXRvcklkLCB0b2tlbiksIDIgcGFyYW1ldGVycyBhcmUgcmVxdWlyZWQgJyArIGFyZ3VtZW50cy5sZW5ndGggKyAnIHdlcmUgZ2l2ZW4nKSk7XG4gIH1cbiAgXG4gIGxldCB0b2tlbiA9IHRva2VuT2JqIHx8IHRoaXMudG9rZW47XG4gIGxldCBlbmNvZGVkVmFsdWUgPSBlbmNvZGVVUklDb21wb25lbnQoYGF0dHJpYnV0ZXMvYXV0aGVudGljYXRvcklkPVwiJHthdXRoZW50aWNhdG9ySWR9XCJgKTtcbiAgbGV0IHBhdGggPSBgJHt0aGlzLmNvbmZpZy50ZW5hbnRVcmx9L3YxLjAvYXV0aG5tZXRob2RzL3NpZ25hdHVyZXM/c2VhcmNoPSR7ZW5jb2RlZFZhbHVlfWA7XG4gIGxldCBvcHRpb25zID0ge1xuICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgdXJsOiBwYXRoXG4gIH07XG5cbiAgcmV0dXJuIHRoaXMuX2hhbmRsZVJlc3BvbnNlKG9wdGlvbnMsIHRva2VuKTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IEF1dGhlbnRpY2F0b3JDb250ZXh0O1xuIl19