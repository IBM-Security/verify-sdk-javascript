let OAuthContext         = require('../../../dist').OAuthContext;
let AuthenticatorContext = require('../../../dist').AuthenticatorContext;
let expect               = require('chai').expect;
let config               = require('./helper').config;
let token                = require('./helper').token;
let authenticatorId      = require('./helper').authenticatorId;

let authClient;
let authCtx;

describe("AuthenticatorContext - viewVerifications()", () => {
    before( () => {
        authClient = new OAuthContext(config);
        authCtx    = new AuthenticatorContext(authClient);
    })

    it("valid params", () => {
        authCtx.viewVerifications(authenticatorId, token).then(response => {
            expect(response.response.verifications[0].state).to.exist;
        }).catch(error => {
            console.log(JSON.stringify(error));
            expect(error).to.not.exist;
        })
    })

    it("no token - should throw 'viewVerifications(authenticatorId, token), 2 parameters are required 1 were given'", () => {
        return authCtx.viewVerifications(authenticatorId).then(response => {
            expect(response).to.not.exist;
        }).catch(error => {
            expect(error.message).to.equal('viewVerifications(authenticatorId, token), 2 parameters are required 1 were given');
        })
    })

    it("invalid token (empty object) - should throw error 'not a valid token'", () => {
        return authCtx.viewVerifications(authenticatorId, {}).then(response => {
            expect(response).to.not.exist;
        }).catch(error => {
            expect(error.message).to.equal('not a valid token');
        })
    })
})
