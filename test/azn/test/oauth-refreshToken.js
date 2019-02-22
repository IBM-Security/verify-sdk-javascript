let OAuthContext = require('../../../dist').OAuthContext;
let expect       = require('chai').expect;
let config       = require("./helper").config;
let token        = require("./helper").token;

let authClient;

describe("OAuthContext - refreshToken()", () => {
    before(() => {
        authClient = new OAuthContext(config);
    })

    it("Valid refreshToken", () => {
        // return authClient.refreshToken(token).then(response => {
        //     expect(response.access_token).to.exist;
        // }).catch(error => {
        //     console.log(JSON.stringify(error));
        //     expect(error).to.not.exist;
        // })
    })

    it("Invalid refreshToken {refresh_token: null} - should throw http error", () => {
        // return authClient.refreshToken({refresh_token: null}).then(response => {
        //     console.log(response);
        //     expect(response).to.not.exist;
        // }).catch(error => {
        //     expect(error.status).to.equal(400);
        // })
    })
})
