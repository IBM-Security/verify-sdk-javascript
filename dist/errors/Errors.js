"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeveloperError = exports.NotAvailableError = exports.InvalidOAuthConfigurationError = exports.AbstractMethodNotImplementedError = exports.VerifyError = void 0;
const enums_1 = require("../helpers/enums");
class VerifyError extends Error {
    constructor(name, message, errorStatus) {
        super();
        this.name = name || enums_1.EErrorNames.VerifyError;
        this.status = errorStatus;
        this.messageId = message && message.messageId || message && message.error;
        this.messageDescription = message && message.messageDescription || message && message.error_description;
        this.message = message;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, VerifyError);
        }
    }
}
exports.VerifyError = VerifyError;
class AbstractMethodNotImplementedError extends Error {
    constructor(...args) {
        super(...args);
        Error.captureStackTrace(this, AbstractMethodNotImplementedError);
    }
}
exports.AbstractMethodNotImplementedError = AbstractMethodNotImplementedError;
class InvalidOAuthConfigurationError extends Error {
    constructor(...args) {
        super(...args);
        Error.captureStackTrace(this, InvalidOAuthConfigurationError);
    }
}
exports.InvalidOAuthConfigurationError = InvalidOAuthConfigurationError;
class NotAvailableError extends Error {
    constructor(...args) {
        super(...args);
        Error.captureStackTrace(this, NotAvailableError);
    }
}
exports.NotAvailableError = NotAvailableError;
class DeveloperError extends Error {
    constructor(...args) {
        super(...args);
        Error.captureStackTrace(this, DeveloperError);
    }
}
exports.DeveloperError = DeveloperError;
//# sourceMappingURL=Errors.js.map