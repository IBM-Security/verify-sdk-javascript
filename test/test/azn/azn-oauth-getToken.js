let OAuthContext = require('../../../dist').OAuthContext;
let utils = require('../../../dist').utils;
let expect = require('chai').expect;
let sinon = require('sinon');
let config = require('./helper').config;
let tokenParams = require('./helper').callback;

let authClient;

describe("OAuthContext(AZN) - getToken()", () => {
    before(() => {
        authClient = new OAuthContext(config);
    });

    if (process.env.REAL_TENANT === 'false') {
        it("valid token params should return access token", () => {
            return authClient.getToken(tokenParams).then(response => {
                expect(response.access_token).to.exist;
            }).catch(error => {
                expect(error).to.not.exist;
            });
        });
    }

    it("no callback url - should throw error 'Params are required' Error", () => {
        expect(() => authClient.getToken()).to.throw('getToken(params), Params are required');
    });

    describe("incorrect data type - should throw error 'Params must contain string' Error", () => {
        let data = [[], 10, [{ data: '' }]];
        data.forEach(value => {
            it(`incorrect data type ${JSON.stringify(value)} - should throw error 'getToken(params), Params must contain data object or query string' Error`, () => {
                expect(() => authClient.getToken(value)).to.throw('getToken(params), Params must contain data object or query string');
            })
        })
    })
})
