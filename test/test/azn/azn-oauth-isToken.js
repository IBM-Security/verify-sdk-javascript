let OAuthContext = require('../../../dist').OAuthContext;
let expect       = require('chai').expect;
let config       = require("./helper").config;
let token        = require("./helper").token;

let authClient;

describe("OAuthContext(AZN) - isToken()", () => {
    before(() => {
        authClient = new OAuthContext(config);
    })

    describe("invalid token type should return false", () => {
        let data = [undefined, 0, null, '', [], {}];
        data.forEach(data => {
            it(`${data} token should return false`, () => {
                expect(authClient.isToken(data)).to.equal(false);
            })
        })
    })

    it("blank token should return false", () => {
        expect(authClient.isToken()).to.equal(false);
    })

    it("valid token should return true", () => {
        expect(authClient.isToken(token)).to.equal(true);
    })

})

