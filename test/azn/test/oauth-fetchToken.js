let OAuthContext = require('../../../dist').OAuthContext;
let expect       = require('chai').expect;
let config       = require('./helper').config;

let authClient;

describe("OAuthContext - fetchToken()", () => {
    before(() => {
        authClient = new OAuthContext(config);
    })

    it("should throw error 'fetchToken() can only be used with Implicit flow'", () => {
        expect(() => authClient.fetchToken()).to.throw('fetchToken() can only be used with Implicit flow');
    })
})
