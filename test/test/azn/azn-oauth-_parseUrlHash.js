let OAuthContext = require('../../../dist').OAuthContext;
let expect       = require('chai').expect;
let config       = require('./helper').config;

let authClient;

describe("OAuthContext(AZN) - _parseUrlHash()", () => {
    before(() => {
        authClient = new OAuthContext(config);
    })

    it("hash should return expected parsed hash", () => {
        let hash = `#section=value`;
        expect(JSON.stringify(authClient._parseUrlHash(hash))).to.equal(`{"section":"value"}`)
    })
})
