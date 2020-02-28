let OAuthContext = require('../../../dist').OAuthContext;
let expect       = require('chai').expect;
let qs           = require('query-string');
let config       = require('./helper').config;
let token        = require('./helper').token;

let authClient;

describe("OAuthContext(AZN) - handleResponse()", () => {
    before(() => {
        authClient = new OAuthContext(config);
    })

    it("no arguments - should throw 'handleResponse(options, token), 2 parameters are required 0 were given' Error", () => {
        return authClient.handleResponse().then(response => {
            expect(response).to.not.exist;
        }).catch(error => {
            expect(error.message).to.equal('handleResponse(options, token), 2 parameters are required 0 were given');
        })
    })

    it("1 argument - should throw 'handleResponse(options, token), 2 parameters are required 1 were given' Error ", () => {
        let options = {};
        return authClient.handleResponse(options).then(response => {
            expect(response).to.not.exist;
        }).catch(error => {
            expect(error.message).to.equal('handleResponse(options, token), 2 parameters are required 1 were given');
        })
    })

    it("invalid token - should throw 'Token parameter is not a valid token' Error", () => {
        let options = {};
        return authClient.handleResponse(options, null).then(response => {
            expect(response).to.not.exist;
        }).catch(error => {
            expect(error.message).to.equal('Token parameter is not a valid token');
        })
    })

    it("valid options and token - should return valid response", () => {
        let options = {
            method: 'POST',
            url: `${config.tenantUrl}/v1.0/endpoint/default/introspect`,
            contentType: 'application/x-www-form-urlencoded',
            data: qs.stringify({
                client_id: config.clientId,
                client_secret: config.clientSecret,
                token: token.access_token
            })
        };

        return authClient.handleResponse(options, token).then(response => {
            expect(response).to.include.all.keys('response', 'token');
        }).catch(error => {
            expect(error).to.not.exist;
        })

    })
})
