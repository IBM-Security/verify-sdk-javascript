let OAuthContext = require('../../../dist').OAuthContext;
let expect       = require('chai').expect;
let config       = require('./helper').config;
let token        = require('./helper').token;

let authClient;

describe("OAuthContext - userinfo(token)", () => {
    before(() => {
        authClient = new OAuthContext(config);
    })

    it("with token - checks that response.displayName exists", () => {
        return authClient.userinfo(token).then(response => {
            expect(response.response.displayName).to.exist;
        }).catch(error => {
            console.log(JSON.stringify(error));
            expect(error).to.not.exist;
        })
    })

    it("with null token - should throw error 'Token parameter is not a valid token'", () => {
        return authClient.userinfo().then(response => {
            console.log(response);
            expect(response).to.not.exist;
        }).catch(error => {
            expect(error.message).to.equal('Token parameter is not a valid token');
        })
    })
})
