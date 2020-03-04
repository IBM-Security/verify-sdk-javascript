let OAuthContext = require('../../../dist').OAuthContext;
let expect       = require('chai').expect;
let config       = require('./helper').config;

let authClient;

describe("OAuthContext(AZN) - getConfig()", () => {
    before(() => {
        authClient = new OAuthContext(config);
    })

    it("should return config object", () => {
        expect(authClient.getConfig()).to.contain(config);
    })
})
