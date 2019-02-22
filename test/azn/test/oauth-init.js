let OAuthContext = require('../../../dist').OAuthContext;
let expect       = require('chai').expect;
let config       = require("./helper").config;

describe("OAuthContext - Instantiation", () => {

    it("Valid config", () => {
        let authClient = new OAuthContext(config);
        expect(authClient).to.exist;
    })

    it("No config - should throw 'Config parameter if required'", () => {
        expect(() => new OAuthContext()).to.throw('Config parameter is required');
    })

    it("No clientId - should throw 'clientId property is required'", () => {
        let data = {}

        expect(() => new OAuthContext(data)).to.throw('clientId property is required');
    })

    it("No tenantUrl - should throw 'Tenant URL is required'", () => {
        let data = {
            clientId: '123'
        }

        expect(() => new OAuthContext(data)).to.throw('Tenant URL is required');
    })

    it("No redirectUri - should throw 'A redirect URL is required'", () => {
        let data = {
            clientId : '123',
            tenantUrl: '123'
        }

        expect(() => new OAuthContext(data)).to.throw('A redirect URL is required');
    })

    it("No responseType - should throw 'Response Type required'", () => {
        let data = {
            clientId   : '123',
            tenantUrl  : '123',
            redirectUri: '123',
        }

        expect(() => new OAuthContext(data)).to.throw('Response Type required');
    })

    it("No scope - should throw 'scope Property not set in Config settings'", () => {
        let data = {
            clientId    : '123',
            tenantUrl   : '123',
            redirectUri : '123',
            responseType: '123'
        }

        expect(() => new OAuthContext(data)).to.throw('scope Property not set in Config settings');
    })

    it("flowType: AZN but no secret - should throw 'Client Secret is required for the AZN code flow'", () => {
        let data = {
            clientId    : '123',
            tenantUrl   : '123',
            redirectUri : '123',
            responseType: '123',
            flowType    : 'AZN',
            scope       : '123'
        }

        expect(() => new OAuthContext(data)).to.throw('Client Secret is required for the AZN code flow');
    })

    it("invalid flowType - should throw 'Check the flowType property in your configuration object is correct. Should be: 'Implicit' or 'AZN'", () => {
        let data = {
            clientId    : '123',
            tenantUrl   : '123',
            redirectUri : '123',
            responseType: '123',
            flowType    : 'incorrect',
            clientSecret: '123',
            scope       : '123'
        }

        expect(() => new OAuthContext(data)).to.throw('Check the flowType property in your configuration object is correct. Should be: "Implicit" or "AZN"');
    })

    it("implicit flowType and storageType - should throw 'Implicit flow not supported in Node'", () => {
        let data = {
            clientId    : '123',
            tenantUrl   : '123',
            redirectUri : '123',
            responseType: '123',
            flowType    : 'Implicit',
            storageType : 'sessionStorage',
            scope       : '123'
        }

        expect(() => new OAuthContext(data)).to.throw('Implicit flow not supported in Node');
    })

    it("implicit flowType no storageType - should throw 'Implicit flow not supported in Node'", () => {
        let data = {
            clientId    : '123',
            tenantUrl   : '123',
            redirectUri : '123',
            responseType: '123',
            flowType    : 'Implicit',
            scope       : '123'
        }

        expect(() => new OAuthContext(data)).to.throw('Implicit flow not supported in Node');
    })
})
