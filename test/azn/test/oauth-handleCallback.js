let OAuthContext = require('../../../dist').OAuthContext;
let expect       = require('chai').expect;
let config       = require("./helper").config;

let authClient;

describe("OAuthContext - handleCallback()", () => {
    before(() => {
        authClient = new OAuthContext(config);
    })

    it("should throw error - handleCallback() is only for Implicit flow", () => {
        expect(() => authClient.handleCallback()).to.throw('handleCallback() is only for Implicit flow');
    })
})
