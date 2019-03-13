let OAuthContext         = require('../../../dist').OAuthContext;
let AuthenticatorContext = require('../../../dist').AuthenticatorContext;
let expect               = require('chai').expect;
let config               = require('./helper').config;
let token                = require('./helper').token;
let authenticatorId      = require('./helper').authenticatorId;

let authClient;
let authCtx;

const path = require('path');
require('dotenv').config({path: path.resolve(__dirname, '../.env')});

describe("AuthenticatorContext - deleteAuthenticator()", () => {
    before( () => {
        authClient = new OAuthContext(config);
        authCtx    = new AuthenticatorContext(authClient);
    })

    if (process.env.DELETE_AUTHENTICATOR === 'true') {
        it("valid params - response.status should be 204", () => {
            return authCtx.deleteAuthenticator(authenticatorId, token).then(response => {
                expect(response.response.status).to.equal(204);
            }).catch(error => {
                console.log(JSON.stringify(error));
                expect(error).to.not.exist;
            })
        })
    }


    it("no token - should throw 'deleteAuthenticator(authenticatorId, token), 2 parameters are required 1 were given'", () => {
        return authCtx.deleteAuthenticator(authenticatorId).then(response => {
            expect(response).to.not.exist;
        }).catch(error => {
            expect(error.message).to.equal('deleteAuthenticator(authenticatorId, token), 2 parameters are required 1 were given');
        })
    })

    it("invalid token (empty object) - should thrown error 'not a valid token'", () => {
        return authCtx.deleteAuthenticator(authenticatorId, {}).then(response => {
            expect(response).to.not.exist;
        }).catch(error => {
            expect(error.message).to.equal('not a valid token');
        })
    })
})
