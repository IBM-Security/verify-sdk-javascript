# Unit Test Instructions

## .env files

The `.env` file in this folder is used in the unit tests for the tenant configuration and for conditional tests.
Within each flow type's folder (e.g.`test/azn`, `test/ropc`, `e2e`), `.env.<flow>` files are used for flow-specific environment variables.
Each flow will load the config from `.env` first, and then any flow-specific environment variables from `.env.<flow>` (i.e. if a variable is declared in `.env`, it will not be overwritten by the value in `.env.<flow>`)
<br>
There are sample `mock.env` files for the above.

The structure is `tenant config`, `test data` and `extra config`.

Below are samples of using the `mock-server` and a `production tenant`.

## Configuration

### Tenant
The configuration which is used in the `OAuthContext` constructor.

### Test Data
The `AuthenticatorId`, `MethodId` and `VerificationId` which will be used throughout the unit tests.

### Extra Config
Any extra configuration.

`REVOKE_TOKENS` determines if the token revocation tests are ran. During development it may be useful to not revoke the tokens as logging in will not be required between tests.

`DELETE_AUTHENTICATOR` if true will not delete the provided authenticator

**NOTE:** If `REAL_TENANT` is true the logout and getToken tests will not be run.

## Using mock-server
To run the unit tests using mock data you'll also need the mock-server. You can clone the repo: https://github.ibm.com/IBM-Verify/mock-server.

You can read more about how the mock-server works https://github.ibm.com/IBM-Verify/mock-server/blob/master/README.md.
### Sample config

```
# ----- MOCK TENANT CONFIG ----- #
TENANT_URL=http://localhost:8080
CLIENT_ID=123
CLIENT_SECRET=123
REDIRECT_URI=http://localhost:3000/authorize/callback
RESPONSE_TYPE=code
FLOW_TYPE=authorization # THIS IS CONFIGURED IN THE FLOW TYPE'S .ENV FILE
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

1. Install dependencies and create .env config files in `test/test` and `test/test/<flow>`
<br> `npm install`
2. To perform the tests run
<br> `npm run test`
<br> To run unit tests for one flow type only, `npm run test-<flow>` (e.g.`npm run test-device`)

A HTML output can be found at `./mochawesome-report/test-results.html`

### Test coverage (must include the package not relative paths)

`npm run coverage`

A HTML output can be found at `./coverage/index.html`

## Using a production tenant
### Sample config

```
# ----- TENANT CONFIG ----- #
TENANT_URL=https://xxxxx.ibmcloud.com
CLIENT_ID=xxxxx
CLIENT_SECRET=xxxxx
REDIRECT_URI=http://localhost:3000/authorize/callback
RESPONSE_TYPE=code
FLOW_TYPE=authorization
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

1. Install dependencies
<br> `npm install`
2. Before running the tests run
<br> `npm run login`
3. This will retrieve and store the `token` for the tests, navigate to `http://localhost:3000` and log into CI. The `token` is then stored in the file `.token` and used for the tests.
4. To perform the tests run
<br> `npm test`

A HTML output can be found at `./mochawesome-report/mochawesome.html`

### Test coverage (must include the package not relative paths)

`npm run coverage`

A HTML output can be found at `./coverage/index.html`
