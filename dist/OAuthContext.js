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
            return _context.abrupt("return", payload.response.active === true);

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
  var token = tokenObj || this.token;

  if (!_utils.default.isToken(tokenObj)) {
    return Promise.reject(new _VerifyError.default(TOKEN_ERROR, 'Token parameter is not a valid token'));
  }

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2xpYi9PQXV0aENvbnRleHQuanMiXSwibmFtZXMiOlsiT0FVVEhfQ09OVEVYVF9DT05GSUdfU0VUVElOR1NfRVJST1IiLCJBcHBDb25maWciLCJPQVVUSF9DT05URVhUX0FQSV9FUlJPUiIsIlRPS0VOX0VSUk9SIiwiT0F1dGhDb250ZXh0IiwiY29uZmlnIiwiVmVyaWZ5RXJyb3IiLCJjbGllbnRJZCIsInRlbmFudFVybCIsInJlZGlyZWN0VXJpIiwiZmxvd1R5cGUiLCJyZXNwb25zZVR5cGUiLCJzY29wZSIsImNsaWVudFNlY3JldCIsInV0aWxzIiwiaXNOb2RlIiwic3RvcmFnZVR5cGUiLCJzdG9yYWdlSGFuZGxlciIsIlN0b3JhZ2VIYW5kbGVyIiwicHJvdG90eXBlIiwiaXNBdXRoZW50aWNhdGVkIiwidG9rZW4iLCJpbnRyb3NwZWN0VG9rZW4iLCJwYXlsb2FkIiwicmVzcG9uc2UiLCJhY3RpdmUiLCJQcm9taXNlIiwicmVqZWN0IiwidG9rZW5PYmoiLCJpc1Rva2VuIiwicGF0aCIsImRhdGEiLCJjbGllbnRfaWQiLCJjbGllbnRfc2VjcmV0IiwiYWNjZXNzX3Rva2VuIiwiZW5jb2RlZERhdGEiLCJxcyIsInN0cmluZ2lmeSIsIm9wdGlvbnMiLCJtZXRob2QiLCJ1cmwiLCJjb250ZW50VHlwZSIsImhhbmRsZVJlc3BvbnNlIiwidXNlcmluZm8iLCJmZXRjaFRva2VuIiwiYWNjZXNzVG9rZW4iLCJKU09OIiwicGFyc2UiLCJnZXRTdG9yYWdlIiwiZXJyb3IiLCJnZXRDb25maWciLCJsb2dvdXQiLCJyZXZva2VUb2tlbiIsImNsZWFyU3RvcmFnZSIsIndpbmRvdyIsImxvY2F0aW9uIiwicmVwbGFjZSIsImxlbmd0aCIsInRva2VuVHlwZSIsImV4cGlyZVRva2VuIiwiYXJndW1lbnRzIiwicmVmcmVzaF90b2tlbiIsIl9wYXJzZVVybEhhc2giLCJoYXNoU3RyaW5nIiwicGFyc2VkSGFzaCIsIl9zZXRTZXNzaW9uIiwiZXhwaXJlc0F0IiwiZXhwaXJlc19pbiIsImNsb2NrU2tldyIsIkRFRkFVTFRfQ0xPQ0tfU0tFVyIsImRlbGF5IiwiRGF0ZSIsIm5vdyIsInNldFRpbWVvdXQiLCJzZXNzaW9uIiwiZ2V0VG9rZW4iLCJwYXJhbXMiLCJxdWVyeSIsIl9wYXJhbXMiLCJzdWJzdHJpbmciLCJpbmRleE9mIiwiZ3JhbnRfdHlwZSIsInJlZGlyZWN0X3VyaSIsInJlZnJlc2hUb2tlbiIsImhhc093blByb3BlcnR5IiwiX2F1dGhvcml6ZSIsIl9idWlsZFVybCIsImxvZ2luIiwib3B0cyIsInJlc3BvbnNlX3R5cGUiLCJzdGF0ZSIsInJhbmRvbVN0cmluZyIsIm5vbmNlIiwiYXV0aGVudGljYXRlIiwicmVzb2x2ZSIsImJpbmQiLCJfcGFyc2VIYXNoIiwic3RhdHVzIiwibmV3VG9rZW4iLCJvcmlnaW5hbFJlcXVlc3QiLCJoYW5kbGVDYWxsYmFjayIsInVybE9iaiIsImVycm9yQ2hlY2siLCJSZWdFeHAiLCJoYXNoIiwidGVzdCIsInNldFN0b3JhZ2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7OztJQUVPQSxtQyxHQUE2RUMsaUIsQ0FBN0VELG1DO0lBQXFDRSx1QixHQUF3Q0QsaUIsQ0FBeENDLHVCO0lBQXlCQyxXLEdBQWVGLGlCLENBQWZFLFc7QUFDckU7Ozs7OztBQUtBLFNBQVNDLFlBQVQsQ0FBc0JDLE1BQXRCLEVBQThCO0FBQzVCLE1BQUksQ0FBQ0EsTUFBTCxFQUFhO0FBQ1QsVUFBTSxJQUFJQyxvQkFBSixDQUFnQk4sbUNBQWhCLEVBQXFELDhCQUFyRCxDQUFOO0FBQ0gsR0FIMkIsQ0FJNUI7OztBQUNBLE1BQUksQ0FBQ0ssTUFBTSxDQUFDRSxRQUFaLEVBQXNCO0FBQ3BCLFVBQU0sSUFBSUQsb0JBQUosQ0FBZ0JOLG1DQUFoQixFQUFxRCwrQkFBckQsQ0FBTjtBQUNEOztBQUNELE1BQUksQ0FBQ0ssTUFBTSxDQUFDRyxTQUFaLEVBQXVCO0FBQ3JCLFVBQU0sSUFB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QUFNLElBQUlULG9CQUFKLENBQWdCSix1QkFBaEIsRUFBeUMsNENBQXpDLENBQU47QUFDSDs7QUFDRCxNQUFJbUcsTUFBSjtBQUNBLE1BQUlDLFVBQVUsR0FBR0MsTUFBTSxDQUFDLFFBQUQsQ0FBdkI7QUFDQSxNQUFJQyxJQUFJLEdBQUlsRCxNQUFNLENBQUNDLFFBQVAsQ0FBZ0JpRCxJQUE1QjtBQUVBSCxFQUFBQSxNQUFNLEdBQUcsUUFBT0csSUFBUCxNQUFnQixRQUFoQixHQUEyQkEsSUFBM0IsR0FBa0MsS0FBSzFDLGFBQUwsQ0FBbUIwQyxJQUFuQixDQUEzQztBQUVBLFNBQU8sSUFBSTlFLE9BQUosQ0FBWSxVQUFTQyxNQUFULEVBQWdCO0FBQ2pDLFFBQUkyRSxVQUFVLENBQUNHLElBQVgsQ0FBZ0JELElBQWhCLENBQUosRUFBMEI7QUFDeEI3RSxNQUFBQSxNQUFNLENBQUMwRSxNQUFELENBQU47QUFDRCxLQUZELE1BRU87QUFDTCxXQUFLcEYsY0FBTCxDQUFvQnlGLFVBQXBCLENBQStCTCxNQUEvQjs7QUFDQSxXQUFLcEMsV0FBTCxHQUZLLENBR0w7OztBQUNBWCxNQUFBQSxNQUFNLENBQUNDLFFBQVAsQ0FBZ0JpRCxJQUFoQixHQUF1QixFQUF2QjtBQUNEO0FBQ0YsR0FUa0IsQ0FTakJULElBVGlCLENBU1osSUFUWSxDQUFaLENBQVA7QUFVRCxDQXBCRDs7ZUFzQmUzRixZIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICdAYmFiZWwvcG9seWZpbGwnO1xuaW1wb3J0IHFzIGZyb20gJ3F1ZXJ5LXN0cmluZyc7XG5pbXBvcnQgVmVyaWZ5RXJyb3IgZnJvbSAnLi9lcnJvcnMvVmVyaWZ5RXJyb3InO1xuaW1wb3J0IFN0b3JhZ2VIYW5kbGVyIGZyb20gJy4vaGVscGVycy9TdG9yYWdlSGFuZGxlcic7XG5pbXBvcnQge0FwcENvbmZpZ30gZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IGFwaVJlcXVlc3QgZnJvbSAnLi9oZWxwZXJzL2FwaVJlcXVlc3QnO1xuaW1wb3J0IHV0aWxzIGZyb20gJy4vaGVscGVycy91dGlscyc7XG5cbmNvbnN0IHtPQVVUSF9DT05URVhUX0NPTkZJR19TRVRUSU5HU19FUlJPUiwgT0FVVEhfQ09OVEVYVF9BUElfRVJST1IsIFRPS0VOX0VSUk9SfSA9IEFwcENvbmZpZztcbi8qKlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBjb25maWcgdXNlcnMgY29uZmlndXJhdGlvbiBzZXR0aW5ncyB0byBraWNrIG9mZlxuICogT0F1dGggaW1wbGljaXQgZmxvd1xuICovXG5mdW5jdGlvbiBPQXV0aENvbnRleHQoY29uZmlnKSB7XG4gIGlmICghY29uZmlnKSB7XG4gICAgICB0aHJvdyBuZXcgVmVyaWZ5RXJyb3IoT0FVVEhfQ09OVEVYVF9DT05GSUdfU0VUVElOR1NfRVJST1IsICdDb25maWcgcGFyYW1ldGVyIGlzIHJlcXVpcmVkJyk7XG4gIH1cbiAgLy9WZXJpZnkgY29uZmlnIHNldHRpbmdzXG4gIGlmICghY29uZmlnLmNsaWVudElkKSB7XG4gICAgdGhyb3cgbmV3IFZlcmlmeUVycm9yKE9BVVRIX0NPTlRFWFRfQ09ORklHX1NFVFRJTkdTX0VSUk9SLCAnY2xpZW50SWQgcHJvcGVydHkgaXMgcmVxdWlyZWQnKTtcbiAgfVxuICBpZiAoIWNvbmZpZy50ZW5hbnRVcmwpIHtcbiAgICB0aHJvdyBuZXcgVmVyaWZ5RXJyb3IoT0FVVEhfQ09OVEVYVF9DT05GSUdfU0VUVElOR1NfRVJST1IsICdUZW5hbnQgVVJMIGlzIHJlcXVpcmVkJyk7XG4gIH1cbiAgaWYgKCFjb25maWcucmVkaXJlY3RVcmkgJiYgY29uZmlnLmZsb3dUeXBlICE9PSAnY2xpZW50X2NyZWRlbnRpYWxzJykge1xuICAgIHRocm93IG5ldyBWZXJpZnlFcnJvcihPQVVUSF9DT05URVhUX0NPTkZJR19TRVRUSU5HU19FUlJPUiwgJ0EgcmVkaXJlY3QgVVJMIGlzIHJlcXVpcmVkJyk7XG4gIH1cbiAgaWYgKCFjb25maWcucmVzcG9uc2VUeXBlICYmIGNvbmZpZy5mbG93VHlwZSAhPT0gJ2NsaWVudF9jcmVkZW50aWFscycpIHtcbiAgICB0aHJvdyBuZXcgVmVyaWZ5RXJyb3IoT0FVVEhfQ09OVEVYVF9DT05GSUdfU0VUVElOR1NfRVJST1IsICdSZXNwb25zZSBUeXBlIHJlcXVpcmVkJyk7XG4gIH1cbiAgaWYgKCFjb25maWcuc2NvcGUpe1xuICAgIHRocm93IG5ldyBWZXJpZnlFcnJvcihPQVVUSF9DT05URVhUX0NPTkZJR19TRVRUSU5HU19FUlJPUiwgJ3Njb3BlIFByb3BlcnR5IG5vdCBzZXQgaW4gQ29uZmlnIHNldHRpbmdzJyk7XG4gIH1cbiAgaWYgKGNvbmZpZy5mbG93VHlwZSA9PT0gJ0FaTicgJiYgIWNvbmZpZy5jbGllbnRTZWNyZXQpe1xuICAgIHRocm93IG5ldyBWZXJpZnlFcnJvcihPQVVUSF9DT05URVhUX0NPTkZJR19TRVRUSU5HU19FUlJPUiwgJ0NsaWVudCBTZWNyZXQgaXMgcmVxdWlyZWQgZm9yIHRoZSBBWk4gY29kZSBmbG93Jyk7XG4gIH1cblxuICBpZiAoIShjb25maWcuZmxvd1R5cGUgPT09ICdJbXBsaWNpdCcgfHwgY29uZmlnLmZsb3dUeXBlID09PSAnQVpOJyB8fCBjb25maWcuZmxvd1R5cGUgPT09ICdjbGllbnRfY3JlZGVudGlhbHMnKSl7XG4gICAgdGhyb3cgbmV3IFZlcmlmeUVycm9yKE9BVVRIX0NPTlRFWFRfQ09ORklHX1NFVFRJTkdTX0VSUk9SLCAnQ2hlY2sgdGhlIGZsb3dUeXBlIHByb3BlcnR5IGluIHlvdXIgY29uZmlndXJhdGlvbiBvYmplY3QgaXMgY29ycmVjdC4gU3VwcG9ydGVkIFZhbHVlczogXCJJbXBsaWNpdFwiLCBcIkFaTlwiLCBcImNsaWVudF9jcmVkZW50aWFsc1wiJyk7XG4gIH1cblxuICBpZiAoY29uZmlnLmZsb3dUeXBlID09PSAnSW1wbGljaXQnKXtcbiAgICBpZiAodXRpbHMuaXNOb2RlKCkpe1xuICAgICAgICB0aHJvdyBuZXcgVmVyaWZ5RXJyb3IoT0FVVEhfQ09OVEVYVF9DT05GSUdfU0VUVElOR1NfRVJST1IsICdJbXBsaWNpdCBmbG93IG5vdCBzdXBwb3J0ZWQgaW4gTm9kZScpO1xuICAgIH1cbiAgICBpZiAoIWNvbmZpZy5zdG9yYWdlVHlwZSl7XG4gICAgICB0aHJvdyBuZXcgVmVyaWZ5RXJyb3IoT0FVVEhfQ09OVEVYVF9DT05GSUdfU0VUVElOR1NfRVJST1IsICdzdG9yYWdlVHlwZSBwcm9wZXJ0eSBub3Qgc2V0LicpO1xuICAgIH1cbiAgICB0aGlzLnN0b3JhZ2VIYW5kbGVyID0gbmV3IFN0b3JhZ2VIYW5kbGVyKGNvbmZpZy5zdG9yYWdlVHlwZSk7XG4gIH1cblxuICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbn1cblxuLyoqXG4gKiBAZnVuY3Rpb24gaXNBdXRoZW50aWNhdGVkIHRvIGNoZWNrIGN1cnJlbnQgdXNlcnMgYWNjZXNzX3Rva2VuIG9yIHJlZnJlc2hfdG9rZW4gdG9cbiAqIGRldGVybWluZSBpZiB0aGV5IGFyZSBzdGlsbCB2YWxpZC5cbiAqIEBwYXJhbSB7b2JqZWN0fSB0b2tlbiB0aGUgdG9rZW4gb2JqZWN0IHdpdGggYWNjZXNzX3Rva2VuLCByZWZyZXNoVG9rZW4gZXRjLlxuICovXG5PQXV0aENvbnRleHQucHJvdG90eXBlLmlzQXV0aGVudGljYXRlZCA9IGFzeW5jIGZ1bmN0aW9uKHRva2VuKXtcbiAgdHJ5IHtcbiAgICBsZXQgcGF5bG9hZCA9IGF3YWl0IHRoaXMuaW50cm9zcGVjdFRva2VuKHRva2VuKTtcbiAgICByZXR1cm4gcGF5bG9hZC5yZXNwb25zZS5hY3RpdmUgPT09IHRydWU7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGVycm9yKTtcbiAgfVxufTtcblxuLyoqXG4gKiBAZnVuY3Rpb24gaW50cm9zcGVjdFRva2VuIHRvIGluc3BlY3QgYW4gT0lEQyB0b2tlbi5cbiAqIEBwYXJhbSB7b2JqZWN0fSB0b2tlbiB0b2tlbiBvYmplY3QgdG8gaW50cm9zcGVjdFxuICovXG5PQXV0aENvbnRleHQucHJvdG90eXBlLmludHJvc3BlY3RUb2tlbiA9IGZ1bmN0aW9uKHRva2VuT2JqKXtcbiAgbGV0IHRva2VuID0gdG9rZW5PYmogfHwgdGhpcy50b2tlbjtcbiAgaWYgKCF1dGlscy5pc1Rva2VuKHRva2VuT2JqKSl7XG4gICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBWZXJpZnlFcnJvcihUT0tFTl9FUlJPUiwgJ1Rva2VuIHBhcmFtZXRlciBpcyBub3QgYSB2YWxpZCB0b2tlbicpKTtcbiAgfVxuXHRcbiAgbGV0IHBhdGggPSBgJHt0aGlzLmNvbmZpZy50ZW5hbnRVcmx9L3YxLjAvZW5kcG9pbnQvZGVmYXVsdC9pbnRyb3NwZWN0YDtcblxuICBsZXQgZGF0YSA9IHtcbiAgICBjbGllbnRfaWQgOiB0aGlzLmNvbmZpZy5jbGllbnRJZCxcbiAgICBjbGllbnRfc2VjcmV0IDogdGhpcy5jb25maWcuY2xpZW50U2VjcmV0LFxuICAgIHRva2VuIDogdG9rZW4uYWNjZXNzX3Rva2VuXG4gIH07XG5cbiAgbGV0IGVuY29kZWREYXRhID0gcXMuc3RyaW5naWZ5KGRhdGEpO1xuXG4gIGxldCBvcHRpb25zID0ge1xuICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgIHVybDogcGF0aCxcbiAgICBjb250ZW50VHlwZTogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICAgZGF0YTogZW5jb2RlZERhdGFcbiB9O1xuXG4gcmV0dXJuIHRoaXMuaGFuZGxlUmVzcG9uc2Uob3B0aW9ucywgdG9rZW4pO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb24gdXNlcmluZm8gQVBJIHRvIGdldCB0aGUgdXNlciBpbmZvcm1hdGlvbiB0aGF0IGlzIGFzc29jaWF0ZWQgd2l0aCB0aGUgdG9rZW4gcGFyYW1ldGVyXG4gKiBAcGFyYW0ge29iamVjdH0gdG9rZW5PYmogdG9rZW4gb2JqZWN0IHdpdGggYWNjZXNzX3Rva2VuIHByb3BlcnR5LlxuICovXG5PQXV0aENvbnRleHQucHJvdG90eXBlLnVzZXJpbmZvID0gZnVuY3Rpb24odG9rZW5PYmope1xuICBsZXQgdG9rZW4gPSB0b2tlbk9iaiB8fCB0aGlzLnRva2VuO1xuXG4gIGlmICghdXRpbHMuaXNUb2tlbih0b2tlbikpe1xuICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgVmVyaWZ5RXJyb3IoVE9LRU5fRVJST1IsICdUb2tlbiBwYXJhbWV0ZXIgaXMgbm90IGEgdmFsaWQgdG9rZW4nKSk7XG4gIH1cblxuICBcbiAgbGV0IHBhdGggPSBgJHt0aGlzLmNvbmZpZy50ZW5hbnRVcmx9L3YxLjAvZW5kcG9pbnQvZGVmYXVsdC91c2VyaW5mb2A7XG5cbiAgbGV0IG9wdGlvbnMgPSB7XG4gICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgdXJsOiBwYXRoLFxuICAgIGNvbnRlbnRUeXBlOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgICBkYXRhOiBxcy5zdHJpbmdpZnkodG9rZW4uYWNjZXNzX3Rva2VuKVxuICB9O1xuXG4gIHJldHVybiB0aGlzLmhhbmRsZVJlc3BvbnNlKG9wdGlvbnMsIHRva2VuKTtcbn07XG5cblxuLyoqXG4gKiBAZnVuY3Rpb24gZmV0Y2hUb2tlbiBVc2VkIGZvciBpbXBsaWNpdCBmbG93IHRvIHJldHVybiB0aGUgYWNjZXNzVG9rZW4gc3RvcmVkIGluIGJyb3dzZXIuXG4qL1xuT0F1dGhDb250ZXh0LnByb3RvdHlwZS5mZXRjaFRva2VuID0gZnVuY3Rpb24oKXtcbiAgaWYgKHRoaXMuY29uZmlnLmZsb3dUeXBlID09PSAnSW1wbGljaXQnICl7XG4gICAgdHJ5IHtcbiAgICAgIGxldCBhY2Nlc3NUb2tlbiA9IEpTT04ucGFyc2UodGhpcy5zdG9yYWdlSGFuZGxlci5nZXRTdG9yYWdlKCd0b2tlbicpKTtcbiAgICAgIHJldHVybiBhY2Nlc3NUb2tlbjtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBWZXJpZnlFcnJvcihPQVVUSF9DT05URVhUX0FQSV9FUlJPUiwgJ2ZldGNoVG9rZW4oKSBjYW4gb25seSBiZSB1c2VkIHdpdGggSW1wbGljaXQgZmxvdycpO1xuICB9XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvbiBnZXRDb25maWdcbiAqIGV4cG9zZSBjb25maWcgb2JqZWN0IGZvciBBdXRoZW50aWNhdG9yQ29udGV4dC5cbiAqL1xuT0F1dGhDb250ZXh0LnByb3RvdHlwZS5nZXRDb25maWcgPSBmdW5jdGlvbigpe1xuICByZXR1cm4gdGhpcy5jb25maWc7XG59O1xuXG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd9IHBhdGggT3B0aW9uYWwgc3RyaW5nIHRvIHJlZGlyZWN0IHVzZXIgYWZ0ZXIgYWNjZXNzVG9rZW4gaGFzIGV4cGlyZWRcbiAqIERlZmF1bHRzIHRvIGluZGV4IHBhZ2UuXG4gKi9cbk9BdXRoQ29udGV4dC5wcm90b3R5cGUubG9nb3V0ID0gYXN5bmMgZnVuY3Rpb24ocGF0aCwgdG9rZW4pIHtcbiAgLy8gY2xlYXIgc3RvcmFnZSBhbmQgcmVkaXJlY3QgdG8gaG9tZSBwYWdlXG4gIGlmICh0aGlzLmNvbmZpZy5mbG93VHlwZSA9PT0gJ0ltcGxpY2l0JyApe1xuICAgICAgbGV0IGFjY2Vzc1Rva2VuID0gdGhpcy5mZXRjaFRva2VuKCk7XG4gICAgICBhd2FpdCB0aGlzLnJldm9rZVRva2VuKGFjY2Vzc1Rva2VuLCAnYWNjZXNzX3Rva2VuJyk7XG4gICAgICBhd2FpdCB0aGlzLnN0b3JhZ2VIYW5kbGVyLmNsZWFyU3RvcmFnZSgpO1xuICAgICAgYXdhaXQgd2luZG93LmxvY2F0aW9uLnJlcGxhY2UocGF0aCB8fCAnLycpO1xuICB9IGVsc2Uge1xuICAgIC8vIHBhdGggYW5kIHRva2VuIHN1cHBsaWVkXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDIgJiYgIXV0aWxzLmlzVG9rZW4odG9rZW4pKSB7XG4gICAgICAgIFByb21pc2UucmVqZWN0KG5ldyBWZXJpZnlFcnJvcihUT0tFTl9FUlJPUiwgJ25vdCBhIHZhbGlkIHRva2VuLicpKTtcbiAgICB9XG4gICAgLy8gbm8gcGF0aCBidXQgYSAndG9rZW4nIHByb3ZpZGVkXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEgJiYgIXV0aWxzLmlzVG9rZW4ocGF0aCkpIHtcbiAgICAgICAgUHJvbWlzZS5yZWplY3QobmV3IFZlcmlmeUVycm9yKFRPS0VOX0VSUk9SLCAnbm90IGEgdmFsaWQgdG9rZW4uJykpO1xuICAgIH1cblxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAyKSB7XG4gICAgICAgIHRoaXMucmV2b2tlVG9rZW4odG9rZW4sICdhY2Nlc3NfdG9rZW4nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnJldm9rZVRva2VuKHBhdGgsICdhY2Nlc3NfdG9rZW4nKTtcbiAgICB9XG4gIH1cbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uIHJldm9rZVRva2VuIHVzZWQgdG8gcmV2b2tlIHZhbGlkIHRva2Vucy5cbiAqIEBwYXJhbSB7b2JqZWN0fSB0b2tlbiB0aGUgVG9rZW4gb2JqZWN0IGNvbnRhaW5pbmcgYWNjZXNzX3Rva2VuLCByZWZyZXNoX3Rva2VuIGV0Yy4uLlxuICogQHBhcmFtIHtzdHJpbmd9IHRva2VuVHlwZSB0aGUgdG9rZW4gdHlwZSB0byBiZSByZXZva2VkIFwiYWNjZXNzX3Rva2VuXCIgb3IgXCJyZWZyZXNoX3Rva2VuXCIuXG4gKi9cbk9BdXRoQ29udGV4dC5wcm90b3R5cGUucmV2b2tlVG9rZW4gPSBmdW5jdGlvbih0b2tlbiwgdG9rZW5UeXBlKXtcbiAgbGV0IHBhdGggPSBgJHt0aGlzLmNvbmZpZy50ZW5hbnRVcmx9L3YxLjAvZW5kcG9pbnQvZGVmYXVsdC9yZXZva2VgO1xuICBsZXQgZXhwaXJlVG9rZW47XG4gIGxldCBlbmNvZGVkRGF0YTtcbiAgbGV0IG9wdGlvbnM7XG5cbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKSB7XG4gICAgICB0aHJvdyBuZXcgVmVyaWZ5RXJyb3IoT0FVVEhfQ09OVEVYVF9BUElfRVJST1IsICdyZXZva2VUb2tlbih0b2tlbiwgdG9rZW5UeXBlKSwgMiBwYXJhbWV0ZXJzIGFyZSByZXF1aXJlZCAnICsgYXJndW1lbnRzLmxlbmd0aCArICcgd2VyZSBnaXZlbicpO1xuICB9XG5cbiAgaWYgKCF0b2tlbikge1xuICAgICAgdGhyb3cgbmV3IFZlcmlmeUVycm9yKE9BVVRIX0NPTlRFWFRfQVBJX0VSUk9SLCAndG9rZW4gY2Fubm90IGJlIG51bGwnKTtcbiAgfVxuXG4gIGlmICghKHRva2VuVHlwZSA9PT0gJ2FjY2Vzc190b2tlbicgfHwgdG9rZW5UeXBlID09PSAncmVmcmVzaF90b2tlbicpKXtcbiAgICB0aHJvdyBuZXcgVmVyaWZ5RXJyb3IoT0FVVEhfQ09OVEVYVF9BUElfRVJST1IsIGBQYXJhbWV0ZXI6ICR7dG9rZW5UeXBlfSBpcyBpbnZhbGlkLlxcbiBTdXBwb3J0ZWQgdmFsdWVzIGFyZSBcImFjY2Vzc190b2tlblwiIG9yIFwicmVmcmVzaF90b2tlbmApO1xuICB9XG5cbiAgZXhwaXJlVG9rZW4gPSB0b2tlblR5cGUgPT09ICdhY2Nlc3NfdG9rZW4nID8gdG9rZW4uYWNjZXNzX3Rva2VuIDogdG9rZW4ucmVmcmVzaF90b2tlbjtcblxuICBsZXQgZGF0YSA9IHtcbiAgICBjbGllbnRfaWQgOiB0aGlzLmNvbmZpZy5jbGllbnRJZCxcbiAgICBjbGllbnRfc2VjcmV0IDogdGhpcy5jb25maWcuY2xpZW50U2VjcmV0LFxuICAgIHRva2VuIDogZXhwaXJlVG9rZW5cbiAgfTtcblxuICBlbmNvZGVkRGF0YSA9IHFzLnN0cmluZ2lmeShkYXRhKTtcblxuICBvcHRpb25zID0ge1xuICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgIGNvbnRlbnRUeXBlOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgICB1cmw6IHBhdGgsXG4gICAgZGF0YTogZW5jb2RlZERhdGFcbiAgfTtcblxuICAvLyB0b2tlbiBpcyBub3QgcmVxdWlyZWQsIGJ1dCBoYW5kbGVSZXNwb25zZSB3aWxsIHRocm93IGVycm9yIHdpdGhvdXQgaXRcbiAgcmV0dXJuIHRoaXMuaGFuZGxlUmVzcG9uc2Uob3B0aW9ucywgdG9rZW4pO1xufTtcblxuLyoqXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGhhc2hTdHJpbmcgdGhlIHVybCBoYXNoIGZyYWdtZW50XG4gKiByZXR1cm4gdXJsIGhhc2ggZnJhZ21lbnQgYXMgYW4gb2JqZWN0XG4gKi9cbk9BdXRoQ29udGV4dC5wcm90b3R5cGUuX3BhcnNlVXJsSGFzaCA9IGZ1bmN0aW9uKGhhc2hTdHJpbmcpIHtcbiAgbGV0IHBhcnNlZEhhc2ggPSBxcy5wYXJzZShoYXNoU3RyaW5nKTtcbiAgcmV0dXJuIHBhcnNlZEhhc2g7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvbiBzZXRTZXNzaW9uIFVzZWQgZm9yIEltcGxpY2l0IGZsb3cuIENyZWF0ZXMgYSBzZXNzaW9uIGZvciB0aGUgU0RLIHRvIG1hbmFnZSB0aGUgYWNjZXNzIHRva2VuXG4gKiB2YWxpZGl0eSBmb3IgdGhlIGdpdmVuIHVzZXIuIENsZWFycyBicm93c2VyIHN0b3JhZ2Ugb24gYWNjZXNzIHRva2VuIGV4cGlyeS5cbiAqL1xuT0F1dGhDb250ZXh0LnByb3RvdHlwZS5fc2V0U2Vzc2lvbiA9IGZ1bmN0aW9uKCkge1xuICBpZiAodXRpbHMuaXNOb2RlKCkpIHtcbiAgICAgIHRocm93IG5ldyBWZXJpZnlFcnJvcihPQVVUSF9DT05URVhUX0FQSV9FUlJPUiwgJ19zZXRTZXNzaW9uKCkgaXMgbm90IHN1cHBvcnRlZCBpbiBOb2RlJyk7XG4gIH1cbiAgY29uc3QgZXhwaXJlc0F0ID0gSlNPTi5wYXJzZSh0aGlzLnN0b3JhZ2VIYW5kbGVyLmdldFN0b3JhZ2UoJ3Rva2VuJykpLmV4cGlyZXNfaW47XG4gIGNvbnN0IGNsb2NrU2tldyA9IEFwcENvbmZpZy5ERUZBVUxUX0NMT0NLX1NLRVc7XG4gIGNvbnN0IGRlbGF5ID0gZXhwaXJlc0F0IC0gKERhdGUubm93KCkgLSBjbG9ja1NrZXcpO1xuXG4gIGlmIChkZWxheSA+IDApIHtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIHRoaXMuc2Vzc2lvbiA9IGZhbHNlO1xuICAgICAgdGhpcy5zdG9yYWdlSGFuZGxlci5jbGVhclN0b3JhZ2UoKTtcbiAgICB9LCBkZWxheSk7XG4gIH1cbn07XG5cbi8qKlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXJhbXNcbiAqIEBmdW5jdGlvbiBnZXRUb2tlbiB0byBtYWtlIGFwaSByZXF1ZXN0IHRvIENsb3VkIElkZW50aXR5IEF1dGhvcml6YXRpb24gc2VydmVyXG4gKiB0byByZXRyaWV2ZSBhY2Nlc3NfdG9rZW4sIHJlZnJlc2hfdG9rZW4sIGdyYW50X2lkLi4uXG4gKi9cbk9BdXRoQ29udGV4dC5wcm90b3R5cGUuZ2V0VG9rZW4gPSBmdW5jdGlvbihwYXJhbXMpIHtcbiAgaWYgKHRoaXMuY29uZmlnLmZsb3dUeXBlID09PSAnSW1wbGljaXQnKSB7XG4gICAgICB0aHJvdyBuZXcgVmVyaWZ5RXJyb3IoT0FVVEhfQ09OVEVYVF9BUElfRVJST1IsICdnZXRUb2tlbigpIGNhbm5vdCBiZSB1c2VkIHdpdGggSW1wbGljaXQgZmxvdycpO1xuICB9XG4gIGlmICghcGFyYW1zKSB7XG4gICAgICAvLyBjaGFuZ2UgbWVzc2FnZVxuICAgICAgdGhyb3cgbmV3IFZlcmlmeUVycm9yKE9BVVRIX0NPTlRFWFRfQVBJX0VSUk9SLCAnZ2V0VG9rZW4ocGFyYW1zKSwgUGFyYW1zIGFyZSByZXF1aXJlZCcpO1xuICB9XG4gIFxuICBsZXQgcXVlcnk7XG4gIGxldCBfcGFyYW1zID0gcGFyYW1zO1xuXG4gIGlmICh0aGlzLmNvbmZpZy5mbG93VHlwZSA9PT0gJ2NsaWVudF9jcmVkZW50aWFscycpe1xuICAgIHF1ZXJ5ID0gX3BhcmFtcztcbiAgfSBlbHNlIHtcbiAgICBxdWVyeSA9IHBhcmFtcy5zdWJzdHJpbmcocGFyYW1zLmluZGV4T2YoJz8nKSk7XG4gIH1cbiAgXG5cbiAgbGV0IGRhdGEgPSB0eXBlb2YgcXVlcnkgPT09ICdvYmplY3QnID8gcXVlcnkgOiBxcy5wYXJzZShxdWVyeSk7XG4gIGxldCBwYXRoID0gYCR7dGhpcy5jb25maWcudGVuYW50VXJsfS92MS4wL2VuZHBvaW50L2RlZmF1bHQvdG9rZW5gO1xuXG4gIGlmICh0aGlzLmNvbmZpZy5mbG93VHlwZSA9PT0gJ2NsaWVudF9jcmVkZW50aWFscycpe1xuICAgIGRhdGEuZ3JhbnRfdHlwZSA9IHRoaXMuY29uZmlnLmZsb3dUeXBlO1xuICB9IGVsc2Uge1xuICAgIGRhdGEucmVkaXJlY3RfdXJpID0gdGhpcy5jb25maWcucmVkaXJlY3RVcmk7XG4gICAgZGF0YS5ncmFudF90eXBlID0gJ2F1dGhvcml6YXRpb25fY29kZSc7XG4gIH1cbiAgXG4gIGRhdGEuY2xpZW50X2lkID0gdGhpcy5jb25maWcuY2xpZW50SWQ7XG4gIGRhdGEuY2xpZW50X3NlY3JldCA9IHRoaXMuY29uZmlnLmNsaWVudFNlY3JldDtcbiAgZGF0YS5zY29wZSA9IHRoaXMuY29uZmlnLnNjb3BlO1xuXG4gIGxldCBlbmNvZGVkRGF0YSA9IHFzLnN0cmluZ2lmeShkYXRhKTtcblxuICBsZXQgb3B0aW9ucyA9XG4gIHtcbiAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICB1cmw6IHBhdGgsXG4gICAgY29udGVudFR5cGU6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnLFxuICAgIGRhdGE6IGVuY29kZWREYXRhXG4gIH07XG5cbiAgcmV0dXJuIGFwaVJlcXVlc3Qob3B0aW9ucyk7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvbiByZWZyZXNoVG9rZW5cbiAqIEBwYXJhbSB7c3RyaW5nfSByZWZyZXNoVG9rZW4gcmVxdWlyZWQgcmVmcmVzaF90b2tlbiBzdHJpbmcuXG4gKiBSZWZyZXNoIGFjY2VzcyB0b2tlbiB3aGVuIHRva2VuIGhhcyBleHBpcmVkLlxuICogVXNlZCBmb3IgQVpOIGZsb3cgb25seS5cbiAqL1xuT0F1dGhDb250ZXh0LnByb3RvdHlwZS5yZWZyZXNoVG9rZW4gPSBmdW5jdGlvbih0b2tlbil7XG4gIGlmICh0aGlzLmNvbmZpZy5mbG93VHlwZSA9PT0gJ0ltcGxpY2l0JyApe1xuICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBWZXJpZnlFcnJvcihPQVVUSF9DT05URVhUX0FQSV9FUlJPUiwgJ0ltcGxpY2l0IGZsb3cgZG9lcyBub3Qgc3VwcG9ydCByZWZyZXNoIHRva2VuJykpO1xuICB9XG5cbiAgaWYgKCF0b2tlbi5oYXNPd25Qcm9wZXJ0eSgncmVmcmVzaF90b2tlbicpKXtcbiAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IFZlcmlmeUVycm9yKE9BVVRIX0NPTlRFWFRfQVBJX0VSUk9SLCAncmVmcmVzaF90b2tlbiBpcyBhIHJlcXVpcmVkIHBhcmFtZXRlcicpKTtcbiAgfVxuXG4gIGxldCBwYXRoID0gYCR7dGhpcy5jb25maWcudGVuYW50VXJsfS92MS4wL2VuZHBvaW50L2RlZmF1bHQvdG9rZW5gO1xuICBsZXQgZGF0YSA9IHtcbiAgICByZWZyZXNoX3Rva2VuIDogdG9rZW4ucmVmcmVzaF90b2tlbixcbiAgICBjbGllbnRfaWQgOiB0aGlzLmNvbmZpZy5jbGllbnRJZCxcbiAgICBjbGllbnRfc2VjcmV0IDogdGhpcy5jb25maWcuY2xpZW50U2VjcmV0LFxuICAgIGdyYW50X3R5cGUgOiAncmVmcmVzaF90b2tlbicsXG4gICAgc2NvcGUgOiB0aGlzLmNvbmZpZy5zY29wZVxuICB9O1xuXG4gIGxldCBlbmNvZGVkRGF0YSA9IHFzLnN0cmluZ2lmeShkYXRhKTtcblxuICBsZXQgb3B0aW9ucyA9XG4gIHtcbiAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICB1cmw6IHBhdGgsXG4gICAgY29udGVudFR5cGU6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnLFxuICAgIGRhdGE6IGVuY29kZWREYXRhXG4gIH07XG5cbiAgcmV0dXJuIGFwaVJlcXVlc3Qob3B0aW9ucyk7XG59O1xuXG5PQXV0aENvbnRleHQucHJvdG90eXBlLl9hdXRob3JpemUgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gIHJldHVybiB0aGlzLl9idWlsZFVybChvcHRpb25zKTtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uIGxvZ2luXG4qIHVzZWQgZm9yIGltcGxpY2l0IGdyYW50IHRvIHJldHJpZXZlIHVybFxuKiBhbmQgYWRkaXRpb25hbCBwYXJhbXMgdG8gc2VuZCB1c2VyLWFnZW50IHRvIENsb3VkIElkZW50aXR5IGxvZ2luXG4qIHNjcmVlbiB0byBhdXRoZW50aWNhdGUgd2l0aCB0aGUgYXV0aG9yaXphdGlvbiBzZXJ2ZXIuXG4qL1xuT0F1dGhDb250ZXh0LnByb3RvdHlwZS5sb2dpbiA9IGZ1bmN0aW9uKCkge1xuIGxldCB1cmwgPSB0aGlzLl9hdXRob3JpemUodGhpcy5jb25maWcpO1xuIHJldHVybiB1cmw7XG59O1xuXG5cbi8qKlxuICogYnVpbGRVcmwgbWV0aG9kXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0cyBjb25maWd1cmF0aW9uIG9iamVjdCB1c2VkIHRvIGNyZWF0ZSBhIHVybCB0byB0aGUgYXV0aG9yaXplIGVuZHBvaW50XG4gKiBmb3IgU1NPIGltcGxpY2l0IGZsb3dcbiAqL1xuT0F1dGhDb250ZXh0LnByb3RvdHlwZS5fYnVpbGRVcmwgPSBmdW5jdGlvbihvcHRzKSB7XG5cdHJldHVybiAoXG5cdFx0b3B0cy50ZW5hbnRVcmwgK1xuXHRcdCcvb2lkYy9lbmRwb2ludC9kZWZhdWx0L2F1dGhvcml6ZT8nICtcblx0XHRxcy5zdHJpbmdpZnkoe1xuXHRcdFx0Y2xpZW50X2lkOiBvcHRzLmNsaWVudElkLFxuXHRcdFx0cmVkaXJlY3RfdXJpOiBvcHRzLnJlZGlyZWN0VXJpLFxuXHRcdFx0c2NvcGU6IG9wdHMuc2NvcGUsXG5cdFx0XHRyZXNwb25zZV90eXBlOiBvcHRzLnJlc3BvbnNlVHlwZSxcblx0XHRcdHN0YXRlOiB1dGlscy5yYW5kb21TdHJpbmcoMTYpLFxuXHRcdFx0bm9uY2U6IHV0aWxzLnJhbmRvbVN0cmluZygxNilcblx0XHR9KVxuXHQpO1xufTtcblxuLyoqXG4vKiogQXV0aG9yaXphdGlvbiBjb2RlIGZsb3cgKEFaTilcbiAqIEBmdW5jdGlvbiBhdXRoZW50aWNhdGUgY29uc3RydWN0IHVybCB0byBlbmFibGUgYXV0aGVudGljYXRpb24gZm9yIHVzZXIuXG4gKi9cbk9BdXRoQ29udGV4dC5wcm90b3R5cGUuYXV0aGVudGljYXRlID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShcbiAgICBmdW5jdGlvbihyZXNvbHZlKSB7XG4gICAgICByZXNvbHZlKHRoaXMuX2F1dGhvcml6ZSh0aGlzLmNvbmZpZykpO1xuICAgIH0uYmluZCh0aGlzKVxuICApO1xufTtcblxuXG4vKipcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gaGFzaFN0cmluZyB0aGUgdXJsIGhhc2ggZnJhZ21lbnRcbiAqIHJldHVybiB1cmwgaGFzaCBmcmFnbWVudCBhcyBhbiBvYmplY3RcbiAqL1xuT0F1dGhDb250ZXh0LnByb3RvdHlwZS5fcGFyc2VIYXNoID0gZnVuY3Rpb24oaGFzaFN0cmluZykge1xuICBsZXQgcGFyc2VkSGFzaCA9IHFzLnBhcnNlKGhhc2hTdHJpbmcpO1xuICByZXR1cm4gcGFyc2VkSGFzaDtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uIGhhbmRsZVJlc3BvbnNlIG1ldGhvZCBoYW5kbGVzIHRoZSBhcGkgcmVxdWVzdCB0byBDbG91ZCBJZGVudGl0eVxuICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgT2JqZWN0IGNvbnRhaW5pbmcgdGhlIGVuZHBvaW50IHBhcmFtcy4gW21ldGhvZCwgdXJsIC4uLmV0Y11cbiAqIEBwYXJhbSB7b2JqZWN0fSB0b2tlbiB0aGUgdG9rZW4gb2JqZWN0IGNvbnRhaW5pbmcgYWNjZXNzX3Rva2VuLCByZWZyZXNoX3Rva2VuIGV0Yy5cbiAqL1xuT0F1dGhDb250ZXh0LnByb3RvdHlwZS5oYW5kbGVSZXNwb25zZSA9IGFzeW5jIGZ1bmN0aW9uKG9wdGlvbnMsIHRva2VuT2JqKXtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKSB7XG4gICAgICB0aHJvdyBuZXcgVmVyaWZ5RXJyb3IoT0FVVEhfQ09OVEVYVF9BUElfRVJST1IsICdoYW5kbGVSZXNwb25zZShvcHRpb25zLCB0b2tlbiksIDIgcGFyYW1ldGVycyBhcmUgcmVxdWlyZWQgJyArIGFyZ3VtZW50cy5sZW5ndGggKyAnIHdlcmUgZ2l2ZW4nKTtcbiAgfVxuICBpZiAoIXV0aWxzLmlzVG9rZW4odG9rZW5PYmopKXtcbiAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IFZlcmlmeUVycm9yKFRPS0VOX0VSUk9SLCAnbm90IGEgdmFsaWQgdG9rZW4nKSk7XG4gIH1cblxuICBsZXQgdG9rZW4gPSB0b2tlbk9iajtcbiAgLy9EZWZpbmUgZW1wdHkgcGF5bG9hZCBvYmplY3RcbiAgbGV0IHBheWxvYWQgPSB7XG4gICAgICByZXNwb25zZTogbnVsbCxcbiAgICAgIHRva2VuOiBudWxsXG4gIH07XG5cbiAgdHJ5IHtcbiAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCBhcGlSZXF1ZXN0KG9wdGlvbnMsIHRva2VuLmFjY2Vzc190b2tlbik7XG4gICAgcGF5bG9hZC5yZXNwb25zZSA9IHJlc3BvbnNlO1xuICAgIGlmICh0aGlzLmNvbmZpZy5mbG93VHlwZSA9PT0gJ0ltcGxpY2l0Jyl7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHJlc3BvbnNlKTtcbiAgICB9XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShwYXlsb2FkKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBpZiAoZXJyb3Iuc3RhdHVzID09PSA0MDEgJiYgdXRpbHMuaXNOb2RlKCkpe1xuICAgICAgLy8gdmFsaWRhdGUgJ3Rva2VuJyBoYXMgcmVmcmVzaF90b2tlblxuICAgICAgaWYgKCF0b2tlbi5yZWZyZXNoX3Rva2VuKSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBWZXJpZnlFcnJvcihPQVVUSF9DT05URVhUX0FQSV9FUlJPUiwgJ2FjY2Vzc190b2tlbiBleHBpcmVkIGFuZCByZWZyZXNoX3Rva2VuIG5vdCBmb3VuZCcpKTtcbiAgICAgIH1cbiAgICAgIGxldCBuZXdUb2tlbiA9IGF3YWl0IHRoaXMucmVmcmVzaFRva2VuKHRva2VuKTtcbiAgICAgIGxldCBvcmlnaW5hbFJlcXVlc3QgPSBhd2FpdCBhcGlSZXF1ZXN0KG9wdGlvbnMsIG5ld1Rva2VuLmFjY2Vzc190b2tlbik7XG4gICAgICBwYXlsb2FkID0ge1xuICAgICAgICByZXNwb25zZTogb3JpZ2luYWxSZXF1ZXN0LFxuICAgICAgICB0b2tlbjogbmV3VG9rZW5cbiAgICAgIH07XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHBheWxvYWQpO1xuICAgIH1cbiAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZXJyb3IpO1xuICB9XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvbiBoYW5kbGVDYWxsYmFjayByZXF1aXJlZCBmb3IgaW1wbGljaXQgZmxvdyB0byBoYW5kbGUgdGhlIGF1dGhlbnRpY2F0aW9uIC8gYXV0aG9yaXphdGlvbiB0cmFuc2FjdGlvbiBmcm9tIENsb3VkIElkZW50aXR5XG4gKiBhbmQgdG8gc3RvcmUgdGhlIGFjY2Vzc190b2tlbiBhbmQgZXhwaXJlc19pbiB2YWx1ZXMgdG8gYnJvd3NlciBzdG9yYWdlLlxuICovXG5PQXV0aENvbnRleHQucHJvdG90eXBlLmhhbmRsZUNhbGxiYWNrID0gZnVuY3Rpb24oKSB7XG4gIGlmICh1dGlscy5pc05vZGUoKSkge1xuICAgICAgdGhyb3cgbmV3IFZlcmlmeUVycm9yKE9BVVRIX0NPTlRFWFRfQVBJX0VSUk9SLCAnaGFuZGxlQ2FsbGJhY2soKSBpcyBvbmx5IGZvciBJbXBsaWNpdCBmbG93Jyk7XG4gIH1cbiAgbGV0IHVybE9iajtcbiAgbGV0IGVycm9yQ2hlY2sgPSBSZWdFeHAoJyNlcnJvcicpO1xuICBsZXQgaGFzaCA9ICB3aW5kb3cubG9jYXRpb24uaGFzaDtcblxuICB1cmxPYmogPSB0eXBlb2YgaGFzaCA9PT0gJ29iamVjdCcgPyBoYXNoIDogdGhpcy5fcGFyc2VVcmxIYXNoKGhhc2gpO1xuXG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZWplY3Qpe1xuICAgIGlmIChlcnJvckNoZWNrLnRlc3QoaGFzaCkpe1xuICAgICAgcmVqZWN0KHVybE9iaik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc3RvcmFnZUhhbmRsZXIuc2V0U3RvcmFnZSh1cmxPYmopO1xuICAgICAgdGhpcy5fc2V0U2Vzc2lvbigpO1xuICAgICAgLy8gcmVtb3ZlIHVybFxuICAgICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSAnJztcbiAgICB9XG4gIH0uYmluZCh0aGlzKSk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBPQXV0aENvbnRleHQ7XG4iXX0=