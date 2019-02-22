let OAuthContext         = require('../../../dist').OAuthContext;
let AuthenticatorContext = require('../../../dist').AuthenticatorContext;
let expect               = require('chai').expect;
let config               = require("./helper").config;

let authClient;


describe("AuthenticatorContext - Instantiation", () => {
    before( () => {
        authClient = new OAuthContext(config);
    })

    it("Valid OAuthContext as parameter", () => {
        authCtx = new AuthenticatorContext(authClient);
        expect(authCtx).to.exist;
    })

    it("No OAuthContext - should throw error 'Oauth parameter if required'", () => {
        expect(() => new AuthenticatorContext()).to.throw('Oauth parameter is required');
    })
})
