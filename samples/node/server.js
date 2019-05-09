const express              = require('express');
const bodyParser           = require('body-parser');
const cookieParser         = require('cookie-parser');                        // optional
const uuidv1               = require('uuid/v1');                              // optional
const OAuthContext         = require('ibm-verify-sdk').OAuthContext;
const AuthenticatorContext = require('ibm-verify-sdk').AuthenticatorContext;

const app = express();
app.use(cookieParser('secret')); // optional
app.use(express.static('front-end/'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// load contents of .env into process.env
require('dotenv').load();

let config = {
    tenantUrl            : process.env.TENANT_URL,
    clientId             : process.env.CLIENT_ID,
    clientSecret         : process.env.CLIENT_SECRET,
    redirectUri          : process.env.REDIRECT_URI,
    responseType         : process.env.RESPONSE_TYPE,
    flowType             : process.env.FLOW_TYPE,
    scope                : process.env.SCOPE,
    registrationProfileId: process.env.REGISTRATION_PROFILE_ID
};

let authClient = new OAuthContext(config);
let authCtx    = new AuthenticatorContext(authClient);

let usersToToken = [];

const getTokenIndex = (id) => {
    let i;

    for (i = 0; i < usersToToken.length; i ++) {
        if (usersToToken[i].id === id) {
            return i;
        }
    }

    return -1;
};

const retrieveToken = (id) => {
    let i = getTokenIndex(id);

    if (i === -1) {
        return null;
    }

    return usersToToken[i].token;
};

const removeToken = (id) => {
    let i = getTokenIndex(id);

    if (i === -1) {
        throw new Error('Token not found');
    }

    usersToToken.splice(i, 1);
};

const updateToken = (id, token) => {
    let i = getTokenIndex(id);

    // not present
    if (i === -1) {
        usersToToken.push({id: id, token: token});
        return;
    }

    usersToToken[i].token = token;
};

app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/home', (req, res) => {
    res.send('Home');
});

// generate authentication url and redirect user
app.get('/login', (req, res) => {
    authClient.authenticate().then(url => {
        res.redirect(url);
    }).catch(error => {
        res.send(error);
    });
});

// user has authenticated through CI, now get the token
app.get(process.env.REDIRECT_URI_ROUTE, (req, res) => {
    authClient.getToken(req.url).then(token => {
        // generate id
        let id = uuidv1();

        // store id in signed cookie - expiry not working
        res.cookie('uuid', id, {signed: true});

        // store and associate token to the user
        updateToken(id, token);
        // usersToToken.push({id: id, token: token});

        // redirect to authenticated page
        res.redirect('/dashboard.html');
    }).catch(error => {
        res.send('ERROR: ' + error);
    });
});

// delete token from storage
app.get('/logout', (req, res) => {
    // get id from cookie
    let id = req.signedCookies.uuid;

    if (!id) {
        res.send('Cannot find cookie');
        return;
    }

    try {
        removeToken(id);
        res.send('Logged out');
    } catch {
        res.send('User not found');
    }

    // revoke access token
    authCtx.logout(token).then(response => {

    }).catch(error => {
        console.log(error);
    });
});

// returns an array of the users registered authenticators
app.get('/api/authenticators/', (req, res) => {
    // get id from cookie
    let id = req.signedCookies.uuid;

    let token = retrieveToken(id);

    // if token was found in storage
    if (token) {
        // set correct header
        res.setHeader('Content-Type', 'application/json');

        authCtx.authenticators(token).then(response => {
            res.send(JSON.stringify(response.response));

            // refresh occurred
            if (response.token) {
                console.log('Refreshed token');
                updateToken(id, response.token);
            }
        }).catch(error => {
            res.send(JSON.stringify(error));
        });
    } else {
        res.send('Token not found');
    }
});

app.get('/api/registration', (req, res) => {
    // get id from cookie
    let id = req.signedCookies.uuid;

    let token = retrieveToken(id);

    // if token was found in storage
    if (token) {
        // set correct header
        res.setHeader('Content-Type', 'application/json');

        authCtx.initiateAuthenticator({qrcodeInResponse: true, accountName: 'sample'}, token).then(response => {
            res.send(JSON.stringify(response.response));

            // refresh occurred
            if (response.token) {
                console.log('Refreshed token');
                updateToken(id, response.token);
            }
        }).catch(error => {
            res.send(JSON.stringify(error));
        });
    } else {
        res.send('Token not found');
    }
});

app.get('/api/methods/:authenticatorId', (req, res) => {
    // get id from cookie
    let id = req.signedCookies.uuid;
    let authenticatorId = req.params.authenticatorId;

    let token = retrieveToken(id);

    // if token was found in storage
    if (token) {
        // set correct header
        res.setHeader('Content-Type', 'application/json');

        authCtx.methods(authenticatorId, token).then(response => {
            res.send(JSON.stringify(response.response));

            // refresh occurred
            if (response.token) {
                console.log('Refreshed token');
                updateToken(id, response.token);
            }
        }).catch(error => {
            res.send(JSON.stringify(error));
        });
    } else {
        res.send('Token not found');
    }
});

app.patch('/api/method/enabled', (req, res) => {
    // get id from cookie
    let id = req.signedCookies.uuid;

    let token    = retrieveToken(id);
    let enabled  = req.body.enabled === 'true';
    let methodId = req.body.methodId;

    // if token was found in storage
    if (token) {
        // set correct header
        res.setHeader('Content-Type', 'application/json');

        authCtx.methodEnabled(methodId, enabled, token).then(response => {
            res.send(JSON.stringify(response.response));

            // refresh occurred
            if (response.token) {
                console.log('Refreshed token');
                updateToken(id, response.token);
            }
        }).catch(error => {
            res.send(JSON.stringify(error));
        });
    } else {
        res.send('Token not found');
    }
});

app.delete('/api/authenticator', (req, res) => {
    // get id from cookie
    let id = req.signedCookies.uuid;

    let token           = retrieveToken(id);
    let authenticatorId = req.body.authenticatorId;

    // if token was found in storage
    if (token) {
        // set correct header
        res.setHeader('Content-Type', 'application/json');

        authCtx.deleteAuthenticator(authenticatorId, token).then(response => {
            res.send(JSON.stringify(response.response));

            // refresh occurred
            if (response.token) {
                console.log('Refreshed token');
                updateToken(id, response.token);
            }
        }).catch(error => {
            res.send(JSON.stringify(error));
        });
    } else {
        res.send('Token not found');
    }
});

app.listen(3000, () => {
    console.log('Server started');
});
