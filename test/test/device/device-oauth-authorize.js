let OAuthContext = require('../../../dist').OAuthContext;
let expect       = require('chai').expect;
let config       = require('./helper').config;

let authClient;

describe("OAuthContext(Device) - authorize()", () => {

    before(() => {
        authClient = new OAuthContext(config);
    })

    it("successful response should return device_code, user_code and verification_uri", () => {
        return authClient.authorize().then(response => {
            expect(response).to.include.all.keys('device_code', 'user_code', 'verification_uri');
        }).catch(error => {
            expect(error).to.not.exist;
        })
    })
})
