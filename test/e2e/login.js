// used to get an access token when testing in a production environment
const express      = require('express');
const app          = express();
const bodyParser   = require('body-parser');
const OAuthContext = require('../../dist').OAuthContext;
const AuthenticatorContext = require('../../dist').AuthenticatorContext;
const fs           = require('fs');
const path         = require('path');

app.use(bodyParser.json());
app.use(express.static(__dirname + '/static'));

// load config from .env
require('dotenv').config( {path: path.resolve(__dirname, '../.env')} );
require('custom-env').env('auth', path.resolve(__dirname, '../test/azn'));

let token = null;

let config = {
    tenantUrl    : process.env.TENANT_URL,
    clientId     : process.env.CLIENT_ID,
    clientSecret : process.env.CLIENT_SECRET,
    redirectUri  : process.env.REDIRECT_URI,
    responseType : process.env.RESPONSE_TYPE,
    flowType     : 'authorization',
    scope        : process.env.SCOPE,
    registrationProfileId: process.env.REGISTRATION_PROFILE_ID
};


console.log(config);

let authClient = new OAuthContext(config);
let authCtx = new AuthenticatorContext(authClient);

let updateEnv = (authId, methodId) => {
    let out = `
AUTHENTICATOR_ID=${authId}
METHOD_ID=${methodId}
VERIFICATION_ID= `;

    console.log('Writing file');
    fs.appendFileSync('.env', out);
    console.log('Writing file done');
};



app.get('/login', function(req, res){
    authClient.authenticate().then(url => {
        res.redirect(url);
    });
});

app.get('/dashboard', function(req, res) {
    res.sendFile(__dirname + '/static/dashboard.html');
});

app.get('/authorize/callback', function(req, res){
    authClient.getToken({data: req.url, path: `${config.tenantUrl}/v1.0/endpoint/default/token`}).then(t => {
        token = t;
        console.log(token);

        fs.writeFile('.token', JSON.stringify(token), (error) => {
            if (error) {
                console.log(error);
                res.send(error);
                return;
            }

            console.log("Token saved to: '.token'");
        });

        // temporary
        let authenticatorId = null;
        let methodId = null;
        authCtx.authenticators(token).then(response => {
            authenticatorId = response.response.authenticators[0].id;
            console.log('Authenticator ID: ' + authenticatorId);

            authCtx.methods(authenticatorId, token).then(r => {
                methodId = r.response.signatures[0].id;
                console.log('Method ID: ' + methodId);

                // update file
                updateEnv(authenticatorId, methodId);
            }).catch(error => {
            });
        }).catch(error => {
        });

        res.redirect('/dashboard');
    }).catch(error => {
        console.log(error);
    });

});

app.get('/api/authenticators/', (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    authCtx.authenticators(token).then(response => {
        res.send(JSON.stringify(response.response));
    }).catch(error => {
        res.send(JSON.stringify(error));
    });
});

app.get('/api/registration', (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    authCtx.initiateAuthenticator({qrcodeInResponse: true, accountName: 'AZN e2e Test'}, token).then(response => {
        res.send(JSON.stringify(response.response));
    }).catch(error => {
        res.send(JSON.stringify(error));
    });

});

app.get('/api/methods/:authenticatorId', (req, res) => {
    let authenticatorId = req.params.authenticatorId;

    res.setHeader('Content-Type', 'application/json');

    authCtx.methods(authenticatorId, token).then(response => {
        res.send(JSON.stringify(response.response));
    }).catch(error => {
        res.send(JSON.stringify(error));
    });
});

app.post('/api/config', (req, res) => {
    updateEnv(req.body.authenticatorId, req.body.methodId);
});

app.listen(3000, () => {
    console.log('Server started');
});
