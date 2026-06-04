import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PostModificationProductsRoutingModule } from './post-modification-products-routing.module';
import { PostModificationAddCompanionProductsComponent } from './post-modification-components/post-modification-add-companion-products/post-modification-add-companion-products.component';
import { PostModificationChangeShippingAddressComponent } from './post-modification-components/post-modification-change-shipping-address/post-modification-change-shipping-address.component';
import { PostModificationChooseAddressLightboxComponent } from './post-modification-components/post-modification-choose-address-lightbox/post-modification-choose-address-lightbox.component';
import { PostModificationPlpOrderSamplesComponent } from './post-modification-components/post-modification-plp-order-samples/post-modification-plp-order-samples.component';
import { PostModificationPlpSavedAddressComponent } from './post-modification-components/post-modification-plp-saved-address/post-modification-plp-saved-address.component';
import { PostModificationPlpShippingAddressComponent } from './post-modification-components/post-modification-plp-shipping-address/post-modification-plp-shipping-address.component';
import { PostModificationProductImageViewComponent } from './post-modification-components/post-modification-product-image-view/post-modification-product-image-view.component';
import { PostModificationProductsCompareComponent } from './post-modification-components/post-modification-products-compare/post-modification-products-compare.component';
import { PostModificationSelectColorLightboxComponent } from './post-modification-components/post-modification-select-color-lightbox/post-modification-select-color-lightbox.component';
import { PostModificationShareViaEmailLightboxComponent } from './post-modification-components/post-modification-share-via-email-lightbox/post-modification-share-via-email-lightbox.component';
import { PostModificationPlpComponent } from './post-modification-pages/post-modification-plp/post-modification-plp.component';
import { PostModificationPdpComponent } from './post-modification-pages/post-modification-pdp/post-modification-pdp.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedModule } from 'src/app/features/shared/shared.module';


@NgModule({
  declarations: [
    PostModificationPlpComponent,
    PostModificationPdpComponent,
    PostModificationSelectColorLightboxComponent,
    PostModificationShareViaEmailLightboxComponent,
    PostModificationChooseAddressLightboxComponent,
    PostModificationChangeShippingAddressComponent,
    PostModificationPlpShippingAddressComponent,
    PostModificationPlpSavedAddressComponent,
    PostModificationPlpOrderSamplesComponent,
    PostModificationAddCompanionProductsComponent,
    PostModificationProductImageViewComponent,
    PostModificationProductsCompareComponent,
  ],
  imports: [
    CommonModule,
    PostModificationProductsRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    CarouselModule,
    ModalModule,
    ReactiveFormsModule,
    NgxPaginationModule
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class PostModificationProductsModule { }
