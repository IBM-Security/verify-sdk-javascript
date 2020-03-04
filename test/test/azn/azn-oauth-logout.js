let OAuthContext = require('../../../dist').OAuthContext;
let expect       = require('chai').expect;
let sinon        = require('sinon');
let config       = require('./helper').config;
let token        = require('./helper').token;

let authClient;
let spy;

describe("OAuthContext(AZN) - logout()", () => {
    before(() => {
        authClient = new OAuthContext(config);
        spy = sinon.spy(authClient, "revokeToken")
    })

    beforeEach(() => {
        spy.resetHistory()
    })

    if (process.env.REVOKE_TOKENS === 'true') {
        it("path and token", () => {
            let path = "http://localhost:3000";

            return authClient.logout(path, token).then(response => {
                expect(response).to.exist;
                expect(authClient.revokeToken.calledOnce).to.equal(true);
                expect(authClient.revokeToken.getCall(0).args[0]).to.equal(token);
                expect(authClient.revokeToken.getCall(0).args[1]).to.equal('access_token');
            }).catch(error => {
                expect(error).to.not.exist;
            })
        })

        it("no path and token", () => {
            return authClient.logout(token).then(response => {
                expect(response).to.exist;
                expect(authClient.revokeToken.calledOnce).to.equal(true);
                expect(authClient.revokeToken.getCall(0).args[0]).to.equal(token);
                expect(authClient.revokeToken.getCall(0).args[1]).to.equal('access_token');
            }).catch(error => {
                expect(error).to.not.exist;
            })
        })

        it("path and invalid token - should throw error", () => {
            let path = "http://localhost:3000";

            return authClient.logout(path, {}).then(response => {
                expect(response).to.not.exist;
            }).catch(error => {
                expect(error.message).to.equal('Token parameter is not a valid token');
            })
        })

        it("no path and invalid token - should throw error", () => {
            return authClient.logout({}).then(response => {
                expect(response).to.not.exist;
            }).catch(error => {
                expect(error.message).to.equal('Token parameter is not a valid token');
            })
        })
    }

    it("no path and no token - should throw error", () => {
        return authClient.logout().then(response => {
            expect(response).to.throw('token cannot be null');
        }).catch(error => {
            expect(error).to.exist;
        })
    })
})


