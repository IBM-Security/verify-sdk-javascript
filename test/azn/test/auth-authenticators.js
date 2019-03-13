let OAuthContext         = require('../../../dist').OAuthContext;
let AuthenticatorContext = require('../../../dist').AuthenticatorContext;
let expect               = require('chai').expect;
let config               = require('./helper').config;
let token                = require('./helper').token;

let authClient;
let authCtx;

describe("AuthenticatorContext - authenticators()", () => {
    before( () => {
        authClient = new OAuthContext(config);
        authCtx    = new AuthenticatorContext(authClient);
    })

    it("valid params - checks if 'authenticators[0].owner' exists", () => {
        return authCtx.authenticators(token).then(response => {
            expect(response.response.authenticators[0].owner).to.exist;
        }).catch(error => {
            console.log(JSON.stringify(error));
            expect(error).to.not.exist;
        })
    });

    it("without token - should throw error 'not a valid token'", () => {
        return authCtx.authenticators(token).then(response => {
            expect(response.response.authenticators[0].owner).to.exist;
        }).catch(error => {
            console.log(JSON.stringify(error));
            expect(error.message).to.equal('not a valid token');
        })
    });

    it("with invalid token (empty object) - should throw error 'not a valid token'", () => {
        return authCtx.authenticators({}).then(response => {
            expect(response.response.to.not.exist);
        }).catch(error => {
            expect(error.message).to.equal('not a valid token');
        })
    });
})
