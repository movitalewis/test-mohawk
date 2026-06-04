import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddCompanionProductsComponent } from './components/add-companion-products/add-companion-products.component';
import { ChangeShippingAddressComponent } from './components/change-shipping-address/change-shipping-address.component';
import { ChooseAddressLightboxComponent } from './components/choose-address-lightbox/choose-address-lightbox.component';
import { PlpOrderSamplesComponent } from './components/plp-order-samples/plp-order-samples.component';
import { PlpSavedAddressComponent } from './components/plp-saved-address/plp-saved-address.component';
import { PlpShippingAddressComponent } from './components/plp-shipping-address/plp-shipping-address.component';
import { ProductsCompareComponent } from './components/products-compare/products-compare.component';
import { SelectColorLightboxComponent } from './components/select-color-lightbox/select-color-lightbox.component';
import { ShareViaEmailLightboxComponent } from './components/share-via-email-lightbox/share-via-email-lightbox.component';
import { PdpComponent } from './pages/pdp/pdp.component';
import { PlpComponent } from './pages/plp/plp.component';

const routes: Routes = [
  {
    path: "",
    component: PlpComponent,
  },
  {
    path: "details/:code",
    component: PdpComponent,
  },
  {
    path: "choose-address",
    component: ChooseAddressLightboxComponent,
  },
  {
    path: "change-address",
    component: ChangeShippingAddressComponent,
  },
  {
    path: "shipping-address",
    component: PlpShippingAddressComponent,
  },
  {
    path: "saved-address",
    component: PlpSavedAddressComponent,
  },
  {
    path: "order-samples",
    component: PlpOrderSamplesComponent,
  },
  {
    path: "select-color",
    component: SelectColorLightboxComponent,
  },
  {
    path: "share-via-email",
    component: ShareViaEmailLightboxComponent,
  },
  {
    path: "companion-products",
    component: AddCompanionProductsComponent,
  },
  {
    path: "products-compare",
    component: ProductsCompareComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductsRoutingModule { }
