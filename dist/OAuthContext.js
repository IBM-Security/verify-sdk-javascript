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

  if (!config.redirectUri && config.flowType !== 'client_credentials') {
    throw new _VerifyError.default(OAUTH_CONTEXT_CONFIG_SETTINGS_ERROR, 'A redirect URL is required');
  }

  if (!config.responseType && config.flowType !== 'client_credentials') {
    throw new _VerifyError.default(OAUTH_CONTEXT_CONFIG_SETTINGS_ERROR, 'Response Type required');
  }

  if (!config.scope) {
    throw new _VerifyError.default(OAUTH_CONTEXT_CONFIG_SETTINGS_ERROR, 'scope Property not set in Config settings');
  }

  if (config.flowType === 'AZN' && !config.clientSecret) {
    throw new _VerifyError.default(OAUTH_CONTEXT_CONFIG_SETTINGS_ERROR, 'Client Secret is required for the AZN code flow');
  }

  if (!(config.flowType === 'Implicit' || config.flowType === 'AZN' || config.flowType === 'client_credentials')) {
    throw new _VerifyError.default(OAUTH_CONTEXT_CONFIG_SETTINGS_ERROR, 'Check the flowType property in your configuration object is correct. Supported Values: "Implicit", "AZN", "client_credentials"');
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
            _context2.next = 13;
            break;

          case 10:
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

          case 13:
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

  var query;
  var _params = params;

  if (this.config.flowType === 'client_credentials') {
    query = _params;
  } else {
    query = params.substring(params.indexOf('?'));
  }

  var data = _typeof(query) === 'object' ? query : _queryString.default.parse(query);
  var path = "".concat(this.config.tenantUrl, "/v1.0/endpoint/default/token");

  if (this.config.flowType === 'client_credentials') {
    data.grant_type = this.config.flowType;
  } else {
    data.redirect_uri = this.config.redirectUri;
    data.grant_type = 'authorization_code';
  }

  data.client_id = this.config.clientId;
  data.client_secret = this.config.clientSecret;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2xpYi9PQXV0aENvbnRleHQuanMiXSwibmFtZXMiOlsiT0FVVEhfQ09OVEVYVF9DT05GSUdfU0VUVElOR1NfRVJST1IiLCJBcHBDb25maWciLCJPQVVUSF9DT05URVhUX0FQSV9FUlJPUiIsIlRPS0VOX0VSUk9SIiwiT0F1dGhDb250ZXh0IiwiY29uZmlnIiwiVmVyaWZ5RXJyb3IiLCJjbGllbnRJZCIsInRlbmFudFVybCIsInJlZGlyZWN0VXJpIiwiZmxvd1R5cGUiLCJyZXNwb25zZVR5cGUiLCJzY29wZSIsImNsaWVudFNlY3JldCIsInV0aWxzIiwiaXNOb2RlIiwic3RvcmFnZVR5cGUiLCJzdG9yYWdlSGFuZGxlciIsIlN0b3JhZ2VIYW5kbGVyIiwicHJvdG90eXBlIiwiaXNBdXRoZW50aWNhdGVkIiwidG9rZW4iLCJpbnRyb3NwZWN0VG9rZW4iLCJwYXlsb2FkIiwicmVzcG9uc2UiLCJhY3RpdmUiLCJQcm9taXNlIiwicmVqZWN0IiwidG9rZW5PYmoiLCJpc1Rva2VuIiwicGF0aCIsImRhdGEiLCJjbGllbnRfaWQiLCJjbGllbnRfc2VjcmV0IiwiYWNjZXNzX3Rva2VuIiwiZW5jb2RlZERhdGEiLCJxcyIsInN0cmluZ2lmeSIsIm9wdGlvbnMiLCJtZXRob2QiLCJ1cmwiLCJjb250ZW50VHlwZSIsImhhbmRsZVJlc3BvbnNlIiwidXNlcmluZm8iLCJmZXRjaFRva2VuIiwiYWNjZXNzVG9rZW4iLCJKU09OIiwicGFyc2UiLCJnZXRTdG9yYWdlIiwiZXJyb3IiLCJnZXRDb25maWciLCJsb2dvdXQiLCJyZXZva2VUb2tlbiIsImNsZWFyU3RvcmFnZSIsIndpbmRvdyIsImxvY2F0aW9uIiwicmVwbGFjZSIsImxlbmd0aCIsInRva2VuVHlwZSIsImV4cGlyZVRva2VuIiwiYXJndW1lbnRzIiwicmVmcmVzaF90b2tlbiIsIl9wYXJzZVVybEhhc2giLCJoYXNoU3RyaW5nIiwicGFyc2VkSGFzaCIsIl9zZXRTZXNzaW9uIiwiZXhwaXJlc0F0IiwiZXhwaXJlc19pbiIsImNsb2NrU2tldyIsIkRFRkFVTFRfQ0xPQ0tfU0tFVyIsImRlbGF5IiwiRGF0ZSIsIm5vdyIsInNldFRpbWVvdXQiLCJzZXNzaW9uIiwiZ2V0VG9rZW4iLCJwYXJhbXMiLCJxdWVyeSIsIl9wYXJhbXMiLCJzdWJzdHJpbmciLCJpbmRleE9mIiwiZ3JhbnRfdHlwZSIsInJlZGlyZWN0X3VyaSIsInJlZnJlc2hUb2tlbiIsImhhc093blByb3BlcnR5IiwiX2F1dGhvcml6ZSIsIl9idWlsZFVybCIsImxvZ2luIiwib3B0cyIsInJlc3BvbnNlX3R5cGUiLCJzdGF0ZSIsInJhbmRvbVN0cmluZyIsIm5vbmNlIiwiYXV0aGVudGljYXRlIiwicmVzb2x2ZSIsImJpbmQiLCJfcGFyc2VIYXNoIiwic3RhdHVzIiwibmV3VG9rZW4iLCJvcmlnaW5hbFJlcXVlc3QiLCJoYW5kbGVDYWxsYmFjayIsInVybE9iaiIsImVycm9yQ2hlY2siLCJSZWdFeHAiLCJoYXNoIiwidGVzdCIsInNldFN0b3JhZ2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7OztJQUVPQSxtQyxHQUE2RUMsaUIsQ0FBN0VELG1DO0lBQXFDRSx1QixHQUF3Q0QsaUIsQ0FBeENDLHVCO0lBQXlCQyxXLEdBQWVGLGlCLENBQWZFLFc7QUFDckU7Ozs7OztBQUtBLFNBQVNDLFlBQVQsQ0FBc0JDLE1BQXRCLEVBQThCO0FBQzVCLE1BQUksQ0FBQ0EsTUFBTCxFQUFhO0FBQ1QsVUFBTSxJQUFJQyxvQkFBSixDQUFnQk4sbUNBQWhCLEVBQXFELDhCQUFyRCxDQUFOO0FBQ0gsR0FIMkIsQ0FJNUI7OztBQUNBLE1BQUksQ0FBQ0ssTUFBTSxDQUFDRSxRQUFaLEVBQXNCO0FBQ3BCLFVBQU0sSUFBSUQsb0JBQUosQ0FBZ0JOLG1DQUFoQixFQUFxRCwrQkFBckQsQ0FBTjtBQUNEOztBQUNELE1BQUksQ0FBQ0ssTUFBTSxDQUFDRyxTQUFaLEVBQXVCO0FBQ3JCLFVBQU0sSUFB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QUosQ0FBZ0JKLHVCQUFoQixFQUF5Qyw0Q0FBekMsQ0FBTjtBQUNIOztBQUNELE1BQUltRyxNQUFKO0FBQ0EsTUFBSUMsVUFBVSxHQUFHQyxNQUFNLENBQUMsUUFBRCxDQUF2QjtBQUNBLE1BQUlDLElBQUksR0FBSWxELE1BQU0sQ0FBQ0MsUUFBUCxDQUFnQmlELElBQTVCO0FBRUFILEVBQUFBLE1BQU0sR0FBRyxRQUFPRyxJQUFQLE1BQWdCLFFBQWhCLEdBQTJCQSxJQUEzQixHQUFrQyxLQUFLMUMsYUFBTCxDQUFtQjBDLElBQW5CLENBQTNDO0FBRUEsU0FBTyxJQUFJOUUsT0FBSixDQUFZLFVBQVNDLE1BQVQsRUFBZ0I7QUFDakMsUUFBSTJFLFVBQVUsQ0FBQ0csSUFBWCxDQUFnQkQsSUFBaEIsQ0FBSixFQUEwQjtBQUN4QjdFLE1BQUFBLE1BQU0sQ0FBQzBFLE1BQUQsQ0FBTjtBQUNELEtBRkQsTUFFTztBQUNMLFdBQUtwRixjQUFMLENBQW9CeUYsVUFBcEIsQ0FBK0JMLE1BQS9COztBQUNBLFdBQUtwQyxXQUFMLEdBRkssQ0FHTDs7O0FBQ0FYLE1BQUFBLE1BQU0sQ0FBQ0MsUUFBUCxDQUFnQmlELElBQWhCLEdBQXVCLEVBQXZCO0FBQ0Q7QUFDRixHQVRrQixDQVNqQlQsSUFUaUIsQ0FTWixJQVRZLENBQVosQ0FBUDtBQVVELENBcEJEOztlQXNCZTNGLFkiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgJ0BiYWJlbC9wb2x5ZmlsbCc7XG5pbXBvcnQgcXMgZnJvbSAncXVlcnktc3RyaW5nJztcbmltcG9ydCBWZXJpZnlFcnJvciBmcm9tICcuL2Vycm9ycy9WZXJpZnlFcnJvcic7XG5pbXBvcnQgU3RvcmFnZUhhbmRsZXIgZnJvbSAnLi9oZWxwZXJzL1N0b3JhZ2VIYW5kbGVyJztcbmltcG9ydCB7QXBwQ29uZmlnfSBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQgYXBpUmVxdWVzdCBmcm9tICcuL2hlbHBlcnMvYXBpUmVxdWVzdCc7XG5pbXBvcnQgdXRpbHMgZnJvbSAnLi9oZWxwZXJzL3V0aWxzJztcblxuY29uc3Qge09BVVRIX0NPTlRFWFRfQ09ORklHX1NFVFRJTkdTX0VSUk9SLCBPQVVUSF9DT05URVhUX0FQSV9FUlJPUiwgVE9LRU5fRVJST1J9ID0gQXBwQ29uZmlnO1xuLyoqXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IGNvbmZpZyB1c2VycyBjb25maWd1cmF0aW9uIHNldHRpbmdzIHRvIGtpY2sgb2ZmXG4gKiBPQXV0aCBpbXBsaWNpdCBmbG93XG4gKi9cbmZ1bmN0aW9uIE9BdXRoQ29udGV4dChjb25maWcpIHtcbiAgaWYgKCFjb25maWcpIHtcbiAgICAgIHRocm93IG5ldyBWZXJpZnlFcnJvcihPQVVUSF9DT05URVhUX0NPTkZJR19TRVRUSU5HU19FUlJPUiwgJ0NvbmZpZyBwYXJhbWV0ZXIgaXMgcmVxdWlyZWQnKTtcbiAgfVxuICAvL1ZlcmlmeSBjb25maWcgc2V0dGluZ3NcbiAgaWYgKCFjb25maWcuY2xpZW50SWQpIHtcbiAgICB0aHJvdyBuZXcgVmVyaWZ5RXJyb3IoT0FVVEhfQ09OVEVYVF9DT05GSUdfU0VUVElOR1NfRVJST1IsICdjbGllbnRJZCBwcm9wZXJ0eSBpcyByZXF1aXJlZCcpO1xuICB9XG4gIGlmICghY29uZmlnLnRlbmFudFVybCkge1xuICAgIHRocm93IG5ldyBWZXJpZnlFcnJvcihPQVVUSF9DT05URVhUX0NPTkZJR19TRVRUSU5HU19FUlJPUiwgJ1RlbmFudCBVUkwgaXMgcmVxdWlyZWQnKTtcbiAgfVxuICBpZiAoIWNvbmZpZy5yZWRpcmVjdFVyaSAmJiBjb25maWcuZmxvd1R5cGUgIT09ICdjbGllbnRfY3JlZGVudGlhbHMnKSB7XG4gICAgdGhyb3cgbmV3IFZlcmlmeUVycm9yKE9BVVRIX0NPTlRFWFRfQ09ORklHX1NFVFRJTkdTX0VSUk9SLCAnQSByZWRpcmVjdCBVUkwgaXMgcmVxdWlyZWQnKTtcbiAgfVxuICBpZiAoIWNvbmZpZy5yZXNwb25zZVR5cGUgJiYgY29uZmlnLmZsb3dUeXBlICE9PSAnY2xpZW50X2NyZWRlbnRpYWxzJykge1xuICAgIHRocm93IG5ldyBWZXJpZnlFcnJvcihPQVVUSF9DT05URVhUX0NPTkZJR19TRVRUSU5HU19FUlJPUiwgJ1Jlc3BvbnNlIFR5cGUgcmVxdWlyZWQnKTtcbiAgfVxuICBpZiAoIWNvbmZpZy5zY29wZSl7XG4gICAgdGhyb3cgbmV3IFZlcmlmeUVycm9yKE9BVVRIX0NPTlRFWFRfQ09ORklHX1NFVFRJTkdTX0VSUk9SLCAnc2NvcGUgUHJvcGVydHkgbm90IHNldCBpbiBDb25maWcgc2V0dGluZ3MnKTtcbiAgfVxuICBpZiAoY29uZmlnLmZsb3dUeXBlID09PSAnQVpOJyAmJiAhY29uZmlnLmNsaWVudFNlY3JldCl7XG4gICAgdGhyb3cgbmV3IFZlcmlmeUVycm9yKE9BVVRIX0NPTlRFWFRfQ09ORklHX1NFVFRJTkdTX0VSUk9SLCAnQ2xpZW50IFNlY3JldCBpcyByZXF1aXJlZCBmb3IgdGhlIEFaTiBjb2RlIGZsb3cnKTtcbiAgfVxuXG4gIGlmICghKGNvbmZpZy5mbG93VHlwZSA9PT0gJ0ltcGxpY2l0JyB8fCBjb25maWcuZmxvd1R5cGUgPT09ICdBWk4nIHx8IGNvbmZpZy5mbG93VHlwZSA9PT0gJ2NsaWVudF9jcmVkZW50aWFscycpKXtcbiAgICB0aHJvdyBuZXcgVmVyaWZ5RXJyb3IoT0FVVEhfQ09OVEVYVF9DT05GSUdfU0VUVElOR1NfRVJST1IsICdDaGVjayB0aGUgZmxvd1R5cGUgcHJvcGVydHkgaW4geW91ciBjb25maWd1cmF0aW9uIG9iamVjdCBpcyBjb3JyZWN0LiBTdXBwb3J0ZWQgVmFsdWVzOiBcIkltcGxpY2l0XCIsIFwiQVpOXCIsIFwiY2xpZW50X2NyZWRlbnRpYWxzXCInKTtcbiAgfVxuXG4gIGlmIChjb25maWcuZmxvd1R5cGUgPT09ICdJbXBsaWNpdCcpe1xuICAgIGlmICh1dGlscy5pc05vZGUoKSl7XG4gICAgICAgIHRocm93IG5ldyBWZXJpZnlFcnJvcihPQVVUSF9DT05URVhUX0NPTkZJR19TRVRUSU5HU19FUlJPUiwgJ0ltcGxpY2l0IGZsb3cgbm90IHN1cHBvcnRlZCBpbiBOb2RlJyk7XG4gICAgfVxuICAgIGlmICghY29uZmlnLnN0b3JhZ2VUeXBlKXtcbiAgICAgIHRocm93IG5ldyBWZXJpZnlFcnJvcihPQVVUSF9DT05URVhUX0NPTkZJR19TRVRUSU5HU19FUlJPUiwgJ3N0b3JhZ2VUeXBlIHByb3BlcnR5IG5vdCBzZXQuJyk7XG4gICAgfVxuICAgIHRoaXMuc3RvcmFnZUhhbmRsZXIgPSBuZXcgU3RvcmFnZUhhbmRsZXIoY29uZmlnLnN0b3JhZ2VUeXBlKTtcbiAgfVxuXG4gIHRoaXMuY29uZmlnID0gY29uZmlnO1xufVxuXG4vKipcbiAqIEBmdW5jdGlvbiBpc0F1dGhlbnRpY2F0ZWQgdG8gY2hlY2sgY3VycmVudCB1c2VycyBhY2Nlc3NfdG9rZW4gb3IgcmVmcmVzaF90b2tlbiB0b1xuICogZGV0ZXJtaW5lIGlmIHRoZXkgYXJlIHN0aWxsIHZhbGlkLlxuICogQHBhcmFtIHtvYmplY3R9IHRva2VuIHRoZSB0b2tlbiBvYmplY3Qgd2l0aCBhY2Nlc3NfdG9rZW4sIHJlZnJlc2hUb2tlbiBldGMuXG4gKi9cbk9BdXRoQ29udGV4dC5wcm90b3R5cGUuaXNBdXRoZW50aWNhdGVkID0gYXN5bmMgZnVuY3Rpb24odG9rZW4pe1xuICB0cnkge1xuICAgIGxldCBwYXlsb2FkID0gYXdhaXQgdGhpcy5pbnRyb3NwZWN0VG9rZW4odG9rZW4pO1xuICAgIHJldHVybiBwYXlsb2FkLnJlc3BvbnNlLmFjdGl2ZTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZXJyb3IpO1xuICB9XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvbiBpbnRyb3NwZWN0VG9rZW4gdG8gaW5zcGVjdCBhbiBPSURDIHRva2VuLlxuICogQHBhcmFtIHtvYmplY3R9IHRva2VuIHRva2VuIG9iamVjdCB0byBpbnRyb3NwZWN0XG4gKi9cbk9BdXRoQ29udGV4dC5wcm90b3R5cGUuaW50cm9zcGVjdFRva2VuID0gZnVuY3Rpb24odG9rZW5PYmope1xuICBpZiAoIXV0aWxzLmlzVG9rZW4odG9rZW5PYmopKXtcbiAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IFZlcmlmeUVycm9yKFRPS0VOX0VSUk9SLCAnVG9rZW4gcGFyYW1ldGVyIGlzIG5vdCBhIHZhbGlkIHRva2VuJykpO1xuICB9XG4gIGxldCB0b2tlbiA9IHRva2VuT2JqIHx8IHRoaXMudG9rZW47XG4gIGxldCBwYXRoID0gYCR7dGhpcy5jb25maWcudGVuYW50VXJsfS92MS4wL2VuZHBvaW50L2RlZmF1bHQvaW50cm9zcGVjdGA7XG5cbiAgbGV0IGRhdGEgPSB7XG4gICAgY2xpZW50X2lkIDogdGhpcy5jb25maWcuY2xpZW50SWQsXG4gICAgY2xpZW50X3NlY3JldCA6IHRoaXMuY29uZmlnLmNsaWVudFNlY3JldCxcbiAgICB0b2tlbiA6IHRva2VuLmFjY2Vzc190b2tlblxuICB9O1xuXG4gIGxldCBlbmNvZGVkRGF0YSA9IHFzLnN0cmluZ2lmeShkYXRhKTtcblxuICBsZXQgb3B0aW9ucyA9IHtcbiAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICB1cmw6IHBhdGgsXG4gICAgY29udGVudFR5cGU6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnLFxuICAgIGRhdGE6IGVuY29kZWREYXRhXG4gfTtcblxuIHJldHVybiB0aGlzLmhhbmRsZVJlc3BvbnNlKG9wdGlvbnMsIHRva2VuKTtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uIHVzZXJpbmZvIEFQSSB0byBnZXQgdGhlIHVzZXIgaW5mb3JtYXRpb24gdGhhdCBpcyBhc3NvY2lhdGVkIHdpdGggdGhlIHRva2VuIHBhcmFtZXRlclxuICogQHBhcmFtIHtvYmplY3R9IHRva2VuT2JqIHRva2VuIG9iamVjdCB3aXRoIGFjY2Vzc190b2tlbiBwcm9wZXJ0eS5cbiAqL1xuT0F1dGhDb250ZXh0LnByb3RvdHlwZS51c2VyaW5mbyA9IGZ1bmN0aW9uKHRva2VuT2JqKXtcbiAgbGV0IHRva2VuID0gdG9rZW5PYmogfHwgdGhpcy50b2tlbjtcblxuICBpZiAoIXV0aWxzLmlzVG9rZW4odG9rZW4pKXtcbiAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IFZlcmlmeUVycm9yKFRPS0VOX0VSUk9SLCAnVG9rZW4gcGFyYW1ldGVyIGlzIG5vdCBhIHZhbGlkIHRva2VuJykpO1xuICB9XG5cbiAgXG4gIGxldCBwYXRoID0gYCR7dGhpcy5jb25maWcudGVuYW50VXJsfS92MS4wL2VuZHBvaW50L2RlZmF1bHQvdXNlcmluZm9gO1xuXG4gIGxldCBvcHRpb25zID0ge1xuICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgIHVybDogcGF0aCxcbiAgICBjb250ZW50VHlwZTogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICAgZGF0YTogcXMuc3RyaW5naWZ5KHRva2VuLmFjY2Vzc190b2tlbilcbiAgfTtcblxuICByZXR1cm4gdGhpcy5oYW5kbGVSZXNwb25zZShvcHRpb25zLCB0b2tlbik7XG59O1xuXG5cbi8qKlxuICogQGZ1bmN0aW9uIGZldGNoVG9rZW4gVXNlZCBmb3IgaW1wbGljaXQgZmxvdyB0byByZXR1cm4gdGhlIGFjY2Vzc1Rva2VuIHN0b3JlZCBpbiBicm93c2VyLlxuKi9cbk9BdXRoQ29udGV4dC5wcm90b3R5cGUuZmV0Y2hUb2tlbiA9IGZ1bmN0aW9uKCl7XG4gIGlmICh0aGlzLmNvbmZpZy5mbG93VHlwZSA9PT0gJ0ltcGxpY2l0JyApe1xuICAgIHRyeSB7XG4gICAgICBsZXQgYWNjZXNzVG9rZW4gPSBKU09OLnBhcnNlKHRoaXMuc3RvcmFnZUhhbmRsZXIuZ2V0U3RvcmFnZSgndG9rZW4nKSk7XG4gICAgICByZXR1cm4gYWNjZXNzVG9rZW47XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgVmVyaWZ5RXJyb3IoT0FVVEhfQ09OVEVYVF9BUElfRVJST1IsICdmZXRjaFRva2VuKCkgY2FuIG9ubHkgYmUgdXNlZCB3aXRoIEltcGxpY2l0IGZsb3cnKTtcbiAgfVxufTtcblxuLyoqXG4gKiBAZnVuY3Rpb24gZ2V0Q29uZmlnXG4gKiBleHBvc2UgY29uZmlnIG9iamVjdCBmb3IgQXV0aGVudGljYXRvckNvbnRleHQuXG4gKi9cbk9BdXRoQ29udGV4dC5wcm90b3R5cGUuZ2V0Q29uZmlnID0gZnVuY3Rpb24oKXtcbiAgcmV0dXJuIHRoaXMuY29uZmlnO1xufTtcblxuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoIE9wdGlvbmFsIHN0cmluZyB0byByZWRpcmVjdCB1c2VyIGFmdGVyIGFjY2Vzc1Rva2VuIGhhcyBleHBpcmVkXG4gKiBEZWZhdWx0cyB0byBpbmRleCBwYWdlLlxuICovXG5PQXV0aENvbnRleHQucHJvdG90eXBlLmxvZ291dCA9IGFzeW5jIGZ1bmN0aW9uKHBhdGgsIHRva2VuKSB7XG4gIC8vIGNsZWFyIHN0b3JhZ2UgYW5kIHJlZGlyZWN0IHRvIGhvbWUgcGFnZVxuICBpZiAodGhpcy5jb25maWcuZmxvd1R5cGUgPT09ICdJbXBsaWNpdCcgKXtcbiAgICAgIGxldCBhY2Nlc3NUb2tlbiA9IHRoaXMuZmV0Y2hUb2tlbigpO1xuICAgICAgYXdhaXQgdGhpcy5yZXZva2VUb2tlbihhY2Nlc3NUb2tlbiwgJ2FjY2Vzc190b2tlbicpO1xuICAgICAgYXdhaXQgdGhpcy5zdG9yYWdlSGFuZGxlci5jbGVhclN0b3JhZ2UoKTtcbiAgICAgIGF3YWl0IHdpbmRvdy5sb2NhdGlvbi5yZXBsYWNlKHBhdGggfHwgJy8nKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBwYXRoIGFuZCB0b2tlbiBzdXBwbGllZFxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAyICYmICF1dGlscy5pc1Rva2VuKHRva2VuKSkge1xuICAgICAgICBQcm9taXNlLnJlamVjdChuZXcgVmVyaWZ5RXJyb3IoVE9LRU5fRVJST1IsICdub3QgYSB2YWxpZCB0b2tlbi4nKSk7XG4gICAgfVxuICAgIC8vIG5vIHBhdGggYnV0IGEgJ3Rva2VuJyBwcm92aWRlZFxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxICYmICF1dGlscy5pc1Rva2VuKHBhdGgpKSB7XG4gICAgICAgIFByb21pc2UucmVqZWN0KG5ldyBWZXJpZnlFcnJvcihUT0tFTl9FUlJPUiwgJ25vdCBhIHZhbGlkIHRva2VuLicpKTtcbiAgICB9XG5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMikge1xuICAgICAgICB0aGlzLnJldm9rZVRva2VuKHRva2VuLCAnYWNjZXNzX3Rva2VuJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5yZXZva2VUb2tlbihwYXRoLCAnYWNjZXNzX3Rva2VuJyk7XG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvbiByZXZva2VUb2tlbiB1c2VkIHRvIHJldm9rZSB2YWxpZCB0b2tlbnMuXG4gKiBAcGFyYW0ge29iamVjdH0gdG9rZW4gdGhlIFRva2VuIG9iamVjdCBjb250YWluaW5nIGFjY2Vzc190b2tlbiwgcmVmcmVzaF90b2tlbiBldGMuLi5cbiAqIEBwYXJhbSB7c3RyaW5nfSB0b2tlblR5cGUgdGhlIHRva2VuIHR5cGUgdG8gYmUgcmV2b2tlZCBcImFjY2Vzc190b2tlblwiIG9yIFwicmVmcmVzaF90b2tlblwiLlxuICovXG5PQXV0aENvbnRleHQucHJvdG90eXBlLnJldm9rZVRva2VuID0gZnVuY3Rpb24odG9rZW4sIHRva2VuVHlwZSl7XG4gIGxldCBwYXRoID0gYCR7dGhpcy5jb25maWcudGVuYW50VXJsfS92MS4wL2VuZHBvaW50L2RlZmF1bHQvcmV2b2tlYDtcbiAgbGV0IGV4cGlyZVRva2VuO1xuICBsZXQgZW5jb2RlZERhdGE7XG4gIGxldCBvcHRpb25zO1xuXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikge1xuICAgICAgdGhyb3cgbmV3IFZlcmlmeUVycm9yKE9BVVRIX0NPTlRFWFRfQVBJX0VSUk9SLCAncmV2b2tlVG9rZW4odG9rZW4sIHRva2VuVHlwZSksIDIgcGFyYW1ldGVycyBhcmUgcmVxdWlyZWQgJyArIGFyZ3VtZW50cy5sZW5ndGggKyAnIHdlcmUgZ2l2ZW4nKTtcbiAgfVxuXG4gIGlmICghdG9rZW4pIHtcbiAgICAgIHRocm93IG5ldyBWZXJpZnlFcnJvcihPQVVUSF9DT05URVhUX0FQSV9FUlJPUiwgJ3Rva2VuIGNhbm5vdCBiZSBudWxsJyk7XG4gIH1cblxuICBpZiAoISh0b2tlblR5cGUgPT09ICdhY2Nlc3NfdG9rZW4nIHx8IHRva2VuVHlwZSA9PT0gJ3JlZnJlc2hfdG9rZW4nKSl7XG4gICAgdGhyb3cgbmV3IFZlcmlmeUVycm9yKE9BVVRIX0NPTlRFWFRfQVBJX0VSUk9SLCBgUGFyYW1ldGVyOiAke3Rva2VuVHlwZX0gaXMgaW52YWxpZC5cXG4gU3VwcG9ydGVkIHZhbHVlcyBhcmUgXCJhY2Nlc3NfdG9rZW5cIiBvciBcInJlZnJlc2hfdG9rZW5gKTtcbiAgfVxuXG4gIGV4cGlyZVRva2VuID0gdG9rZW5UeXBlID09PSAnYWNjZXNzX3Rva2VuJyA/IHRva2VuLmFjY2Vzc190b2tlbiA6IHRva2VuLnJlZnJlc2hfdG9rZW47XG5cbiAgbGV0IGRhdGEgPSB7XG4gICAgY2xpZW50X2lkIDogdGhpcy5jb25maWcuY2xpZW50SWQsXG4gICAgY2xpZW50X3NlY3JldCA6IHRoaXMuY29uZmlnLmNsaWVudFNlY3JldCxcbiAgICB0b2tlbiA6IGV4cGlyZVRva2VuXG4gIH07XG5cbiAgZW5jb2RlZERhdGEgPSBxcy5zdHJpbmdpZnkoZGF0YSk7XG5cbiAgb3B0aW9ucyA9IHtcbiAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICBjb250ZW50VHlwZTogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICAgdXJsOiBwYXRoLFxuICAgIGRhdGE6IGVuY29kZWREYXRhXG4gIH07XG5cbiAgLy8gdG9rZW4gaXMgbm90IHJlcXVpcmVkLCBidXQgaGFuZGxlUmVzcG9uc2Ugd2lsbCB0aHJvdyBlcnJvciB3aXRob3V0IGl0XG4gIHJldHVybiB0aGlzLmhhbmRsZVJlc3BvbnNlKG9wdGlvbnMsIHRva2VuKTtcbn07XG5cbi8qKlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBoYXNoU3RyaW5nIHRoZSB1cmwgaGFzaCBmcmFnbWVudFxuICogcmV0dXJuIHVybCBoYXNoIGZyYWdtZW50IGFzIGFuIG9iamVjdFxuICovXG5PQXV0aENvbnRleHQucHJvdG90eXBlLl9wYXJzZVVybEhhc2ggPSBmdW5jdGlvbihoYXNoU3RyaW5nKSB7XG4gIGxldCBwYXJzZWRIYXNoID0gcXMucGFyc2UoaGFzaFN0cmluZyk7XG4gIHJldHVybiBwYXJzZWRIYXNoO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb24gc2V0U2Vzc2lvbiBVc2VkIGZvciBJbXBsaWNpdCBmbG93LiBDcmVhdGVzIGEgc2Vzc2lvbiBmb3IgdGhlIFNESyB0byBtYW5hZ2UgdGhlIGFjY2VzcyB0b2tlblxuICogdmFsaWRpdHkgZm9yIHRoZSBnaXZlbiB1c2VyLiBDbGVhcnMgYnJvd3NlciBzdG9yYWdlIG9uIGFjY2VzcyB0b2tlbiBleHBpcnkuXG4gKi9cbk9BdXRoQ29udGV4dC5wcm90b3R5cGUuX3NldFNlc3Npb24gPSBmdW5jdGlvbigpIHtcbiAgaWYgKHV0aWxzLmlzTm9kZSgpKSB7XG4gICAgICB0aHJvdyBuZXcgVmVyaWZ5RXJyb3IoT0FVVEhfQ09OVEVYVF9BUElfRVJST1IsICdfc2V0U2Vzc2lvbigpIGlzIG5vdCBzdXBwb3J0ZWQgaW4gTm9kZScpO1xuICB9XG4gIGNvbnN0IGV4cGlyZXNBdCA9IEpTT04ucGFyc2UodGhpcy5zdG9yYWdlSGFuZGxlci5nZXRTdG9yYWdlKCd0b2tlbicpKS5leHBpcmVzX2luO1xuICBjb25zdCBjbG9ja1NrZXcgPSBBcHBDb25maWcuREVGQVVMVF9DTE9DS19TS0VXO1xuICBjb25zdCBkZWxheSA9IGV4cGlyZXNBdCAtIChEYXRlLm5vdygpIC0gY2xvY2tTa2V3KTtcblxuICBpZiAoZGVsYXkgPiAwKSB7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0aGlzLnNlc3Npb24gPSBmYWxzZTtcbiAgICAgIHRoaXMuc3RvcmFnZUhhbmRsZXIuY2xlYXJTdG9yYWdlKCk7XG4gICAgfSwgZGVsYXkpO1xuICB9XG59O1xuXG4vKipcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcGFyYW1zXG4gKiBAZnVuY3Rpb24gZ2V0VG9rZW4gdG8gbWFrZSBhcGkgcmVxdWVzdCB0byBDbG91ZCBJZGVudGl0eSBBdXRob3JpemF0aW9uIHNlcnZlclxuICogdG8gcmV0cmlldmUgYWNjZXNzX3Rva2VuLCByZWZyZXNoX3Rva2VuLCBncmFudF9pZC4uLlxuICovXG5PQXV0aENvbnRleHQucHJvdG90eXBlLmdldFRva2VuID0gZnVuY3Rpb24ocGFyYW1zKSB7XG4gIGlmICh0aGlzLmNvbmZpZy5mbG93VHlwZSA9PT0gJ0ltcGxpY2l0Jykge1xuICAgICAgdGhyb3cgbmV3IFZlcmlmeUVycm9yKE9BVVRIX0NPTlRFWFRfQVBJX0VSUk9SLCAnZ2V0VG9rZW4oKSBjYW5ub3QgYmUgdXNlZCB3aXRoIEltcGxpY2l0IGZsb3cnKTtcbiAgfVxuICBpZiAoIXBhcmFtcykge1xuICAgICAgLy8gY2hhbmdlIG1lc3NhZ2VcbiAgICAgIHRocm93IG5ldyBWZXJpZnlFcnJvcihPQVVUSF9DT05URVhUX0FQSV9FUlJPUiwgJ2dldFRva2VuKHBhcmFtcyksIFBhcmFtcyBhcmUgcmVxdWlyZWQnKTtcbiAgfVxuICBcbiAgbGV0IHF1ZXJ5O1xuICBsZXQgX3BhcmFtcyA9IHBhcmFtcztcblxuICBpZiAodGhpcy5jb25maWcuZmxvd1R5cGUgPT09ICdjbGllbnRfY3JlZGVudGlhbHMnKXtcbiAgICBxdWVyeSA9IF9wYXJhbXM7XG4gIH0gZWxzZSB7XG4gICAgcXVlcnkgPSBwYXJhbXMuc3Vic3RyaW5nKHBhcmFtcy5pbmRleE9mKCc/JykpO1xuICB9XG4gIFxuXG4gIGxldCBkYXRhID0gdHlwZW9mIHF1ZXJ5ID09PSAnb2JqZWN0JyA/IHF1ZXJ5IDogcXMucGFyc2UocXVlcnkpO1xuICBsZXQgcGF0aCA9IGAke3RoaXMuY29uZmlnLnRlbmFudFVybH0vdjEuMC9lbmRwb2ludC9kZWZhdWx0L3Rva2VuYDtcblxuICBpZiAodGhpcy5jb25maWcuZmxvd1R5cGUgPT09ICdjbGllbnRfY3JlZGVudGlhbHMnKXtcbiAgICBkYXRhLmdyYW50X3R5cGUgPSB0aGlzLmNvbmZpZy5mbG93VHlwZTtcbiAgfSBlbHNlIHtcbiAgICBkYXRhLnJlZGlyZWN0X3VyaSA9IHRoaXMuY29uZmlnLnJlZGlyZWN0VXJpO1xuICAgIGRhdGEuZ3JhbnRfdHlwZSA9ICdhdXRob3JpemF0aW9uX2NvZGUnO1xuICB9XG4gIFxuICBkYXRhLmNsaWVudF9pZCA9IHRoaXMuY29uZmlnLmNsaWVudElkO1xuICBkYXRhLmNsaWVudF9zZWNyZXQgPSB0aGlzLmNvbmZpZy5jbGllbnRTZWNyZXQ7XG4gIGRhdGEuc2NvcGUgPSB0aGlzLmNvbmZpZy5zY29wZTtcblxuICBsZXQgZW5jb2RlZERhdGEgPSBxcy5zdHJpbmdpZnkoZGF0YSk7XG5cbiAgbGV0IG9wdGlvbnMgPVxuICB7XG4gICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgdXJsOiBwYXRoLFxuICAgIGNvbnRlbnRUeXBlOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgICBkYXRhOiBlbmNvZGVkRGF0YVxuICB9O1xuXG4gIHJldHVybiBhcGlSZXF1ZXN0KG9wdGlvbnMpO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb24gcmVmcmVzaFRva2VuXG4gKiBAcGFyYW0ge3N0cmluZ30gcmVmcmVzaFRva2VuIHJlcXVpcmVkIHJlZnJlc2hfdG9rZW4gc3RyaW5nLlxuICogUmVmcmVzaCBhY2Nlc3MgdG9rZW4gd2hlbiB0b2tlbiBoYXMgZXhwaXJlZC5cbiAqIFVzZWQgZm9yIEFaTiBmbG93IG9ubHkuXG4gKi9cbk9BdXRoQ29udGV4dC5wcm90b3R5cGUucmVmcmVzaFRva2VuID0gZnVuY3Rpb24odG9rZW4pe1xuICBpZiAodGhpcy5jb25maWcuZmxvd1R5cGUgPT09ICdJbXBsaWNpdCcgKXtcbiAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgVmVyaWZ5RXJyb3IoT0FVVEhfQ09OVEVYVF9BUElfRVJST1IsICdJbXBsaWNpdCBmbG93IGRvZXMgbm90IHN1cHBvcnQgcmVmcmVzaCB0b2tlbicpKTtcbiAgfVxuXG4gIGlmICghdG9rZW4uaGFzT3duUHJvcGVydHkoJ3JlZnJlc2hfdG9rZW4nKSl7XG4gICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBWZXJpZnlFcnJvcihPQVVUSF9DT05URVhUX0FQSV9FUlJPUiwgJ3JlZnJlc2hfdG9rZW4gaXMgYSByZXF1aXJlZCBwYXJhbWV0ZXInKSk7XG4gIH1cblxuICBsZXQgcGF0aCA9IGAke3RoaXMuY29uZmlnLnRlbmFudFVybH0vdjEuMC9lbmRwb2ludC9kZWZhdWx0L3Rva2VuYDtcbiAgbGV0IGRhdGEgPSB7XG4gICAgcmVmcmVzaF90b2tlbiA6IHRva2VuLnJlZnJlc2hfdG9rZW4sXG4gICAgY2xpZW50X2lkIDogdGhpcy5jb25maWcuY2xpZW50SWQsXG4gICAgY2xpZW50X3NlY3JldCA6IHRoaXMuY29uZmlnLmNsaWVudFNlY3JldCxcbiAgICBncmFudF90eXBlIDogJ3JlZnJlc2hfdG9rZW4nLFxuICAgIHNjb3BlIDogdGhpcy5jb25maWcuc2NvcGVcbiAgfTtcblxuICBsZXQgZW5jb2RlZERhdGEgPSBxcy5zdHJpbmdpZnkoZGF0YSk7XG5cbiAgbGV0IG9wdGlvbnMgPVxuICB7XG4gICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgdXJsOiBwYXRoLFxuICAgIGNvbnRlbnRUeXBlOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgICBkYXRhOiBlbmNvZGVkRGF0YVxuICB9O1xuXG4gIHJldHVybiBhcGlSZXF1ZXN0KG9wdGlvbnMpO1xufTtcblxuT0F1dGhDb250ZXh0LnByb3RvdHlwZS5fYXV0aG9yaXplID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICByZXR1cm4gdGhpcy5fYnVpbGRVcmwob3B0aW9ucyk7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvbiBsb2dpblxuKiB1c2VkIGZvciBpbXBsaWNpdCBncmFudCB0byByZXRyaWV2ZSB1cmxcbiogYW5kIGFkZGl0aW9uYWwgcGFyYW1zIHRvIHNlbmQgdXNlci1hZ2VudCB0byBDbG91ZCBJZGVudGl0eSBsb2dpblxuKiBzY3JlZW4gdG8gYXV0aGVudGljYXRlIHdpdGggdGhlIGF1dGhvcml6YXRpb24gc2VydmVyLlxuKi9cbk9BdXRoQ29udGV4dC5wcm90b3R5cGUubG9naW4gPSBmdW5jdGlvbigpIHtcbiBsZXQgdXJsID0gdGhpcy5fYXV0aG9yaXplKHRoaXMuY29uZmlnKTtcbiByZXR1cm4gdXJsO1xufTtcblxuXG4vKipcbiAqIGJ1aWxkVXJsIG1ldGhvZFxuICogQHBhcmFtIHtvYmplY3R9IG9wdHMgY29uZmlndXJhdGlvbiBvYmplY3QgdXNlZCB0byBjcmVhdGUgYSB1cmwgdG8gdGhlIGF1dGhvcml6ZSBlbmRwb2ludFxuICogZm9yIFNTTyBpbXBsaWNpdCBmbG93XG4gKi9cbk9BdXRoQ29udGV4dC5wcm90b3R5cGUuX2J1aWxkVXJsID0gZnVuY3Rpb24ob3B0cykge1xuXHRyZXR1cm4gKFxuXHRcdG9wdHMudGVuYW50VXJsICtcblx0XHQnL29pZGMvZW5kcG9pbnQvZGVmYXVsdC9hdXRob3JpemU/JyArXG5cdFx0cXMuc3RyaW5naWZ5KHtcblx0XHRcdGNsaWVudF9pZDogb3B0cy5jbGllbnRJZCxcblx0XHRcdHJlZGlyZWN0X3VyaTogb3B0cy5yZWRpcmVjdFVyaSxcblx0XHRcdHNjb3BlOiBvcHRzLnNjb3BlLFxuXHRcdFx0cmVzcG9uc2VfdHlwZTogb3B0cy5yZXNwb25zZVR5cGUsXG5cdFx0XHRzdGF0ZTogdXRpbHMucmFuZG9tU3RyaW5nKDE2KSxcblx0XHRcdG5vbmNlOiB1dGlscy5yYW5kb21TdHJpbmcoMTYpXG5cdFx0fSlcblx0KTtcbn07XG5cbi8qKlxuLyoqIEF1dGhvcml6YXRpb24gY29kZSBmbG93IChBWk4pXG4gKiBAZnVuY3Rpb24gYXV0aGVudGljYXRlIGNvbnN0cnVjdCB1cmwgdG8gZW5hYmxlIGF1dGhlbnRpY2F0aW9uIGZvciB1c2VyLlxuICovXG5PQXV0aENvbnRleHQucHJvdG90eXBlLmF1dGhlbnRpY2F0ZSA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gbmV3IFByb21pc2UoXG4gICAgZnVuY3Rpb24ocmVzb2x2ZSkge1xuICAgICAgcmVzb2x2ZSh0aGlzLl9hdXRob3JpemUodGhpcy5jb25maWcpKTtcbiAgICB9LmJpbmQodGhpcylcbiAgKTtcbn07XG5cblxuLyoqXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGhhc2hTdHJpbmcgdGhlIHVybCBoYXNoIGZyYWdtZW50XG4gKiByZXR1cm4gdXJsIGhhc2ggZnJhZ21lbnQgYXMgYW4gb2JqZWN0XG4gKi9cbk9BdXRoQ29udGV4dC5wcm90b3R5cGUuX3BhcnNlSGFzaCA9IGZ1bmN0aW9uKGhhc2hTdHJpbmcpIHtcbiAgbGV0IHBhcnNlZEhhc2ggPSBxcy5wYXJzZShoYXNoU3RyaW5nKTtcbiAgcmV0dXJuIHBhcnNlZEhhc2g7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvbiBoYW5kbGVSZXNwb25zZSBtZXRob2QgaGFuZGxlcyB0aGUgYXBpIHJlcXVlc3QgdG8gQ2xvdWQgSWRlbnRpdHlcbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIE9iamVjdCBjb250YWluaW5nIHRoZSBlbmRwb2ludCBwYXJhbXMuIFttZXRob2QsIHVybCAuLi5ldGNdXG4gKiBAcGFyYW0ge29iamVjdH0gdG9rZW4gdGhlIHRva2VuIG9iamVjdCBjb250YWluaW5nIGFjY2Vzc190b2tlbiwgcmVmcmVzaF90b2tlbiBldGMuXG4gKi9cbk9BdXRoQ29udGV4dC5wcm90b3R5cGUuaGFuZGxlUmVzcG9uc2UgPSBhc3luYyBmdW5jdGlvbihvcHRpb25zLCB0b2tlbk9iail7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikge1xuICAgICAgdGhyb3cgbmV3IFZlcmlmeUVycm9yKE9BVVRIX0NPTlRFWFRfQVBJX0VSUk9SLCAnaGFuZGxlUmVzcG9uc2Uob3B0aW9ucywgdG9rZW4pLCAyIHBhcmFtZXRlcnMgYXJlIHJlcXVpcmVkICcgKyBhcmd1bWVudHMubGVuZ3RoICsgJyB3ZXJlIGdpdmVuJyk7XG4gIH1cbiAgaWYgKCF1dGlscy5pc1Rva2VuKHRva2VuT2JqKSl7XG4gICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBWZXJpZnlFcnJvcihUT0tFTl9FUlJPUiwgJ25vdCBhIHZhbGlkIHRva2VuJykpO1xuICB9XG5cbiAgbGV0IHRva2VuID0gdG9rZW5PYmo7XG4gIC8vRGVmaW5lIGVtcHR5IHBheWxvYWQgb2JqZWN0XG4gIGxldCBwYXlsb2FkID0ge1xuICAgICAgcmVzcG9uc2U6IG51bGwsXG4gICAgICB0b2tlbjogbnVsbFxuICB9O1xuXG4gIHRyeSB7XG4gICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgYXBpUmVxdWVzdChvcHRpb25zLCB0b2tlbi5hY2Nlc3NfdG9rZW4pO1xuICAgIHBheWxvYWQucmVzcG9uc2UgPSByZXNwb25zZTtcbiAgICBpZiAodGhpcy5jb25maWcuZmxvd1R5cGUgPT09ICdJbXBsaWNpdCcpe1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShyZXNwb25zZSk7XG4gICAgfVxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUocGF5bG9hZCk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgaWYgKGVycm9yLnN0YXR1cyA9PT0gNDAxICYmIHV0aWxzLmlzTm9kZSgpKXtcbiAgICAgIC8vIHZhbGlkYXRlICd0b2tlbicgaGFzIHJlZnJlc2hfdG9rZW5cbiAgICAgIGlmICghdG9rZW4ucmVmcmVzaF90b2tlbikge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgVmVyaWZ5RXJyb3IoT0FVVEhfQ09OVEVYVF9BUElfRVJST1IsICdhY2Nlc3NfdG9rZW4gZXhwaXJlZCBhbmQgcmVmcmVzaF90b2tlbiBub3QgZm91bmQnKSk7XG4gICAgICB9XG4gICAgICBsZXQgbmV3VG9rZW4gPSBhd2FpdCB0aGlzLnJlZnJlc2hUb2tlbih0b2tlbik7XG4gICAgICBsZXQgb3JpZ2luYWxSZXF1ZXN0ID0gYXdhaXQgYXBpUmVxdWVzdChvcHRpb25zLCBuZXdUb2tlbi5hY2Nlc3NfdG9rZW4pO1xuICAgICAgcGF5bG9hZCA9IHtcbiAgICAgICAgcmVzcG9uc2U6IG9yaWdpbmFsUmVxdWVzdCxcbiAgICAgICAgdG9rZW46IG5ld1Rva2VuXG4gICAgICB9O1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShwYXlsb2FkKTtcbiAgICB9XG4gICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGVycm9yKTtcbiAgfVxufTtcblxuLyoqXG4gKiBAZnVuY3Rpb24gaGFuZGxlQ2FsbGJhY2sgcmVxdWlyZWQgZm9yIGltcGxpY2l0IGZsb3cgdG8gaGFuZGxlIHRoZSBhdXRoZW50aWNhdGlvbiAvIGF1dGhvcml6YXRpb24gdHJhbnNhY3Rpb24gZnJvbSBDbG91ZCBJZGVudGl0eVxuICogYW5kIHRvIHN0b3JlIHRoZSBhY2Nlc3NfdG9rZW4gYW5kIGV4cGlyZXNfaW4gdmFsdWVzIHRvIGJyb3dzZXIgc3RvcmFnZS5cbiAqL1xuT0F1dGhDb250ZXh0LnByb3RvdHlwZS5oYW5kbGVDYWxsYmFjayA9IGZ1bmN0aW9uKCkge1xuICBpZiAodXRpbHMuaXNOb2RlKCkpIHtcbiAgICAgIHRocm93IG5ldyBWZXJpZnlFcnJvcihPQVVUSF9DT05URVhUX0FQSV9FUlJPUiwgJ2hhbmRsZUNhbGxiYWNrKCkgaXMgb25seSBmb3IgSW1wbGljaXQgZmxvdycpO1xuICB9XG4gIGxldCB1cmxPYmo7XG4gIGxldCBlcnJvckNoZWNrID0gUmVnRXhwKCcjZXJyb3InKTtcbiAgbGV0IGhhc2ggPSAgd2luZG93LmxvY2F0aW9uLmhhc2g7XG5cbiAgdXJsT2JqID0gdHlwZW9mIGhhc2ggPT09ICdvYmplY3QnID8gaGFzaCA6IHRoaXMuX3BhcnNlVXJsSGFzaChoYXNoKTtcblxuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVqZWN0KXtcbiAgICBpZiAoZXJyb3JDaGVjay50ZXN0KGhhc2gpKXtcbiAgICAgIHJlamVjdCh1cmxPYmopO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnN0b3JhZ2VIYW5kbGVyLnNldFN0b3JhZ2UodXJsT2JqKTtcbiAgICAgIHRoaXMuX3NldFNlc3Npb24oKTtcbiAgICAgIC8vIHJlbW92ZSB1cmxcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gJyc7XG4gICAgfVxuICB9LmJpbmQodGhpcykpO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgT0F1dGhDb250ZXh0O1xuIl19