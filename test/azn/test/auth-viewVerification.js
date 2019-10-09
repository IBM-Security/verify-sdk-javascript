let OAuthContext         = require('../../../dist').OAuthContext;
let AuthenticatorContext = require('../../../dist').AuthenticatorContext;
let expect               = require('chai').expect;
let config               = require('./helper').config;
let token                = require('./helper').token;
let authenticatorId      = require('./helper').authenticatorId;
let verificationId       = require('./helper').verificationId;

let authClient;
let authCtx;

describe("AuthenticatorContext - viewVerification()", () => {
    before( () => {
        authClient = new OAuthContext(config);
        authCtx    = new AuthenticatorContext(authClient);
    })

    it("valid params - checks if verification owner exists", () => {
        // return authCtx.viewVerification(authenticatorId, verificationId, token).then(response => {
        return authCtx.viewVerification(authenticatorId, global.verificationId, token).then(response => {
            expect(response.response.owner).to.exist;
        }).catch(error => {
            console.log(JSON.stringify(error));
            expect(error).to.not.exist;
        })
    })

    it("no token - should throw 'viewVerification(authenticatorId, transactionId, token), 3 parameters are required 2 were given'", () => {
        return authCtx.viewVerification(authenticatorId, verificationId).then(response => {
            expect(response).to.not.exist;
        }).catch(error => {
            expect(error.message).to.equal('viewVerification(authenticatorId, transactionId, token), 3 parameters are required 2 were given');
        })
    })

    it("invalid token (empty object) - should throw error 'not a valid token'", () => {
        return authCtx.viewVerification(authenticatorId, verificationId, {}).then(response => {
            expect(response).to.not.exist;
        }).catch(error => {
            expect(error.message).to.equal('not a valid token');
        })
    })
})
