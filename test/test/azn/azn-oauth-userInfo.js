let OAuthContext = require('../../../dist').OAuthContext;
let expect       = require('chai').expect;
let sinon        = require('sinon');
let config       = require('./helper').config;
let token        = require('./helper').token;

let authClient;
let spy;

describe("OAuthContext(AZN) - userInfo(token)", () => {
    before(() => {
        authClient = new OAuthContext(config);
        spy = sinon.spy(authClient, "handleResponse");
    })

    beforeEach(() => {
        spy.resetHistory()
    })

    it("with token - checks that response.displayName exists", () => {
        return authClient.userInfo(token).then(response => {
            expect(response.response.displayName).to.exist;
            expect(authClient.handleResponse.calledOnce).to.equal(true);
            expect(authClient.handleResponse.getCall(0).args[1]).to.equal(token);
        }).catch(error => {
            expect(error).to.not.exist;
        })
    })

    it("with null token - should throw error 'Token parameter is not a valid token'", () => {
        return authClient.userInfo().then(response => {
            expect(response).to.not.exist;
        }).catch(error => {
            expect(error.message).to.equal('Token parameter is not a valid token');
        })
    })
})
