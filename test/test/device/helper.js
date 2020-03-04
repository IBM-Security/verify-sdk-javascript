// should use dotenv for config
const fs   = require('fs');
const path = require('path');
require('dotenv').config({path: path.resolve(__dirname, '../../.env')});
require('custom-env').env('device', path.resolve(__dirname));

module.exports.config = {
    tenantUrl             : process.env.TENANT_URL,
    clientId              : process.env.CLIENT_ID,
    clientSecret          : process.env.CLIENT_SECRET,
    redirectUri           : process.env.REDIRECT_URI,
    registrationProfileId : process.env.REGISTRATION_PROFILE_ID,
    responseType          : process.env.RESPONSE_TYPE,
    flowType              : process.env.FLOW_TYPE,
    scope                 : process.env.SCOPE
};

// load saved token from `npm run login`
if (process.env.REAL_TENANT === 'true') {
    module.exports.token = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../.token')));
} else {
    // fake token
    module.exports.token = {
        "access_token": "88888888",
        "id_token": "4444",
        "grant_id": "22",
        "expires_in": 500,
        "token_type": "Bearer",
        "scope": "openid",
        "refresh_token": "666666"
    };
}

module.exports.optionalTests = {
    REVOKE_TOKENS        : process.env.REVOKE_TOKENS,
    DELETE_AUTHENTICATOR : process.env.DELETE_AUTHENTICATOR
};

module.exports.callback = "/?state=BU_zDjVVI30U0Un0&code=idWfb2Ts2TTI2umfPGFbLSh5pusnwt&grant_id=0e57bd36-4dc3-4a8c-841c-d250d3e0aa1b";

module.exports.authenticatorId = process.env.AUTHENTICATOR_ID;
module.exports.methodId        = process.env.METHOD_ID;
module.exports.verificationId  = process.env.VERIFICATION_ID;
module.exports.deviceCode      = process.env.DEVICE_CODE;


module.exports.AppConfig =  {
    DEFAULT_CLOCK_SKEW : 300,
    HTTP_ERROR : 'Http Error',
    OAUTH_CONTEXT_CONFIG_SETTINGS_ERROR : 'OAuthContext Configuration Error',
    OAUTH_CONTEXT_API_ERROR : 'OAuthContext API Error',
    AUTHENTICATOR_CONTEXT_ERROR : 'AuthenticatorContext Error',
    TOKEN_ERROR : 'Token Error'
};
