let OAuthContext = require('../../../dist').OAuthContext;
let expect       = require('chai').expect;
let config       = require('./helper').config;

describe("OAuthContext(ROPC) - Instantiation", () => {

    it("Valid config", () => {
        let authClient = new OAuthContext(config);
        expect(authClient).to.exist;
    })
})
