# IBM Verify SDK
![Type](https://img.shields.io/badge/Type-JavaScript-blue.svg)

* [Getting Started](#getting-started)
* [Configuration Settings](#configuration-settings)
* [OauthContext](#oauthcontext)
* [OAuth API Samples](#oauth-samples)
* [AuthenticatorContext](#authenticatorcontext)
* [AuthenticatorContext API Samples](#authenticatorcontext-api-aamples)
* [License](#license)

The purpose of the Javascript client library is to enable a developer to create web based applications that enhance the user experience with Cloud Identity Verify.
IBM Verify SDK currently supports the following grant types:
 - Authorization Code Flow (AZN)
    - The most commonly used flow for clients that can securely maintain a client secret such as web    applications and native mobile applications as the Access Token is passed directly to the web server hosting the app, without going through the end user's web browser which can expose a risk.
 - Implicit Flow
    - With the SDK Implicit flow is handled purely client-side. Examples are single page sites and hybrid mobile apps. 

## Prerequisites
**Important both of the following items are required to enable the use of the IBM Verify SDK.**
- Configuring your [Cloud Identity Tenant](https://iamdevportal.us-east.mybluemix.net/verify/javascript/civ-getting-started/configuring-your-ci-tenant)
 - Creating your custom Cloud Identity [web application](https://www.ibm.com/support/knowledgecenter/SSCT62/com.ibm.iamservice.doc/tasks/oidc_app_sso.html) using OpenID Connect for Single Sign-on.
 
 
# Getting Started
After configuring your Tenant and your application on Cloud Identity, you can install the IBM Verify SDK:
```bash
# npm
npm install ibm-verify-sdk
```

Referencing the sdk in your application:
```javascript
var {OAuthContext, AuthenticatorContext} = require('ibm-verify-sdk');
var authClient = new OAuthContext(/*config*/);

```

# Configuration Settings
Configuring your application for authentication / authorization transactions using Single Sign On.
Initial configuration to kick off your authentication flow with Cloud Identity Authorization server.

| Parameters   | Description                                                                                                                                                                                        | Type   | Requirements                          |
|--------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------|---------------------------------------|
| tenantUrl    | The base URL which will direct users to Cloud Identity for authentication                                                                                                                          | String | **Required**                          |
| clientId     | The client ID string generated on your applications Sign-on page within Cloud Identity                                                                                                             | String | **Required**                          |
| clientSecret | The client secret string assigned to you by Cloud Identity. This data is used together with the client ID to authenticate the relying party and to exchange an authorization code for an ID token. | String | **Required for `authorization` flow only** |
| redirectUrl  | The address where Cloud Identity sends its authentication response to the relying party.                                                                                                           | String | **Required**                          |
| responseType | Authorization Flow value: `code`. Implicit Flow value: `id_token` or `token` or `id_token` with `token`  | String | **Required**
| storage |Set client side storage type. Default is `sessionStorage` options: `sessionStorage`, `localStorage`, `cookies` | Object | **Required for `implicit` flow only** |
| registrationProfileId | A pre-configured registration profile with a unique ID used to bind an authenticator instance to a user. Read more about [Managing registration profiles](https://www.ibm.com/support/knowledgecenter/SSCT62/com.ibm.iamservice.doc/tasks/verify_profile_manage.html). | String | **Required** |
|flowType | Used by the SDK to determine which flow will get invoked by your application. **Options:** `AZN` or `Implicit`. | String | **Required** |
|scope | The `openid` scope is required to generate the id_token parameter | String | **Required** |


 Learn more about Cloud Identity's [custom application configuration](https://www.ibm.com/support/knowledgecenter/SSCT62/com.ibm.iamservice.doc/tasks/oidc_app_sso.html).

 

```javascript
// Example configuration settings for authorization flow
let config = {
  tenantUrl: process.env.TENANT_URL,
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  registrationProfileId: process.env.REGISTRATION_PROFILE_ID,
  redirectUri: 'https://{redirectUrl}',
  responseType: 'code',
  flowType: 'AZN',
  scope: 'openid',
};

// Instantiate OAuthContext
authClient = new OAuthContext(config);

```

# OAuthContext
The OAuthContext object represents the interactions between the relying party and the Cloud Identity authorization server to acquire access tokens which enable the application access to protected resources


# OAuth Samples

 - [isAuthenticated](#isauthenticatedtoken)
 - [introspectToken](#introspecttokentoken)
 - [revokeToken](#revoketokentoken-tokentype)

 **Note:** For a full list of all OAuthContext supported samples please refer to the  [IBM Security developer portal](https://iamdevportal.us-east.mybluemix.net/verify/javascript/ibm-verify-sdk-object-model/oauthcontext)



## isAuthenticated(token)
@param {object} `token` object as parameter

Returns the current active state of the token (Boolean).
```javascript 

  // Validate your access_token using the token object.
  authClient.isAuthenticated(token)
  .then((result) => {
    console.log(result) // active: true / false
  }).catch((err) => {
    // Handle error...
  });

```
## introspectToken(token)
@param {object} `token` object as parameter
**Note:** `token` parameter is only required for authorization flow
```javascript
authClient.introspectToken(token)
.then(r => {
    console.log(r.response);
}).catch((err) => {
    // Handle error...
})

```
<details><summary>Sample Response payload</summary>

```javascript

{
  "client_id": "string",
  "userType": "regular",
  "preferred_username": "string",
  "uniqueSecurityName": "string",
  "token_type": "access_token",
  "realmName": "string",
  "ext": {},
  "groupIds": [
    "string"
  ],
  "exp": 0,
  "iat": 0,
  "active": true,
  "scope": "string",
  "grant_type": "string",
  "sub": "string"
}
```
</details>

## revokeToken(token, tokenType)
@params `token` {object} Containing the `access_token` or `refresh_token`

@params `tokenType` {String} The token type to be revoked ("access_token" or "refresh_token").

Revokes the `access_token` or `refresh_token` which ever is specified by the tokenType parameter.

```javascript
let token = getRequestersToken(req);

// revoking the access_token
authclient.revokeToken(token, 'access_token')
.then(response => {

}).catch(error => {
    console.log(error);
})

// revoking the refresh_token
authclient.revokeToken(token, 'refresh_token')
.then(response => {

}).catch(error => {
    console.log(error);
})
```

# AuthenticatorContext
The AuthenticatorContext class contains most of the functionality in the SDK. It is used to interact with an individuals authenticators, verifications and methods.


**Note:** The constructor, requires an OAuthContext object as a parameter and returns an AuthenticatorContext object.

```javascript
var {OAuthContext, AuthenticatorContext} = require('ibm-verify-sdk');

let config = {
  tenantUrl: process.env.TENANT_URL,
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  registrationProfileId: process.env.REGISTRATION_PROFILE_ID,
  redirectUri: 'https://{redirectUrl}',
  responseType: 'code',
  flowType: 'AZN',
  scope: 'openid',
};

var authClient = new OAuthContext(config);
var authCtx = new AuthenticatorContext(authClient);
```

# AuthenticatorContext API Samples

- [authenticators](#authenticatorstoken)
- [initiateAuthenticator](#initiateAuthenticatordataobj-token)

 **Note:** For a full list of all OAuthContext supported samples please refer to the [IBM Security developer portal](https://iamdevportal.us-east.mybluemix.net/verify/javascript/ibm-verify-sdk-object-model/authenticator-context)



## authenticators(token)
@param {object} `token` object required only for the authorization flow. 

Returns an object with the property authenticators where the value is an array of authenticator objects which are registered to the user.

```javascript
// token parameter only required for authorization flow
 authCtx.authenticators(token)
 .then(authenticators => {
      console.log(authenticators);
  }).catch(error => {
      console.log(error);
  });
});
```
<details><summary>Sample Response payload</summary>

```javascript
{
  "authenticators": [
    {
      "creationTime": "2018-04-19T09:21:38.414Z",
      "enabled"     : true,
      "clientId"    : "64f20377-6041-47ec-a47f-d9bd0a5095e7",
      "state"       : "ACTIVE",
      "owner"       : "50TPV1B8Q9",
      "attributes"  : {
        "deviceName"        : "John's iPhone",
        "pushToken"         : "5fw75HqyXnivkpmb%3AudWNSI7s",
        "fingerprintSupport": true,
        "applicationVersion": "1.0.5",
        "faceSupport"       : false,
        "accountName"       : "Savings Account",
        "deviceType"        : "iPhone",
        "deviceId"          : "3f9821f4-b79f-47e3-9efc-51a48cf00ea7",
        "frontCameraSupport": true,
        "osVersion"         : "11.2.1",
        "applicationId"     : "com.ibm.security.verifyapp",
        "platformType"      : "IOS",
        "verifySdkVersion"  : "1.0.1"
      },
      "id": "7b676daa-8725-472d-a7f2-88f05c0b798b"
    }
  ]
}
```
</details>

## initiateAuthenticator(dataObj, token)
@param {object} `dataObj`

@param {object} `token` object required only for the authorization flow. 

Initiates an authenticator registration, the response contains a base64 encoded png QR code which can be scanned using the IBM Verify mobile app to complete the registration.

```javascript
let dataObj = {
    accountName: 'Savings Account'
}

authCtx.initiateAuthenticator(dataObj, token)
.then(response => {
    console.log(response.qrcode);
}).catch(error => {
    console.log(error);
});
```
<details><summary>Sample Response payload</summary>

```javascript
{
  "code"   : "rNxkpy2TSdv3pFgVW9kq",
  "qrcode" : "c2FtcGxlCg==",
  "version": {
    "platform": "com.ibm.security.access.verify",
    "number"  : "1.0.1"
  },
  "registrationUri": "https://tenant.ice.ibmcloud.com/v1.0/authenticators/registration",
  "accountName"    : "Savings Account"
}
```
</details>


# License
The MIT License (MIT)

Copyright (c) 2019 IBM

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
