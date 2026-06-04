// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  backendEnvironment:"",
  production: true,
  hostURL: "https://www.mohawkxchange.com",
 //hostURL: "http://localhost:4200",
  baseUrl:
    "https://pubprd.virtualservices.mohawkind.com/SOAP105/vPUB.MHK.COMMCLOUD.OCC.Custom.svc/us_b2b_commercial/",
  baseAPIURl:
    "https://pubprd.virtualservices.mohawkind.com/SOAP105/vPUB.MHK.COMMCLOUD.OCC.Custom.svc/",
  baseASMAPIURl:
     "https://api.cjjsup9vs1-mohawkcar2-p1-public.model-t.cc.commerce.ondemand.com/",
  baseBloomreachAPIURl:
    "https://staging-cmsapi.mohawkind.com/site/rest/xchange/",
  virtualServicesAddressValidate:
    "https://pubprd.virtualservices.mohawkind.com/SOAP105/vPUB.MHK.CREST.xchange.ABAP.svc",
  onDemand: {
    baseUrl:
      "https://api.cjjsup9vs1-mohawkcar2-p1-public.model-t.cc.commerce.ondemand.com",
    // apiUser: '/services/v2/pergo/users/',
    refreshAuth:
      "/authorizationserver/oauth/token?client_id=sso-client&client_secret=secret&grant_type=refresh_token",
    apiAuth:
      "/authorizationserver/oauth/token?client_id=sso-client&client_secret=secret&grant_type=sso",
    // apiForgotPwd: '/services/v2/pergo/forgottenpasswordtokens?userId=',
    // apiResetPwd: '/services/v2/pergo/resetpassword',
    // apiVerifyEmail: '/api/v1/authentication/validate/',
    clientId: "occ_prodUser",
    secret: "MAnZ7xRNx2Wof0y",
    type: "client_credentials",
    grant_types: {
      client: "client_credentials",
      refresh: "refresh_token",
      password: "password",
    },
  },
  earningsStatementUrl:
    "https://prd.virtualservices.mohawkind.com/SOAT302/vEXT.MHK.eMPower.DealerEarningsStatements.svc",
  aptCheckBaseUrl:
    "https://pubprd.virtualservices.mohawkind.com/SOAP105/vPUB.MHK.COMMCLOUD.OCC.Custom.svc/",
  addressValidationClientId: "eMpower_hybris",
  addressValidationSecret: "Gr3@tJo8!",
  sendEmail: 'https://mohawkmailcdp.azurewebsites.net/email',
  sentinentURL:'https://pubprd.virtualservices.mohawkind.com/SOAQ405/vPUB.MHK.COMMCLOUD.OCC.Custom.svc',
  sentinentUser:'eMpower_hybris',
  sentinentPwd:'Gr3@tJo8!',
  openAM:"https://ssoexternal.mohawkind.com/proxy/OIDCintermediate.jsp?RelayState=",
  openAmRedirect:"https://ssoexternal.mohawkind.com/proxy/XUI/?realm=connector&ForceAuth=true&service=Azure_oidc&goto=",
  openAMForgot:"https://ssoexternal.mohawkind.com/proxy/mhkws/mhkapi/resetPassword/",
  s4SourceInvoice: "https://pubprd.virtualservices.mohawkind.com/SOAP105/vPUB.MHK.EXT.OpenText.BusinessWorkspace.svc/nodes",
  camsSourceInvoice: "https://pubprd.virtualservices.mohawkind.com/SOAP105/vPUB.MHK.eMPower.GetCAMSInvoicePDF.svc",
  attachmentDownloadUser: "eMpower_hybris",
  attachmentDownloadPwd: "Gr3@tJo8!",
  powerbiEmbedUrl: "https://app.powerbi.com/reportEmbed?reportId=fc13aa4b-0e50-4202-9c48-e6c2e6c231b3&groupId=726b1166-a91b-41cc-b228-120637923d73",
  powerbiReportId: "fc13aa4b-0e50-4202-9c48-e6c2e6c231b3",
  msalToken: "https://pubprd.virtualservices.mohawkind.com/SOAP105/vPUB.MHK.PowerBI.Auth.svc/groups/726b1166-a91b-41cc-b228-120637923d73/reports/fc13aa4b-0e50-4202-9c48-e6c2e6c231b3/GenerateToken",
  pdfPath:"https://mohawkdirectory.blob.core.windows.net/crest-prod-spec/xchange/",
  CAMSOrdersDetails: "https://pubprd.virtualservices.mohawkind.com/SOAP105/vPUB.MHK.CREST.CAMSCGI2.REST.svc?ENTITY=TRANSID&ENV=CRESTPROD",
  getXchangeInventoryStatus: "https://prd-crestpim-api.azurewebsites.net/api/GetXchangeInventoryStatus",
  mohawkToday: "https://ssoexternal.mohawkind.com/proxy/XUI/?goto=https%3A%2F%2Fmohawktoday.com%2Fauthomatic-handler%2Fxchange&ForceAuth=true&realm=connector&service=Azure_oidc&authIndexType=service&authIndexValue=Azure_oidc&client_id=OIDC_Prod&redirect_uri=https%3A%2F%2Fmohawktoday.com%2Fauthomatic-handler%2Fxchange&scope=openid&state=&response_type=code#login/",
  updateOrderPS: "https://ps-tools.azurewebsites.net/api/xchgUpdateOrder",
  addNewLinePS: "https://ps-tools.azurewebsites.net/api/xchgAddNewLine",
  viewOrderUpdatesPS: "https://ps-tools.azurewebsites.net/api/xchgViewOrderUpdates",
  cancelOrderOrLinePS: "https://ps-tools.azurewebsites.net/api/xchgCancelOrderOrLine",
  addressReqHistoryPS:"https://ps-tools-dev.azurewebsites.net/api/xchgAddressReqHistory"
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.