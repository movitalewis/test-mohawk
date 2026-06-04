import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PostModificationAddCompanionProductsComponent } from './post-modification-components/post-modification-add-companion-products/post-modification-add-companion-products.component';
import { PostModificationChangeShippingAddressComponent } from './post-modification-components/post-modification-change-shipping-address/post-modification-change-shipping-address.component';
import { PostModificationChooseAddressLightboxComponent } from './post-modification-components/post-modification-choose-address-lightbox/post-modification-choose-address-lightbox.component';
import { PostModificationPlpOrderSamplesComponent } from './post-modification-components/post-modification-plp-order-samples/post-modification-plp-order-samples.component';
import { PostModificationPlpSavedAddressComponent } from './post-modification-components/post-modification-plp-saved-address/post-modification-plp-saved-address.component';
import { PostModificationPlpShippingAddressComponent } from './post-modification-components/post-modification-plp-shipping-address/post-modification-plp-shipping-address.component';
import { PostModificationProductsCompareComponent } from './post-modification-components/post-modification-products-compare/post-modification-products-compare.component';
import { PostModificationSelectColorLightboxComponent } from './post-modification-components/post-modification-select-color-lightbox/post-modification-select-color-lightbox.component';
import { PostModificationShareViaEmailLightboxComponent } from './post-modification-components/post-modification-share-via-email-lightbox/post-modification-share-via-email-lightbox.component';
import { PostModificationPdpComponent } from './post-modification-pages/post-modification-pdp/post-modification-pdp.component';
import { PostModificationPlpComponent } from './post-modification-pages/post-modification-plp/post-modification-plp.component';

const routes: Routes = [
  {
    path: ":order_number",
    component: PostModificationPlpComponent,
  },
  // {
  //   path: ":type/:code",
  //   component: PdpComponent,
  // },
  // {
  //   path: ":type",
  //   component: PlpComponent,
  // },
  {
    path: "details/:order_number/:code",
    component: PostModificationPdpComponent,
  },
  {
    path: "choose-address",
    component: PostModificationChooseAddressLightboxComponent,
  },
  {
    path: "change-address",
    component: PostModificationChangeShippingAddressComponent,
  },
  {
    path: "shipping-address",
    component: PostModificationPlpShippingAddressComponent,
  },
  {
    path: "saved-address",
    component: PostModificationPlpSavedAddressComponent,
  },
  {
    path: "order-samples",
    component: PostModificationPlpOrderSamplesComponent,
  },
  {
    path: "select-color",
    component: PostModificationSelectColorLightboxComponent,
  },
  {
    path: "share-via-email",
    component: PostModificationShareViaEmailLightboxComponent,
  },
  {
    path: "companion-products",
    component: PostModificationAddCompanionProductsComponent,
  },
  {
    path: "products-compare",
    component: PostModificationProductsCompareComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PostModificationProductsRoutingModule { }
