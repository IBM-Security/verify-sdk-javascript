let selectedAuthenticator = 0;
let selectedMethod;
let authenticators;

const updateSelectedAuthenticator = (index) => {
    selectedAuthenticator = index;
    updateAuthenticatorInfo(authenticators[index]);
    getMethods(authenticators[index].id);
};

const insertAuthenticator = (authenticator) => {
    let table = document.getElementById('auth-tbody');
    let length = table.rows.length;
    let row = table.insertRow(length);


    row.onclick = () => {
        updateSelectedAuthenticator(length);
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

const deleteAuthenticator = (authenticatorId) => {
    $('#authenticator-info').html('Loading...');

    let data = {authenticatorId: authenticatorId};

    $.ajax({
        type: 'DELETE',
        url: 'http://localhost:3000/api/authenticator/',
        data: data,

        success: function(result) {
            location.reload();
        },
        error: function(error) {
            $('#authenticator-info').html(JSON.stringify(error));
        }
    });
};

const enableMethod = (state) => {
    $('#method-info').html('Loading...');

    let data = {methodId: selectedMethod, enabled: state};

    $.ajax({
        type: 'PATCH',
        url: 'http://localhost:3000/api/method/enabled/',
        data: data,

        success: function(result) {
            getMethods(authenticators[selectedAuthenticator].id);
        },
        error: function(error) {
            $('#method-info').html(JSON.stringify(error));
        }
    });
};

const getAuthenticators = () => {
    $('#authenticator-info').html('Loading...');

    $.ajax({
        type: 'GET',
        url: 'http://localhost:3000/api/authenticators/',
        success: function(result) {
            for (let i = 0; i < result.authenticators.length; i ++){
                insertAuthenticator(result.authenticators[i]);
            }

            authenticators = result.authenticators;

            $('#authenticator-info').html(JSON.stringify(result.authenticators[0], null, 4));
            getMethods(authenticators[0].id);
        },
        error: function(error) {
            $('#authenticator-info').html(JSON.stringify(error));
        }
    });
};

const newAuthenticator = () => {
    $.ajax({
        type: 'GET',
        url: 'http://localhost:3000/api/registration/',
        success: function(result) {
            $('#qr').attr('src', 'data:image/png;base64, ' + result.qrcode);
        },
        error: function(error) {
            alert(JSON.stringify(error));
        }
    });
};

const getMethods = (authenticatorId) => {
    $('#method-info').html('Loading...');

    $.ajax({
        type: 'GET',
        url: 'http://localhost:3000/api/methods/' + authenticatorId,
        success: function(result) {
            $('#method-info').html(JSON.stringify(result.signatures, null, 4));
            selectedMethod = result.signatures[0].id;
        },
        error: function(error) {
            $('#method-info').html(JSON.stringify(error));
        }
    });
};

getAuthenticators();


