import { CartComponent } from "./pages/cart/cart.component";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { EmptyCartComponent } from "./pages/empty-cart/empty-cart.component";

const routes: Routes = [
  {
    path: "",
    component: CartComponent,
  },
  {
    path: "empty",
    component: EmptyCartComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CartRoutingModule {}
