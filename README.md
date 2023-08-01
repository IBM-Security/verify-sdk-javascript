# IBM Security Verify SDK for JavaScript
![Type](https://img.shields.io/badge/Type-Typescript-blue.svg?style=flat-square)
![npm](https://img.shields.io/npm/v/ibm-verify-sdk.svg?style=flat-square)
![NPM](https://img.shields.io/npm/l/ibm-verify-sdk.svg?colorB=blue&style=flat-square)

- [IBM Security Verify SDK for JavaScript](#ibm-security-verify-sdk-for-javascript)
	- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
	- [Configuration Settings](#configuration-settings)
	- [OAuthContext](#oauthcontext)
- [License](#license)

The purpose of the Javascript client library is to enable a developer to create web based applications that enhance the user experience with IBM Security Verify.
IBM Security Verify SDK for JavaScript currently supports the following grant types:
 - **Authorization Code Flow**
    - The most commonly used flow for clients that can securely maintain a client secret such as web applications and native mobile applications as the Access Token is passed directly to the web server hosting the app, without going through the end user's web browser which can expose a risk.
 - **Resource owner password credentials (ROPC)**
	- In this flow the user's username and password are excahnged for an access token.
	**This grant type can be enabled, but use it only if no other flows are available.**
 - **Device Flow**
	-	The device flow enables devices such as Smart TVs that have limited or no browser
	capabilities to obtain an access token. The device flow still requires browser interaction during authentication.
 - **Implicit Flow**
    - Implicit flow is handled purely client-side where the users application might not have a server to store secrets. An example would be a single page application.
		**This flow should only be recommended in this type of scenario**


## Prerequisites
**Important both of the following items are required to enable the use of the IBM Verify SDK.**
- Configuring your [IBM Security Verify Tenant](https://iamdevportal.us-east.mybluemix.net/verify/javascript/civ-getting-started/configuring-your-ci-tenant)
 - Creating your custom IBM Security Verify [web application](https://www.ibm.com/support/knowledgecenter/SSCT62/com.ibm.iamservice.doc/tasks/oidc_app_sso.html) using OpenID Connect for Single Sign-on.


# Getting Started
After configuring your Tenant and your application on IBM Security Verify, you can install the IBM Security Verify SDK for JavaScript:
```bash
npm install ibm-verify-sdk
```

Referencing the sdk in your application:
```javascript
var {OAuthContext, AuthenticatorContext} = require('ibm-verify-sdk');
var authClient = new OAuthContext(/*config*/);

```

## Configuration Settings
Configuring your application for authentication / authorization transactions using Single Sign On.
Initial configuration to kick off your authentication flow with IBM Security Verify Authorization server.

Examples on how to configure your oidc applicaiton can be found on the IBM Security Identity and Access: Developer Portal site. [Configuring your application](http://developer.ice.ibmcloud.com/verify/javascript/ibm-verify-sdk-object-model/config).

## OAuthContext
The OAuthContext object represents the interactions between the relying party and the IBM Security Verify authorization server to acquire access tokens which enable the application access to protected resources.
[Additional information about OAuthContext](https://pages.github.ibm.com/ibm-security/iam-docs/verify/javascript/ibm-verify-sdk-object-model/oauthcontext)



# License
The MIT License (MIT)

Copyright (c) 2019, 2023 - IBM Corp.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
