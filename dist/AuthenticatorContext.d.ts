import { IApiRequest, IAuthenticatorInitPayload, IAuthenticatorVerify, IToken } from './helpers/interfaces';
declare class AuthenticatorContext {
    oauth: any;
    config: any;
    token: any;
    constructor(oauth: any);
    _fetchToken(): any;
    _isAuthenticated(token: IToken): any;
    _handleResponse(options: IApiRequest, token: IToken): any;
    authenticators(tokenObj: IToken): Promise<any>;
    initiateAuthenticator(dataObj: IAuthenticatorInitPayload, tokenObj: IToken): any;
    createVerification(authenticatorId: string, formData: IAuthenticatorVerify, tokenObj: IToken): any;
    viewVerifications(authenticatorId: string, tokenObj: IToken): Promise<any>;
    viewVerification(authenticatorId: string, transactionId: string, tokenObj: IToken): any;
    pollVerification(authenticatorId: string, transactionId: string, tokenObj: IToken, delay: number, attempts: number): Promise<any>;
    enabled(authenticatorId: string, enabled: boolean, tokenObj: IToken): any;
    deleteAuthenticator(authenticatorId: string, tokenObj: IToken): any;
    methodEnabled(id: string, enabled: boolean, tokenObj: IToken): any;
    methods(authenticatorId: string, tokenObj: IToken): any;
}
export default AuthenticatorContext;
