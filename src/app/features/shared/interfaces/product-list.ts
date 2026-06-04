export interface Product {
  styleName: string;
  image: string;
  styleId: string;
  sellingColorId: string[];
  enableOrderSample: boolean;
  subCategoryName: string;
  productImageURL: string;
  introductoryDate: string;
  type: string;
  category: string;
  price: string;
  code: string;
  flag: string;
  firstVariantCode: string;
  productType?: string;
  droppedFlag?: boolean;
  brand: string;
  preOrderFlag: boolean;
  styleBlocked: boolean;
}

export interface ProductList extends Array<Product> {}
