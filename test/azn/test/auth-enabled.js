let OAuthContext         = require('../../../dist').OAuthContext;
let AuthenticatorContext = require('../../../dist').AuthenticatorContext;
let expect               = require('chai').expect;
let config               = require('./helper').config;
let token                = require('./helper').token;
let authenticatorId      = require('./helper').authenticatorId;

let authClient;
let authCtx;

describe("AuthenticatorContext - enabled()", () => {
    before( () => {
        authClient = new OAuthContext(config);
        authCtx    = new AuthenticatorContext(authClient);
    });

    it("valid params - should have a response status of 204", () => {
        return authCtx.enabled(authenticatorId, true, token).then(response => {
            expect(response.response.status).to.equal(204);
        }).catch(error => {
            console.log(JSON.stringify(error));
            expect(error).to.not.exist;
        });
    });

    it("no token - should throw 'enabled(authenticatorId, enabled, token), 3 parameters are required 2 were given'", () => {
        return authCtx.enabled(authenticatorId, true).then(response => {
            expect(response).to.not.exist;
        }).catch(error => {
            expect(error.message).to.equal('enabled(authenticatorId, enabled, token), 3 parameters are required 2 were given');
        });
    });

    it("invalid token (empty object) - should throw error 'not a valid token'", () => {
        return authCtx.enabled(authenticatorId, true, {}).then(response => {
            expect(response).to.not.exist;
        }).catch(error => {
            expect(error.message).to.equal('not a valid token');
        });
    });
});
