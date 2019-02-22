let OAuthContext = require('../../../dist').OAuthContext;
let expect       = require('chai').expect;
let config       = require("./helper").config;

let authClient;

describe("OAuthContext - login()", () => {
    before(() => {
        authClient = new OAuthContext(config);
    })

    it("builds URL correctly", () => {
        expect(authClient.login().startsWith("http")).to.be.true;
    })
})
