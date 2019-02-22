let OAuthContext         = require('../../../dist').OAuthContext;
let AuthenticatorContext = require('../../../dist').AuthenticatorContext;
let expect               = require('chai').expect;
let config               = require("./helper").config;

let authClient;
let authCtx;

describe("AuthenticatorContext - _fetchToken()", () => {
    before( () => {
        authClient = new OAuthContext(config);
        authCtx    = new AuthenticatorContext(authClient);
    })

    it("should throw error - 'fetchToken() can only be used with Implicit flow'", () => {
        expect(() => authCtx._fetchToken()).to.throw('fetchToken() can only be used with Implicit flow');
    })
})
