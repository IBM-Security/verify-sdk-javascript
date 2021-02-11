declare enum EFlowTypes {
    ImplicitFlow = "implicit",
    AuthoriztionCodeFlow = "authorization",
    DeviceFlow = "device",
    ROPCFlow = "ropc",
    Password = "password"
}
declare enum EGrantTypes {
    Device = "urn:ietf:params:oauth:grant-type:device_code",
    Authorization_Grant_Type = "authorization_code",
    ROPC = "password"
}
declare enum ETokens {
    AccessToken = "access_token",
    RefreshToken = "refresh_token",
    ExpiredToken = "expired_token"
}
declare enum EMethods {
    POST = "POST",
    GET = "GET",
    PUT = "PUT",
    PATCH = "PATCH",
    DELETE = "DELETE"
}
declare enum ERequestHeaders {
    ImagePNG = "image/png"
}
declare enum EErrorNames {
    VerifyError = "Verify error",
    DeveloperError = "Developer error"
}
export { EErrorNames, EGrantTypes, ETokens, EMethods, EFlowTypes, ERequestHeaders };
