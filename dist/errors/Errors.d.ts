declare class VerifyError extends Error {
    status: any;
    messageId: any;
    messageDescription: any;
    message: any;
    constructor(name: string, message?: any, errorStatus?: string);
}
declare class AbstractMethodNotImplementedError extends Error {
    constructor(...args: any);
}
declare class InvalidOAuthConfigurationError extends Error {
    constructor(...args: any);
}
declare class NotAvailableError extends Error {
    constructor(...args: any);
}
declare class DeveloperError extends Error {
    constructor(...args: any);
}
export { VerifyError, AbstractMethodNotImplementedError, InvalidOAuthConfigurationError, NotAvailableError, DeveloperError };
