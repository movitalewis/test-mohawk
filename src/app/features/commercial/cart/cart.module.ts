import { SharedModule } from "src/app/features/shared/shared.module";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";

import { CartRoutingModule } from "./cart-routing.module";
import { CartComponent } from "./pages/cart/cart.component";
import { EmptyCartComponent } from "./pages/empty-cart/empty-cart.component";
import { PlaceReservePopupComponent } from "./components/place-reserve-popup/place-reserve-popup.component";
import { XchangePlaceReservePopupComponent } from "./components/xchange-place-reserve-popup/xchange-place-reserve-popup.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';

@NgModule({
  declarations: [
    CartComponent,
    EmptyCartComponent,
    PlaceReservePopupComponent,
    XchangePlaceReservePopupComponent
  ],
  imports: [
    CommonModule,
    CartRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    MatSlideToggleModule,
    TypeaheadModule.forRoot(), 
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  providers:[DatePipe]
})
export class CartModule {}
