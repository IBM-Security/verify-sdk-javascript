"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("@babel/polyfill");

var _queryString = _interopRequireDefault(require("query-string"));

var _VerifyError = _interopRequireDefault(require("./errors/VerifyError"));

var _StorageHandler = _interopRequireDefault(require("./helpers/StorageHandler"));

var _config = require("./config");

var _apiRequest = _interopRequireDefault(require("./helpers/apiRequest"));

var _utils = _interopRequireDefault(require("./helpers/utils"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var OAUTH_CONTEXT_CONFIG_SETTINGS_ERROR = _config.AppConfig.OAUTH_CONTEXT_CONFIG_SETTINGS_ERROR,
    OAUTH_CONTEXT_API_ERROR = _config.AppConfig.OAUTH_CONTEXT_API_ERROR,
    TOKEN_ERROR = _config.AppConfig.TOKEN_ERROR;
/**
 *
 * @param {object} config users configuration settings to kick off
 * OAuth implicit flow
 */

function OAuthContext(config) {
  if (!config) {
    throw new _VerifyError.default(OAUTH_CONTEXT_CONFIG_SETTINGS_ERROR, 'Config parameter is required');
  } //Verify config settings


  if (!config.clientId) {
    throw new _VerifyError.default(OAUTH_CONTEXT_CONFIG_SETTINGS_ERROR, 'clientId property is required');
  }

  if (!config.tenantUrl) {
    throw new _VerifyError.default(OAUTH_CONTEXT_CONFIG_SETTINGS_ERROR, 'Tenant URL is required');
  }

  if (!config.redirectUri) {
    throw new _VerifyError.default(OAUTH_CONTEXT_CONFIG_SETTINGS_ERROR, 'A redirect URL is required');
  }

  if (!config.responseType) {
    throw new _VerifyError.default(OAUTH_CONTEXT_CONFIG_SETTINGS_ERROR, 'Response Type required');
  }

  if (!config.scope) {
    throw new _VerifyError.default(OAUTH_CONTEXT_CONFIG_SETTINGS_ERROR, 'scope Property not set in Config settings');
  }

  if (config.flowType === 'AZN' && !config.clientSecret) {
    throw new _VerifyError.default(OAUTH_CONTEXT_CONFIG_SETTINGS_ERROR, 'Client Secret is required for the AZN code flow');
  }

  if (!(config.flowType === 'Implicit' || config.flowType === 'AZN')) {
    throw new _VerifyError.default(OAUTH_CONTEXT_CONFIG_SETTINGS_ERROR, 'Check the flowType property in your configuration object is correct. Should be: "Implicit" or "AZN"');
  }

  if (config.flowType === 'Implicit') {
    if (_utils.default.isNode()) {
      throw new _VerifyError.default(OAUTH_CONTEXT_CONFIG_SETTINGS_ERROR, 'Implicit flow not supported in Node');
    }

    if (!config.storageType) {
      throw new _VerifyError.default(OAUTH_CONTEXT_CONFIG_SETTINGS_ERROR, 'storageType property not set.');
    }

    this.storageHandler = new _StorageHandler.default(config.storageType);
  }

  this.config = config;
}
/**
 * @function isAuthenticated to check current users access_token or refresh_token to
 * determine if they are still valid.
 * @param {object} token the token object with access_token, refreshToken etc.
 */


OAuthContext.prototype.isAuthenticated =
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee(token) {
    var payload;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return this.introspectToken(token);

          case 3:
            payload = _context.sent;
            return _context.abrupt("return", payload.response.active);

          case 7:
            _context.prev = 7;
            _context.t0 = _context["catch"](0);
            return _context.abrupt("return", Promise.reject(_context.t0));

          case 10:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 7]]);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();
/**
 * @function introspectToken to inspect an OIDC token.
 * @param {object} token token object to introspect
 */


