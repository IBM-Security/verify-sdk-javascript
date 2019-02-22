const optionalTests = require('./helper').optionalTests;

let message = "Use this space to provide some additional info";

describe(message, () => {

    describe("Environment Variables", () => {

        for (test in optionalTests) {

            it(test + ": " + optionalTests[test], () => {

            })
        }

        it("REAL_TENANT: " + process.env.REAL_TENANT, () => {

        })
    })
})
