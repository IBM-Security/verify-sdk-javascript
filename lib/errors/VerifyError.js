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

export default VerifyError;
