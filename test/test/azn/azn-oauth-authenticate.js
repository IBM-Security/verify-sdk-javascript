let OAuthContext = require('../../../dist').OAuthContext;
let expect       = require('chai').expect;
let sinon        = require('sinon');
let config       = require('./helper').config;

let authClient;
let spy;

describe("OAuthContext(AZN) - authenticate()", () => {
    before(() => {
        authClient = new OAuthContext(config);
        spy = sinon.spy(authClient, "_authorize");
    })

    beforeEach(() => {
        spy.resetHistory()
    })

    it("should call authorize() with config as argument", () => {
        return authClient.authenticate().then(() => {
            expect(authClient._authorize.calledOnce).to.equal(true);
            expect(authClient._authorize.getCall(0).args[0]).to.equal(config);
        })
    })
})
