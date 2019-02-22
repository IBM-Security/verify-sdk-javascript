# Unit Test Instructions

## .env file

The `.env` file is used in the unit tests for the the tenant configuration and for conditional tests. The structure is `tenant config`, `test data` and `extra config`. 

Below are samples of using the `mock-server` and a `production tenant`.

## Configuration

### Tenant
The configuration which is used in the `OauthContext` constructor

### Test Data
The `AuthenticatorId`, `MethodId` and `VerificationId` which will be used throughout the unit tests

### Extra Config
Any extra configuration.

 `REVOKE_TOKENS` determines if the token revocation tests are ran. During development it may be useful to not revoke the tokens as logging in will not be required between tests.

`DELETE_AUTHENTICATOR` if true will not delete the provided authenticator

**NOTE:** if `REAL_TENANT` is true the logout and getToken tests will not be ran

## Using mock-server
### Sample config

```
# ----- MOCK TENANT CONFIG ----- #
TENANT_URL=http://localhost:8080
CLIENT_ID=123
CLIENT_SECRET=123
REDIRECT_URI=http://localhost:3000/authorize/callback
RESPONSE_TYPE=code
FLOW_TYPE=AZN
SCOPE=openid
REGISTRATION_PROFILE_ID=123

REAL_TENANT=false

# ----- TEST DATA ----- #

# -- MOCK DATA -- #
AUTHENTICATOR_ID=52ff7517-a416-42da-b569-1a6331906cf0
METHOD_ID=d1e8a07a-d6d1-47ee-9e85-4e8cef938b9c
VERIFICATION_ID=8626645c-2acb-4714-a725-01f9d684f266

# ----- EXTRA CONFIG ----- #
REVOKE_TOKENS=false
DELETE_AUTHENTICATOR=true
```

### Running the tests

Install dependencies

`npm install`

To perform the tests run

`npm test`

A HTML output can be found at `./mochawesome-report/mochawesome.html`

### Test coverage (must include the package not relative paths)

`npm run coverage`

A HTML output can be found at `./coverage/lcov-report/index.html`

## Using a production tenant
### Sample config

```
# ----- TENANT CONFIG ----- #
TENANT_URL=https://xxxxx.ibmcloud.com
CLIENT_ID=xxxxx
CLIENT_SECRET=xxxxx
REDIRECT_URI=http://localhost:3000/authorize/callback
RESPONSE_TYPE=code
FLOW_TYPE=AZN
SCOPE=openid
REGISTRATION_PROFILE_ID=xxxxx

REAL_TENANT=true

# ----- TEST DATA ----- #

# -- REAL DATA -- #
AUTHENTICATOR_ID=xxxxx
METHOD_ID=xxxxx
VERIFICATION_ID=xxxxx

# ----- EXTRA CONFIG ----- #
REVOKE_TOKENS=false
DELETE_AUTHENTICATOR=false
```

### Running the tests

Install dependencies

`npm install`

Before running the tests run

`npm run login`

This will retrieve and store the `token` for the tests, navigate to `http://localhost:3000` and log into CI. The `token` is then stored in the file `.token` and used for the tests.

To perform the tests run

`npm test`

A HTML output can be found at `./mochawesome-report/mochawesome.html`

### Test coverage (must include the package not relative paths)

`npm run coverage`

A HTML output can be found at `./coverage/lcov-report/index.html`
