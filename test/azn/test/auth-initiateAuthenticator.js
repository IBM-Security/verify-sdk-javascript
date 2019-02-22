let OAuthContext         = require('../../../dist').OAuthContext;
let AuthenticatorContext = require('../../../dist').AuthenticatorContext;
let expect               = require('chai').expect;
let config               = require("./helper").config;
let token                = require("./helper").token;

let authClient;
let authCtx;

describe("AuthenticatorContext - initiateAuthenticator()", () => {
    before( () => {
        authClient = new OAuthContext(config);
        authCtx    = new AuthenticatorContext(authClient);
    })

    it("owner and account name specified", () => {
        let data = {accountName: "test"};

        return authCtx.initiateAuthenticator(data, token).then(response => {
            expect(response.response).to.have.property('qrcode');
        }).catch(error => {
            expect(error).to.not.exist;
        })
    })

    it("empty data object", () => {
        let data = {};

        return authCtx.initiateAuthenticator(data, token).then(response => {
            expect(response.response).to.have.property('qrcode');
        }).catch(error => {
            console.log(JSON.stringify(error));
            expect(error).to.not.exist;
        })
    })

    // these two will fail
    it("null data param - should throw 'dataObj cannot be null'", () => {
        return authCtx.initiateAuthenticator(null, token).then(response => {
            expect(response).to.not.exist;
        }).catch(error => {
            expect(error.message).to.equal('dataObj cannot be null');
        })
    })

    it("no data param - should throw ' initiateAuthenticator(dataObj, token), 2 parameters are required 1 were given'", () => {
        return authCtx.initiateAuthenticator(token).then(response => {
            expect(response).to.not.exist;
        }).catch(error => {
            expect(error.message).to.equal('initiateAuthenticator(dataObj, token), 2 parameters are required 1 were given')
        })
    })

    it("no token provided - should throw 'initiateAuthenticator(dataObj, token), 2 parameters are required 1 were given'", () => {
        let data = {};

        return authCtx.initiateAuthenticator(data).then(response => {
            expect(response).to.not.exist;
        }).catch(error => {
            expect(error.message).to.equal('initiateAuthenticator(dataObj, token), 2 parameters are required 1 were given')
        })
    })

    it("null token provided - should throw 'not a valid token'", () => {
        let data = {};

        return authCtx.initiateAuthenticator(data, null).then(response => {
            expect(response).to.not.exist;
        }).catch(error => {
            expect(error.message).to.equal('not a valid token');
        })
    })

    it("invalid token (empty object) provided - should throw 'not a valid token'", () => {
        let data = {};

        return authCtx.initiateAuthenticator(data, {}).then(response => {
            expect(response).to.not.exist;
        }).catch(error => {
            expect(error.message).to.equal('not a valid token');
        })
    })
})
