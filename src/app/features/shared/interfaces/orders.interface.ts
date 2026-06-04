export interface orderHistoryResponse {}

// export interface OrderResponse {
//   appliedOrderPromotions: [];
//   appliedProductPromotions: [];
//   appliedVouchers: [];
//   calculated: boolean;
//   cancellable: boolean;
//   code: string;
//   consignments: [];
//   costCenter: B2BCostCenter;
//   created: string;
//   deliveryAddress: Address;
//   deliveryCost: Price;
//   deliveryItemsQuantity: number;
//   deliveryMode: DeliveryMode;
//   deliveryOrderGroups: [];
//   deliveryStatus: string;
//   deliveryStatusDisplay: string;
//   entries: [];
//   entryGroups: [];
//   guestCustomer: boolean;
//   guid: string;
//   net: boolean;
//   orderDiscounts: Price;
//   orgCustomer: User;
//   paymentAddress: Address;
//   paymentInfo: PaymentDetails;
//   permissionResults: [];
//   pickupItemQuantity: number;
//   pickupOrderGroups: [];
//   productDiscounts: Price;
//   purchaseOrderNumber: string;
//   returnable: boolean;
//   site: string;
//   status: string;
//   statusDisplay: string;
//   store: string;
//   subTotal: Price;
//   totalDiscounts: Price;
//   totalItems: number;
//   totalPrice: Price;
//   totalPriceWithTax: Price;
//   totalTax: Price;
//   totalUnitCount: number;
//   unconsignedEntries: [];
//   user: Principal;
// }

export interface OrderSearchReq {
  code: string;
  colorName: string;
  colorNumber: string;
  dateRange: string;
  isSampleOrder: boolean;
  poNumber: string;
  productType: string;
  searchText: string;
  sidemark: string;
  sortOrderBy: string;
  status: string;
  styleName: string;
  styleNumber: string;
  type: string;
}