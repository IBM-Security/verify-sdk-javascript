let OAuthContext = require('../../../dist').OAuthContext;
let expect       = require('chai').expect;
let sinon        = require('sinon');
let config       = require('./helper').config;
let deviceCode   = require('./helper').deviceCode;

let authClient;
let spy;

describe("OAuthContext(Device) - pollTokenApi()", () => {
    before(() => {
        authClient = new OAuthContext(config);
        spy = sinon.spy(authClient, "getToken")
    })

    beforeEach(() => {
        spy.resetHistory()
    })

    it("valid device code should call getToken and return response", () => {
        return authClient.pollTokenApi(deviceCode).then(response => {
                        expect(response).to.exist;
        }).catch(error => {
            expect(error.messageId).to.equal('authorization_pending')
        })
    })

    it("no device code - should throw error 'No device code value provided.' Error", () => {
            return authClient.pollTokenApi('', 5000)
            .then((response) => {
                expect(response).to.not.exist;
            })
            .catch((error) => {
                expect(error.message).to.equal('No device code value provided.');
            })
    });
})
