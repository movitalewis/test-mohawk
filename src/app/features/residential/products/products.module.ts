import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";

import { ProductsRoutingModule } from "./products-routing.module";
import { PlpComponent } from "./pages/plp/plp.component";

import { SharedModule } from "../../shared/shared.module";
import { SelectColorLightboxComponent } from "./components/select-color-lightbox/select-color-lightbox.component";
import { ShareViaEmailLightboxComponent } from "./components/share-via-email-lightbox/share-via-email-lightbox.component";
import { ChangeShippingAddressComponent } from "./components/change-shipping-address/change-shipping-address.component";
import { AddCompanionProductsComponent } from "./components/add-companion-products/add-companion-products.component";
import { PlpOrderSamplesComponent } from "./components/plp-order-samples/plp-order-samples.component";
import { PlpShippingAddressComponent } from "./components/plp-shipping-address/plp-shipping-address.component";
import { PlpSavedAddressComponent } from "./components/plp-saved-address/plp-saved-address.component";
import { PdpComponent } from "./pages/pdp/pdp.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { ModalModule } from "ngx-bootstrap/modal";
import { CarouselModule } from "ngx-owl-carousel-o";
import { ProductImageViewComponent } from "./components/product-image-view/product-image-view.component";
import { ProductsCompareComponent } from "./components/products-compare/products-compare.component";
import { NgxPaginationModule } from "ngx-pagination";
import { ResidentialSharedModule } from "../residential-shared.module";

@NgModule({
  declarations: [
    PlpComponent,
    PdpComponent,
    SelectColorLightboxComponent,
    ShareViaEmailLightboxComponent,
    ChangeShippingAddressComponent,
    PlpShippingAddressComponent,
    PlpSavedAddressComponent,
    PlpOrderSamplesComponent,
    AddCompanionProductsComponent,
    ProductImageViewComponent,
    ProductsCompareComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ProductsRoutingModule,
    ResidentialSharedModule,
    SharedModule,
    ModalModule,
    CarouselModule,
    ReactiveFormsModule,
    NgxPaginationModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [DatePipe],
})
export class ProductsModule {}
