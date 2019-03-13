let OAuthContext = require('../../../dist').OAuthContext;
let expect       = require('chai').expect;
let config       = require('./helper').config;
let callback     = require('./helper').callback;

let authClient;

describe("OAuthContext - getToken()", () => {
    before( () => {
        authClient = new OAuthContext(config);
    });

    if (process.env.REAL_TENANT === 'false') {
        it("valid callback url", () => {
            return authClient.getToken(callback).then(response => {
                expect(response.access_token).to.exist;
            }).catch(error => {
                console.log(JSON.stringify(error));
                expect(error).to.not.exist;
            });
        });
    }

    it("no callback url - should throw error 'Params are required' Error", () => {
        expect(() => authClient.getToken()).to.throw('getToken(params), Params are required');
    });
})
