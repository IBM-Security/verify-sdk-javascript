let OAuthContext = require('../../../dist').OAuthContext;
let expect       = require('chai').expect;
let sinon        = require('sinon');
let config       = require('./helper').config;
let token        = require('./helper').token;

let authClient;
let spy;

describe("OAuthContext(AZN) - revokeToken()", () => {
    before(() => {
        authClient = new OAuthContext(config);
        spy = sinon.spy(authClient, "handleResponse")
    })

    beforeEach(() => {
        spy.resetHistory()
    })

    it("0 arguments - should throw 'revokeToken(token, tokenType), 2 parameters are required 0 were given'", () => {
        expect(() => authClient.revokeToken()).to.throw('revokeToken(token, tokenType), 2 parameters are required 0 were given');
    });

    it("1 argument - should throw 'revokeToken(token, tokenType), 2 parameters are required 1 were given'", () => {
        expect(() => authClient.revokeToken(token)).to.throw('revokeToken(token, tokenType), 2 parameters are required 1 were given');
    });

    if (process.env.REVOKE_TOKENS === 'true') {
        it("valid token and 'access_token' - should return a response status of 200", () => {
            return authClient.revokeToken(token, 'access_token').then(response => {
                expect(response).to.exist;
                expect(authClient.handleResponse.calledOnce).to.equal(true);
                expect(authClient.handleResponse.getCall(0).args[1]).to.equal(token);
            }).catch(error => {
                expect(error).to.not.exist;
            })
        })
    }

    it("invalid token and 'access_token' - should throw 'token cannot be null'", () => {
        expect(() => authClient.revokeToken(null, 'access_token')).to.throw('token cannot be null');
    })

    if (process.env.REVOKE_TOKENS === 'true') {
        it("valid token and 'refresh_token - should return a response status of 200'", () => {
            return authClient.revokeToken(token, 'refresh_token').then(response => {
                expect(response).to.exist;
                expect(authClient.handleResponse.calledOnce).to.equal(true);
                expect(authClient.handleResponse.getCall(0).args[1]).to.equal(token);
            }).catch(error => {
                expect(error).to.not.exist;
            })
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