OAuthContext.prototype.introspectToken = function (tokenObj) {
  if (!_utils.default.isToken(tokenObj)) {
    return Promise.reject(new _VerifyError.default(TOKEN_ERROR, 'Token parameter is not a valid token'));
  }

  var token = tokenObj || this.token;
  var path = "".concat(this.config.tenantUrl, "/v1.0/endpoint/default/introspect");
  var data = {
    client_id: this.config.clientId,
    client_secret: this.config.clientSecret,
    token: token.access_token
  };

  var encodedData = _queryString.default.stringify(data);

  var options = {
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


OAuthContext.prototype.userinfo = function (tokenObj) {
  var token = tokenObj || this.token;

  if (!_utils.default.isToken(token)) {
    return Promise.reject(new _VerifyError.default(TOKEN_ERROR, 'Token parameter is not a valid token'));
  }

  var path = "".concat(this.config.tenantUrl, "/v1.0/endpoint/default/userinfo");
  var options = {
    method: 'POST',
    url: path,
    contentType: 'application/x-www-form-urlencoded',
    data: _queryString.default.stringify(token.access_token)
  };
  return this.handleResponse(options, token);
};
/**
 * @function fetchToken Used for implicit flow to return the accessToken stored in browser.
*/


OAuthContext.prototype.fetchToken = function () {
  if (this.config.flowType === 'Implicit') {
    try {
      var accessToken = JSON.parse(this.storageHandler.getStorage('token'));
      return accessToken;
    } catch (error) {
      return null;
    }
  } else {
    throw new _VerifyError.default(OAUTH_CONTEXT_API_ERROR, 'fetchToken() can only be used with Implicit flow');
  }
};
/**
 * @function getConfig
 * expose config object for AuthenticatorContext.
 */


OAuthContext.prototype.getConfig = function () {
  return this.config;
};
/**
 * @param {string} path Optional string to redirect user after accessToken has expired
 * Defaults to index page.
 */


OAuthContext.prototype.logout =
/*#__PURE__*/
function () {
  var _ref2 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee2(path, token) {
    var accessToken,
        _args2 = arguments;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (!(this.config.flowType === 'Implicit')) {
              _context2.next = 10;
              break;
            }

            accessToken = this.fetchToken();
            _context2.next = 4;
            return this.revokeToken(accessToken, 'access_token');

          case 4:
            _context2.next = 6;
            return this.storageHandler.clearStorage();

          case 6:
            _context2.next = 8;
            return window.location.replace(path || '/');

          case 8:
            _context2.next = 11;
            break;

          case 10:
            if (this.config.flowType === 'AZN') {
              // path and token supplied
              if (_args2.length === 2 && !_utils.default.isToken(token)) {
                Promise.reject(new _VerifyError.default(TOKEN_ERROR, 'not a valid token.'));
              } // no path but a 'token' provided


              if (_args2.length === 1 && !_utils.default.isToken(path)) {
                Promise.reject(new _VerifyError.default(TOKEN_ERROR, 'not a valid token.'));
              }

              if (_args2.length === 2) {
                this.revokeToken(token, 'access_token');
              } else {
                this.revokeToken(path, 'access_token');
              }
            }

          case 11:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function (_x2, _x3) {
    return _ref2.apply(this, arguments);
  };
}();
/**
 * @function revokeToken used to revoke valid tokens.
 * @param {object} token the Token object containing access_token, refresh_token etc...
 * @param {string} tokenType the token type to be revoked "access_token" or "refresh_token".
 */


OAuthContext.prototype.revokeToken = function (token, tokenType) {
  var path = "".concat(this.config.tenantUrl, "/v1.0/endpoint/default/revoke");
  var expireToken;
  var encodedData;
  var options;

  if (arguments.length < 2) {
    throw new _VerifyError.default(OAUTH_CONTEXT_API_ERROR, 'revokeToken(token, tokenType), 2 parameters are required ' + arguments.length + ' were given');
  }

  if (!token) {
    throw new _VerifyError.default(OAUTH_CONTEXT_API_ERROR, 'token cannot be null');
  }

  if (!(tokenType === 'access_token' || tokenType === 'refresh_token')) {
    throw new _VerifyError.default(OAUTH_CONTEXT_API_ERROR, "Parameter: ".concat(tokenType, " is invalid.\n Supported values are \"access_token\" or \"refresh_token"));
  }

  expireToken = tokenType === 'access_token' ? token.access_token : token.refresh_token;
  var data = {
    client_id: this.config.clientId,
    client_secret: this.config.clientSecret,
    token: expireToken
  };
  encodedData = _queryString.default.stringify(data);
  options = {
    method: 'POST',
    contentType: 'application/x-www-form-urlencoded',
    url: path,
    data: encodedData
  }; // token is not required, but handleResponse will throw error without it

  return this.handleResponse(options, token);
};
/**
 *
 * @param {string} hashString the url hash fragment
 * return url hash fragment as an object
 */


OAuthContext.prototype._parseUrlHash = function (hashString) {
  var parsedHash = _queryString.default.parse(hashString);

  return parsedHash;
};
/**
 * @function setSession Used for Implicit flow. Creates a session for the SDK to manage the access token
 * validity for the given user. Clears browser storage on access token expiry.
 */


OAuthContext.prototype._setSession = function () {
  var _this = this;

  if (_utils.default.isNode()) {
    throw new _VerifyError.default(OAUTH_CONTEXT_API_ERROR, '_setSession() is not supported in Node');
  }

  var expiresAt = JSON.parse(this.storageHandler.getStorage('token')).expires_in;
  var clockSkew = _config.AppConfig.DEFAULT_CLOCK_SKEW;
  var delay = expiresAt - (Date.now() - clockSkew);

  if (delay > 0) {
    setTimeout(function () {
      _this.session = false;

      _this.storageHandler.clearStorage();
    }, delay);
  }
};
/**
 *
 * @param {string} params
 * @function getToken to make api request to Cloud Identity Authorization server
 * to retrieve access_token, refresh_token, grant_id...
 */


OAuthContext.prototype.getToken = function (params) {
  if (this.config.flowType === 'Implicit') {
    throw new _VerifyError.default(OAUTH_CONTEXT_API_ERROR, 'getToken() cannot be used with Implicit flow');
  }

  if (!params) {
    // change message
    throw new _VerifyError.default(OAUTH_CONTEXT_API_ERROR, 'getToken(params), Params are required');
  }

  var query = params.substring(params.indexOf('?'));
  var data = _typeof(query) === 'object' ? query : _queryString.default.parse(query);
  var path = "".concat(this.config.tenantUrl, "/v1.0/endpoint/default/token");
  data.redirect_uri = this.config.redirectUri;
  data.client_id = this.config.clientId;
  data.client_secret = this.config.clientSecret;
  data.grant_type = 'authorization_code';
  data.scope = this.config.scope;

  var encodedData = _queryString.default.stringify(data);

  var options = {
    method: 'POST',
    url: path,
    contentType: 'application/x-www-form-urlencoded',
    data: encodedData
  };
  return (0, _apiRequest.default)(options);
};
/**
 * @function refreshToken
 * @param {string} refreshToken required refresh_token string.
 * Refresh access token when token has expired.
 * Used for AZN flow only.
 */


OAuthContext.prototype.refreshToken = function (token) {
  if (this.config.flowType === 'Implicit') {
    return Promise.reject(new _VerifyError.default(OAUTH_CONTEXT_API_ERROR, 'Implicit flow does not support refresh token'));
  }

  if (!token.hasOwnProperty('refresh_token')) {
    return Promise.reject(new _VerifyError.default(OAUTH_CONTEXT_API_ERROR, 'refresh_token is a required parameter'));
  }

  var path = "".concat(this.config.tenantUrl, "/v1.0/endpoint/default/token");
  var data = {
    refresh_token: token.refresh_token,
    client_id: this.config.clientId,
    client_secret: this.config.clientSecret,
    grant_type: 'refresh_token',
    scope: this.config.scope
  };

  var encodedData = _queryString.default.stringify(data);

  var options = {
    method: 'POST',
    url: path,
    contentType: 'application/x-www-form-urlencoded',
    data: encodedData
  };
  return (0, _apiRequest.default)(options);
};

OAuthContext.prototype._authorize = function (options) {
  return this._buildUrl(options);
};
/**
 * @function login
* used for implicit grant to retrieve url
* and additional params to send user-agent to Cloud Identity login
* screen to authenticate with the authorization server.
*/


OAuthContext.prototype.login = function () {
  var url = this._authorize(this.config);

  return url;
};
/**
 * buildUrl method
 * @param {object} opts configuration object used to create a url to the authorize endpoint
 * for SSO implicit flow
 */


OAuthContext.prototype._buildUrl = function (opts) {
  return opts.tenantUrl + '/oidc/endpoint/default/authorize?' + _queryString.default.stringify({
    client_id: opts.clientId,
    redirect_uri: opts.redirectUri,
    scope: opts.scope,
    response_type: opts.responseType,
    state: _utils.default.randomString(16),
    nonce: _utils.default.randomString(16)
  });
};
/**
/** Authorization code flow (AZN)
 * @function authenticate construct url to enable authentication for user.
 */


OAuthContext.prototype.authenticate = function () {
  return new Promise(function (resolve) {
    resolve(this._authorize(this.config));
  }.bind(this));
};
/**
 *
 * @param {string} hashString the url hash fragment
 * return url hash fragment as an object
 */


OAuthContext.prototype._parseHash = function (hashString) {
  var parsedHash = _queryString.default.parse(hashString);

  return parsedHash;
};
/**
 * @function handleResponse method handles the api request to Cloud Identity
 * @param {object} options Object containing the endpoint params. [method, url ...etc]
 * @param {object} token the token object containing access_token, refresh_token etc.
 */


OAuthContext.prototype.handleResponse =
/*#__PURE__*/
function () {
  var _ref3 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee3(options, tokenObj) {
    var token,
        payload,
        response,
        newToken,
        originalRequest,
        _args3 = arguments;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            if (!(_args3.length < 2)) {
              _context3.next = 2;
              break;
            }

            throw new _VerifyError.default(OAUTH_CONTEXT_API_ERROR, 'handleResponse(options, token), 2 parameters are required ' + _args3.length + ' were given');

          case 2:
            if (_utils.default.isToken(tokenObj)) {
              _context3.next = 4;
              break;
            }

            return _context3.abrupt("return", Promise.reject(new _VerifyError.default(TOKEN_ERROR, 'not a valid token')));

          case 4:
            token = tokenObj; //Define empty payload object

            payload = {
              response: null,
              token: null
            };
            _context3.prev = 6;
            _context3.next = 9;
            return (0, _apiRequest.default)(options, token.access_token);

          case 9:
            response = _context3.sent;
            payload.response = response;

            if (!(this.config.flowType === 'Implicit')) {
              _context3.next = 13;
              break;
            }

            return _context3.abrupt("return", Promise.resolve(response));

          case 13:
            return _context3.abrupt("return", Promise.resolve(payload));

          case 16:
            _context3.prev = 16;
            _context3.t0 = _context3["catch"](6);

            if (!(_context3.t0.status === 401 && _utils.default.isNode())) {
              _context3.next = 29;
              break;
            }

            if (token.refresh_token) {
              _context3.next = 21;
              break;
            }

            return _context3.abrupt("return", Promise.reject(new _VerifyError.default(OAUTH_CONTEXT_API_ERROR, 'access_token expired and refresh_token not found')));

          case 21:
            _context3.next = 23;
            return this.refreshToken(token);

          case 23:
            newToken = _context3.sent;
            _context3.next = 26;
            return (0, _apiRequest.default)(options, newToken.access_token);

          case 26:
            originalRequest = _context3.sent;
            payload = {
              response: originalRequest,
              token: newToken
            };
            return _context3.abrupt("return", Promise.resolve(payload));

          case 29:
            return _context3.abrupt("return", Promise.reject(_context3.t0));

          case 30:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, this, [[6, 16]]);
  }));

  return function (_x4, _x5) {
    return _ref3.apply(this, arguments);
  };
}();
/**
 * @function handleCallback required for implicit flow to handle the authentication / authorization transaction from Cloud Identity
 * and to store the access_token and expires_in values to browser storage.
 */


