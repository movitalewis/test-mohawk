export interface User {
  accountList: string;
  active: boolean;
  confirmPassword: string;
  displayUid: string;
  email: string;
  extension: string;
  fax: string;
  firstName: string;
  jobTitle: string;
  lastName: string;
  mobilePhone: string;
  notificationData: NotificationData;
  password: string;
  primaryRole: string;
  selectedSuffixAccounts: string;
  storeLocationCode: string;
  titleCode: string;
  uid: string;
  userPermissions: string[];
  workPhone: string;
}

export interface Account {
  account: number,
  division: string,
  active: boolean,
  allowSales?: boolean
}

interface OrgUnit {
  active: boolean;
  name: string;
  uid: string;
}

interface CostCenter {
  active: boolean;
  activeFlag: boolean;
  code: string;
  currency: Currency;
  name: string;
  originalCode: string;
}

interface Currency {
  active: boolean;
  isocode: string;
  name: string;
  symbol: string;
}

interface ApprovalProcess {
  code: string;
  name: string;
}

interface Address {
  cellphone: string;
  companyName: string;
  contactAddress: boolean;
  country: Country;
  defaultAddress: boolean;
  department: string;
  district: string;
  email: string;
  errorCode: string;
  errorMessage: string;
  firstName: string;
  formattedAddress: string;
  id: string;
  isHomeAddress: boolean;
  isOfficeAddress: boolean;
  lastName: string;
  line1: string;
  line2: string;
  phone: string;
  postalCode: string;
  region: Region;
  remarks: string;
  shippingAddress: boolean;
  title: string;
  titleCode: string;
  town: string;
  visibleInAddressBook: boolean;
}

interface Region {
  countryIso: string;
  isocode: string;
  isocodeShort: string;
  name: string;
}

interface Country {
  isocode: string;
  name: string;
}

interface NotificationData {
  allClaims: boolean;
  allOrders: boolean;
  allQuotes: boolean;
  allReserves: boolean;
  emailAdvanceShipNotificationEnabled: boolean;
  emailClaimConfirmNotificationEnabled: boolean;
  emailClaimProcessNotificationEnabled: boolean;
  emailClaimStatusNotificationEnabled: boolean;
  emailCustActionNotificationEnabled: boolean;
  emailDeliveryPickupNotificationEnabled: boolean;
  emailLoadArrivesNotificationEnabled: boolean;
  emailLoadLeavesNotificationEnabled: boolean;
  emailNewInvoiceNotificationEnabled: boolean;
  emailOrderNotificationEnabled: boolean;
  emailOutForDeliveryNotificationEnabled: boolean;
  emailPaymentConfirmNotificationEnabled: boolean;
  emailQuoteCancelledNotificationEnabled: boolean;
  emailQuoteConfirmationNotificationEnabled: boolean;
  emailQuoteExpiryNotificationEnabled: boolean;
  emailReserveExpireNotificationEnabled: boolean;
  faxAdvanceShipNotificationEnabled: boolean;
  faxClaimConfirmNotificationEnabled: boolean;
  faxClaimProcessNotificationEnabled: boolean;
  faxClaimStatusNotificationEnabled: boolean;
  faxCustActionNotificationEnabled: boolean;
  faxDeliveryPickupNotificationEnabled: boolean;
  faxLoadArrivesNotificationEnabled: boolean;
  faxLoadLeavesNotificationEnabled: boolean;
  faxNewInvoiceNotificationEnabled: boolean;
  faxOrderNotificationEnabled: boolean;
  faxOutForDeliveryNotificationEnabled: boolean;
  faxPaymentConfirmNotificationEnabled: boolean;
  faxQuoteCancelledNotificationEnabled: boolean;
  faxQuoteConfirmationNotificationEnabled: boolean;
  faxQuoteExpiryNotificationEnabled: boolean;
  faxReserveExpireNotificationEnabled: boolean;
  salesforceClaimConfirmNotificationEnabled: boolean;
  salesforceClaimProcessNotificationEnabled: boolean;
  salesforceClaimStatusNotificationEnabled: boolean;
  salesforceDeliveryPickupNotificationEnabled: boolean;
  salesforceLoadArrivesNotificationEnabled: boolean;
  salesforceLoadLeavesNotificationEnabled: boolean;
  salesforceOrderNotificationEnabled: boolean;
  salesforceOutForDeliveryNotificationEnabled: boolean;
  salesforceQuoteCancelledNotificationEnabled: boolean;
  salesforceQuoteConfirmationNotificationEnabled: boolean;
  salesforceQuoteExpiryNotificationEnabled: boolean;
  salesforceReserveExpireNotificationEnabled: boolean;
  textAdvanceShipNotificationEnabled: boolean;
  textClaimConfirmNotificationEnabled: boolean;
  textClaimProcessNotificationEnabled: boolean;
  textClaimStatusNotificationEnabled: boolean;
  textCustActionNotificationEnabled: boolean;
  textDeliveryPickupNotificationEnabled: boolean;
  textLoadArrivesNotificationEnabled: boolean;
  textLoadLeavesNotificationEnabled: boolean;
  textNewInvoiceNotificationEnabled: boolean;
  textOrderNotificationEnabled: boolean;
  textOutForDeliveryNotificationEnabled: boolean;
  textPaymentConfirmNotificationEnabled: boolean;
  textQuoteCancelledNotificationEnabled: boolean;
  textQuoteConfirmationNotificationEnabled: boolean;
  textQuoteExpiryNotificationEnabled: boolean;
  textReserveExpireNotificationEnabled: boolean;
}