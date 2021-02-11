import { IApiRequest } from './interfaces';
declare const apiRequest: (request: IApiRequest, accessToken?: string | undefined) => Promise<any>;
export default apiRequest;
