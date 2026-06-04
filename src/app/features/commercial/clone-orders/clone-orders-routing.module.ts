import { RouterModule, Routes } from "@angular/router";
import { CloneOrdersComponent } from "./clone-orders/clone-orders.component";
import { NgModule } from "@angular/core";

const routes: Routes = [
  {
    path: "",
    component: CloneOrdersComponent,
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CloneOrdersRoutingModule {}
