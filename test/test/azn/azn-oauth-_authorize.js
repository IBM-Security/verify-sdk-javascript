let OAuthContext = require('../../../dist').OAuthContext;
let expect       = require('chai').expect;
let sinon        = require('sinon');
let config       = require('./helper').config;

let authClient;
let spy;

describe("OAuthContext(AZN) - _authorize()", () => {
    before(() => {
        authClient = new OAuthContext(config);
        spy = sinon.spy(authClient, "_buildUrl");
    })

    beforeEach(() => {
        spy.resetHistory()
    })

    it("should call buildUrl() with provided options as argument", () => {
        let options = {
            tenantUrl: config.tenantUrl,
            clientId: config.clientId,
            redirectUri: config.redirect_uri,
            scope: config.scope,
            response_type: config.responseType
        };
        authClient._authorize(options);
        expect(authClient._buildUrl.calledOnce).to.equal(true);
        expect(authClient._buildUrl.getCall(0).args[0]).to.equal(options);
    })
})
