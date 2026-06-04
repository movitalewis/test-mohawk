import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { OrdersPageComponent } from './pages/orders-page/orders-page.component';
import { ReservesComponent } from './pages/reserves/reserves.component';
import { OrderDetailsComponent } from './pages/orders-edit/order-details/order-details.component';
import { OrderDetailsEditComponent } from './pages/orders-edit/order-details-edit/order-details-edit.component';
import { CancelOrderComponent } from './pages/orders-edit/components/cancel-order/cancel-order.component';
import { RequestPriceComponent } from './pages/orders-edit/components/request-price/request-price.component';
import { OrdersHistoryDetailsComponent } from './pages/orders-history-details/orders-history-details.component';
import { ReserveDetailsComponent } from './pages/reserves/reserve-details/reserve-details.component';
import { ProductRemovedComponent } from './pages/reserves/product-removed/product-removed.component';


const routes: Routes = [
  {
    path: '',
    component: OrdersPageComponent
  },
  {
    path: 'orders-history-details/:id',
    component: OrdersHistoryDetailsComponent
  },
  {
    path: 'reserves',
    component: ReservesComponent
  },
  {
    path: 'reserves-details/:id',
    component: ReserveDetailsComponent
  },
  {
    path: 'order-details/:id',
    component: OrderDetailsComponent
  },
  {
    path: 'order-details-edit',
    component: OrderDetailsEditComponent
  },
  {
    path: 'cancel-order',
    component: CancelOrderComponent
  },
  {
    path: 'request-price',
    component: RequestPriceComponent
  },
  {
    path: 'product-removed',
    component: ProductRemovedComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrdersRoutingModule { }
