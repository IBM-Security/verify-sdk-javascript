let OAuthContext = require('../../../dist').OAuthContext;
let AuthenticatorContext = require('../../../dist').AuthenticatorContext;
let expect       = require('chai').expect;
let config       = require('./helper').config;
let token        = require('./helper').token;

let authenticatorId = require('./helper').authenticatorId;
let transactionId = require('./helper').verificationId;

let authClient;
let authCtx;

describe("AuthenticatorContext - pollVerification(authenticatorId, transactionId, token, delay, attempts)", () => {
    before(() => {
        authClient = new OAuthContext(config);
        authCtx = new AuthenticatorContext(authClient);
    })

    it("valid parameters", () => {
        // return authCtx.pollVerification(authenticatorId, transactionId, token, 1000, 10).then(response => {
        return authCtx.pollVerification(authenticatorId, global.verificationId, token, 1000, 10).then(response => {
            console.log(response);
            expect(response.state).to.exist;
        }).catch(error => {
            console.log(JSON.stringify(error));
            expect(error).to.not.exist;
        })
    })
})
