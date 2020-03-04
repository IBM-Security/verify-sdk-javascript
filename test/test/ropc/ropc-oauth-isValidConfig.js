let OAuthContext = require('../../../dist').OAuthContext;
let expect       = require('chai').expect;
let config       = require('./helper').config;

let authClient;

describe("OAuthContext(ROPC) - isValidConfig()", () => {
    before(() => {
        authClient = new OAuthContext(config);
    })

    it("Valid config should return true", () => {
        expect(authClient.isValidConfig()).to.be.true
    })
})
