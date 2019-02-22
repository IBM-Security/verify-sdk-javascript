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

  var token = tokenObj || this.token;
  var path = "".concat(this.config.tenantUrl, "/v1.0/authenticators/initiation?qrcodeInResponse=true");
  var options = {
    method: 'POST',
    url: path,
    data: {
      owner: null,
      clientId: this.config.registrationProfileId,
      accountName: dataObj.accountName || 'Default Account'
    },
    accept: 'image/png'
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


AuthenticatorContext.prototype.pollVerificationIter =
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2xpYi9BdXRoZW50aWNhdG9yQ29udGV4dC5qcyJdLCJuYW1lcyI6WyJBVVRIRU5USUNBVE9SX0NPTlRFWFRfRVJST1IiLCJBcHBDb25maWciLCJERUZBVUxUX1BPTExJTkdfREVMQVkiLCJERUZBVUxUX1BPTExJTkdfQVRURU1QVFMiLCJBdXRoZW50aWNhdG9yQ29udGV4dCIsIm9hdXRoIiwiVmVyaWZ5RXJyb3IiLCJjb25maWciLCJnZXRDb25maWciLCJmbG93VHlwZSIsInRva2VuIiwiX2ZldGNoVG9rZW4iLCJwcm90b3R5cGUiLCJmZXRjaFRva2VuIiwiX2lzQXV0aGVudGljYXRlZCIsImlzQXV0aGVudGljYXRlZCIsIl9oYW5kbGVSZXNwb25zZSIsIm9wdGlvbnMiLCJoYW5kbGVSZXNwb25zZSIsImF1dGhlbnRpY2F0b3JzIiwidG9rZW5PYmoiLCJQcm9taXNlIiwicmVqZWN0IiwicGF0aCIsInRlbmFudFVybCIsIm1ldGhvZCIsInVybCIsImluaXRpYXRlQXV0aGVudGljYXRvciIsImRhdGFPYmoiLCJhcmd1bWVudHMiLCJsZW5ndGgiLCJkYXRhIiwib3duZXIiLCJjbGllbnRJZCIsInJlZ2lzdHJhdGlvblByb2ZpbGVJZCIsImFjY291bnROYW1lIiwiYWNjZXB0IiwiY3JlYXRlVmVyaWZpY2F0aW9uIiwiYXV0aGVudGljYXRvcklkIiwiZm9ybURhdGEiLCJ0cmFuc2FjdGlvbkRhdGEiLCJtZXNzYWdlIiwidHhNZXNzYWdlIiwib3JpZ2luSXBBZGRyZXNzIiwib3JpZ2luVXNlckFnZW50IiwiYWRkaXRpb25hbERhdGEiLCJ0eEFkZGl0aW9uYWxEYXRhIiwicHVzaE5vdGlmaWNhdGlvbiIsInRpdGxlIiwic2VuZCIsInB1c2hNZXNzYWdlIiwiYXV0aGVudGljYXRpb25NZXRob2RzIiwiaWQiLCJtZXRob2RJZCIsIm1ldGhvZFR5cGUiLCJsb2dpYyIsImV4cGlyZXNJbiIsImV4cGlyZXMiLCJ2aWV3VmVyaWZpY2F0aW9ucyIsInZpZXdWZXJpZmljYXRpb24iLCJ0cmFuc2FjdGlvbklkIiwicG9sbFZlcmlmaWNhdGlvbkl0ZXIiLCJkZWxheSIsImF0dGVtcHRzIiwiX3Rva2VuT2JqIiwiX2F0dGVtcHRzIiwiX2RlbGF5IiwidG9rZW5SZWZyZXNoZWQiLCJwYXlsb2FkIiwicmVzcG9uc2UiLCJzdGF0ZSIsInJlc29sdmUiLCJ1dGlscyIsInNsZWVwIiwiZW5hYmxlZCIsInZhbHVlIiwib3AiLCJjb250ZW50VHlwZSIsImRlbGV0ZUF1dGhlbnRpY2F0b3IiLCJtZXRob2RFbmFibGVkIiwibWV0aG9kcyIsImVuY29kZWRWYWx1ZSIsImVuY29kZVVSSUNvbXBvbmVudCJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOztBQUNBOztBQUNBOzs7Ozs7OztJQUdFQSwyQixHQUdFQyxpQixDQUhGRCwyQjtJQUNBRSxxQixHQUVFRCxpQixDQUZGQyxxQjtJQUNBQyx3QixHQUNFRixpQixDQURGRSx3Qjs7QUFHRixTQUFTQyxvQkFBVCxDQUE4QkMsS0FBOUIsRUFBcUM7QUFDbkMsTUFBSSxDQUFDQSxLQUFMLEVBQVk7QUFDUixVQUFNLElBQUlDLG9CQUFKLENBQWdCTiwyQkFBaEIsRUFBNkMsNkJBQTdDLENBQU47QUFDSDs7QUFDRCxPQUFLSyxLQUFMLEdBQWFBLEtBQWI7QUFDQSxPQUFLRSxNQUFMLEdBQWMsS0FBS0YsS0FBTCxDQUFXRyxTQUFYLEVBQWQ7O0FBQ0EsTUFBSSxLQUFLRCxNQUFMLENBQVlFLFFBQVosS0FBeUIsVUFBN0IsRUFBd0M7QUFDdEMsU0FBS0MsS0FBTCxHQUFhLEtBQUtDLFdBQUwsRUFBYjtBQUNEO0FBQ0Y7O0FBR0RQLG9CQUFvQixDQUFDUSxTQUFyQixDQUErQkQsV0FBL0IsR0FBNkMsWUFBVTtBQUNyRCxTQUFPLEtBQUtOLEtBQUwsQ0FBV1EsVUFBWCxFQUFQO0FBQ0QsQ0FGRDs7QUFHQVQsb0JBQW9CLENBQUNRLFNBQXJCLENBQStCRSxnQkFBL0IsR0FBa0QsVUFBU0osS0FBVCxFQUFlO0FBQy9ELFNBQU8sS0FBS0wsS0FBTCxDQUFX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QUMzRSxNQUFJUyxTQUFTLENBQUNDLE1BQVYsR0FBbUIsQ0FBbkIsSUFBeUIsS0FBS3ZCLE1BQUwsQ0FBWUUsUUFBWixLQUF5QixVQUF0RCxFQUFrRTtBQUNoRSxXQUFPWSxPQUFPLENBQUNDLE1BQVIsQ0FBZSxJQUFJaEIsb0JBQUosQ0FBZ0JOLDJCQUFoQixFQUE2QyxnRUFBZ0U2QixTQUFTLENBQUNDLE1BQTFFLEdBQW1GLGFBQWhJLENBQWYsQ0FBUDtBQUNEOztBQUVELE1BQUlwQixLQUFLLEdBQUdVLFFBQVEsSUFBSSxLQUFLVixLQUE3QjtBQUNBLE1BQUl1RSxZQUFZLEdBQUdDLGtCQUFrQix3Q0FBZ0M1QyxlQUFoQyxRQUFyQztBQUNBLE1BQUlmLElBQUksYUFBTSxLQUFLaEIsTUFBTCxDQUFZaUIsU0FBbEIsa0RBQW1FeUQsWUFBbkUsQ0FBUjtBQUNBLE1BQUloRSxPQUFPLEdBQUc7QUFDWlEsSUFBQUEsTUFBTSxFQUFFLEtBREk7QUFFWkMsSUFBQUEsR0FBRyxFQUFFSDtBQUZPLEdBQWQ7QUFLQSxTQUFPLEtBQUtQLGVBQUwsQ0FBcUJDLE9BQXJCLEVBQThCUCxLQUE5QixDQUFQO0FBQ0QsQ0FkRDs7ZUFnQmVOLG9CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtBcHBDb25maWd9IGZyb20gJy4vY29uZmlnJztcbmltcG9ydCBWZXJpZnlFcnJvciBmcm9tICcuL2Vycm9ycy9WZXJpZnlFcnJvcic7XG5pbXBvcnQgdXRpbHMgZnJvbSAnLi9oZWxwZXJzL3V0aWxzJztcblxuY29uc3Qge1xuICBBVVRIRU5USUNBVE9SX0NPTlRFWFRfRVJST1IsXG4gIERFRkFVTFRfUE9MTElOR19ERUxBWSxcbiAgREVGQVVMVF9QT0xMSU5HX0FUVEVNUFRTXG59ID0gQXBwQ29uZmlnO1xuXG5mdW5jdGlvbiBBdXRoZW50aWNhdG9yQ29udGV4dChvYXV0aCkge1xuICBpZiAoIW9hdXRoKSB7XG4gICAgICB0aHJvdyBuZXcgVmVyaWZ5RXJyb3IoQVVUSEVOVElDQVRPUl9DT05URVhUX0VSUk9SLCAnT2F1dGggcGFyYW1ldGVyIGlzIHJlcXVpcmVkJyk7XG4gIH1cbiAgdGhpcy5vYXV0aCA9IG9hdXRoO1xuICB0aGlzLmNvbmZpZyA9IHRoaXMub2F1dGguZ2V0Q29uZmlnKCk7XG4gIGlmICh0aGlzLmNvbmZpZy5mbG93VHlwZSA9PT0gJ0ltcGxpY2l0Jyl7XG4gICAgdGhpcy50b2tlbiA9IHRoaXMuX2ZldGNoVG9rZW4oKTtcbiAgfVxufVxuXG5cbkF1dGhlbnRpY2F0b3JDb250ZXh0LnByb3RvdHlwZS5fZmV0Y2hUb2tlbiA9IGZ1bmN0aW9uKCl7XG4gIHJldHVybiB0aGlzLm9hdXRoLmZldGNoVG9rZW4oKTtcbn07XG5BdXRoZW50aWNhdG9yQ29udGV4dC5wcm90b3R5cGUuX2lzQXV0aGVudGljYXRlZCA9IGZ1bmN0aW9uKHRva2VuKXtcbiAgcmV0dXJuIHRoaXMub2F1dGguaXNBdXRoZW50aWNhdGVkKHRva2VuKTtcbn07XG5BdXRoZW50aWNhdG9yQ29udGV4dC5wcm90b3R5cGUuX2hhbmRsZVJlc3BvbnNlID0gZnVuY3Rpb24ob3B0aW9ucywgdG9rZW4pe1xuICByZXR1cm4gdGhpcy5vYXV0aC5oYW5kbGVSZXNwb25zZShvcHRpb25zLCB0b2tlbik7XG59O1xuXG4vKipcbiAqIFRoZSBBdXRoZW50aWNhdG9yIG9iamVjdCBwcm92aWRlcyBwcm9wZXJ0aWVzIGFuZCBtZXRob2RzIHRvIHZpZXdcbiAqIGRldmljZSBpbmZvcm1hdGlvbiBhbmQgcmVtb3ZlIG1ldGhvZHNcbiAqIEBwYXJhbSB7b2JqZWN0fSB0b2tlbk9iaiBjb250YWluaW5nIGFjY2Vzc190b2tlbiwgcmVmcmVzaF90b2tlbiAuLi5cbiAqL1xuQXV0aGVudGljYXRvckNvbnRleHQucHJvdG90eXBlLmF1dGhlbnRpY2F0b3JzID0gZnVuY3Rpb24odG9rZW5PYmopIHtcbiAgbGV0IHRva2VuID0gdG9rZW5PYmogfHwgdGhpcy50b2tlbjtcbiAgaWYgKCF0b2tlbikge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBWZXJpZnlFcnJvcihBVVRIRU5USUNBVE9SX0NPTlRFWFRfRVJST1IsICd0b2tlbiBpcyBhIHJlcXVpcmVkIHBhcmFtZXRlcicpKTtcbiAgfVxuICBsZXQgcGF0aCA9IGAke3RoaXMuY29uZmlnLnRlbmFudFVybH0vdjEuMC9hdXRoZW50aWNhdG9yc2A7XG4gIGxldCBvcHRpb25zID0ge1xuICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgdXJsOiBwYXRoXG4gIH07XG5cbiAgcmV0dXJuIHRoaXMuX2hhbmRsZVJlc3BvbnNlKG9wdGlvbnMsIHRva2VuKTtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uIGluaXRpYXRlQXV0aGVudGljYXRvclxuICogSW5pdGlhdGVzIGEgbmV3IGF1dGhlbnRpY2F0b3IgdGhhdCB0aGUgY2xpZW50IGNhbiBvciBlbnRlciBtYW51YWxseSB1c2luZyBhIG1vYmlsZSBkZXZpY2UuXG4gKiBUaGlzIG1ldGhvZCByZXR1cm5zIGJhc2U2NCBlbmNvZGVkIGRhdGEgcmVwcmVzZW50aW5nIGEgUVIgY29kZS5cbiAqIEBwYXJhbSB7b2JqZWN0fSBkYXRhT2JqIGNvbnRhaW5pbmcgYSB1c2VyIGZyaWVuZGx5IG5hbWUgZm9yIHRoZSByZWdpc3RyYXRpb24uXG4gKiBAcGFyYW0ge29iamVjdH0gdG9rZW5PYmogY29udGFpbmluZyBhY2Nlc3NfdG9rZW4sIHJlZnJlc2hfdG9rZW4gLi4uXG4gKi9cbkF1dGhlbnRpY2F0b3JDb250ZXh0LnByb3RvdHlwZS5pbml0aWF0ZUF1dGhlbnRpY2F0b3IgPSBmdW5jdGlvbihkYXRhT2JqLCB0b2tlbk9iaikge1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIgJiYgdGhpcy5jb25maWcuZmxvd1R5cGUgIT09ICdJbXBsaWNpdCcgKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IFZlcmlmeUVycm9yKEFVVEhFTlRJQ0FUT1JfQ09OVEVYVF9FUlJPUiwgJ2luaXRpYXRlQXV0aGVudGljYXRvcihkYXRhT2JqLCB0b2tlbiksIDIgcGFyYW1ldGVycyBhcmUgcmVxdWlyZWQgJyArIGFyZ3VtZW50cy5sZW5ndGggKyAnIHdlcmUgZ2l2ZW4nKSk7XG4gIH1cblxuICBpZiAoIWRhdGFPYmopIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgVmVyaWZ5RXJyb3IoQVVUSEVOVElDQVRPUl9DT05URVhUX0VSUk9SLCAnZGF0YU9iaiBjYW5ub3QgYmUgbnVsbCcpKTtcbiAgfVxuICBsZXQgdG9rZW4gPSB0b2tlbk9iaiB8fCB0aGlzLnRva2VuO1xuICBsZXQgcGF0aCA9IGAke3RoaXMuY29uZmlnLnRlbmFudFVybH0vdjEuMC9hdXRoZW50aWNhdG9ycy9pbml0aWF0aW9uP3FyY29kZUluUmVzcG9uc2U9dHJ1ZWA7XG4gIGxldCBvcHRpb25zID0ge1xuICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgIHVybDogcGF0aCxcbiAgICBkYXRhOiB7XG4gICAgICAgIG93bmVyOiBudWxsLFxuICAgICAgICBjbGllbnRJZDogdGhpcy5jb25maWcucmVnaXN0cmF0aW9uUHJvZmlsZUlkLFxuICAgICAgICBhY2NvdW50TmFtZTogZGF0YU9iai5hY2NvdW50TmFtZSB8fCAnRGVmYXVsdCBBY2NvdW50J1xuICAgIH0sXG4gICAgYWNjZXB0OiAnaW1hZ2UvcG5nJ1xuICB9O1xuICByZXR1cm4gdGhpcy5faGFuZGxlUmVzcG9uc2Uob3B0aW9ucywgdG9rZW4pO1xufTtcblxuXG4vKipcbiAqIEBmdW5jdGlvbiBjcmVhdGVWZXJpZmljYXRpb24gZnVuY3Rpb24gY3JlYXRlcyBhIHRyYW5zYWN0aW9uIGFuZCBzZW5kcyBhIHB1c2ggbm90aWZpY2F0aW9uIHRvIHRoZSBhc3NvY2lhdGVkIGF1dGhlbnRpY2F0b3IuXG4gKiBAcGFyYW0ge3N0cmluZ30gYXV0aGVudGljYXRvcklkIENyZWF0ZXMgYSBuZXcgdmVyaWZpY2F0aW9uIGZvciB0aGUgcmVnaXN0ZXJlZCBhdXRoZW50aWNhdG9yLlxuICogQHBhcmFtIHtvYmplY3R9IGZvcm1EYXRhICBhIEpTT04gcGF5bG9hZCB0aGF0IHNwZWNpZmllcyB0aGUgdmVyaWZpY2F0aW9uIHRyYW5zYWN0aW9uIGRhdGFcbiAqIEBwYXJhbSB7b2JqZWN0fSB0b2tlbk9iaiBjb250YWluaW5nIGFjY2Vzc190b2tlbiwgcmVmcmVzaF90b2tlbiAuLi5cbiAqL1xuQXV0aGVudGljYXRvckNvbnRleHQucHJvdG90eXBlLmNyZWF0ZVZlcmlmaWNhdGlvbiA9IGZ1bmN0aW9uKGF1dGhlbnRpY2F0b3JJZCwgZm9ybURhdGEsIHRva2VuT2JqKSB7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMyAmJiB0aGlzLmNvbmZpZy5mbG93VHlwZSAhPT0gJ0ltcGxpY2l0Jykge1xuICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgVmVyaWZ5RXJyb3IoQVVUSEVOVElDQVRPUl9DT05URVhUX0VSUk9SLCAnY3JlYXRlVmVyaWZpY2F0aW9uKGF1dGhlbnRpY2F0b3JJZCwgZm9ybURhdGEsIHRva2VuKSwgMyBwYXJhbWV0ZXJzIGFyZSByZXF1aXJlZCAnICsgYXJndW1lbnRzLmxlbmd0aCArICcgd2VyZSBnaXZlbicpKTtcbiAgfVxuICBcbiAgaWYgKCFmb3JtRGF0YSkge1xuICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgVmVyaWZ5RXJyb3IoQVVUSEVOVElDQVRPUl9DT05URVhUX0VSUk9SLCAnZm9ybURhdGEgaXMgYSByZXF1aXJlZCBwYXJhbWV0ZXInKSk7XG4gIH1cbiAgXG4gIGxldCB0b2tlbiA9IHRva2VuT2JqIHx8IHRoaXMudG9rZW47XG4gIGxldCBwYXRoID0gYCR7dGhpcy5jb25maWcudGVuYW50VXJsfS92MS4wL2F1dGhlbnRpY2F0b3JzLyR7YXV0aGVudGljYXRvcklkfS92ZXJpZmljYXRpb25zYDtcblxuICBsZXQgZGF0YSA9IHtcbiAgICB0cmFuc2FjdGlvbkRhdGE6IHtcbiAgICAgIG1lc3NhZ2U6IGZvcm1EYXRhLnR4TWVzc2FnZSB8fCAnICcsXG4gICAgICBvcmlnaW5JcEFkZHJlc3M6IGZvcm1EYXRhLm9yaWdpbklwQWRkcmVzcyB8fCAnICcsXG4gICAgICBvcmlnaW5Vc2VyQWdlbnQ6IGZvcm1EYXRhLm9yaWdpblVzZXJBZ2VudCB8fCAnICcsXG4gICAgICBhZGRpdGlvbmFsRGF0YTogZm9ybURhdGEudHhBZGRpdGlvbmFsRGF0YVxuICAgIH0sXG4gICAgcHVzaE5vdGlmaWNhdGlvbjoge1xuICAgICAgdGl0bGU6IGZvcm1EYXRhLnRpdGxlIHx8ICcgJyxcbiAgICAgIHNlbmQ6IGZvcm1EYXRhLnNlbmQsXG4gICAgICBtZXNzYWdlOiBmb3JtRGF0YS5wdXNoTWVzc2FnZSB8fCAnICdcbiAgICB9LFxuICAgIGF1dGhlbnRpY2F0aW9uTWV0aG9kczogW3tcbiAgICAgIGlkOiBmb3JtRGF0YS5tZXRob2RJZCxcbiAgICAgIG1ldGhvZFR5cGU6ICdzaWduYXR1cmUnXG4gICAgfV0sXG4gICAgbG9naWM6ICdPUicsXG4gICAgZXhwaXJlc0luOiBmb3JtRGF0YS5leHBpcmVzIHx8IDEyMFxuICB9O1xuXG4gIGxldCBvcHRpb25zID0ge1xuICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgIHVybDogcGF0aCxcbiAgICBkYXRhOiBkYXRhXG4gIH07XG5cbiAgcmV0dXJuIHRoaXMuX2hhbmRsZVJlc3BvbnNlKG9wdGlvbnMsIHRva2VuKTtcbn07XG5cblxuLyoqXG4gKiBAZnVuY3Rpb24gdmlld1ZlcmlmaWNhdGlvbnMgUmV0cmlldmUgdGhlIGxpc3Qgb2YgdmVyaWZpY2F0aW9uIHRyYW5zYWN0aW9ucy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBhdXRoZW50aWNhdG9ySWQgVGhlIGF1dGhlbnRpY2F0b3IgcmVnaXN0cmF0aW9uIGlkZW50aWZpZXIuXG4gKiBAcGFyYW0ge29iamVjdH0gdG9rZW5PYmogY29udGFpbmluZyBhY2Nlc3NfdG9rZW4sIHJlZnJlc2hfdG9rZW4gLi4uXG4gKi9cbkF1dGhlbnRpY2F0b3JDb250ZXh0LnByb3RvdHlwZS52aWV3VmVyaWZpY2F0aW9ucyA9IGZ1bmN0aW9uKGF1dGhlbnRpY2F0b3JJZCwgdG9rZW5PYmopIHtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyICYmIHRoaXMuY29uZmlnLmZsb3dUeXBlICE9PSAnSW1wbGljaXQnICkge1xuICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgVmVyaWZ5RXJyb3IoQVVUSEVOVElDQVRPUl9DT05URVhUX0VSUk9SLCAndmlld1ZlcmlmaWNhdGlvbnMoYXV0aGVudGljYXRvcklkLCB0b2tlbiksIDIgcGFyYW1ldGVycyBhcmUgcmVxdWlyZWQgJyArIGFyZ3VtZW50cy5sZW5ndGggKyAnIHdlcmUgZ2l2ZW4nKSk7XG4gIH1cbiAgXG4gIGxldCB0b2tlbiA9IHRva2VuT2JqIHx8IHRoaXMudG9rZW47XG4gIGxldCBwYXRoID0gYCR7dGhpcy5jb25maWcudGVuYW50VXJsfS92MS4wL2F1dGhlbnRpY2F0b3JzLyR7YXV0aGVudGljYXRvcklkfS92ZXJpZmljYXRpb25zYDtcbiAgbGV0IG9wdGlvbnMgPSB7XG4gICAgbWV0aG9kOiAnR0VUJyxcbiAgICB1cmw6IHBhdGhcbiAgfTtcbiAgcmV0dXJuIHRoaXMuX2hhbmRsZVJlc3BvbnNlKG9wdGlvbnMsIHRva2VuKTtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uIHZpZXdWZXJpZmljYXRpb24gUmV0cmlldmUgYSBzcGVjaWZpYyB2ZXJpZmljYXRpb24gdHJhbnNhY3Rpb24gdGhhdCBpcyBhc3NvY2lhdGVkIHdpdGggYW4gYXV0aGVudGljYXRvciByZWdpc3RyYXRpb24uXG4gKiBAcGFyYW0ge3N0cmluZ30gYXV0aGVudGljYXRvcklkIFRoZSBhdXRoZW50aWNhdG9yIHJlZ2lzdHJhdGlvbiBpZGVudGlmaWVyLlxuICogQHBhcmFtIHtzdHJpbmd9IHRyYW5zYWN0aW9uSWQgVGhlIHZlcmlmaWNhdGlvbiB0cmFuc2FjdGlvbiBpZGVudGlmaWVyLlxuICogQHBhcmFtIHtvYmplY3R9IHRva2VuT2JqIGNvbnRhaW5pbmcgYWNjZXNzX3Rva2VuLCByZWZyZXNoX3Rva2VuIC4uLlxuICovXG5BdXRoZW50aWNhdG9yQ29udGV4dC5wcm90b3R5cGUudmlld1ZlcmlmaWNhdGlvbiA9IGZ1bmN0aW9uKGF1dGhlbnRpY2F0b3JJZCwgdHJhbnNhY3Rpb25JZCwgdG9rZW5PYmope1xuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAzICYmIHRoaXMuY29uZmlnLmZsb3dUeXBlICE9PSAnSW1wbGljaXQnICkge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IFZlcmlmeUVycm9yKEFVVEhFTlRJQ0FUT1JfQ09OVEVYVF9FUlJPUiwgJ3ZpZXdWZXJpZmljYXRpb24oYXV0aGVudGljYXRvcklkLCB0cmFuc2FjdGlvbklkLCB0b2tlbiksIDMgcGFyYW1ldGVycyBhcmUgcmVxdWlyZWQgJyArIGFyZ3VtZW50cy5sZW5ndGggKyAnIHdlcmUgZ2l2ZW4nKSk7XG4gICAgICB9XG4gICAgICBcbiAgbGV0IHRva2VuID0gdG9rZW5PYmogfHwgdGhpcy50b2tlbjtcbiAgbGV0IHBhdGggPSBgJHt0aGlzLmNvbmZpZy50ZW5hbnRVcmx9L3YxLjAvYXV0aGVudGljYXRvcnMvJHthdXRoZW50aWNhdG9ySWR9L3ZlcmlmaWNhdGlvbnMvJHt0cmFuc2FjdGlvbklkfWA7XG4gIGxldCBvcHRpb25zID0ge1xuICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgdXJsOiBwYXRoXG4gIH07XG4gIHJldHVybiB0aGlzLl9oYW5kbGVSZXNwb25zZShvcHRpb25zLCB0b2tlbik7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvbiBwb2xsVmVyaWZpY2F0aW9uIHJlY3Vyc2l2ZSBmdW5jdGlvbiB0aGF0IHBvbGxzIGEgZ2l2ZW4gdHJhbnNhY3Rpb24gaWQgZm9yIGEgc3RhdGUgY2hhbmdlXG4gKiBAcGFyYW0ge3N0cmluZ30gYXV0aGVudGljYXRvcklkIGF1dGhlbnRpY2F0b3IgaWRcbiAqIEBwYXJhbSB7b2JqZWN0fSB0cmFuc2FjdGlvbklkIHRyYW5zYWN0aW9uIGlkXG4gKiBAcGFyYW0ge29iamVjdH0gdG9rZW5PYmogY29udGFpbmluZyBhY2Nlc3NfdG9rZW4sIHJlZnJlc2hfdG9rZW4gLi4uXG4gKiBAcGFyYW0ge29iamVjdH0gZGVsYXkgZGVsYXkgYmV0d2VlbiBwb2xsc1xuICogQHBhcmFtIHtvYmplY3R9IGF0dGVtcHRzIGhvdyBtYW55IHRpbWVzIHRvIHBvbGxcbiAqL1xuQXV0aGVudGljYXRvckNvbnRleHQucHJvdG90eXBlLnBvbGxWZXJpZmljYXRpb25JdGVyID0gIGFzeW5jIGZ1bmN0aW9uKGF1dGhlbnRpY2F0b3JJZCwgdHJhbnNhY3Rpb25JZCwgdG9rZW5PYmosIGRlbGF5LCBhdHRlbXB0cykge1xuICBsZXQgX3Rva2VuT2JqID0gdG9rZW5PYmo7XG4gIGxldCBfYXR0ZW1wdHMgPSBhdHRlbXB0cyB8fCBERUZBVUxUX1BPTExJTkdfQVRURU1QVFM7XG4gIGxldCBfZGVsYXkgPSBkZWxheSB8fCBERUZBVUxUX1BPTExJTkdfREVMQVk7XG5cbiAgbGV0IHRva2VuUmVmcmVzaGVkID0gZmFsc2U7XG5cbiAgd2hpbGUgKF9hdHRlbXB0cyA+IDApe1xuICAgIHRyeSB7XG4gICAgICBsZXQgcGF5bG9hZCA9IGF3YWl0IHRoaXMudmlld1ZlcmlmaWNhdGlvbihhdXRoZW50aWNhdG9ySWQsIHRyYW5zYWN0aW9uSWQsIHRva2VuT2JqKTtcblxuICAgICAgLy8gdG9rZW4gd2FzIHJlZnJlc2hlZFxuICAgICAgaWYgKHBheWxvYWQudG9rZW4pIHtcbiAgICAgICAgdG9rZW5SZWZyZXNoZWQgPSB0cnVlO1xuICAgICAgICBfdG9rZW5PYmogPSBwYXlsb2FkLnRva2VuO1xuICAgICAgfVxuXG4gICAgICAvLyAnUEVORElORycgaXMgZGVmYXVsdCB2YWx1ZVxuICAgICAgaWYgKHBheWxvYWQucmVzcG9uc2Uuc3RhdGUgIT09ICdQRU5ESU5HJyB8fCBwYXlsb2FkLnJlc3BvbnNlLnN0YXRlICE9PSAnU0VORElORycpIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7c3RhdGU6IHBheWxvYWQucmVzcG9uc2Uuc3RhdGUsIHRva2VuOiB0b2tlblJlZnJlc2hlZCA/IF90b2tlbk9iaiA6IG51bGx9KTtcbiAgICAgIH1cblxuICAgICAgYXdhaXQgdXRpbHMuc2xlZXAoX2RlbGF5KTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlcnJvcik7XG4gICAgICB9XG5cbiAgICAgIF9hdHRlbXB0cyAtLTtcbiAgICB9XG5cbiAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IFZlcmlmeUVycm9yKCdudW1iZXIgb2YgcG9sbGluZyBhdHRlbXB0cyBleGNlZWRlZCcpKTtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uIGVuYWJsZWQgZnVuY3Rpb24gdG8gdXBkYXRlIGF0dHJpYnV0ZXMgb2YgYSBzcGVjaWZpYyBhdXRoZW50aWNhdG9yIHJlZ2lzdHJhdGlvbiBmb3JcbiAqIElCTSBWZXJpZnkgaW5zdGFuY2VzIG9yIGN1c3RvbSBtb2JpbGUgYXV0aGVudGljYXRvcnMgdGhhdCBhcmUgYnVpbHQgZnJvbSB0aGUgSUJNIFZlcmlmeSBTREsuXG4gKiBAcGFyYW0ge3N0cmluZ30gYXV0aGVudGljYXRvcklkIElkIG9mIGF1dGhlbnRpY2F0ZWQgZGV2aWNlXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGVuYWJsZWQgYm9vbGVhbiB0byBlbmFibGUvZGlzYWJsZSBlbnJvbGxlZCBtZXRob2RcbiAqIEBwYXJhbSB7b2JqZWN0fSB0b2tlbk9iaiBjb250YWluaW5nIGFjY2Vzc190b2tlbiwgcmVmcmVzaF90b2tlbiAuLi5cbiAqL1xuQXV0aGVudGljYXRvckNvbnRleHQucHJvdG90eXBlLmVuYWJsZWQgPSBmdW5jdGlvbihhdXRoZW50aWNhdG9ySWQsIGVuYWJsZWQsIHRva2VuT2JqKSB7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMyAgJiYgdGhpcy5jb25maWcuZmxvd1R5cGUgIT09ICdJbXBsaWNpdCcpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IFZlcmlmeUVycm9yKEFVVEhFTlRJQ0FUT1JfQ09OVEVYVF9FUlJPUiwgJ2VuYWJsZWQoYXV0aGVudGljYXRvcklkLCBlbmFibGVkLCB0b2tlbiksIDMgcGFyYW1ldGVycyBhcmUgcmVxdWlyZWQgJyArIGFyZ3VtZW50cy5sZW5ndGggKyAnIHdlcmUgZ2l2ZW4nKSk7XG4gIH1cbiAgXG4gIGxldCB0b2tlbiA9IHRva2VuT2JqIHx8IHRoaXMudG9rZW47XG4gIGxldCBwYXRoID0gYCR7dGhpcy5jb25maWcudGVuYW50VXJsfS92MS4wL2F1dGhlbnRpY2F0b3JzLyR7YXV0aGVudGljYXRvcklkfWA7XG4gIGxldCBvcHRpb25zID0ge1xuICAgIG1ldGhvZDogJ1BBVENIJyxcbiAgICB1cmw6IHBhdGgsXG4gICAgZGF0YTogW3tcbiAgICAgIHBhdGg6ICcvZW5hYmxlZCcsXG4gICAgICB2YWx1ZTogZW5hYmxlZCxcbiAgICAgIG9wOiAncmVwbGFjZSdcbiAgICB9XSxcbiAgICBjb250ZW50VHlwZTogJ2FwcGxpY2F0aW9uL2pzb24tcGF0Y2granNvbidcbiAgfTtcblxuICByZXR1cm4gdGhpcy5faGFuZGxlUmVzcG9uc2Uob3B0aW9ucywgdG9rZW4pO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb24gZGVsZXRlQXV0aGVudGljYXRvciBmdW5jdGlvbiB0byBkZWxldGUgYSBzcGVjaWZpYyBhdXRoZW50aWNhdG9yIHJlZ2lzdHJhdGlvbiBmb3IgSUJNIFZlcmlmeSBpbnN0YW5jZXMgb3JcbiAqIGN1c3RvbSBtb2JpbGUgYXV0aGVudGljYXRvcnMgdGhhdCBhcmUgYnVpbHQgZnJvbSB0aGUgSUJNIFZlcmlmeSBTREsuXG4gKiBAcGFyYW0ge3N0cmluZ30gYXV0aGVudGljYXRvcklkIElkIG9mIGF1dGhlbnRpY2F0ZWQgZGV2aWNlIHRvIGJlIGRlbGV0ZWQuXG4gKiBAcGFyYW0ge29iamVjdH0gdG9rZW5PYmogY29udGFpbmluZyBhY2Nlc3NfdG9rZW4sIHJlZnJlc2hfdG9rZW4gLi4uXG4gKi9cbkF1dGhlbnRpY2F0b3JDb250ZXh0LnByb3RvdHlwZS5kZWxldGVBdXRoZW50aWNhdG9yID0gZnVuY3Rpb24oYXV0aGVudGljYXRvcklkLCB0b2tlbk9iaikge1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIgICYmIHRoaXMuY29uZmlnLmZsb3dUeXBlICE9PSAnSW1wbGljaXQnKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBWZXJpZnlFcnJvcihBVVRIRU5USUNBVE9SX0NPTlRFWFRfRVJST1IsICdkZWxldGVBdXRoZW50aWNhdG9yKGF1dGhlbnRpY2F0b3JJZCwgdG9rZW4pLCAyIHBhcmFtZXRlcnMgYXJlIHJlcXVpcmVkICcgKyBhcmd1bWVudHMubGVuZ3RoICsgJyB3ZXJlIGdpdmVuJykpO1xuICB9XG4gIFxuICBsZXQgdG9rZW4gPSB0b2tlbk9iaiB8fCB0aGlzLnRva2VuO1xuICBsZXQgcGF0aCA9IGAke3RoaXMuY29uZmlnLnRlbmFudFVybH0vdjEuMC9hdXRoZW50aWNhdG9ycy8ke2F1dGhlbnRpY2F0b3JJZH1gO1xuICBsZXQgb3B0aW9ucyA9IHtcbiAgICBtZXRob2Q6ICdERUxFVEUnLFxuICAgIHVybDogcGF0aCxcbiAgICBkYXRhOiBmYWxzZVxuICB9O1xuICByZXR1cm4gdGhpcy5faGFuZGxlUmVzcG9uc2Uob3B0aW9ucywgdG9rZW4pO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb24gbWV0aG9kRW5hYmxlZCBHZXRzIG9yIHNldHMgdGhlIGN1cnJlbnQgc3RhdHVzIG9mIHRoZSBtZXRob2QuXG4gKiBAcGFyYW0ge3N0cmluZ30gaWQgVGhlIHNpZ25hdHVyZSBlbnJvbGxtZW50IGlkZW50aWZpZXJcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gZW5hYmxlZCBFbmFibGUgLyBEaXNhYmxlIGVucm9sbGVkIHNpZ25hdHVyZSBtZXRob2QuXG4gKiBAcGFyYW0ge29iamVjdH0gdG9rZW5PYmogY29udGFpbmluZyBhY2Nlc3NfdG9rZW4sIHJlZnJlc2hfdG9rZW4gLi4uXG4gKi9cbkF1dGhlbnRpY2F0b3JDb250ZXh0LnByb3RvdHlwZS5tZXRob2RFbmFibGVkID0gZnVuY3Rpb24oaWQsIGVuYWJsZWQsIHRva2VuT2JqKSB7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMyAgJiYgdGhpcy5jb25maWcuZmxvd1R5cGUgIT09ICdJbXBsaWNpdCcpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IFZlcmlmeUVycm9yKEFVVEhFTlRJQ0FUT1JfQ09OVEVYVF9FUlJPUiwgJ21ldGhvZEVuYWJsZWQoaWQsIGVuYWJsZWQsIHRva2VuKSwgMyBwYXJhbWV0ZXJzIGFyZSByZXF1aXJlZCAnICsgYXJndW1lbnRzLmxlbmd0aCArICcgd2VyZSBnaXZlbicpKTtcbiAgfVxuICBcbiAgbGV0IHRva2VuID0gdG9rZW5PYmogfHwgdGhpcy50b2tlbjtcbiAgbGV0IHBhdGggPSBgJHt0aGlzLmNvbmZpZy50ZW5hbnRVcmx9L3YxLjAvYXV0aG5tZXRob2RzL3NpZ25hdHVyZXMvJHtpZH1gO1xuICBsZXQgb3B0aW9ucyA9IHtcbiAgICBtZXRob2Q6ICdQQVRDSCcsXG4gICAgdXJsOiBwYXRoLFxuICAgIGRhdGE6IFt7XG4gICAgICBwYXRoOiAnL2VuYWJsZWQnLFxuICAgICAgdmFsdWU6IGVuYWJsZWQsXG4gICAgICBvcDogJ3JlcGxhY2UnXG4gICAgfV0sXG4gICAgY29udGVudFR5cGU6ICdhcHBsaWNhdGlvbi9qc29uLXBhdGNoK2pzb24nXG4gIH07XG5cbiAgcmV0dXJuIHRoaXMuX2hhbmRsZVJlc3BvbnNlKG9wdGlvbnMsIHRva2VuKTtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uIG1ldGhvZHMgR2V0cyBhbiBhcnJheSBvZiBtZXRob2Qgb2JqZWN0cyBjb250YWluaW5nIGFsbCB0aGUgZW5yb2xsZWQgbWV0aG9kcyBmb3IgYSBnaXZlbiBhdXRoZW50aWNhdG9yLlxuICogQHBhcmFtIHtzdHJpbmd9IGF1dGhlbnRpY2F0b3JJZCB1bmlxdWUgSUQgb2YgcmVnaXN0ZXJlZCBhdXRoZW50aWNhdG9yXG4gKiBAcGFyYW0ge29iamVjdH0gdG9rZW5PYmogY29udGFpbmluZyBhY2Nlc3NfdG9rZW4sIHJlZnJlc2hfdG9rZW4gLi4uXG4gKi9cbkF1dGhlbnRpY2F0b3JDb250ZXh0LnByb3RvdHlwZS5tZXRob2RzID0gZnVuY3Rpb24oYXV0aGVudGljYXRvcklkLCB0b2tlbk9iaikge1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIgICYmIHRoaXMuY29uZmlnLmZsb3dUeXBlICE9PSAnSW1wbGljaXQnKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBWZXJpZnlFcnJvcihBVVRIRU5USUNBVE9SX0NPTlRFWFRfRVJST1IsICdtZXRob2RzKGF1dGhlbnRpY2F0b3JJZCwgdG9rZW4pLCAyIHBhcmFtZXRlcnMgYXJlIHJlcXVpcmVkICcgKyBhcmd1bWVudHMubGVuZ3RoICsgJyB3ZXJlIGdpdmVuJykpO1xuICB9XG4gIFxuICBsZXQgdG9rZW4gPSB0b2tlbk9iaiB8fCB0aGlzLnRva2VuO1xuICBsZXQgZW5jb2RlZFZhbHVlID0gZW5jb2RlVVJJQ29tcG9uZW50KGBhdHRyaWJ1dGVzL2F1dGhlbnRpY2F0b3JJZD1cIiR7YXV0aGVudGljYXRvcklkfVwiYCk7XG4gIGxldCBwYXRoID0gYCR7dGhpcy5jb25maWcudGVuYW50VXJsfS92MS4wL2F1dGhubWV0aG9kcy9zaWduYXR1cmVzP3NlYXJjaD0ke2VuY29kZWRWYWx1ZX1gO1xuICBsZXQgb3B0aW9ucyA9IHtcbiAgICBtZXRob2Q6ICdHRVQnLFxuICAgIHVybDogcGF0aFxuICB9O1xuXG4gIHJldHVybiB0aGlzLl9oYW5kbGVSZXNwb25zZShvcHRpb25zLCB0b2tlbik7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBBdXRoZW50aWNhdG9yQ29udGV4dDtcbiJdfQ==