// import { IErrorMessage } from './interfaces';

import { EErrorNames } from '../helpers/enums';

class VerifyError extends Error {
	status: any;
	messageId: any;
	messageDescription: any;
	message: any;

	constructor(name: string, message?: any, errorStatus?: string) {
		super();
		this.name = name || EErrorNames.VerifyError;
		this.status = errorStatus;
		this.messageId = message && message.messageId || message && message.error;
		this.messageDescription = message && message.messageDescription || message &&message.error_description;
		this.message = message;

		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, VerifyError);
		}
	}
}
class AbstractMethodNotImplementedError extends Error {
	constructor(...args: any) {
		super(...args);
		Error.captureStackTrace(this, AbstractMethodNotImplementedError);
	}
}

class InvalidOAuthConfigurationError extends Error {
	constructor(...args: any) {
		super(...args);
		Error.captureStackTrace(this, InvalidOAuthConfigurationError);
	}
}

class NotAvailableError extends Error {
	constructor(...args: any) {
		super(...args);
		Error.captureStackTrace(this, NotAvailableError);
	}
}

class DeveloperError extends Error {
	constructor(...args: any) {
		super(...args);
		Error.captureStackTrace(this, DeveloperError);
	}
}

export {VerifyError, AbstractMethodNotImplementedError, InvalidOAuthConfigurationError, NotAvailableError, DeveloperError};

