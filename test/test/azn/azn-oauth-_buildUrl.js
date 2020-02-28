let OAuthContext = require('../../../dist').OAuthContext;
let expect       = require('chai').expect;
let config       = require('./helper').config;

let authClient;

describe("OAuthContext(AZN) - _authenticate()", () => {
    before(() => {
        authClient = new OAuthContext(config);
    })

    it("should return valid url", () => {
        let response = authClient._buildUrl(config);
        // returns a url, with nonce so cant do a direct comparison
        // check instead that each attribute is present
        expect(response.startsWith(`${config.tenantUrl}/oidc/endpoint/default/authorize?`)).to.be.true;
        expect(response).to.include(`client_id=${encodeURIComponent(config.clientId)}`);
        expect(response).to.include(`redirect_uri=${encodeURIComponent(config.redirectUri)}`);
        expect(response).to.include(`scope=${encodeURIComponent(config.scope)}`);
        expect(response).to.include(`response_type=${encodeURIComponent(config.responseType)}`);
        expect(response).to.include(`state=`);
        expect(response).to.include(`nonce=`);
    })
})
