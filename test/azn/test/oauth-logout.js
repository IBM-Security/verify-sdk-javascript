let OAuthContext = require('../../../dist').OAuthContext;
let expect       = require('chai').expect;
let config       = require('./helper').config;
let token        = require('./helper').token;

let authClient;

describe("OAuthContext - logout()", () => {
    before(() => {
        authClient = new OAuthContext(config);
    })

    if (process.env.REVOKE_TOKENS === 'true') {
        it("path and token - update this", () => {
            let path = "http://localhost:3000";

            // update this
            return authClient.logout(path, token).then(response => {
                expect(response).to.not.exist;
            })
        })

        it("no path and token ", () => {
            return authClient.logout(token).then(response => {
                expect(response).to.not.exist;
            }).catch(error => {
                expect(error).exist;
            })
        })
    }

    it("no path and no token - should throw error", () => {
        return authClient.logout().then(response => {
            expect(response).to.throw('not a valid token');
        }).catch(error => {
            expect(error).to.exist;
        })
    })
})


