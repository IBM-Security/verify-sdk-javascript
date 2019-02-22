// used to get an access token when testing in a production environment
const express      = require('express');
const app          = express();
const OAuthContext = require('../../dist').OAuthContext;
const fs           = require('fs');

const expressConfig = {
    port: 3000
}

// load config from .env
require('dotenv').load();

let config = {
    tenantUrl    : process.env.TENANT_URL,
    clientId     : process.env.CLIENT_ID,
    clientSecret : process.env.CLIENT_SECRET,
    clientId     : process.env.CLIENT_ID,
    redirectUri  : process.env.REDIRECT_URI,
    responseType : process.env.RESPONSE_TYPE,
    // flowType     : process.env.FLOW_TYPE,
    flowType     : "AZN",
    scope        : process.env.SCOPE
};

console.log(config);

let authClient = new OAuthContext(config);

// Site index prompts authentication
app.get('/', function(req, res){
    //Returns promise with url string to Cloud Identity login page.
    authClient.authenticate().then(url => {
        // Url oidc endpoint for authroization with required parameters.
        // console.log(url);
        res.redirect(url);
    });
})

// Callback url which is configured in Cloud Identitiy Application settings.
// eg. https://localhost:3000/authorize/callback
app.get('/authorize/callback', function(req, res){
    // Returns promise
    authClient.getToken(req.url).then(token => {
        // Store token securely in database and associate with the requester
        // redirect to a route that requires authentication i.e. dashboard, profile page, etc.
        console.log(token);

        fs.writeFile(".token", JSON.stringify(token), (error) => {
            if (error) {
                console.log(error);
                res.send(error);
                return;
            }

            console.log("Token saved to: '.token'");
        })



        res.send(token);

    }).catch(error => {
        // Error handling
        // send appropriate response
        console.log(error);
    });

});

app.listen(3000, () => {
    console.log("Server started on port: " + config.port);
})
