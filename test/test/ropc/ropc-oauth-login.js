let OAuthContext = require('../../../dist').OAuthContext;
let expect = require('chai').expect;
let config = require('./helper').config;

let authClient;

describe("OAuthContext(ROPC) - login()", () => {
    before(() => {
        authClient = new OAuthContext(config);
    })

    if (process.env.REAL_TENANT === 'true') {
        it("Login returns response", async () => {
            let response = await authClient.login(config.username, config.password);
            expect(response).to.not.be.null;
        })
    } else {
        it("Login with credentials returns access token", () => {
            return authClient.login(config.username, config.password).then(response => {
                expect(response.access_token).to.exist;
            }).catch(error => {
                expect(error).to.not.exist;
            })
        })

        it("Login with no credentials returns error", () => {
            return authClient.login().then(response => {
                expect(response).to.not.exist;
            }).catch(error => {
                expect(error.message).to.equal('username and password params are required');
                // expect(error.status).to.equal(400)
            })
        })
    }

})
