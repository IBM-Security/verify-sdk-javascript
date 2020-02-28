class VerifyError extends Error {
	constructor(name, message, errorStatus) {
		super();
		this.name = name || 'Verify Error';
		this.status = errorStatus;
		this.messageId = message.messageId || message.error;
		this.messageDescription = message.messageDescription || message.error_description;
		this.message = message;

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, VerifyError);
		}
	}
}
class AbstractMethodNotImplementedError extends Error {
	constructor(...args) {
		super(...args);
		Error.captureStackTrace(this, AbstractMethodNotImplementedError);
	}
}

class InvalidOAuthConfigurationError extends Error {
	constructor(...args) {
		super(...args);
		Error.captureStackTrace(this, InvalidOAuthConfigurationError);
	}
}

class NotAvailableError extends Error {
	constructor(...args) {
		super(...args);
		Error.captureStackTrace(this, NotAvailableError);
	}
}

class DeveloperError extends Error {
	constructor(...args) {
		super(...args);
		Error.captureStackTrace(this, DeveloperError);
	}
}

module.exports = {VerifyError, AbstractMethodNotImplementedError, InvalidOAuthConfigurationError, NotAvailableError, DeveloperError};

