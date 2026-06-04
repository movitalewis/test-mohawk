export const CLAIM_TYPE_OPTIONS = {
  //payload_ref : dropdown_values
  FREIGHT: "Freight Billing Error",
  PRICING: "Pricing Billing Error",
  TAX: "Tax Billing Error",
  ACCOMMODATION_RETURN: "Accommodation Return",
  MOHAWK_ORDER_ERROR: "Order Error Claim",
  DEFECTIVE_PRODUCT: "Defective Product Claim",
  WRONG_PRODUCT: "Wrong Product Claim",
  DAMAGED: "Damage Claim",
  WRONG_QUANTITY_SHORTAGE: "Quantity Claim",
  CANCELLATION_FEE: "Cancellation Fees",
  CUSTOMER_SATISFACTION: "Assurance Warranty Claim",
};

export const CLAIM_TYPES = {
  // local_ref : response_ref(ex:clam : "details service)
  WRONG_QUANTITY_SHORTAGE: "Quantity Claim",
  WRONG_PRODUCT: "Wrong Product Claim",
  TAX: "Tax Billing Error",
  PRICING: "Pricing Billing Error",
  MOHAWK_ORDER_ERROR: "Order Error Claim",
  FREIGHT: "Freight Billing Error",
  DEFECTIVE_PRODUCT: "Defective Product Claim",
  DAMAGED: "Damage Claim",
  CUSTOMER_SATISFACTION: "Assurance Warranty Claim",
  CANCELLATION_FEE: "Cancellation Fees",
  ACCOMMODATION_RETURN: "Accommodation Return",
};

export const CLAIM_PATH_NAMES = {
  // local_ref : response_ref(ex:clam : "details service)
  WRONG_QUANTITY_SHORTAGE: "quantity-claim",
  WRONG_PRODUCT: "wrong-product-claim",
  TAX: "tax-billing-error",
  PRICING: "pricing-billing-error",
  MOHAWK_ORDER_ERROR: "order-error-claim",
  FREIGHT: "freight-billing-error",
  DEFECTIVE_PRODUCT: "defective-product-claim",
  DAMAGED: "damage-claim",
  CUSTOMER_SATISFACTION: "assurance-warranty-claim",
  CANCELLATION_FEE: "cancellation-fees",
  ACCOMMODATION_RETURN: "accommodation-return",
  ADD_LABOR_CLAIM: "add-labor-claim",
};

export const LABOR_ELIGIBLE_CLAIMTYPES = [
  CLAIM_PATH_NAMES.MOHAWK_ORDER_ERROR,
  CLAIM_PATH_NAMES.DEFECTIVE_PRODUCT,
  CLAIM_PATH_NAMES.WRONG_PRODUCT,
  CLAIM_PATH_NAMES.DAMAGED,
  CLAIM_PATH_NAMES.WRONG_QUANTITY_SHORTAGE,
  CLAIM_PATH_NAMES.CUSTOMER_SATISFACTION,
];

export const LABOR_ELIGIBLE_CLAIMS = [
  CLAIM_TYPES.MOHAWK_ORDER_ERROR,
  CLAIM_TYPES.DEFECTIVE_PRODUCT,
  CLAIM_TYPES.WRONG_PRODUCT,
  CLAIM_TYPES.DAMAGED,
  CLAIM_TYPES.WRONG_QUANTITY_SHORTAGE,
  CLAIM_TYPES.CUSTOMER_SATISFACTION,
];

export const CLAIM_COLUMNS = {
  "columns": [
    { key: "invoiceSeq", title: "Invoice Line Number" },
    { key: "disputeCaseId", title: "Claim Line Number" },
    { key: "claimStatusDetail", title: "Line Status" },
    { key: "component", title: "Type" },
    { key: "styleName", title: "Style #/Desc" },
    { key: "colorName", title: "Color #/Desc" },
    { key: "dyeLot", title: "Dye Lot" },
    { key: "rollNumber", title: "Roll #" },
    { key: "partNumber", title: "Part #" },
    { key: "shipQuantity", title: "Invoice Qty" },
    { key: "pricePerUnit", title: "Invoice Unit Price" },
    {
      key: "productPrice",
      title: `Invoice Amount (USD)`,
    },
    { key: "claimQuanity", title: "Claim Quantity" },
    {
      key: "subTotal",
      title: `Sub Total (USD)`,
    },
  ],
};
