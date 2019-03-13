let OAuthContext = require('../../../dist').OAuthContext;
let expect       = require('chai').expect;
let config       = require('./helper').config;

let authClient;

describe("OAuthContext - authenticate()", () => {
    before(() => {
        authClient = new OAuthContext(config);
    })

    it("Should return url - need to make test stricter", () => {
        return authClient.authenticate().then(response => {
            // returns a url, with nonce so cant do a direct comparison
            expect(response.startsWith("http")).to.be.true;
        })
    })
})
