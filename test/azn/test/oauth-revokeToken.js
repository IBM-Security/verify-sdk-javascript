let OAuthContext = require('../../../dist').OAuthContext;
let expect       = require('chai').expect;
let config       = require("./helper").config;
let token        = require("./helper").token;

let authClient;

describe("OAuthContext - revokeToken()", () => {
    before(() => {
        authClient = new OAuthContext(config);
    })

    if (process.env.REVOKE_TOKENS === 'true') {
        it("valid token and 'access_token' - should return a response status of 200", () => {
            // return authClient.revokeToken(token, 'access_token').then(response => {
            //     console.log(response);
            //     expect(response.response.status).to.equal(200);
            // }).catch(error => {
            //     console.log(JSON.stringify(error));
            //     expect(error).to.not.exist;
            // })
        })
    }

    it("invalid token and 'access_token' - should throw 'token cannot be null'", () => {
        expect(() => authClient.revokeToken(null, 'access_token')).to.throw('token cannot be null');
    })

    if (process.env.REVOKE_TOKENS === 'true') {
        it("valid token and 'refresh_token - should return a response status of 200'", () => {
            // return authClient.revokeToken(token, 'refresh_token').then(response => {
            //     expect(response.response).to.not.exist;
            // }).catch(error => {
            //     console.log(JSON.stringify(error));
            //     expect(error).to.not.exist;
            // })
        })
    }

    it("invalid token and 'refresh_token' - should throw 'token cannot be null'", () => {
        expect(() => authClient.revokeToken(null, 'refresh_token')).to.throw('token cannot be null');
    })

    it("null and null - should throw 'token cannot be null'", () => {
        expect(() => authClient.revokeToken(null, null)).to.throw('token cannot be null');
    })

    it("invalid tokenType - should throw ''Parameter: invalid is invalid.\n Supported values are access_token or refresh_token'", () => {
        expect(() => authClient.revokeToken(token, 'invalid')).to.throw('Parameter: invalid is invalid.\n Supported values are "access_token" or "refresh_token');
    })
})
