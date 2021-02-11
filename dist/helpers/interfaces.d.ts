interface ISDKConfig {
    DEFAULT_CLOCK_SKEW: number;
    HTTP_ERROR: string;
    OAUTH_CONTEXT_CONFIG_SETTINGS_ERROR: string;
    OAUTH_CONTEXT_API_ERROR: string;
    AUTHENTICATOR_CONTEXT_ERROR: string;
    TOKEN_ERROR: string;
    DEFAULT_POLLING_ATTEMPTS: number;
    DEFAULT_POLLING_DELAY: number;
}
interface IOAuthConfig {
    tenantUrl: string;
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    responseType: string;
    flowType: string;
    scope: string;
    storageType?: Storage;
    grantType?: string;
}
interface ITokenProps {
    access_token: string;
    refresh_token: string;
    expires_in: string | number;
    client_secret: string;
    client_id: string;
    scope: string;
    redirect_uri: string;
    grant_type: string;
}
interface IRequestData {
    client_id: string;
    client_secret: string;
    refresh_token: string;
    grant_type: string;
    scope?: string;
    token?: string;
}
interface IDeviceFlow extends ITokenProps {
    device_code: string;
}
interface IROPCFlow extends ITokenProps {
    username: string;
    password: string;
}
interface IResponse {
    response: any;
    token: IToken;
}
interface IApiRequest {
    method: string;
    url: string;
    contentType?: string;
    data: string | boolean | {
        [key: string]: any;
    };
    accept?: string;
}
interface IRequestHeaders {
    accept: string;
}
interface IError {
    messageId: string;
    messageDescription: string;
}
interface IToken {
    access_token: string;
    refresh_token: string;
    expires_in: string | number;
    [key: string]: string | number;
}
interface IUtils {
    randomString: (length: number) => string;
    dateString: (val: string) => string;
    isNode: () => boolean;
    isToken: (token: IToken) => boolean;
    sleep: (duration: number) => Promise<void>;
    isUrl: (url: string) => boolean;
}
interface IAuthenticatorInitPayload {
    owner: string;
    clientId: string;
    accountName: string;
    qrcodeInResponse: boolean;
}
interface IAuthenticatorVerify {
    originIpAddress: string;
    txMessage: string;
    originUserAgent: string;
    txAdditionalData: string;
    title: string;
    send: boolean;
    pushMessage: string;
    methodId: string;
    expires: number;
}
export { ITokenProps, IError, IDeviceFlow, IROPCFlow, IResponse, IRequestData, IApiRequest, IRequestHeaders, IToken, ISDKConfig, IOAuthConfig, IUtils, IAuthenticatorInitPayload, IAuthenticatorVerify };
