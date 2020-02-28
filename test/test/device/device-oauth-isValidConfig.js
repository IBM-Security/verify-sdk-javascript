let OAuthContext = require('../../../dist').OAuthContext;
let expect       = require('chai').expect;
let config       = require('./helper').config;

let authClient;

describe("OAuthContext(Device) - isValidConfig()", () => {

    before(() => {
        authClient = new OAuthContext(config);
    })

    it("should return true", () => {
        expect(authClient.isValidConfig()).to.equal(true);
    })
})
