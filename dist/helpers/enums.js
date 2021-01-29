"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERequestHeaders = exports.EFlowTypes = exports.EMethods = exports.ETokens = exports.EGrantTypes = exports.EErrorNames = void 0;
var EFlowTypes;
(function (EFlowTypes) {
    EFlowTypes["ImplicitFlow"] = "implicit";
    EFlowTypes["AuthoriztionCodeFlow"] = "authorization";
    EFlowTypes["DeviceFlow"] = "device";
    EFlowTypes["ROPCFlow"] = "ropc";
    EFlowTypes["Password"] = "password";
})(EFlowTypes || (EFlowTypes = {}));
exports.EFlowTypes = EFlowTypes;
var EGrantTypes;
(function (EGrantTypes) {
    EGrantTypes["Device"] = "urn:ietf:params:oauth:grant-type:device_code";
    EGrantTypes["Authorization_Grant_Type"] = "authorization_code";
    EGrantTypes["ROPC"] = "password";
})(EGrantTypes || (EGrantTypes = {}));
exports.EGrantTypes = EGrantTypes;
var ETokens;
(function (ETokens) {
    ETokens["AccessToken"] = "access_token";
    ETokens["RefreshToken"] = "refresh_token";
    ETokens["ExpiredToken"] = "expired_token";
})(ETokens || (ETokens = {}));
exports.ETokens = ETokens;
var EMethods;
(function (EMethods) {
    EMethods["POST"] = "POST";
    EMethods["GET"] = "GET";
    EMethods["PUT"] = "PUT";
    EMethods["PATCH"] = "PATCH";
    EMethods["DELETE"] = "DELETE";
})(EMethods || (EMethods = {}));
exports.EMethods = EMethods;
var ERequestHeaders;
(function (ERequestHeaders) {
    ERequestHeaders["ImagePNG"] = "image/png";
})(ERequestHeaders || (ERequestHeaders = {}));
exports.ERequestHeaders = ERequestHeaders;
var EErrorNames;
(function (EErrorNames) {
    EErrorNames["VerifyError"] = "Verify error";
    EErrorNames["DeveloperError"] = "Developer error";
})(EErrorNames || (EErrorNames = {}));
exports.EErrorNames = EErrorNames;
//# sourceMappingURL=enums.js.map