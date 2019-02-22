let OAuthContext         = require('ibm-verify-sdk').OAuthContext;
let AuthenticatorContext = require('ibm-verify-sdk').AuthenticatorContext;

let config = {
    tenantUrl:'',
    clientId:'',
    redirectUri:'http://localhost:3000/authorize/callback',
    responseType:'token id_token',
    flowType:'Implicit',
    scope:'openid',
    registrationProfileId:'',
    storageType: sessionStorage
};

let authClient = new OAuthContext(config);
let authCtx    = new AuthenticatorContext(authClient);

if (window.location.pathname === '/authorize/callback') {
    authClient.handleCallback();
    window.location.replace('/dashboard.html');
}

if (window.location.pathname === '/') {
    let url = authClient.login();
    window.location.replace(url);
}

let selectedAuthenticator = 0;
let selectedMethod;
let authenticators;

global.updateSelectedAuthenticator = (index) => {
    selectedAuthenticator = index;
    updateAuthenticatorInfo(authenticators[index]);
    getMethods(authenticators[index].id);
};

const insertAuthenticator = (authenticator) => {
    let table = document.getElementById('auth-tbody');
    let length = table.rows.length;
    let row = table.insertRow(length);


    row.onclick = () => {
        global.updateSelectedAuthenticator(length);
    };

    let cell1 = row.insertCell(0);
    let cell2 = row.insertCell(1);
    let cell3 = row.insertCell(2);
    let cell4 = row.insertCell(3);

    cell1.innerHTML = authenticator.id;
    cell2.innerHTML = authenticator.attributes.accountName;
    cell3.innerHTML = authenticator.attributes.deviceType;
    cell4.innerHTML = `<button type="button" class="btn btn-danger btn-sm" onclick=deleteAuthenticator("${authenticator.id}")> Delete Authenticator </button>`;
};

const updateAuthenticatorInfo = (info) => {
    $('#authenticator-info').html(JSON.stringify(info, null, 4));
};

global.deleteAuthenticator = (authenticatorId) => {
    $('#authenticator-info').html('Loading...');

    authCtx.deleteAuthenticator(authenticatorId).then(response => {
        location.reload();
    }).catch(error => {
        $('#authenticator-info').html(JSON.stringify(error));
    });
};

global.enableMethod = (state) => {
    $('#method-info').html('Loading...');

    authCtx.methodEnabled(selectedMethod, state).then(response => {
        getMethods(authenticators[selectedAuthenticator].id);
    }).catch(error => {
        $('#method-info').html(JSON.stringify(error));
    });
};

const getAuthenticators = () => {
    $('#authenticator-info').html('Loading...');

    authCtx.authenticators().then(response => {
        for (let i = 0; i < response.authenticators.length; i ++){
            insertAuthenticator(response.authenticators[i]);
        }

        authenticators = response.authenticators;

        $('#authenticator-info').html(JSON.stringify(response.authenticators[0], null, 4));
        getMethods(authenticators[0].id);

    }).catch(error => {
        $('#authenticator-info').html(JSON.stringify(error));
    });
};

global.newAuthenticator = () => {

    authCtx.initiateAuthenticator({accountName: 'sample'}).then(response => {
        $('#qr').attr('src', 'data:image/png;base64, ' + response.qrcode);
    }).catch(error => {
        alert(JSON.stringify(error));
    });
};

const getMethods = (authenticatorId) => {
    $('#method-info').html('Loading...');

    authCtx.methods(authenticatorId).then(response => {
        $('#method-info').html(JSON.stringify(response.signatures, null, 4));
        selectedMethod = response.signatures[0].id;
    }).catch(error => {
        $('#method-info').html(JSON.stringify(error));
    });
};

getAuthenticators();


