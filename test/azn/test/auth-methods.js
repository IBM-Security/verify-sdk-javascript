let OAuthContext         = require('../../../dist').OAuthContext;
let AuthenticatorContext = require('../../../dist').AuthenticatorContext;
let expect               = require('chai').expect;
let config               = require('./helper').config;
let token                = require('./helper').token;
let authenticatorId      = require('./helper').authenticatorId;

let authClient;
let authCtx;

describe("AuthenticatorContext - methods()", () => {
    before( () => {
        authClient = new OAuthContext(config);
        authCtx    = new AuthenticatorContext(authClient);
    })

    it("valid params", () => {
        return authCtx.methods(authenticatorId, token).then(response => {
            expect(response.response.signatures[0]).to.exist;
        }).catch(error => {
            console.log(JSON.stringify(error));
            expect(error).to.not.exist;
        })
    })

    it("no token - should throw 'methods(authenticatorId, token), 2 parameters are required 1 were given'", () => {
        return authCtx.methods(authenticatorId).then(response => {
            expect(response).to.not.exist;
        }).catch(error => {
            expect(error.message).to.equal('methods(authenticatorId, token), 2 parameters are required 1 were given');
        })    
    })

    it("null token - should throw 'not a valid token'", () => {
        return authCtx.methods(authenticatorId, null).then(response => {
            expect(response).to.not.exist;
        }).catch(error => {
            expect(error.message).to.equal('not a valid token');
        })
    })

    it("invalid token (empty object) - should throw 'not a valid token'", () => {
        return authCtx.methods(authenticatorId, {}).then(response => {
            expect(response).to.not.exist;
        }).catch(error => {
            expect(error.message).to.equal('not a valid token');
        })
    })
})
