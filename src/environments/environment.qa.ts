// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  backendEnvironment:"TESTING (TS5)",
  production: false,
  hostURL: "https://qa-alpha.mohawkxchange.com",
  baseUrl:
     "https://pubqas.virtualservices.mohawkind.com/SOAQ405/vPUB.MHKSand.COMMCLOUD.OCC.Custom.svc/us_b2b_commercial/",
  baseAPIURl:
    "https://pubqas.virtualservices.mohawkind.com/SOAQ405/vPUB.MHKSand.COMMCLOUD.OCC.Custom.svc/",
  baseASMAPIURl:
     "https://api.cjjsup9vs1-mohawkcar2-s1-public.model-t.cc.commerce.ondemand.com/",
  baseBloomreachAPIURl:
    "https://staging-cmsapi.mohawkind.com/site/rest/xchange/",
  virtualServicesAddressValidate:
    "https://pubqas.virtualservices.mohawkind.com/SOAQ405/vPUB.MHK.CREST.xchange.ABAP.svc/Z_XPS_ADDRVAL_SRV/ADDR_VALIDATESet",
  onDemand: {
    baseUrl:
      "https://api.cjjsup9vs1-mohawkcar2-s1-public.model-t.cc.commerce.ondemand.com",
    // apiUser: '/services/v2/pergo/users/',
    refreshAuth:
      "/authorizationserver/oauth/token?client_id=sso-client&client_secret=secret&grant_type=refresh_token",
    apiAuth:
      "/authorizationserver/oauth/token?client_id=sso-client&client_secret=secret&grant_type=sso",
    // apiForgotPwd: '/services/v2/pergo/forgottenpasswordtokens?userId=',
    // apiResetPwd: '/services/v2/pergo/resetpassword',
    // apiVerifyEmail: '/api/v1/authentication/validate/',
    clientId: "occ_testUser",
    secret: "Mohawk@123",
    type: "client_credentials",
    grant_types: {
      client: "client_credentials",
      refresh: "refresh_token",
      password: "password",
    },
  },
  earningsStatementUrl:
    "https://tst.virtualservices.mohawkind.com/SOAT302/vEXT.MHK.eMPower.DealerEarningsStatements.svc",
  aptCheckBaseUrl:
       "https://pubqas.virtualservices.mohawkind.com/SOAQ405/vPUB.MHKSand.COMMCLOUD.OCC.Custom.svc/",
  addressValidationClientId: "eMpower_hybris",
  addressValidationSecret: "Gr3@tJo8!",
  sendEmail: 'https://mohawkmailcdp.azurewebsites.net/email',
  sentinentURL:'https://pubqas.virtualservices.mohawkind.com/SOAQ405/vPUB.MHK.COMMCLOUD.OCC.Custom.svc',
  sentinentUser:'eMpower_hybris',
  sentinentPwd:'Gr3@tJo8!',
  openAM:"https://ssoproxytst.mohawkind.com/proxy/OIDCintermediate.jsp?RelayState=",
  openAmRedirect:"https://ssoproxytst.mohawkind.com/proxy/XUI/?realm=connector&ForceAuth=true&service=Azure_oidc&goto=",
  openAMForgot:"https://ssoproxytst.mohawkind.com/proxy/mhkws/mhkapi/resetPassword/",
  s4SourceInvoice: "https://pubqas.virtualservices.mohawkind.com/SOAQ405/vPUB.MHK.EXT.OpenText.BusinessWorkspace.svc/nodes",
  attachmentDownloadUser: "MHK_OPENTEXT",
  attachmentDownloadPwd: "YpPqn}gMi2gMo4QW5WbaG1,25%.*wY.aqY]!~",
  camsSourceInvoice: "https://pubtst.virtualservices.mohawkind.com/SOAT305Cloud/vPUB.MHK.eMPower.GetCAMSInvoicePDF.svc",
  powerbiEmbedUrl: "https://app.powerbi.com/reportEmbed?reportId=9bf5e9f2-e449-4460-a5b2-c2add862e4ef&groupId=40a64b47-7f49-4768-b247-728bbdc89016",
  powerbiReportId: "9bf5e9f2-e449-4460-a5b2-c2add862e4ef",
  msalToken: "https://pubqas.virtualservices.mohawkind.com/SOAQ405/vPUB.MHK.PowerBI.Auth.svc/groups/40a64b47-7f49-4768-b247-728bbdc89016/reports/9bf5e9f2-e449-4460-a5b2-c2add862e4ef/GenerateToken",
  pdfPath:"https://mohawkdirectory.blob.core.windows.net/crest-prod-spec/xchange/",
  CAMSOrdersDetails: "https://pubqas.virtualservices.mohawkind.com/SOAQ405/vMHK.CREST.Ecommerce.CAMSCGI2.REST.svc",
  getXchangeInventoryStatus: "https://qa-crestpim-api.azurewebsites.net/api/GetXchangeInventoryStatus",
  mohawkToday: "https://ssoproxytst.mohawkind.com/proxy/XUI/?goto=https://mt55.mohawktoday.com%2Fauthomatic-handler%2Fxchange&ForceAuth=true&realm=connector&service=Azure_oidc&authIndexType=service&authIndexValue=Azure_oidc&client_id=OIDC_Prod&redirect_uri=https://mt55.mohawktoday.com%2Fauthomatic-handler%2Fxchange&scope=openid&state=&response_type=code#login/",
  updateOrderPS: "https://ps-tools-dev.azurewebsites.net/api/xchgUpdateOrder",
  addNewLinePS: "https://ps-tools-dev.azurewebsites.net/api/xchgAddNewLine",
  viewOrderUpdatesPS: "https://ps-tools-dev.azurewebsites.net/api/xchgViewOrderUpdates",
  cancelOrderOrLinePS: "https://ps-tools-dev.azurewebsites.net/api/xchgCancelOrderOrLine",
  addressReqHistoryPS:"https://ps-tools-dev.azurewebsites.net/api/xchgAddressReqHistory"
  // "https://mt55.mohawktoday.com/"
  // https://ssoexternal.mohawkind.com/proxy?goto=https%3A%2F%2Fmohawktoday.com%2Fauthomatic-handler%2Fxchange&ForceAuth=true&realm=connector&service=Azure_oidc&authIndexType=service&authIndexValue=Azure_oidc&client_id=OIDC_Prod&redirect_uri=https%3A%2F%2Fmohawktoday.com%2Fauthomatic-handler%2Fxchange&scope=openid&state=&response_type=code

};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
