let OAuthContext = require('../../../dist').OAuthContext;
let expect       = require('chai').expect;
let config       = require('./helper').config;
let token        = require('./helper').token;

let authClient;

describe("OAuthContext - isAuthenticated()", () => {
    before(() => {
        authClient = new OAuthContext(config);
    })

    it("with token", () => {
        return authClient.isAuthenticated(token).then(response => {
            expect(response).to.be.true;
        }).catch(error => {
            console.log("ERROR: " + JSON.stringify(error));
            expect(error).to.not.exist;
        })
    })

    it("null token - should throw error 'Token parameter is not a valid token'", () => {
        return authClient.isAuthenticated(null).then(response => {
            expect(response).to.not.exist;
        }).catch(error => {
            expect(error.message).to.equal('Token parameter is not a valid token');
        })
    })

    it("invalid token (empty object) - should throw error 'Token parameter is not a valid token'", () => {
        return authClient.isAuthenticated(null).then(response => {
            expect(response).to.not.exist;
        }).catch(error => {
            expect(error.message).to.equal('Token parameter is not a valid token');
        })
    })
})