OAuthContext.prototype.handleCallback = function () {
  if (_utils.default.isNode()) {
    throw new _VerifyError.default(OAUTH_CONTEXT_API_ERROR, 'handleCallback() is only for Implicit flow');
  }

  var urlObj;
  var errorCheck = RegExp('#error');
  var hash = window.location.hash;
  urlObj = _typeof(hash) === 'object' ? hash : this._parseUrlHash(hash);
  return new Promise(function (reject) {
    if (errorCheck.test(hash)) {
      reject(urlObj);
    } else {
      this.storageHandler.setStorage(urlObj);

      this._setSession(); // remove url


      window.location.hash = '';
    }
  }.bind(this));
};

var _default = OAuthContext;
exports.default = _default;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2xpYi9PQXV0aENvbnRleHQuanMiXSwibmFtZXMiOlsiT0FVVEhfQ09OVEVYVF9DT05GSUdfU0VUVElOR1NfRVJST1IiLCJBcHBDb25maWciLCJPQVVUSF9DT05URVhUX0FQSV9FUlJPUiIsIlRPS0VOX0VSUk9SIiwiT0F1dGhDb250ZXh0IiwiY29uZmlnIiwiVmVyaWZ5RXJyb3IiLCJjbGllbnRJZCIsInRlbmFudFVybCIsInJlZGlyZWN0VXJpIiwicmVzcG9uc2VUeXBlIiwic2NvcGUiLCJmbG93VHlwZSIsImNsaWVudFNlY3JldCIsInV0aWxzIiwiaXNOb2RlIiwic3RvcmFnZVR5cGUiLCJzdG9yYWdlSGFuZGxlciIsIlN0b3JhZ2VIYW5kbGVyIiwicHJvdG90eXBlIiwiaXNBdXRoZW50aWNhdGVkIiwidG9rZW4iLCJpbnRyb3NwZWN0VG9rZW4iLCJwYXlsb2FkIiwicmVzcG9uc2UiLCJhY3RpdmUiLCJQcm9taXNlIiwicmVqZWN0IiwidG9rZW5PYmoiLCJpc1Rva2VuIiwicGF0aCIsImRhdGEiLCJjbGllbnRfaWQiLCJjbGllbnRfc2VjcmV0IiwiYWNjZXNzX3Rva2VuIiwiZW5jb2RlZERhdGEiLCJxcyIsInN0cmluZ2lmeSIsIm9wdGlvbnMiLCJtZXRob2QiLCJ1cmwiLCJjb250ZW50VHlwZSIsImhhbmRsZVJlc3BvbnNlIiwidXNlcmluZm8iLCJmZXRjaFRva2VuIiwiYWNjZXNzVG9rZW4iLCJKU09OIiwicGFyc2UiLCJnZXRTdG9yYWdlIiwiZXJyb3IiLCJnZXRDb25maWciLCJsb2dvdXQiLCJyZXZva2VUb2tlbiIsImNsZWFyU3RvcmFnZSIsIndpbmRvdyIsImxvY2F0aW9uIiwicmVwbGFjZSIsImxlbmd0aCIsInRva2VuVHlwZSIsImV4cGlyZVRva2VuIiwiYXJndW1lbnRzIiwicmVmcmVzaF90b2tlbiIsIl9wYXJzZVVybEhhc2giLCJoYXNoU3RyaW5nIiwicGFyc2VkSGFzaCIsIl9zZXRTZXNzaW9uIiwiZXhwaXJlc0F0IiwiZXhwaXJlc19pbiIsImNsb2NrU2tldyIsIkRFRkFVTFRfQ0xPQ0tfU0tFVyIsImRlbGF5IiwiRGF0ZSIsIm5vdyIsInNldFRpbWVvdXQiLCJzZXNzaW9uIiwiZ2V0VG9rZW4iLCJwYXJhbXMiLCJxdWVyeSIsInN1YnN0cmluZyIsImluZGV4T2YiLCJyZWRpcmVjdF91cmkiLCJncmFudF90eXBlIiwicmVmcmVzaFRva2VuIiwiaGFzT3duUHJvcGVydHkiLCJfYXV0aG9yaXplIiwiX2J1aWxkVXJsIiwibG9naW4iLCJvcHRzIiwicmVzcG9uc2VfdHlwZSIsInN0YXRlIiwicmFuZG9tU3RyaW5nIiwibm9uY2UiLCJhdXRoZW50aWNhdGUiLCJyZXNvbHZlIiwiYmluZCIsIl9wYXJzZUhhc2giLCJzdGF0dXMiLCJuZXdUb2tlbiIsIm9yaWdpbmFsUmVxdWVzdCIsImhhbmRsZUNhbGxiYWNrIiwidXJsT2JqIiwiZXJyb3JDaGVjayIsIlJlZ0V4cCIsImhhc2giLCJ0ZXN0Iiwic2V0U3RvcmFnZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7Ozs7O0lBRU9BLG1DLEdBQTZFQyxpQixDQUE3RUQsbUM7SUFBcUNFLHVCLEdBQXdDRCxpQixDQUF4Q0MsdUI7SUFBeUJDLFcsR0FBZUYsaUIsQ0FBZkUsVztBQUNyRTs7Ozs7O0FBS0EsU0FBU0MsWUFBVCxDQUFzQkMsTUFBdEIsRUFBOEI7QUFDNUIsTUFBSSxDQUFDQSxNQUFMLEVBQWE7QUFDVCxVQUFNLElBQUlDLG9CQUFKLENBQWdCTixtQ0FBaEIsRUFBcUQsOEJBQXJELENBQU47QUFDSCxHQUgyQixDQUk1Qjs7O0FBQ0EsTUFBSSxDQUFDSyxNQUFNLENBQUNFLFFBQVosRUFBc0I7QUFDcEIsVUFBTSxJQUFJRCxvQkFBSixDQUFnQk4sbUNBQWhCLEVBQXFELCtCQUFyRCxDQUFOO0FBQ0Q7O0FBQ0QsTUFBSSxDQUFDSyxNQUFNLENBQUNHLFNBQVosRUFBdUI7QUFDckIsVUFBTSxJQUFJRixvQkFBSixD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QUEwQjtBQUN4QjVFLE1BQUFBLE1BQU0sQ0FBQ3lFLE1BQUQsQ0FBTjtBQUNELEtBRkQsTUFFTztBQUNMLFdBQUtuRixjQUFMLENBQW9Cd0YsVUFBcEIsQ0FBK0JMLE1BQS9COztBQUNBLFdBQUtuQyxXQUFMLEdBRkssQ0FHTDs7O0FBQ0FYLE1BQUFBLE1BQU0sQ0FBQ0MsUUFBUCxDQUFnQmdELElBQWhCLEdBQXVCLEVBQXZCO0FBQ0Q7QUFDRixHQVRrQixDQVNqQlQsSUFUaUIsQ0FTWixJQVRZLENBQVosQ0FBUDtBQVVELENBcEJEOztlQXNCZTFGLFkiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgJ0BiYWJlbC9wb2x5ZmlsbCc7XG5pbXBvcnQgcXMgZnJvbSAncXVlcnktc3RyaW5nJztcbmltcG9ydCBWZXJpZnlFcnJvciBmcm9tICcuL2Vycm9ycy9WZXJpZnlFcnJvcic7XG5pbXBvcnQgU3RvcmFnZUhhbmRsZXIgZnJvbSAnLi9oZWxwZXJzL1N0b3JhZ2VIYW5kbGVyJztcbmltcG9ydCB7QXBwQ29uZmlnfSBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQgYXBpUmVxdWVzdCBmcm9tICcuL2hlbHBlcnMvYXBpUmVxdWVzdCc7XG5pbXBvcnQgdXRpbHMgZnJvbSAnLi9oZWxwZXJzL3V0aWxzJztcblxuY29uc3Qge09BVVRIX0NPTlRFWFRfQ09ORklHX1NFVFRJTkdTX0VSUk9SLCBPQVVUSF9DT05URVhUX0FQSV9FUlJPUiwgVE9LRU5fRVJST1J9ID0gQXBwQ29uZmlnO1xuLyoqXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IGNvbmZpZyB1c2VycyBjb25maWd1cmF0aW9uIHNldHRpbmdzIHRvIGtpY2sgb2ZmXG4gKiBPQXV0aCBpbXBsaWNpdCBmbG93XG4gKi9cbmZ1bmN0aW9uIE9BdXRoQ29udGV4dChjb25maWcpIHtcbiAgaWYgKCFjb25maWcpIHtcbiAgICAgIHRocm93IG5ldyBWZXJpZnlFcnJvcihPQVVUSF9DT05URVhUX0NPTkZJR19TRVRUSU5HU19FUlJPUiwgJ0NvbmZpZyBwYXJhbWV0ZXIgaXMgcmVxdWlyZWQnKTtcbiAgfVxuICAvL1ZlcmlmeSBjb25maWcgc2V0dGluZ3NcbiAgaWYgKCFjb25maWcuY2xpZW50SWQpIHtcbiAgICB0aHJvdyBuZXcgVmVyaWZ5RXJyb3IoT0FVVEhfQ09OVEVYVF9DT05GSUdfU0VUVElOR1NfRVJST1IsICdjbGllbnRJZCBwcm9wZXJ0eSBpcyByZXF1aXJlZCcpO1xuICB9XG4gIGlmICghY29uZmlnLnRlbmFudFVybCkge1xuICAgIHRocm93IG5ldyBWZXJpZnlFcnJvcihPQVVUSF9DT05URVhUX0NPTkZJR19TRVRUSU5HU19FUlJPUiwgJ1RlbmFudCBVUkwgaXMgcmVxdWlyZWQnKTtcbiAgfVxuICBpZiAoIWNvbmZpZy5yZWRpcmVjdFVyaSkge1xuICAgIHRocm93IG5ldyBWZXJpZnlFcnJvcihPQVVUSF9DT05URVhUX0NPTkZJR19TRVRUSU5HU19FUlJPUiwgJ0EgcmVkaXJlY3QgVVJMIGlzIHJlcXVpcmVkJyk7XG4gIH1cbiAgaWYgKCFjb25maWcucmVzcG9uc2VUeXBlKSB7XG4gICAgdGhyb3cgbmV3IFZlcmlmeUVycm9yKE9BVVRIX0NPTlRFWFRfQ09ORklHX1NFVFRJTkdTX0VSUk9SLCAnUmVzcG9uc2UgVHlwZSByZXF1aXJlZCcpO1xuICB9XG4gIGlmICghY29uZmlnLnNjb3BlKXtcbiAgICB0aHJvdyBuZXcgVmVyaWZ5RXJyb3IoT0FVVEhfQ09OVEVYVF9DT05GSUdfU0VUVElOR1NfRVJST1IsICdzY29wZSBQcm9wZXJ0eSBub3Qgc2V0IGluIENvbmZpZyBzZXR0aW5ncycpO1xuICB9XG4gIGlmIChjb25maWcuZmxvd1R5cGUgPT09ICdBWk4nICYmICFjb25maWcuY2xpZW50U2VjcmV0KXtcbiAgICB0aHJvdyBuZXcgVmVyaWZ5RXJyb3IoT0FVVEhfQ09OVEVYVF9DT05GSUdfU0VUVElOR1NfRVJST1IsICdDbGllbnQgU2VjcmV0IGlzIHJlcXVpcmVkIGZvciB0aGUgQVpOIGNvZGUgZmxvdycpO1xuICB9XG5cbiAgaWYgKCEoY29uZmlnLmZsb3dUeXBlID09PSAnSW1wbGljaXQnIHx8IGNvbmZpZy5mbG93VHlwZSA9PT0gJ0FaTicpKXtcbiAgICB0aHJvdyBuZXcgVmVyaWZ5RXJyb3IoT0FVVEhfQ09OVEVYVF9DT05GSUdfU0VUVElOR1NfRVJST1IsICdDaGVjayB0aGUgZmxvd1R5cGUgcHJvcGVydHkgaW4geW91ciBjb25maWd1cmF0aW9uIG9iamVjdCBpcyBjb3JyZWN0LiBTaG91bGQgYmU6IFwiSW1wbGljaXRcIiBvciBcIkFaTlwiJyk7XG4gIH1cblxuICBpZiAoY29uZmlnLmZsb3dUeXBlID09PSAnSW1wbGljaXQnKXtcbiAgICBpZiAodXRpbHMuaXNOb2RlKCkpe1xuICAgICAgICB0aHJvdyBuZXcgVmVyaWZ5RXJyb3IoT0FVVEhfQ09OVEVYVF9DT05GSUdfU0VUVElOR1NfRVJST1IsICdJbXBsaWNpdCBmbG93IG5vdCBzdXBwb3J0ZWQgaW4gTm9kZScpO1xuICAgIH1cbiAgICBpZiAoIWNvbmZpZy5zdG9yYWdlVHlwZSl7XG4gICAgICB0aHJvdyBuZXcgVmVyaWZ5RXJyb3IoT0FVVEhfQ09OVEVYVF9DT05GSUdfU0VUVElOR1NfRVJST1IsICdzdG9yYWdlVHlwZSBwcm9wZXJ0eSBub3Qgc2V0LicpO1xuICAgIH1cbiAgICB0aGlzLnN0b3JhZ2VIYW5kbGVyID0gbmV3IFN0b3JhZ2VIYW5kbGVyKGNvbmZpZy5zdG9yYWdlVHlwZSk7XG4gIH1cblxuICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbn1cblxuLyoqXG4gKiBAZnVuY3Rpb24gaXNBdXRoZW50aWNhdGVkIHRvIGNoZWNrIGN1cnJlbnQgdXNlcnMgYWNjZXNzX3Rva2VuIG9yIHJlZnJlc2hfdG9rZW4gdG9cbiAqIGRldGVybWluZSBpZiB0aGV5IGFyZSBzdGlsbCB2YWxpZC5cbiAqIEBwYXJhbSB7b2JqZWN0fSB0b2tlbiB0aGUgdG9rZW4gb2JqZWN0IHdpdGggYWNjZXNzX3Rva2VuLCByZWZyZXNoVG9rZW4gZXRjLlxuICovXG5PQXV0aENvbnRleHQucHJvdG90eXBlLmlzQXV0aGVudGljYXRlZCA9IGFzeW5jIGZ1bmN0aW9uKHRva2VuKXtcbiAgdHJ5IHtcbiAgICBsZXQgcGF5bG9hZCA9IGF3YWl0IHRoaXMuaW50cm9zcGVjdFRva2VuKHRva2VuKTtcbiAgICByZXR1cm4gcGF5bG9hZC5yZXNwb25zZS5hY3RpdmU7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGVycm9yKTtcbiAgfVxufTtcblxuLyoqXG4gKiBAZnVuY3Rpb24gaW50cm9zcGVjdFRva2VuIHRvIGluc3BlY3QgYW4gT0lEQyB0b2tlbi5cbiAqIEBwYXJhbSB7b2JqZWN0fSB0b2tlbiB0b2tlbiBvYmplY3QgdG8gaW50cm9zcGVjdFxuICovXG5PQXV0aENvbnRleHQucHJvdG90eXBlLmludHJvc3BlY3RUb2tlbiA9IGZ1bmN0aW9uKHRva2VuT2JqKXtcbiAgaWYgKCF1dGlscy5pc1Rva2VuKHRva2VuT2JqKSl7XG4gICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBWZXJpZnlFcnJvcihUT0tFTl9FUlJPUiwgJ1Rva2VuIHBhcmFtZXRlciBpcyBub3QgYSB2YWxpZCB0b2tlbicpKTtcbiAgfVxuICBsZXQgdG9rZW4gPSB0b2tlbk9iaiB8fCB0aGlzLnRva2VuO1xuICBsZXQgcGF0aCA9IGAke3RoaXMuY29uZmlnLnRlbmFudFVybH0vdjEuMC9lbmRwb2ludC9kZWZhdWx0L2ludHJvc3BlY3RgO1xuXG4gIGxldCBkYXRhID0ge1xuICAgIGNsaWVudF9pZCA6IHRoaXMuY29uZmlnLmNsaWVudElkLFxuICAgIGNsaWVudF9zZWNyZXQgOiB0aGlzLmNvbmZpZy5jbGllbnRTZWNyZXQsXG4gICAgdG9rZW4gOiB0b2tlbi5hY2Nlc3NfdG9rZW5cbiAgfTtcblxuICBsZXQgZW5jb2RlZERhdGEgPSBxcy5zdHJpbmdpZnkoZGF0YSk7XG5cbiAgbGV0IG9wdGlvbnMgPSB7XG4gICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgdXJsOiBwYXRoLFxuICAgIGNvbnRlbnRUeXBlOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgICBkYXRhOiBlbmNvZGVkRGF0YVxuIH07XG5cbiByZXR1cm4gdGhpcy5oYW5kbGVSZXNwb25zZShvcHRpb25zLCB0b2tlbik7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvbiB1c2VyaW5mbyBBUEkgdG8gZ2V0IHRoZSB1c2VyIGluZm9ybWF0aW9uIHRoYXQgaXMgYXNzb2NpYXRlZCB3aXRoIHRoZSB0b2tlbiBwYXJhbWV0ZXJcbiAqIEBwYXJhbSB7b2JqZWN0fSB0b2tlbk9iaiB0b2tlbiBvYmplY3Qgd2l0aCBhY2Nlc3NfdG9rZW4gcHJvcGVydHkuXG4gKi9cbk9BdXRoQ29udGV4dC5wcm90b3R5cGUudXNlcmluZm8gPSBmdW5jdGlvbih0b2tlbk9iail7XG4gIGxldCB0b2tlbiA9IHRva2VuT2JqIHx8IHRoaXMudG9rZW47XG5cbiAgaWYgKCF1dGlscy5pc1Rva2VuKHRva2VuKSl7XG4gICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBWZXJpZnlFcnJvcihUT0tFTl9FUlJPUiwgJ1Rva2VuIHBhcmFtZXRlciBpcyBub3QgYSB2YWxpZCB0b2tlbicpKTtcbiAgfVxuXG4gIFxuICBsZXQgcGF0aCA9IGAke3RoaXMuY29uZmlnLnRlbmFudFVybH0vdjEuMC9lbmRwb2ludC9kZWZhdWx0L3VzZXJpbmZvYDtcblxuICBsZXQgb3B0aW9ucyA9IHtcbiAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICB1cmw6IHBhdGgsXG4gICAgY29udGVudFR5cGU6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnLFxuICAgIGRhdGE6IHFzLnN0cmluZ2lmeSh0b2tlbi5hY2Nlc3NfdG9rZW4pXG4gIH07XG5cbiAgcmV0dXJuIHRoaXMuaGFuZGxlUmVzcG9uc2Uob3B0aW9ucywgdG9rZW4pO1xufTtcblxuXG4vKipcbiAqIEBmdW5jdGlvbiBmZXRjaFRva2VuIFVzZWQgZm9yIGltcGxpY2l0IGZsb3cgdG8gcmV0dXJuIHRoZSBhY2Nlc3NUb2tlbiBzdG9yZWQgaW4gYnJvd3Nlci5cbiovXG5PQXV0aENvbnRleHQucHJvdG90eXBlLmZldGNoVG9rZW4gPSBmdW5jdGlvbigpe1xuICBpZiAodGhpcy5jb25maWcuZmxvd1R5cGUgPT09ICdJbXBsaWNpdCcgKXtcbiAgICB0cnkge1xuICAgICAgbGV0IGFjY2Vzc1Rva2VuID0gSlNPTi5wYXJzZSh0aGlzLnN0b3JhZ2VIYW5kbGVyLmdldFN0b3JhZ2UoJ3Rva2VuJykpO1xuICAgICAgcmV0dXJuIGFjY2Vzc1Rva2VuO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IFZlcmlmeUVycm9yKE9BVVRIX0NPTlRFWFRfQVBJX0VSUk9SLCAnZmV0Y2hUb2tlbigpIGNhbiBvbmx5IGJlIHVzZWQgd2l0aCBJbXBsaWNpdCBmbG93Jyk7XG4gIH1cbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uIGdldENvbmZpZ1xuICogZXhwb3NlIGNvbmZpZyBvYmplY3QgZm9yIEF1dGhlbnRpY2F0b3JDb250ZXh0LlxuICovXG5PQXV0aENvbnRleHQucHJvdG90eXBlLmdldENvbmZpZyA9IGZ1bmN0aW9uKCl7XG4gIHJldHVybiB0aGlzLmNvbmZpZztcbn07XG5cblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gcGF0aCBPcHRpb25hbCBzdHJpbmcgdG8gcmVkaXJlY3QgdXNlciBhZnRlciBhY2Nlc3NUb2tlbiBoYXMgZXhwaXJlZFxuICogRGVmYXVsdHMgdG8gaW5kZXggcGFnZS5cbiAqL1xuT0F1dGhDb250ZXh0LnByb3RvdHlwZS5sb2dvdXQgPSBhc3luYyBmdW5jdGlvbihwYXRoLCB0b2tlbikge1xuICAvLyBjbGVhciBzdG9yYWdlIGFuZCByZWRpcmVjdCB0byBob21lIHBhZ2VcbiAgaWYgKHRoaXMuY29uZmlnLmZsb3dUeXBlID09PSAnSW1wbGljaXQnICl7XG4gICAgICBsZXQgYWNjZXNzVG9rZW4gPSB0aGlzLmZldGNoVG9rZW4oKTtcbiAgICAgIGF3YWl0IHRoaXMucmV2b2tlVG9rZW4oYWNjZXNzVG9rZW4sICdhY2Nlc3NfdG9rZW4nKTtcbiAgICAgIGF3YWl0IHRoaXMuc3RvcmFnZUhhbmRsZXIuY2xlYXJTdG9yYWdlKCk7XG4gICAgICBhd2FpdCB3aW5kb3cubG9jYXRpb24ucmVwbGFjZShwYXRoIHx8ICcvJyk7XG4gIH0gZWxzZSBpZiAodGhpcy5jb25maWcuZmxvd1R5cGUgPT09ICdBWk4nICl7XG4gICAgLy8gcGF0aCBhbmQgdG9rZW4gc3VwcGxpZWRcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMiAmJiAhdXRpbHMuaXNUb2tlbih0b2tlbikpIHtcbiAgICAgICAgUHJvbWlzZS5yZWplY3QobmV3IFZlcmlmeUVycm9yKFRPS0VOX0VSUk9SLCAnbm90IGEgdmFsaWQgdG9rZW4uJykpO1xuICAgIH1cbiAgICAvLyBubyBwYXRoIGJ1dCBhICd0b2tlbicgcHJvdmlkZWRcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSAmJiAhdXRpbHMuaXNUb2tlbihwYXRoKSkge1xuICAgICAgICBQcm9taXNlLnJlamVjdChuZXcgVmVyaWZ5RXJyb3IoVE9LRU5fRVJST1IsICdub3QgYSB2YWxpZCB0b2tlbi4nKSk7XG4gICAgfVxuXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgdGhpcy5yZXZva2VUb2tlbih0b2tlbiwgJ2FjY2Vzc190b2tlbicpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucmV2b2tlVG9rZW4ocGF0aCwgJ2FjY2Vzc190b2tlbicpO1xuICAgIH1cbiAgfVxufTtcblxuLyoqXG4gKiBAZnVuY3Rpb24gcmV2b2tlVG9rZW4gdXNlZCB0byByZXZva2UgdmFsaWQgdG9rZW5zLlxuICogQHBhcmFtIHtvYmplY3R9IHRva2VuIHRoZSBUb2tlbiBvYmplY3QgY29udGFpbmluZyBhY2Nlc3NfdG9rZW4sIHJlZnJlc2hfdG9rZW4gZXRjLi4uXG4gKiBAcGFyYW0ge3N0cmluZ30gdG9rZW5UeXBlIHRoZSB0b2tlbiB0eXBlIHRvIGJlIHJldm9rZWQgXCJhY2Nlc3NfdG9rZW5cIiBvciBcInJlZnJlc2hfdG9rZW5cIi5cbiAqL1xuT0F1dGhDb250ZXh0LnByb3RvdHlwZS5yZXZva2VUb2tlbiA9IGZ1bmN0aW9uKHRva2VuLCB0b2tlblR5cGUpe1xuICBsZXQgcGF0aCA9IGAke3RoaXMuY29uZmlnLnRlbmFudFVybH0vdjEuMC9lbmRwb2ludC9kZWZhdWx0L3Jldm9rZWA7XG4gIGxldCBleHBpcmVUb2tlbjtcbiAgbGV0IGVuY29kZWREYXRhO1xuICBsZXQgb3B0aW9ucztcblxuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHtcbiAgICAgIHRocm93IG5ldyBWZXJpZnlFcnJvcihPQVVUSF9DT05URVhUX0FQSV9FUlJPUiwgJ3Jldm9rZVRva2VuKHRva2VuLCB0b2tlblR5cGUpLCAyIHBhcmFtZXRlcnMgYXJlIHJlcXVpcmVkICcgKyBhcmd1bWVudHMubGVuZ3RoICsgJyB3ZXJlIGdpdmVuJyk7XG4gIH1cblxuICBpZiAoIXRva2VuKSB7XG4gICAgICB0aHJvdyBuZXcgVmVyaWZ5RXJyb3IoT0FVVEhfQ09OVEVYVF9BUElfRVJST1IsICd0b2tlbiBjYW5ub3QgYmUgbnVsbCcpO1xuICB9XG5cbiAgaWYgKCEodG9rZW5UeXBlID09PSAnYWNjZXNzX3Rva2VuJyB8fCB0b2tlblR5cGUgPT09ICdyZWZyZXNoX3Rva2VuJykpe1xuICAgIHRocm93IG5ldyBWZXJpZnlFcnJvcihPQVVUSF9DT05URVhUX0FQSV9FUlJPUiwgYFBhcmFtZXRlcjogJHt0b2tlblR5cGV9IGlzIGludmFsaWQuXFxuIFN1cHBvcnRlZCB2YWx1ZXMgYXJlIFwiYWNjZXNzX3Rva2VuXCIgb3IgXCJyZWZyZXNoX3Rva2VuYCk7XG4gIH1cblxuICBleHBpcmVUb2tlbiA9IHRva2VuVHlwZSA9PT0gJ2FjY2Vzc190b2tlbicgPyB0b2tlbi5hY2Nlc3NfdG9rZW4gOiB0b2tlbi5yZWZyZXNoX3Rva2VuO1xuXG4gIGxldCBkYXRhID0ge1xuICAgIGNsaWVudF9pZCA6IHRoaXMuY29uZmlnLmNsaWVudElkLFxuICAgIGNsaWVudF9zZWNyZXQgOiB0aGlzLmNvbmZpZy5jbGllbnRTZWNyZXQsXG4gICAgdG9rZW4gOiBleHBpcmVUb2tlblxuICB9O1xuXG4gIGVuY29kZWREYXRhID0gcXMuc3RyaW5naWZ5KGRhdGEpO1xuXG4gIG9wdGlvbnMgPSB7XG4gICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgY29udGVudFR5cGU6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnLFxuICAgIHVybDogcGF0aCxcbiAgICBkYXRhOiBlbmNvZGVkRGF0YVxuICB9O1xuXG4gIC8vIHRva2VuIGlzIG5vdCByZXF1aXJlZCwgYnV0IGhhbmRsZVJlc3BvbnNlIHdpbGwgdGhyb3cgZXJyb3Igd2l0aG91dCBpdFxuICByZXR1cm4gdGhpcy5oYW5kbGVSZXNwb25zZShvcHRpb25zLCB0b2tlbik7XG59O1xuXG4vKipcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gaGFzaFN0cmluZyB0aGUgdXJsIGhhc2ggZnJhZ21lbnRcbiAqIHJldHVybiB1cmwgaGFzaCBmcmFnbWVudCBhcyBhbiBvYmplY3RcbiAqL1xuT0F1dGhDb250ZXh0LnByb3RvdHlwZS5fcGFyc2VVcmxIYXNoID0gZnVuY3Rpb24oaGFzaFN0cmluZykge1xuICBsZXQgcGFyc2VkSGFzaCA9IHFzLnBhcnNlKGhhc2hTdHJpbmcpO1xuICByZXR1cm4gcGFyc2VkSGFzaDtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uIHNldFNlc3Npb24gVXNlZCBmb3IgSW1wbGljaXQgZmxvdy4gQ3JlYXRlcyBhIHNlc3Npb24gZm9yIHRoZSBTREsgdG8gbWFuYWdlIHRoZSBhY2Nlc3MgdG9rZW5cbiAqIHZhbGlkaXR5IGZvciB0aGUgZ2l2ZW4gdXNlci4gQ2xlYXJzIGJyb3dzZXIgc3RvcmFnZSBvbiBhY2Nlc3MgdG9rZW4gZXhwaXJ5LlxuICovXG5PQXV0aENvbnRleHQucHJvdG90eXBlLl9zZXRTZXNzaW9uID0gZnVuY3Rpb24oKSB7XG4gIGlmICh1dGlscy5pc05vZGUoKSkge1xuICAgICAgdGhyb3cgbmV3IFZlcmlmeUVycm9yKE9BVVRIX0NPTlRFWFRfQVBJX0VSUk9SLCAnX3NldFNlc3Npb24oKSBpcyBub3Qgc3VwcG9ydGVkIGluIE5vZGUnKTtcbiAgfVxuICBjb25zdCBleHBpcmVzQXQgPSBKU09OLnBhcnNlKHRoaXMuc3RvcmFnZUhhbmRsZXIuZ2V0U3RvcmFnZSgndG9rZW4nKSkuZXhwaXJlc19pbjtcbiAgY29uc3QgY2xvY2tTa2V3ID0gQXBwQ29uZmlnLkRFRkFVTFRfQ0xPQ0tfU0tFVztcbiAgY29uc3QgZGVsYXkgPSBleHBpcmVzQXQgLSAoRGF0ZS5ub3coKSAtIGNsb2NrU2tldyk7XG5cbiAgaWYgKGRlbGF5ID4gMCkge1xuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy5zZXNzaW9uID0gZmFsc2U7XG4gICAgICB0aGlzLnN0b3JhZ2VIYW5kbGVyLmNsZWFyU3RvcmFnZSgpO1xuICAgIH0sIGRlbGF5KTtcbiAgfVxufTtcblxuLyoqXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHBhcmFtc1xuICogQGZ1bmN0aW9uIGdldFRva2VuIHRvIG1ha2UgYXBpIHJlcXVlc3QgdG8gQ2xvdWQgSWRlbnRpdHkgQXV0aG9yaXphdGlvbiBzZXJ2ZXJcbiAqIHRvIHJldHJpZXZlIGFjY2Vzc190b2tlbiwgcmVmcmVzaF90b2tlbiwgZ3JhbnRfaWQuLi5cbiAqL1xuT0F1dGhDb250ZXh0LnByb3RvdHlwZS5nZXRUb2tlbiA9IGZ1bmN0aW9uKHBhcmFtcykge1xuICBpZiAodGhpcy5jb25maWcuZmxvd1R5cGUgPT09ICdJbXBsaWNpdCcpIHtcbiAgICAgIHRocm93IG5ldyBWZXJpZnlFcnJvcihPQVVUSF9DT05URVhUX0FQSV9FUlJPUiwgJ2dldFRva2VuKCkgY2Fubm90IGJlIHVzZWQgd2l0aCBJbXBsaWNpdCBmbG93Jyk7XG4gIH1cbiAgaWYgKCFwYXJhbXMpIHtcbiAgICAgIC8vIGNoYW5nZSBtZXNzYWdlXG4gICAgICB0aHJvdyBuZXcgVmVyaWZ5RXJyb3IoT0FVVEhfQ09OVEVYVF9BUElfRVJST1IsICdnZXRUb2tlbihwYXJhbXMpLCBQYXJhbXMgYXJlIHJlcXVpcmVkJyk7XG4gIH1cbiAgbGV0IHF1ZXJ5ID0gcGFyYW1zLnN1YnN0cmluZyhwYXJhbXMuaW5kZXhPZignPycpKTtcbiAgbGV0IGRhdGEgPSB0eXBlb2YgcXVlcnkgPT09ICdvYmplY3QnID8gcXVlcnkgOiBxcy5wYXJzZShxdWVyeSk7XG4gIGxldCBwYXRoID0gYCR7dGhpcy5jb25maWcudGVuYW50VXJsfS92MS4wL2VuZHBvaW50L2RlZmF1bHQvdG9rZW5gO1xuXG4gIGRhdGEucmVkaXJlY3RfdXJpID0gdGhpcy5jb25maWcucmVkaXJlY3RVcmk7XG4gIGRhdGEuY2xpZW50X2lkID0gdGhpcy5jb25maWcuY2xpZW50SWQ7XG4gIGRhdGEuY2xpZW50X3NlY3JldCA9IHRoaXMuY29uZmlnLmNsaWVudFNlY3JldDtcbiAgZGF0YS5ncmFudF90eXBlID0gJ2F1dGhvcml6YXRpb25fY29kZSc7XG4gIGRhdGEuc2NvcGUgPSB0aGlzLmNvbmZpZy5zY29wZTtcblxuICBsZXQgZW5jb2RlZERhdGEgPSBxcy5zdHJpbmdpZnkoZGF0YSk7XG5cbiAgbGV0IG9wdGlvbnMgPVxuICB7XG4gICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgdXJsOiBwYXRoLFxuICAgIGNvbnRlbnRUeXBlOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgICBkYXRhOiBlbmNvZGVkRGF0YVxuICB9O1xuXG4gIHJldHVybiBhcGlSZXF1ZXN0KG9wdGlvbnMpO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb24gcmVmcmVzaFRva2VuXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVmcmVzaFRva2VuIHJlcXVpcmVkIHJlZnJlc2hfdG9rZW4gc3RyaW5nLlxuICogUmVmcmVzaCBhY2Nlc3MgdG9rZW4gd2hlbiB0b2tlbiBoYXMgZXhwaXJlZC5cbiAqIFVzZWQgZm9yIEFaTiBmbG93IG9ubHkuXG4gKi9cbk9BdXRoQ29udGV4dC5wcm90b3R5cGUucmVmcmVzaFRva2VuID0gZnVuY3Rpb24odG9rZW4pe1xuICBpZiAodGhpcy5jb25maWcuZmxvd1R5cGUgPT09ICdJbXBsaWNpdCcgKXtcbiAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgVmVyaWZ5RXJyb3IoT0FVVEhfQ09OVEVYVF9BUElfRVJST1IsICdJbXBsaWNpdCBmbG93IGRvZXMgbm90IHN1cHBvcnQgcmVmcmVzaCB0b2tlbicpKTtcbiAgfVxuXG4gIGlmICghdG9rZW4uaGFzT3duUHJvcGVydHkoJ3JlZnJlc2hfdG9rZW4nKSl7XG4gICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBWZXJpZnlFcnJvcihPQVVUSF9DT05URVhUX0FQSV9FUlJPUiwgJ3JlZnJlc2hfdG9rZW4gaXMgYSByZXF1aXJlZCBwYXJhbWV0ZXInKSk7XG4gIH1cblxuICBsZXQgcGF0aCA9IGAke3RoaXMuY29uZmlnLnRlbmFudFVybH0vdjEuMC9lbmRwb2ludC9kZWZhdWx0L3Rva2VuYDtcbiAgbGV0IGRhdGEgPSB7XG4gICAgcmVmcmVzaF90b2tlbiA6IHRva2VuLnJlZnJlc2hfdG9rZW4sXG4gICAgY2xpZW50X2lkIDogdGhpcy5jb25maWcuY2xpZW50SWQsXG4gICAgY2xpZW50X3NlY3JldCA6IHRoaXMuY29uZmlnLmNsaWVudFNlY3JldCxcbiAgICBncmFudF90eXBlIDogJ3JlZnJlc2hfdG9rZW4nLFxuICAgIHNjb3BlIDogdGhpcy5jb25maWcuc2NvcGVcbiAgfTtcblxuICBsZXQgZW5jb2RlZERhdGEgPSBxcy5zdHJpbmdpZnkoZGF0YSk7XG5cbiAgbGV0IG9wdGlvbnMgPVxuICB7XG4gICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgdXJsOiBwYXRoLFxuICAgIGNvbnRlbnRUeXBlOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgICBkYXRhOiBlbmNvZGVkRGF0YVxuICB9O1xuXG4gIHJldHVybiBhcGlSZXF1ZXN0KG9wdGlvbnMpO1xufTtcblxuT0F1dGhDb250ZXh0LnByb3RvdHlwZS5fYXV0aG9yaXplID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICByZXR1cm4gdGhpcy5fYnVpbGRVcmwob3B0aW9ucyk7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvbiBsb2dpblxuKiB1c2VkIGZvciBpbXBsaWNpdCBncmFudCB0byByZXRyaWV2ZSB1cmxcbiogYW5kIGFkZGl0aW9uYWwgcGFyYW1zIHRvIHNlbmQgdXNlci1hZ2VudCB0byBDbG91ZCBJZGVudGl0eSBsb2dpblxuKiBzY3JlZW4gdG8gYXV0aGVudGljYXRlIHdpdGggdGhlIGF1dGhvcml6YXRpb24gc2VydmVyLlxuKi9cbk9BdXRoQ29udGV4dC5wcm90b3R5cGUubG9naW4gPSBmdW5jdGlvbigpIHtcbiBsZXQgdXJsID0gdGhpcy5fYXV0aG9yaXplKHRoaXMuY29uZmlnKTtcbiByZXR1cm4gdXJsO1xufTtcblxuXG4vKipcbiAqIGJ1aWxkVXJsIG1ldGhvZFxuICogQHBhcmFtIHtvYmplY3R9IG9wdHMgY29uZmlndXJhdGlvbiBvYmplY3QgdXNlZCB0byBjcmVhdGUgYSB1cmwgdG8gdGhlIGF1dGhvcml6ZSBlbmRwb2ludFxuICogZm9yIFNTTyBpbXBsaWNpdCBmbG93XG4gKi9cbk9BdXRoQ29udGV4dC5wcm90b3R5cGUuX2J1aWxkVXJsID0gZnVuY3Rpb24ob3B0cykge1xuXHRyZXR1cm4gKFxuXHRcdG9wdHMudGVuYW50VXJsICtcblx0XHQnL29pZGMvZW5kcG9pbnQvZGVmYXVsdC9hdXRob3JpemU/JyArXG5cdFx0cXMuc3RyaW5naWZ5KHtcblx0XHRcdGNsaWVudF9pZDogb3B0cy5jbGllbnRJZCxcblx0XHRcdHJlZGlyZWN0X3VyaTogb3B0cy5yZWRpcmVjdFVyaSxcblx0XHRcdHNjb3BlOiBvcHRzLnNjb3BlLFxuXHRcdFx0cmVzcG9uc2VfdHlwZTogb3B0cy5yZXNwb25zZVR5cGUsXG5cdFx0XHRzdGF0ZTogdXRpbHMucmFuZG9tU3RyaW5nKDE2KSxcblx0XHRcdG5vbmNlOiB1dGlscy5yYW5kb21TdHJpbmcoMTYpXG5cdFx0fSlcblx0KTtcbn07XG5cbi8qKlxuLyoqIEF1dGhvcml6YXRpb24gY29kZSBmbG93IChBWk4pXG4gKiBAZnVuY3Rpb24gYXV0aGVudGljYXRlIGNvbnN0cnVjdCB1cmwgdG8gZW5hYmxlIGF1dGhlbnRpY2F0aW9uIGZvciB1c2VyLlxuICovXG5PQXV0aENvbnRleHQucHJvdG90eXBlLmF1dGhlbnRpY2F0ZSA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gbmV3IFByb21pc2UoXG4gICAgZnVuY3Rpb24ocmVzb2x2ZSkge1xuICAgICAgcmVzb2x2ZSh0aGlzLl9hdXRob3JpemUodGhpcy5jb25maWcpKTtcbiAgICB9LmJpbmQodGhpcylcbiAgKTtcbn07XG5cbi8qKlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBoYXNoU3RyaW5nIHRoZSB1cmwgaGFzaCBmcmFnbWVudFxuICogcmV0dXJuIHVybCBoYXNoIGZyYWdtZW50IGFzIGFuIG9iamVjdFxuICovXG5PQXV0aENvbnRleHQucHJvdG90eXBlLl9wYXJzZUhhc2ggPSBmdW5jdGlvbihoYXNoU3RyaW5nKSB7XG4gIGxldCBwYXJzZWRIYXNoID0gcXMucGFyc2UoaGFzaFN0cmluZyk7XG4gIHJldHVybiBwYXJzZWRIYXNoO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb24gaGFuZGxlUmVzcG9uc2UgbWV0aG9kIGhhbmRsZXMgdGhlIGFwaSByZXF1ZXN0IHRvIENsb3VkIElkZW50aXR5XG4gKiBAcGFyYW0ge29iamVjdH0gb3B0aW9ucyBPYmplY3QgY29udGFpbmluZyB0aGUgZW5kcG9pbnQgcGFyYW1zLiBbbWV0aG9kLCB1cmwgLi4uZXRjXVxuICogQHBhcmFtIHtvYmplY3R9IHRva2VuIHRoZSB0b2tlbiBvYmplY3QgY29udGFpbmluZyBhY2Nlc3NfdG9rZW4sIHJlZnJlc2hfdG9rZW4gZXRjLlxuICovXG5PQXV0aENvbnRleHQucHJvdG90eXBlLmhhbmRsZVJlc3BvbnNlID0gYXN5bmMgZnVuY3Rpb24ob3B0aW9ucywgdG9rZW5PYmope1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHtcbiAgICAgIHRocm93IG5ldyBWZXJpZnlFcnJvcihPQVVUSF9DT05URVhUX0FQSV9FUlJPUiwgJ2hhbmRsZVJlc3BvbnNlKG9wdGlvbnMsIHRva2VuKSwgMiBwYXJhbWV0ZXJzIGFyZSByZXF1aXJlZCAnICsgYXJndW1lbnRzLmxlbmd0aCArICcgd2VyZSBnaXZlbicpO1xuICB9XG4gIGlmICghdXRpbHMuaXNUb2tlbih0b2tlbk9iaikpe1xuICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgVmVyaWZ5RXJyb3IoVE9LRU5fRVJST1IsICdub3QgYSB2YWxpZCB0b2tlbicpKTtcbiAgfVxuXG4gIGxldCB0b2tlbiA9IHRva2VuT2JqO1xuICAvL0RlZmluZSBlbXB0eSBwYXlsb2FkIG9iamVjdFxuICBsZXQgcGF5bG9hZCA9IHtcbiAgICAgIHJlc3BvbnNlOiBudWxsLFxuICAgICAgdG9rZW46IG51bGxcbiAgfTtcblxuICB0cnkge1xuICAgIGxldCByZXNwb25zZSA9IGF3YWl0IGFwaVJlcXVlc3Qob3B0aW9ucywgdG9rZW4uYWNjZXNzX3Rva2VuKTtcbiAgICBwYXlsb2FkLnJlc3BvbnNlID0gcmVzcG9uc2U7XG4gICAgaWYgKHRoaXMuY29uZmlnLmZsb3dUeXBlID09PSAnSW1wbGljaXQnKXtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUocmVzcG9uc2UpO1xuICAgIH1cbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHBheWxvYWQpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGlmIChlcnJvci5zdGF0dXMgPT09IDQwMSAmJiB1dGlscy5pc05vZGUoKSl7XG4gICAgICAvLyB2YWxpZGF0ZSAndG9rZW4nIGhhcyByZWZyZXNoX3Rva2VuXG4gICAgICBpZiAoIXRva2VuLnJlZnJlc2hfdG9rZW4pIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IFZlcmlmeUVycm9yKE9BVVRIX0NPTlRFWFRfQVBJX0VSUk9SLCAnYWNjZXNzX3Rva2VuIGV4cGlyZWQgYW5kIHJlZnJlc2hfdG9rZW4gbm90IGZvdW5kJykpO1xuICAgICAgfVxuICAgICAgbGV0IG5ld1Rva2VuID0gYXdhaXQgdGhpcy5yZWZyZXNoVG9rZW4odG9rZW4pO1xuICAgICAgbGV0IG9yaWdpbmFsUmVxdWVzdCA9IGF3YWl0IGFwaVJlcXVlc3Qob3B0aW9ucywgbmV3VG9rZW4uYWNjZXNzX3Rva2VuKTtcbiAgICAgIHBheWxvYWQgPSB7XG4gICAgICAgIHJlc3BvbnNlOiBvcmlnaW5hbFJlcXVlc3QsXG4gICAgICAgIHRva2VuOiBuZXdUb2tlblxuICAgICAgfTtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUocGF5bG9hZCk7XG4gICAgfVxuICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlcnJvcik7XG4gIH1cbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uIGhhbmRsZUNhbGxiYWNrIHJlcXVpcmVkIGZvciBpbXBsaWNpdCBmbG93IHRvIGhhbmRsZSB0aGUgYXV0aGVudGljYXRpb24gLyBhdXRob3JpemF0aW9uIHRyYW5zYWN0aW9uIGZyb20gQ2xvdWQgSWRlbnRpdHlcbiAqIGFuZCB0byBzdG9yZSB0aGUgYWNjZXNzX3Rva2VuIGFuZCBleHBpcmVzX2luIHZhbHVlcyB0byBicm93c2VyIHN0b3JhZ2UuXG4gKi9cbk9BdXRoQ29udGV4dC5wcm90b3R5cGUuaGFuZGxlQ2FsbGJhY2sgPSBmdW5jdGlvbigpIHtcbiAgaWYgKHV0aWxzLmlzTm9kZSgpKSB7XG4gICAgICB0aHJvdyBuZXcgVmVyaWZ5RXJyb3IoT0FVVEhfQ09OVEVYVF9BUElfRVJST1IsICdoYW5kbGVDYWxsYmFjaygpIGlzIG9ubHkgZm9yIEltcGxpY2l0IGZsb3cnKTtcbiAgfVxuICBsZXQgdXJsT2JqO1xuICBsZXQgZXJyb3JDaGVjayA9IFJlZ0V4cCgnI2Vycm9yJyk7XG4gIGxldCBoYXNoID0gIHdpbmRvdy5sb2NhdGlvbi5oYXNoO1xuXG4gIHVybE9iaiA9IHR5cGVvZiBoYXNoID09PSAnb2JqZWN0JyA/IGhhc2ggOiB0aGlzLl9wYXJzZVVybEhhc2goaGFzaCk7XG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlamVjdCl7XG4gICAgaWYgKGVycm9yQ2hlY2sudGVzdChoYXNoKSl7XG4gICAgICByZWplY3QodXJsT2JqKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zdG9yYWdlSGFuZGxlci5zZXRTdG9yYWdlKHVybE9iaik7XG4gICAgICB0aGlzLl9zZXRTZXNzaW9uKCk7XG4gICAgICAvLyByZW1vdmUgdXJsXG4gICAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9ICcnO1xuICAgIH1cbiAgfS5iaW5kKHRoaXMpKTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IE9BdXRoQ29udGV4dDtcbiJdfQ==