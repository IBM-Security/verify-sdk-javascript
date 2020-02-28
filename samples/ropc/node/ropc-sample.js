const OAuthContext = require('ibm-verify-sdk').OAuthContext;
const rls = require('readline-sync');

require('dotenv').config();

const config = {
    tenantUrl: process.env.TENANT_URL,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    responseType: process.env.RESPONSE_TYPE,
    flowType: process.env.FLOW_TYPE,
    scope: process.env.SCOPE,
};


async function login() {
    try {
        return await ROPC.login(username, password);
    } catch (error) {
        throw error;
    }
}


console.log('ibm-verify-sdk ROPC sample application\n\n');

console.log('Authenticate against');
console.log(`tenant   : ${config.tenantUrl}`);
console.log(`client ID: ${config.clientId}\n\n`);

const ROPC = new OAuthContext(config);

const username = rls.question('username: ');
const password = rls.question('password: ', { hideEchoBack: true });

let token;

console.log('\n\nAuthenticating...');
login().then(t => {
    token = t;

    console.log('Successfully authenticated\n\n');
    console.log('Retrieving user information...');
    ROPC.userInfo(token).then(r => {
        console.log('Successfully retrieved user information\n\n');
        console.log(r.response);
    }).catch(e => {
        console.log('Error occured while retrieving user information');
        console.log(e);
    });
}).catch(e => {
    console.log('Error occured while authenticating', e.message);
});

