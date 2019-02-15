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
            return this.refreshToken(token.refresh_token);

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2xpYi9PQXV0aENvbnRleHQuanMiXSwibmFtZXMiOlsiT0FVVEhfQ09OVEVYVF9DT05GSUdfU0VUVElOR1NfRVJST1IiLCJBcHBDb25maWciLCJPQVVUSF9DT05URVhUX0FQSV9FUlJPUiIsIlRPS0VOX0VSUk9SIiwiT0F1dGhDb250ZXh0IiwiY29uZmlnIiwiVmVyaWZ5RXJyb3IiLCJjbGllbnRJZCIsInRlbmFudFVybCIsInJlZGlyZWN0VXJpIiwicmVzcG9uc2VUeXBlIiwic2NvcGUiLCJmbG93VHlwZSIsImNsaWVudFNlY3JldCIsInV0aWxzIiwiaXNOb2RlIiwic3RvcmFnZVR5cGUiLCJzdG9yYWdlSGFuZGxlciIsIlN0b3JhZ2VIYW5kbGVyIiwicHJvdG90eXBlIiwiaXNBdXRoZW50aWNhdGVkIiwidG9rZW4iLCJpbnRyb3NwZWN0VG9rZW4iLCJwYXlsb2FkIiwicmVzcG9uc2UiLCJhY3RpdmUiLCJQcm9taXNlIiwicmVqZWN0IiwidG9rZW5PYmoiLCJpc1Rva2VuIiwicGF0aCIsImRhdGEiLCJjbGllbnRfaWQiLCJjbGllbnRfc2VjcmV0IiwiYWNjZXNzX3Rva2VuIiwiZW5jb2RlZERhdGEiLCJxcyIsInN0cmluZ2lmeSIsIm9wdGlvbnMiLCJtZXRob2QiLCJ1cmwiLCJjb250ZW50VHlwZSIsImhhbmRsZVJlc3BvbnNlIiwiZmV0Y2hUb2tlbiIsImFjY2Vzc1Rva2VuIiwiSlNPTiIsInBhcnNlIiwiZ2V0U3RvcmFnZSIsImVycm9yIiwiZ2V0Q29uZmlnIiwibG9nb3V0IiwicmV2b2tlVG9rZW4iLCJjbGVhclN0b3JhZ2UiLCJ3aW5kb3ciLCJsb2NhdGlvbiIsInJlcGxhY2UiLCJsZW5ndGgiLCJ0b2tlblR5cGUiLCJleHBpcmVUb2tlbiIsImFyZ3VtZW50cyIsInJlZnJlc2hfdG9rZW4iLCJfcGFyc2VVcmxIYXNoIiwiaGFzaFN0cmluZyIsInBhcnNlZEhhc2giLCJfc2V0U2Vzc2lvbiIsImV4cGlyZXNBdCIsImV4cGlyZXNfaW4iLCJjbG9ja1NrZXciLCJERUZBVUxUX0NMT0NLX1NLRVciLCJkZWxheSIsIkRhdGUiLCJub3ciLCJzZXRUaW1lb3V0Iiwic2Vzc2lvbiIsImdldFRva2VuIiwicGFyYW1zIiwicXVlcnkiLCJzdWJzdHJpbmciLCJpbmRleE9mIiwicmVkaXJlY3RfdXJpIiwiZ3JhbnRfdHlwZSIsInJlZnJlc2hUb2tlbiIsImhhc093blByb3BlcnR5IiwiX2F1dGhvcml6ZSIsIl9idWlsZFVybCIsImxvZ2luIiwib3B0cyIsInJlc3BvbnNlX3R5cGUiLCJzdGF0ZSIsInJhbmRvbVN0cmluZyIsIm5vbmNlIiwiYXV0aGVudGljYXRlIiwicmVzb2x2ZSIsImJpbmQiLCJfcGFyc2VIYXNoIiwic3RhdHVzIiwibmV3VG9rZW4iLCJvcmlnaW5hbFJlcXVlc3QiLCJoYW5kbGVDYWxsYmFjayIsInVybE9iaiIsImVycm9yQ2hlY2siLCJSZWdFeHAiLCJoYXNoIiwidGVzdCIsInNldFN0b3JhZ2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7Ozs7OztJQUVPQSxtQyxHQUE2RUMsaUIsQ0FBN0VELG1DO0lBQXFDRSx1QixHQUF3Q0QsaUIsQ0FBeENDLHVCO0lBQXlCQyxXLEdBQWVGLGlCLENBQWZFLFc7QUFDckU7Ozs7OztBQUtBLFNBQVNDLFlBQVQsQ0FBc0JDLE1BQXRCLEVBQThCO0FBQzVCLE1BQUksQ0FBQ0EsTUFBTCxFQUFhO0FBQ1QsVUFBTSxJQUFJQyxvQkFBSixDQUFnQk4sbUNBQWhCLEVBQXFELDhCQUFyRCxDQUFOO0FBQ0gsR0FIMkIsQ0FJNUI7OztBQUNBLE1BQUksQ0FBQ0ssTUFBTSxDQUFDRSxRQUFaLEVBQXNCO0FBQ3BCLFVBQU0sSUFBSUQsb0JBQUosQ0FBZ0JOLG1DQUFoQixFQUFxRCwrQkFBckQsQ0FBTjtBQUNEOztBQUNELE1BQUksQ0FBQ0ssTUFBTSxDQUFDRyxTQUFaLEVBQXVCO0FBQ3JCLFVBQU0sSUFBSUYsb0JBQUosQ0FBZ0JOLG1DQUFo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LFVBQU0sSUFBSVQsb0JBQUosQ0FBZ0JKLHVCQUFoQixFQUF5Qyw0Q0FBekMsQ0FBTjtBQUNIOztBQUNELE1BQUlpRyxNQUFKO0FBQ0EsTUFBSUMsVUFBVSxHQUFHQyxNQUFNLENBQUMsUUFBRCxDQUF2QjtBQUNBLE1BQUlDLElBQUksR0FBSWpELE1BQU0sQ0FBQ0MsUUFBUCxDQUFnQmdELElBQTVCO0FBRUFILEVBQUFBLE1BQU0sR0FBRyxRQUFPRyxJQUFQLE1BQWdCLFFBQWhCLEdBQTJCQSxJQUEzQixHQUFrQyxLQUFLekMsYUFBTCxDQUFtQnlDLElBQW5CLENBQTNDO0FBRUEsU0FBTyxJQUFJNUUsT0FBSixDQUFZLFVBQVNDLE1BQVQsRUFBZ0I7QUFDakMsUUFBSXlFLFVBQVUsQ0FBQ0csSUFBWCxDQUFnQkQsSUFBaEIsQ0FBSixFQUEwQjtBQUN4QjNFLE1BQUFBLE1BQU0sQ0FBQ3dFLE1BQUQsQ0FBTjtBQUNELEtBRkQsTUFFTztBQUNMLFdBQUtsRixjQUFMLENBQW9CdUYsVUFBcEIsQ0FBK0JMLE1BQS9COztBQUNBLFdBQUtuQyxXQUFMLEdBRkssQ0FHTDs7O0FBQ0FYLE1BQUFBLE1BQU0sQ0FBQ0MsUUFBUCxDQUFnQmdELElBQWhCLEdBQXVCLEVBQXZCO0FBQ0Q7QUFDRixHQVRrQixDQVNqQlQsSUFUaUIsQ0FTWixJQVRZLENBQVosQ0FBUDtBQVVELENBcEJEOztlQXNCZXpGLFkiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgJ0BiYWJlbC9wb2x5ZmlsbCc7XG5pbXBvcnQgcXMgZnJvbSAncXVlcnktc3RyaW5nJztcbmltcG9ydCBWZXJpZnlFcnJvciBmcm9tICcuL2Vycm9ycy9WZXJpZnlFcnJvcic7XG5pbXBvcnQgU3RvcmFnZUhhbmRsZXIgZnJvbSAnLi9oZWxwZXJzL1N0b3JhZ2VIYW5kbGVyJztcbmltcG9ydCB7QXBwQ29uZmlnfSBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQgYXBpUmVxdWVzdCBmcm9tICcuL2hlbHBlcnMvYXBpUmVxdWVzdCc7XG5pbXBvcnQgdXRpbHMgZnJvbSAnLi9oZWxwZXJzL3V0aWxzJztcblxuY29uc3Qge09BVVRIX0NPTlRFWFRfQ09ORklHX1NFVFRJTkdTX0VSUk9SLCBPQVVUSF9DT05URVhUX0FQSV9FUlJPUiwgVE9LRU5fRVJST1J9ID0gQXBwQ29uZmlnO1xuLyoqXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IGNvbmZpZyB1c2VycyBjb25maWd1cmF0aW9uIHNldHRpbmdzIHRvIGtpY2sgb2ZmXG4gKiBPQXV0aCBpbXBsaWNpdCBmbG93XG4gKi9cbmZ1bmN0aW9uIE9BdXRoQ29udGV4dChjb25maWcpIHtcbiAgaWYgKCFjb25maWcpIHtcbiAgICAgIHRocm93IG5ldyBWZXJpZnlFcnJvcihPQVVUSF9DT05URVhUX0NPTkZJR19TRVRUSU5HU19FUlJPUiwgJ0NvbmZpZyBwYXJhbWV0ZXIgaXMgcmVxdWlyZWQnKTtcbiAgfVxuICAvL1ZlcmlmeSBjb25maWcgc2V0dGluZ3NcbiAgaWYgKCFjb25maWcuY2xpZW50SWQpIHtcbiAgICB0aHJvdyBuZXcgVmVyaWZ5RXJyb3IoT0FVVEhfQ09OVEVYVF9DT05GSUdfU0VUVElOR1NfRVJST1IsICdjbGllbnRJZCBwcm9wZXJ0eSBpcyByZXF1aXJlZCcpO1xuICB9XG4gIGlmICghY29uZmlnLnRlbmFudFVybCkge1xuICAgIHRocm93IG5ldyBWZXJpZnlFcnJvcihPQVVUSF9DT05URVhUX0NPTkZJR19TRVRUSU5HU19FUlJPUiwgJ1RlbmFudCBVUkwgaXMgcmVxdWlyZWQnKTtcbiAgfVxuICBpZiAoIWNvbmZpZy5yZWRpcmVjdFVyaSkge1xuICAgIHRocm93IG5ldyBWZXJpZnlFcnJvcihPQVVUSF9DT05URVhUX0NPTkZJR19TRVRUSU5HU19FUlJPUiwgJ0EgcmVkaXJlY3QgVVJMIGlzIHJlcXVpcmVkJyk7XG4gIH1cbiAgaWYgKCFjb25maWcucmVzcG9uc2VUeXBlKSB7XG4gICAgdGhyb3cgbmV3IFZlcmlmeUVycm9yKE9BVVRIX0NPTlRFWFRfQ09ORklHX1NFVFRJTkdTX0VSUk9SLCAnUmVzcG9uc2UgVHlwZSByZXF1aXJlZCcpO1xuICB9XG4gIGlmICghY29uZmlnLnNjb3BlKXtcbiAgICB0aHJvdyBuZXcgVmVyaWZ5RXJyb3IoT0FVVEhfQ09OVEVYVF9DT05GSUdfU0VUVElOR1NfRVJST1IsICdzY29wZSBQcm9wZXJ0eSBub3Qgc2V0IGluIENvbmZpZyBzZXR0aW5ncycpO1xuICB9XG4gIGlmIChjb25maWcuZmxvd1R5cGUgPT09ICdBWk4nICYmICFjb25maWcuY2xpZW50U2VjcmV0KXtcbiAgICB0aHJvdyBuZXcgVmVyaWZ5RXJyb3IoT0FVVEhfQ09OVEVYVF9DT05GSUdfU0VUVElOR1NfRVJST1IsICdDbGllbnQgU2VjcmV0IGlzIHJlcXVpcmVkIGZvciB0aGUgQVpOIGNvZGUgZmxvdycpO1xuICB9XG5cbiAgaWYgKCEoY29uZmlnLmZsb3dUeXBlID09PSAnSW1wbGljaXQnIHx8IGNvbmZpZy5mbG93VHlwZSA9PT0gJ0FaTicpKXtcbiAgICB0aHJvdyBuZXcgVmVyaWZ5RXJyb3IoT0FVVEhfQ09OVEVYVF9DT05GSUdfU0VUVElOR1NfRVJST1IsICdDaGVjayB0aGUgZmxvd1R5cGUgcHJvcGVydHkgaW4geW91ciBjb25maWd1cmF0aW9uIG9iamVjdCBpcyBjb3JyZWN0LiBTaG91bGQgYmU6IFwiSW1wbGljaXRcIiBvciBcIkFaTlwiJyk7XG4gIH1cblxuICBpZiAoY29uZmlnLmZsb3dUeXBlID09PSAnSW1wbGljaXQnKXtcbiAgICBpZiAodXRpbHMuaXNOb2RlKCkpe1xuICAgICAgICB0aHJvdyBuZXcgVmVyaWZ5RXJyb3IoT0FVVEhfQ09OVEVYVF9DT05GSUdfU0VUVElOR1NfRVJST1IsICdJbXBsaWNpdCBmbG93IG5vdCBzdXBwb3J0ZWQgaW4gTm9kZScpO1xuICAgIH1cbiAgICBpZiAoIWNvbmZpZy5zdG9yYWdlVHlwZSl7XG4gICAgICB0aHJvdyBuZXcgVmVyaWZ5RXJyb3IoT0FVVEhfQ09OVEVYVF9DT05GSUdfU0VUVElOR1NfRVJST1IsICdzdG9yYWdlVHlwZSBwcm9wZXJ0eSBub3Qgc2V0LicpO1xuICAgIH1cbiAgICB0aGlzLnN0b3JhZ2VIYW5kbGVyID0gbmV3IFN0b3JhZ2VIYW5kbGVyKGNvbmZpZy5zdG9yYWdlVHlwZSk7XG4gIH1cblxuICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbn1cblxuLyoqXG4gKiBAZnVuY3Rpb24gaXNBdXRoZW50aWNhdGVkIHRvIGNoZWNrIGN1cnJlbnQgdXNlcnMgYWNjZXNzX3Rva2VuIG9yIHJlZnJlc2hfdG9rZW4gdG9cbiAqIGRldGVybWluZSBpZiB0aGV5IGFyZSBzdGlsbCB2YWxpZC5cbiAqIEBwYXJhbSB7b2JqZWN0fSB0b2tlbiB0aGUgdG9rZW4gb2JqZWN0IHdpdGggYWNjZXNzX3Rva2VuLCByZWZyZXNoVG9rZW4gZXRjLlxuICovXG5PQXV0aENvbnRleHQucHJvdG90eXBlLmlzQXV0aGVudGljYXRlZCA9IGFzeW5jIGZ1bmN0aW9uKHRva2VuKXtcbiAgdHJ5IHtcbiAgICBsZXQgcGF5bG9hZCA9IGF3YWl0IHRoaXMuaW50cm9zcGVjdFRva2VuKHRva2VuKTtcbiAgICByZXR1cm4gcGF5bG9hZC5yZXNwb25zZS5hY3RpdmU7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGVycm9yKTtcbiAgfVxufTtcblxuLyoqXG4gKiBAZnVuY3Rpb24gaW50cm9zcGVjdFRva2VuIHRvIGluc3BlY3QgYW4gT0lEQyB0b2tlbi5cbiAqIEBwYXJhbSB7b2JqZWN0fSB0b2tlbiB0b2tlbiBvYmplY3QgdG8gaW50cm9zcGVjdFxuICovXG5PQXV0aENvbnRleHQucHJvdG90eXBlLmludHJvc3BlY3RUb2tlbiA9IGZ1bmN0aW9uKHRva2VuT2JqKXtcbiAgaWYgKCF1dGlscy5pc1Rva2VuKHRva2VuT2JqKSl7XG4gICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBWZXJpZnlFcnJvcihUT0tFTl9FUlJPUiwgJ1Rva2VuIHBhcmFtZXRlciBpcyBub3QgYSB2YWxpZCB0b2tlbicpKTtcbiAgfVxuICBsZXQgdG9rZW4gPSB0b2tlbk9iaiB8fCB0aGlzLnRva2VuO1xuICBsZXQgcGF0aCA9IGAke3RoaXMuY29uZmlnLnRlbmFudFVybH0vdjEuMC9lbmRwb2ludC9kZWZhdWx0L2ludHJvc3BlY3RgO1xuXG4gIGxldCBkYXRhID0ge1xuICAgIGNsaWVudF9pZCA6IHRoaXMuY29uZmlnLmNsaWVudElkLFxuICAgIGNsaWVudF9zZWNyZXQgOiB0aGlzLmNvbmZpZy5jbGllbnRTZWNyZXQsXG4gICAgdG9rZW4gOiB0b2tlbi5hY2Nlc3NfdG9rZW5cbiAgfTtcblxuICBsZXQgZW5jb2RlZERhdGEgPSBxcy5zdHJpbmdpZnkoZGF0YSk7XG5cbiAgbGV0IG9wdGlvbnMgPSB7XG4gICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgdXJsOiBwYXRoLFxuICAgIGNvbnRlbnRUeXBlOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgICBkYXRhOiBlbmNvZGVkRGF0YVxuIH07XG5cbiByZXR1cm4gdGhpcy5oYW5kbGVSZXNwb25zZShvcHRpb25zLCB0b2tlbik7XG59O1xuXG5cbi8qKlxuICogQGZ1bmN0aW9uIGZldGNoVG9rZW4gVXNlZCBmb3IgaW1wbGljaXQgZmxvdyB0byByZXR1cm4gdGhlIGFjY2Vzc1Rva2VuIHN0b3JlZCBpbiBicm93c2VyLlxuKi9cbk9BdXRoQ29udGV4dC5wcm90b3R5cGUuZmV0Y2hUb2tlbiA9IGZ1bmN0aW9uKCl7XG4gIGlmICh0aGlzLmNvbmZpZy5mbG93VHlwZSA9PT0gJ0ltcGxpY2l0JyApe1xuICAgIHRyeSB7XG4gICAgICBsZXQgYWNjZXNzVG9rZW4gPSBKU09OLnBhcnNlKHRoaXMuc3RvcmFnZUhhbmRsZXIuZ2V0U3RvcmFnZSgndG9rZW4nKSk7XG4gICAgICByZXR1cm4gYWNjZXNzVG9rZW47XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgVmVyaWZ5RXJyb3IoT0FVVEhfQ09OVEVYVF9BUElfRVJST1IsICdmZXRjaFRva2VuKCkgY2FuIG9ubHkgYmUgdXNlZCB3aXRoIEltcGxpY2l0IGZsb3cnKTtcbiAgfVxufTtcblxuLyoqXG4gKiBAZnVuY3Rpb24gZ2V0Q29uZmlnXG4gKiBleHBvc2UgY29uZmlnIG9iamVjdCBmb3IgQXV0aGVudGljYXRvckNvbnRleHQuXG4gKi9cbk9BdXRoQ29udGV4dC5wcm90b3R5cGUuZ2V0Q29uZmlnID0gZnVuY3Rpb24oKXtcbiAgcmV0dXJuIHRoaXMuY29uZmlnO1xufTtcblxuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoIE9wdGlvbmFsIHN0cmluZyB0byByZWRpcmVjdCB1c2VyIGFmdGVyIGFjY2Vzc1Rva2VuIGhhcyBleHBpcmVkXG4gKiBEZWZhdWx0cyB0byBpbmRleCBwYWdlLlxuICovXG5PQXV0aENvbnRleHQucHJvdG90eXBlLmxvZ291dCA9IGFzeW5jIGZ1bmN0aW9uKHBhdGgsIHRva2VuKSB7XG4gIC8vIGNsZWFyIHN0b3JhZ2UgYW5kIHJlZGlyZWN0IHRvIGhvbWUgcGFnZVxuICBpZiAodGhpcy5jb25maWcuZmxvd1R5cGUgPT09ICdJbXBsaWNpdCcgKXtcbiAgICAgIGxldCBhY2Nlc3NUb2tlbiA9IHRoaXMuZmV0Y2hUb2tlbigpO1xuICAgICAgYXdhaXQgdGhpcy5yZXZva2VUb2tlbihhY2Nlc3NUb2tlbiwgJ2FjY2Vzc190b2tlbicpO1xuICAgICAgYXdhaXQgdGhpcy5zdG9yYWdlSGFuZGxlci5jbGVhclN0b3JhZ2UoKTtcbiAgICAgIGF3YWl0IHdpbmRvdy5sb2NhdGlvbi5yZXBsYWNlKHBhdGggfHwgJy8nKTtcbiAgfSBlbHNlIGlmICh0aGlzLmNvbmZpZy5mbG93VHlwZSA9PT0gJ0FaTicgKXtcbiAgICAvLyBwYXRoIGFuZCB0b2tlbiBzdXBwbGllZFxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAyICYmICF1dGlscy5pc1Rva2VuKHRva2VuKSkge1xuICAgICAgICBQcm9taXNlLnJlamVjdChuZXcgVmVyaWZ5RXJyb3IoVE9LRU5fRVJST1IsICdub3QgYSB2YWxpZCB0b2tlbi4nKSk7XG4gICAgfVxuICAgIC8vIG5vIHBhdGggYnV0IGEgJ3Rva2VuJyBwcm92aWRlZFxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxICYmICF1dGlscy5pc1Rva2VuKHBhdGgpKSB7XG4gICAgICAgIFByb21pc2UucmVqZWN0KG5ldyBWZXJpZnlFcnJvcihUT0tFTl9FUlJPUiwgJ25vdCBhIHZhbGlkIHRva2VuLicpKTtcbiAgICB9XG5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMikge1xuICAgICAgICB0aGlzLnJldm9rZVRva2VuKHRva2VuLCAnYWNjZXNzX3Rva2VuJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5yZXZva2VUb2tlbihwYXRoLCAnYWNjZXNzX3Rva2VuJyk7XG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvbiByZXZva2VUb2tlbiB1c2VkIHRvIHJldm9rZSB2YWxpZCB0b2tlbnMuXG4gKiBAcGFyYW0ge29iamVjdH0gdG9rZW4gdGhlIFRva2VuIG9iamVjdCBjb250YWluaW5nIGFjY2Vzc190b2tlbiwgcmVmcmVzaF90b2tlbiBldGMuLi5cbiAqIEBwYXJhbSB7c3RyaW5nfSB0b2tlblR5cGUgdGhlIHRva2VuIHR5cGUgdG8gYmUgcmV2b2tlZCBcImFjY2Vzc190b2tlblwiIG9yIFwicmVmcmVzaF90b2tlblwiLlxuICovXG5PQXV0aENvbnRleHQucHJvdG90eXBlLnJldm9rZVRva2VuID0gZnVuY3Rpb24odG9rZW4sIHRva2VuVHlwZSl7XG4gIGxldCBwYXRoID0gYCR7dGhpcy5jb25maWcudGVuYW50VXJsfS92MS4wL2VuZHBvaW50L2RlZmF1bHQvcmV2b2tlYDtcbiAgbGV0IGV4cGlyZVRva2VuO1xuICBsZXQgZW5jb2RlZERhdGE7XG4gIGxldCBvcHRpb25zO1xuXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikge1xuICAgICAgdGhyb3cgbmV3IFZlcmlmeUVycm9yKE9BVVRIX0NPTlRFWFRfQVBJX0VSUk9SLCAncmV2b2tlVG9rZW4odG9rZW4sIHRva2VuVHlwZSksIDIgcGFyYW1ldGVycyBhcmUgcmVxdWlyZWQgJyArIGFyZ3VtZW50cy5sZW5ndGggKyAnIHdlcmUgZ2l2ZW4nKTtcbiAgfVxuXG4gIGlmICghdG9rZW4pIHtcbiAgICAgIHRocm93IG5ldyBWZXJpZnlFcnJvcihPQVVUSF9DT05URVhUX0FQSV9FUlJPUiwgJ3Rva2VuIGNhbm5vdCBiZSBudWxsJyk7XG4gIH1cblxuICBpZiAoISh0b2tlblR5cGUgPT09ICdhY2Nlc3NfdG9rZW4nIHx8IHRva2VuVHlwZSA9PT0gJ3JlZnJlc2hfdG9rZW4nKSl7XG4gICAgdGhyb3cgbmV3IFZlcmlmeUVycm9yKE9BVVRIX0NPTlRFWFRfQVBJX0VSUk9SLCBgUGFyYW1ldGVyOiAke3Rva2VuVHlwZX0gaXMgaW52YWxpZC5cXG4gU3VwcG9ydGVkIHZhbHVlcyBhcmUgXCJhY2Nlc3NfdG9rZW5cIiBvciBcInJlZnJlc2hfdG9rZW5gKTtcbiAgfVxuXG4gIGV4cGlyZVRva2VuID0gdG9rZW5UeXBlID09PSAnYWNjZXNzX3Rva2VuJyA/IHRva2VuLmFjY2Vzc190b2tlbiA6IHRva2VuLnJlZnJlc2hfdG9rZW47XG5cbiAgbGV0IGRhdGEgPSB7XG4gICAgY2xpZW50X2lkIDogdGhpcy5jb25maWcuY2xpZW50SWQsXG4gICAgY2xpZW50X3NlY3JldCA6IHRoaXMuY29uZmlnLmNsaWVudFNlY3JldCxcbiAgICB0b2tlbiA6IGV4cGlyZVRva2VuXG4gIH07XG5cbiAgZW5jb2RlZERhdGEgPSBxcy5zdHJpbmdpZnkoZGF0YSk7XG5cbiAgb3B0aW9ucyA9IHtcbiAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICBjb250ZW50VHlwZTogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcsXG4gICAgdXJsOiBwYXRoLFxuICAgIGRhdGE6IGVuY29kZWREYXRhXG4gIH07XG5cbiAgLy8gdG9rZW4gaXMgbm90IHJlcXVpcmVkLCBidXQgaGFuZGxlUmVzcG9uc2Ugd2lsbCB0aHJvdyBlcnJvciB3aXRob3V0IGl0XG4gIHJldHVybiB0aGlzLmhhbmRsZVJlc3BvbnNlKG9wdGlvbnMsIHRva2VuKTtcbn07XG5cbi8qKlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBoYXNoU3RyaW5nIHRoZSB1cmwgaGFzaCBmcmFnbWVudFxuICogcmV0dXJuIHVybCBoYXNoIGZyYWdtZW50IGFzIGFuIG9iamVjdFxuICovXG5PQXV0aENvbnRleHQucHJvdG90eXBlLl9wYXJzZVVybEhhc2ggPSBmdW5jdGlvbihoYXNoU3RyaW5nKSB7XG4gIGxldCBwYXJzZWRIYXNoID0gcXMucGFyc2UoaGFzaFN0cmluZyk7XG4gIHJldHVybiBwYXJzZWRIYXNoO1xufTtcblxuLyoqXG4gKiBAZnVuY3Rpb24gc2V0U2Vzc2lvbiBVc2VkIGZvciBJbXBsaWNpdCBmbG93LiBDcmVhdGVzIGEgc2Vzc2lvbiBmb3IgdGhlIFNESyB0byBtYW5hZ2UgdGhlIGFjY2VzcyB0b2tlblxuICogdmFsaWRpdHkgZm9yIHRoZSBnaXZlbiB1c2VyLiBDbGVhcnMgYnJvd3NlciBzdG9yYWdlIG9uIGFjY2VzcyB0b2tlbiBleHBpcnkuXG4gKi9cbk9BdXRoQ29udGV4dC5wcm90b3R5cGUuX3NldFNlc3Npb24gPSBmdW5jdGlvbigpIHtcbiAgaWYgKHV0aWxzLmlzTm9kZSgpKSB7XG4gICAgICB0aHJvdyBuZXcgVmVyaWZ5RXJyb3IoT0FVVEhfQ09OVEVYVF9BUElfRVJST1IsICdfc2V0U2Vzc2lvbigpIGlzIG5vdCBzdXBwb3J0ZWQgaW4gTm9kZScpO1xuICB9XG4gIGNvbnN0IGV4cGlyZXNBdCA9IEpTT04ucGFyc2UodGhpcy5zdG9yYWdlSGFuZGxlci5nZXRTdG9yYWdlKCd0b2tlbicpKS5leHBpcmVzX2luO1xuICBjb25zdCBjbG9ja1NrZXcgPSBBcHBDb25maWcuREVGQVVMVF9DTE9DS19TS0VXO1xuICBjb25zdCBkZWxheSA9IGV4cGlyZXNBdCAtIChEYXRlLm5vdygpIC0gY2xvY2tTa2V3KTtcblxuICBpZiAoZGVsYXkgPiAwKSB7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICB0aGlzLnNlc3Npb24gPSBmYWxzZTtcbiAgICAgIHRoaXMuc3RvcmFnZUhhbmRsZXIuY2xlYXJTdG9yYWdlKCk7XG4gICAgfSwgZGVsYXkpO1xuICB9XG59O1xuXG4vKipcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcGFyYW1zXG4gKiBAZnVuY3Rpb24gZ2V0VG9rZW4gdG8gbWFrZSBhcGkgcmVxdWVzdCB0byBDbG91ZCBJZGVudGl0eSBBdXRob3JpemF0aW9uIHNlcnZlclxuICogdG8gcmV0cmlldmUgYWNjZXNzX3Rva2VuLCByZWZyZXNoX3Rva2VuLCBncmFudF9pZC4uLlxuICovXG5PQXV0aENvbnRleHQucHJvdG90eXBlLmdldFRva2VuID0gZnVuY3Rpb24ocGFyYW1zKSB7XG4gIGlmICh0aGlzLmNvbmZpZy5mbG93VHlwZSA9PT0gJ0ltcGxpY2l0Jykge1xuICAgICAgdGhyb3cgbmV3IFZlcmlmeUVycm9yKE9BVVRIX0NPTlRFWFRfQVBJX0VSUk9SLCAnZ2V0VG9rZW4oKSBjYW5ub3QgYmUgdXNlZCB3aXRoIEltcGxpY2l0IGZsb3cnKTtcbiAgfVxuICBpZiAoIXBhcmFtcykge1xuICAgICAgLy8gY2hhbmdlIG1lc3NhZ2VcbiAgICAgIHRocm93IG5ldyBWZXJpZnlFcnJvcihPQVVUSF9DT05URVhUX0FQSV9FUlJPUiwgJ2dldFRva2VuKHBhcmFtcyksIFBhcmFtcyBhcmUgcmVxdWlyZWQnKTtcbiAgfVxuICBsZXQgcXVlcnkgPSBwYXJhbXMuc3Vic3RyaW5nKHBhcmFtcy5pbmRleE9mKCc/JykpO1xuICBsZXQgZGF0YSA9IHR5cGVvZiBxdWVyeSA9PT0gJ29iamVjdCcgPyBxdWVyeSA6IHFzLnBhcnNlKHF1ZXJ5KTtcbiAgbGV0IHBhdGggPSBgJHt0aGlzLmNvbmZpZy50ZW5hbnRVcmx9L3YxLjAvZW5kcG9pbnQvZGVmYXVsdC90b2tlbmA7XG5cbiAgZGF0YS5yZWRpcmVjdF91cmkgPSB0aGlzLmNvbmZpZy5yZWRpcmVjdFVyaTtcbiAgZGF0YS5jbGllbnRfaWQgPSB0aGlzLmNvbmZpZy5jbGllbnRJZDtcbiAgZGF0YS5jbGllbnRfc2VjcmV0ID0gdGhpcy5jb25maWcuY2xpZW50U2VjcmV0O1xuICBkYXRhLmdyYW50X3R5cGUgPSAnYXV0aG9yaXphdGlvbl9jb2RlJztcbiAgZGF0YS5zY29wZSA9IHRoaXMuY29uZmlnLnNjb3BlO1xuXG4gIGxldCBlbmNvZGVkRGF0YSA9IHFzLnN0cmluZ2lmeShkYXRhKTtcblxuICBsZXQgb3B0aW9ucyA9XG4gIHtcbiAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICB1cmw6IHBhdGgsXG4gICAgY29udGVudFR5cGU6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnLFxuICAgIGRhdGE6IGVuY29kZWREYXRhXG4gIH07XG5cbiAgcmV0dXJuIGFwaVJlcXVlc3Qob3B0aW9ucyk7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvbiByZWZyZXNoVG9rZW5cbiAqIEBwYXJhbSB7c3RyaW5nfSByZWZyZXNoVG9rZW4gcmVxdWlyZWQgcmVmcmVzaF90b2tlbiBzdHJpbmcuXG4gKiBSZWZyZXNoIGFjY2VzcyB0b2tlbiB3aGVuIHRva2VuIGhhcyBleHBpcmVkLlxuICogVXNlZCBmb3IgQVpOIGZsb3cgb25seS5cbiAqL1xuT0F1dGhDb250ZXh0LnByb3RvdHlwZS5yZWZyZXNoVG9rZW4gPSBmdW5jdGlvbih0b2tlbil7XG4gIGlmICh0aGlzLmNvbmZpZy5mbG93VHlwZSA9PT0gJ0ltcGxpY2l0JyApe1xuICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBWZXJpZnlFcnJvcihPQVVUSF9DT05URVhUX0FQSV9FUlJPUiwgJ0ltcGxpY2l0IGZsb3cgZG9lcyBub3Qgc3VwcG9ydCByZWZyZXNoIHRva2VuJykpO1xuICB9XG5cbiAgaWYgKCF0b2tlbi5oYXNPd25Qcm9wZXJ0eSgncmVmcmVzaF90b2tlbicpKXtcbiAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IFZlcmlmeUVycm9yKE9BVVRIX0NPTlRFWFRfQVBJX0VSUk9SLCAncmVmcmVzaF90b2tlbiBpcyBhIHJlcXVpcmVkIHBhcmFtZXRlcicpKTtcbiAgfVxuXG4gIGxldCBwYXRoID0gYCR7dGhpcy5jb25maWcudGVuYW50VXJsfS92MS4wL2VuZHBvaW50L2RlZmF1bHQvdG9rZW5gO1xuICBsZXQgZGF0YSA9IHtcbiAgICByZWZyZXNoX3Rva2VuIDogdG9rZW4ucmVmcmVzaF90b2tlbixcbiAgICBjbGllbnRfaWQgOiB0aGlzLmNvbmZpZy5jbGllbnRJZCxcbiAgICBjbGllbnRfc2VjcmV0IDogdGhpcy5jb25maWcuY2xpZW50U2VjcmV0LFxuICAgIGdyYW50X3R5cGUgOiAncmVmcmVzaF90b2tlbicsXG4gICAgc2NvcGUgOiB0aGlzLmNvbmZpZy5zY29wZVxuICB9O1xuXG4gIGxldCBlbmNvZGVkRGF0YSA9IHFzLnN0cmluZ2lmeShkYXRhKTtcblxuICBsZXQgb3B0aW9ucyA9XG4gIHtcbiAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICB1cmw6IHBhdGgsXG4gICAgY29udGVudFR5cGU6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnLFxuICAgIGRhdGE6IGVuY29kZWREYXRhXG4gIH07XG5cbiAgcmV0dXJuIGFwaVJlcXVlc3Qob3B0aW9ucyk7XG59O1xuXG5PQXV0aENvbnRleHQucHJvdG90eXBlLl9hdXRob3JpemUgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gIHJldHVybiB0aGlzLl9idWlsZFVybChvcHRpb25zKTtcbn07XG5cbi8qKlxuICogQGZ1bmN0aW9uIGxvZ2luXG4qIHVzZWQgZm9yIGltcGxpY2l0IGdyYW50IHRvIHJldHJpZXZlIHVybFxuKiBhbmQgYWRkaXRpb25hbCBwYXJhbXMgdG8gc2VuZCB1c2VyLWFnZW50IHRvIENsb3VkIElkZW50aXR5IGxvZ2luXG4qIHNjcmVlbiB0byBhdXRoZW50aWNhdGUgd2l0aCB0aGUgYXV0aG9yaXphdGlvbiBzZXJ2ZXIuXG4qL1xuT0F1dGhDb250ZXh0LnByb3RvdHlwZS5sb2dpbiA9IGZ1bmN0aW9uKCkge1xuIGxldCB1cmwgPSB0aGlzLl9hdXRob3JpemUodGhpcy5jb25maWcpO1xuIHJldHVybiB1cmw7XG59O1xuXG5cbi8qKlxuICogYnVpbGRVcmwgbWV0aG9kXG4gKiBAcGFyYW0ge29iamVjdH0gb3B0cyBjb25maWd1cmF0aW9uIG9iamVjdCB1c2VkIHRvIGNyZWF0ZSBhIHVybCB0byB0aGUgYXV0aG9yaXplIGVuZHBvaW50XG4gKiBmb3IgU1NPIGltcGxpY2l0IGZsb3dcbiAqL1xuT0F1dGhDb250ZXh0LnByb3RvdHlwZS5fYnVpbGRVcmwgPSBmdW5jdGlvbihvcHRzKSB7XG5cdHJldHVybiAoXG5cdFx0b3B0cy50ZW5hbnRVcmwgK1xuXHRcdCcvb2lkYy9lbmRwb2ludC9kZWZhdWx0L2F1dGhvcml6ZT8nICtcblx0XHRxcy5zdHJpbmdpZnkoe1xuXHRcdFx0Y2xpZW50X2lkOiBvcHRzLmNsaWVudElkLFxuXHRcdFx0cmVkaXJlY3RfdXJpOiBvcHRzLnJlZGlyZWN0VXJpLFxuXHRcdFx0c2NvcGU6IG9wdHMuc2NvcGUsXG5cdFx0XHRyZXNwb25zZV90eXBlOiBvcHRzLnJlc3BvbnNlVHlwZSxcblx0XHRcdHN0YXRlOiB1dGlscy5yYW5kb21TdHJpbmcoMTYpLFxuXHRcdFx0bm9uY2U6IHV0aWxzLnJhbmRvbVN0cmluZygxNilcblx0XHR9KVxuXHQpO1xufTtcblxuLyoqXG4vKiogQXV0aG9yaXphdGlvbiBjb2RlIGZsb3cgKEFaTilcbiAqIEBmdW5jdGlvbiBhdXRoZW50aWNhdGUgY29uc3RydWN0IHVybCB0byBlbmFibGUgYXV0aGVudGljYXRpb24gZm9yIHVzZXIuXG4gKi9cbk9BdXRoQ29udGV4dC5wcm90b3R5cGUuYXV0aGVudGljYXRlID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShcbiAgICBmdW5jdGlvbihyZXNvbHZlKSB7XG4gICAgICByZXNvbHZlKHRoaXMuX2F1dGhvcml6ZSh0aGlzLmNvbmZpZykpO1xuICAgIH0uYmluZCh0aGlzKVxuICApO1xufTtcblxuLyoqXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGhhc2hTdHJpbmcgdGhlIHVybCBoYXNoIGZyYWdtZW50XG4gKiByZXR1cm4gdXJsIGhhc2ggZnJhZ21lbnQgYXMgYW4gb2JqZWN0XG4gKi9cbk9BdXRoQ29udGV4dC5wcm90b3R5cGUuX3BhcnNlSGFzaCA9IGZ1bmN0aW9uKGhhc2hTdHJpbmcpIHtcbiAgbGV0IHBhcnNlZEhhc2ggPSBxcy5wYXJzZShoYXNoU3RyaW5nKTtcbiAgcmV0dXJuIHBhcnNlZEhhc2g7XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvbiBoYW5kbGVSZXNwb25zZSBtZXRob2QgaGFuZGxlcyB0aGUgYXBpIHJlcXVlc3QgdG8gQ2xvdWQgSWRlbnRpdHlcbiAqIEBwYXJhbSB7b2JqZWN0fSBvcHRpb25zIE9iamVjdCBjb250YWluaW5nIHRoZSBlbmRwb2ludCBwYXJhbXMuIFttZXRob2QsIHVybCAuLi5ldGNdXG4gKiBAcGFyYW0ge29iamVjdH0gdG9rZW4gdGhlIHRva2VuIG9iamVjdCBjb250YWluaW5nIGFjY2Vzc190b2tlbiwgcmVmcmVzaF90b2tlbiBldGMuXG4gKi9cbk9BdXRoQ29udGV4dC5wcm90b3R5cGUuaGFuZGxlUmVzcG9uc2UgPSBhc3luYyBmdW5jdGlvbihvcHRpb25zLCB0b2tlbk9iail7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikge1xuICAgICAgdGhyb3cgbmV3IFZlcmlmeUVycm9yKE9BVVRIX0NPTlRFWFRfQVBJX0VSUk9SLCAnaGFuZGxlUmVzcG9uc2Uob3B0aW9ucywgdG9rZW4pLCAyIHBhcmFtZXRlcnMgYXJlIHJlcXVpcmVkICcgKyBhcmd1bWVudHMubGVuZ3RoICsgJyB3ZXJlIGdpdmVuJyk7XG4gIH1cbiAgaWYgKCF1dGlscy5pc1Rva2VuKHRva2VuT2JqKSl7XG4gICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBWZXJpZnlFcnJvcihUT0tFTl9FUlJPUiwgJ25vdCBhIHZhbGlkIHRva2VuJykpO1xuICB9XG5cbiAgbGV0IHRva2VuID0gdG9rZW5PYmo7XG4gIC8vRGVmaW5lIGVtcHR5IHBheWxvYWQgb2JqZWN0XG4gIGxldCBwYXlsb2FkID0ge1xuICAgICAgcmVzcG9uc2U6IG51bGwsXG4gICAgICB0b2tlbjogbnVsbFxuICB9O1xuXG4gIHRyeSB7XG4gICAgbGV0IHJlc3BvbnNlID0gYXdhaXQgYXBpUmVxdWVzdChvcHRpb25zLCB0b2tlbi5hY2Nlc3NfdG9rZW4pO1xuICAgIHBheWxvYWQucmVzcG9uc2UgPSByZXNwb25zZTtcbiAgICBpZiAodGhpcy5jb25maWcuZmxvd1R5cGUgPT09ICdJbXBsaWNpdCcpe1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShyZXNwb25zZSk7XG4gICAgfVxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUocGF5bG9hZCk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgaWYgKGVycm9yLnN0YXR1cyA9PT0gNDAxICYmIHV0aWxzLmlzTm9kZSgpKXtcbiAgICAgIC8vIHZhbGlkYXRlICd0b2tlbicgaGFzIHJlZnJlc2hfdG9rZW5cbiAgICAgIGlmICghdG9rZW4ucmVmcmVzaF90b2tlbikge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgVmVyaWZ5RXJyb3IoT0FVVEhfQ09OVEVYVF9BUElfRVJST1IsICdhY2Nlc3NfdG9rZW4gZXhwaXJlZCBhbmQgcmVmcmVzaF90b2tlbiBub3QgZm91bmQnKSk7XG4gICAgICB9XG4gICAgICBsZXQgbmV3VG9rZW4gPSBhd2FpdCB0aGlzLnJlZnJlc2hUb2tlbih0b2tlbi5yZWZyZXNoX3Rva2VuKTtcbiAgICAgIGxldCBvcmlnaW5hbFJlcXVlc3QgPSBhd2FpdCBhcGlSZXF1ZXN0KG9wdGlvbnMsIG5ld1Rva2VuLmFjY2Vzc190b2tlbik7XG4gICAgICBwYXlsb2FkID0ge1xuICAgICAgICByZXNwb25zZTogb3JpZ2luYWxSZXF1ZXN0LFxuICAgICAgICB0b2tlbjogbmV3VG9rZW5cbiAgICAgIH07XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHBheWxvYWQpO1xuICAgIH1cbiAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZXJyb3IpO1xuICB9XG59O1xuXG4vKipcbiAqIEBmdW5jdGlvbiBoYW5kbGVDYWxsYmFjayByZXF1aXJlZCBmb3IgaW1wbGljaXQgZmxvdyB0byBoYW5kbGUgdGhlIGF1dGhlbnRpY2F0aW9uIC8gYXV0aG9yaXphdGlvbiB0cmFuc2FjdGlvbiBmcm9tIENsb3VkIElkZW50aXR5XG4gKiBhbmQgdG8gc3RvcmUgdGhlIGFjY2Vzc190b2tlbiBhbmQgZXhwaXJlc19pbiB2YWx1ZXMgdG8gYnJvd3NlciBzdG9yYWdlLlxuICovXG5PQXV0aENvbnRleHQucHJvdG90eXBlLmhhbmRsZUNhbGxiYWNrID0gZnVuY3Rpb24oKSB7XG4gIGlmICh1dGlscy5pc05vZGUoKSkge1xuICAgICAgdGhyb3cgbmV3IFZlcmlmeUVycm9yKE9BVVRIX0NPTlRFWFRfQVBJX0VSUk9SLCAnaGFuZGxlQ2FsbGJhY2soKSBpcyBvbmx5IGZvciBJbXBsaWNpdCBmbG93Jyk7XG4gIH1cbiAgbGV0IHVybE9iajtcbiAgbGV0IGVycm9yQ2hlY2sgPSBSZWdFeHAoJyNlcnJvcicpO1xuICBsZXQgaGFzaCA9ICB3aW5kb3cubG9jYXRpb24uaGFzaDtcblxuICB1cmxPYmogPSB0eXBlb2YgaGFzaCA9PT0gJ29iamVjdCcgPyBoYXNoIDogdGhpcy5fcGFyc2VVcmxIYXNoKGhhc2gpO1xuXG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZWplY3Qpe1xuICAgIGlmIChlcnJvckNoZWNrLnRlc3QoaGFzaCkpe1xuICAgICAgcmVqZWN0KHVybE9iaik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc3RvcmFnZUhhbmRsZXIuc2V0U3RvcmFnZSh1cmxPYmopO1xuICAgICAgdGhpcy5fc2V0U2Vzc2lvbigpO1xuICAgICAgLy8gcmVtb3ZlIHVybFxuICAgICAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSAnJztcbiAgICB9XG4gIH0uYmluZCh0aGlzKSk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBPQXV0aENvbnRleHQ7XG4iXX0=