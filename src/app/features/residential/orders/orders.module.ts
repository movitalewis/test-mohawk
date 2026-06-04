import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { OrdersRoutingModule } from './orders-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { OrdersPageComponent } from './pages/orders-page/orders-page.component';
import { ReservesComponent } from './pages/reserves/reserves.component';
import { ReserveDetailsComponent } from './pages/reserves/reserve-details/reserve-details.component';
import { ErrorAlertComponent } from './pages/reserves/components/error-alert/error-alert.component';
import { ExtendPopupComponent } from './pages/reserves/components/extend-popup/extend-popup.component';
import { ExtendItemsPupupComponent } from './pages/reserves/components/extend-items-pupup/extend-items-pupup.component';
import { AddCartPopupComponent } from './pages/reserves/components/add-cart-popup/add-cart-popup.component';
import { SuccessAlertComponent } from './pages/reserves/components/success-alert/success-alert.component';
import { CancelReservePopupComponent } from './pages/reserves/components/cancel-reserve-popup/cancel-reserve-popup.component';
import { OrderDetailsComponent } from './pages/orders-edit/order-details/order-details.component';
import { OrderDetailsEditComponent } from './pages/orders-edit/order-details-edit/order-details-edit.component';
import { CancelOrderComponent } from './pages/orders-edit/components/cancel-order/cancel-order.component';
import { RequestPriceComponent } from './pages/orders-edit/components/request-price/request-price.component';
import { OrdersHistoryDetailsComponent } from './pages/orders-history-details/orders-history-details.component';
import { ProductRemovedComponent } from './pages/reserves/product-removed/product-removed.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgxPaginationModule } from 'ngx-pagination';
import { OrderDetailsCancelHoldModalComponent } from './modals/order-details-cancel-hold-modal/order-details-cancel-hold-modal.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AddAccessoriesComponent } from './pages/add-accessories/add-accessories.component';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { AddNewLineComponent } from './pages/add-new-line/add-new-line.component';

@NgModule({
  declarations: [
    OrdersPageComponent,
    OrdersHistoryDetailsComponent,
    ReservesComponent,
    ReserveDetailsComponent,
    ErrorAlertComponent,
    ExtendPopupComponent,
    ExtendItemsPupupComponent,
    AddCartPopupComponent,
    SuccessAlertComponent,
    CancelReservePopupComponent,
    OrderDetailsComponent,
    OrderDetailsEditComponent,
    CancelOrderComponent,
    RequestPriceComponent,
    ProductRemovedComponent,
    OrderDetailsCancelHoldModalComponent,
    AddAccessoriesComponent,
    AddNewLineComponent,
  ],
  imports: [
    CommonModule,
    OrdersRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    NgxPaginationModule,
    MatSlideToggleModule,
    TypeaheadModule.forRoot(), 
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  providers:[DatePipe]
})
export class OrdersModule {}
