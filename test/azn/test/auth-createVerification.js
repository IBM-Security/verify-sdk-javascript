let OAuthContext         = require('../../../dist').OAuthContext;
let AuthenticatorContext = require('../../../dist').AuthenticatorContext;
let expect               = require('chai').expect;
let config               = require('./helper').config;
let token                = require('./helper').token;
let authenticatorId      = require('./helper').authenticatorId;
let methodId             = require('./helper').methodId;

let authClient;
let authCtx;

describe("AuthenticatorContext - createVerification()", () => {
    before( () => {
        authClient = new OAuthContext(config);
        authCtx    = new AuthenticatorContext(authClient);
    });

    it("Valid params - checks that response.state exists", () => {

        // does nothing when using mock server
        let formData = {
            send    : "true",
            methodId: methodId
        };

        return authCtx.createVerification(authenticatorId, formData, token).then(response => {
            expect(response.response.state).to.exist;
            // update global variable for use with e2e testing
            global.verificationId = response.response.id;
        }).catch(error => {
            console.log(JSON.stringify(error));
            expect(error).to.not.exist;
        });
    });

    it("No authenticatorId - should throw 'createVerification(authenticatorId, formData, token), 3 parameters are required 2 were given'", () => {
        let formData = {
            send    : "true",
            methodId: methodId
        };

        return authCtx.createVerification(formData, token).then(response => {
            expect(response).to.not.exist;
        }).catch(error => {
            expect(error.message).to.equal('createVerification(authenticatorId, formData, token), 3 parameters are required 2 were given');
        });
    });

    it("No formData - should throw 'formData is a required parameter'", () => {
        return authCtx.createVerification(authenticatorId, null, token).then(response => {
            expect(response).to.not.exist;
        }).catch(error => {
            expect(error.message).to.equal('formData is a required parameter');
        });
    });

    it("No token - should throw 'createVerification(authenticatorId, formData, token), 3 parameters are required 2 were given'", () => {
        let formData = {
            send    : "true",
            methodId: methodId
        };

        return authCtx.createVerification(formData, token).then(response => {
            expect(response).to.not.exist;
        }).catch(error => {
            expect(error.message).to.equal('createVerification(authenticatorId, formData, token), 3 parameters are required 2 were given');
        });
    });

    it("Null token - should throw 'not a valid token'", () => {
        let formData = {
            send: "true",
            methodId: methodId
        };

        return authCtx.createVerification(authenticatorId, formData, null).then(response => {
            expect(response).to.not.exist;
        }).catch(error => {
            expect(error.message).to.equal('not a valid token');
        });
    });

    it("Invalid token (empty object) - should throw 'not a valid token'", () => {
        let formData = {
            send    : "true",
            methodId: methodId
        };

        return authCtx.createVerification(authenticatorId, formData, {}).then(response => {
            expect(response).to.not.exist;
        }).catch(error => {
            expect(error.message).to.equal('not a valid token');
        });
    });
});
