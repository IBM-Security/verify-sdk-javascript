let OAuthContext = require('../../../dist').OAuthContext;
let expect = require('chai').expect;
let config = require('./helper').config;

describe("OAuthContext(AZN) - Instantiation", () => {

    it("Valid config", () => {
        let authClient = new OAuthContext(config);
        expect(authClient).to.exist;
    });

    it("No config - should throw 'Config parameter if required'", () => {
        expect(() => new OAuthContext()).to.throw('Config parameter is required');
    });

    it("No flowType - should throw 'flowType property is required in config settings'", () => {
        let data = {
            flowType: undefined
        };

        expect(() => new OAuthContext(data)).to.throw('flowType property is required in config settings')
    });

    it("No clientId - should throw 'clientId property is required in config settings'", () => {
        let data = {
            flowType: 'authorization'
        };

        expect(() => new OAuthContext(data)).to.throw('clientId property is required in config settings');
    });

    it("No tenantUrl - should throw 'tenantUrl property is required in config settings'", () => {
        let data = {
            flowType: 'authorization',
            clientId: '123'
        };

        expect(() => new OAuthContext(data)).to.throw('tenantUrl property is required in config settings');
    });

    it("No redirectUri - should throw 'redirectUri property is required in config settings'", () => {
        let data = {
            clientId: '123',
            tenantUrl: 'http://123',
            scope: '123',
            flowType: 'authorization',
            clientSecret: '123'
        };

        expect(() => new OAuthContext(data)).to.throw('redirectUri property is required in config settings');
    });

    it("No responseType - should throw 'responseType property is required in config settings'", () => {
        let data = {
            clientId: '123',
            tenantUrl: 'http://123',
            redirectUri: 'http://123',
            scope: '123',
            flowType: 'authorization',
            clientSecret: '123'
        };

        expect(() => new OAuthContext(data)).to.throw('responseType property is required in config settings');
    });

    it("No scope - should throw 'scope property is required in config settings'", () => {
        let data = {
            clientId: '123',
            tenantUrl: 'http://123',
            redirectUri: 'http://123',
            responseType: '123',
            flowType: 'authorization',
            clientSecret: '123'
        };

        expect(() => new OAuthContext(data)).to.throw('scope property is required in config settings');
    });

    it("invalid flowType - should throw '\"incorrect\" flowType not valid. Valid flow types are:  \"implicit\", \"authorization\", \"urn:ietf:params:oauth:grant-type:device_code\", \"password\"", () => {
        let data = {
            clientId: '123',
            tenantUrl: 'http://123',
            redirectUri: '123',
            responseType: '123',
            flowType: 'incorrect',
            clientSecret: '123',
            scope: '123'
        };

        expect(() => new OAuthContext(data)).to.throw(`"${data.flowType}" flowType not valid. Valid flow types are:  "implicit", "authorization", "device", "ropc"`);
    });

    it("implicit flowType and storageType - should throw 'Implicit flow is not supported in Node'", () => {
        let data = {
            clientId: '123',
            tenantUrl: 'http://123',
            redirectUri: '123',
            responseType: '123',
            flowType: 'implicit',
            storageType: 'sessionStorage',
            scope: '123'
        };

        expect(() => new OAuthContext(data)).to.throw('Implicit flow is not supported in Node');
    });

    it("implicit flowType no storageType - should throw 'Implicit flow is not supported in Node'", () => {
        let data = {
            clientId: '123',
            tenantUrl: 'http://123',
            redirectUri: '123',
            responseType: '123',
            flowType: 'implicit',
            scope: '123'
        };

        expect(() => new OAuthContext(data)).to.throw('Implicit flow is not supported in Node');
    })
});
