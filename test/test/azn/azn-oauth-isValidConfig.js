let OAuthContext = require('../../../dist').OAuthContext;
let expect       = require('chai').expect;
let config       = require("./helper").config;

let authClient;

describe("OAuthContext(AZN) - isToken()", () => {
    before(() => {
        authClient = new OAuthContext(config);
    })

    it("valid config should return true", () => {
        expect(authClient.isValidConfig()).to.equal(true);
    })
})
