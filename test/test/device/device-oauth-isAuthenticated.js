let OAuthContext = require('../../../dist').OAuthContext;
let expect       = require('chai').expect;
let sinon        = require('sinon');
let config       = require('./helper').config;
let token        = require('./helper').token;

let authClient;
let spy;

describe("OAuthContext(Device) - isAuthenticated()", () => {

    before(() => {
        authClient = new OAuthContext(config);
        spy = sinon.spy(authClient, "introspectToken")
    })

    beforeEach(() => {
        spy.resetHistory()
    })

    it("valid access token should call introspectToken and return true", () => {
        return authClient.isAuthenticated(token).then(response => {
            expect(response).to.equal(true);
            expect(authClient.introspectToken.calledOnce).to.equal(true);
            expect(authClient.introspectToken.getCall(0).args[0]).to.equal(token);
        }).catch(error => {
            expect(error).to.not.exist;
        })
    })
})

