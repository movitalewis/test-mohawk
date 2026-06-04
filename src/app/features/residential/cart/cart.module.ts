import { SharedModule } from 'src/app/features/shared/shared.module';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CartRoutingModule } from './cart-routing.module';
import { CartComponent } from './pages/cart/cart.component';
import { CartAccessoriesComponent } from './pages/cart-accessories/cart-accessories.component';
import { EmptyCartComponent } from './pages/empty-cart/empty-cart.component';
import { PlaceReservePopupComponent } from './components/place-reserve-popup/place-reserve-popup.component';
import { XchangePlaceReservePopupComponent } from './components/xchange-place-reserve-popup/xchange-place-reserve-popup.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';


@NgModule({
  declarations: [
    CartComponent,
    CartAccessoriesComponent,
    EmptyCartComponent,
    PlaceReservePopupComponent,
    XchangePlaceReservePopupComponent,
    
  ],
  imports: [
    CommonModule,
    CartRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    MatSlideToggleModule
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class CartModule { }
