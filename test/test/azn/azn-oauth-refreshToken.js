let OAuthContext = require('../../../dist').OAuthContext;
let expect       = require('chai').expect;
let config       = require('./helper').config;
let token        = require('./helper').token;

let authClient;

describe("OAuthContext(AZN) - refreshToken()", () => {
    before(() => {
        authClient = new OAuthContext(config);
    })

    it("Valid refreshToken - should return response with access_token", () => {
        return authClient.refreshToken(token).then(response => {
            expect(response.access_token).to.exist;
        }).catch(error => {
            expect(error).to.not.exist;
        })
    })

    it("Provided token has no refresh_token - should throw 'token has no refresh_token property' error", () => {
        let token = {};
        return authClient.refreshToken(token).then(response => {
            expect(response).to.not.exist;
        }).catch(error => {
            expect(error.message).to.equal('token has no refresh_token property');
        })
    });

    it("Invalid refreshToken {refresh_token: null} - should throw http error", () => {
        return authClient.refreshToken({refresh_token: null}).then(response => {
            expect(response).to.not.exist;
        }).catch(error => {
            expect(error.status).to.equal(400);
        })
    })
})
