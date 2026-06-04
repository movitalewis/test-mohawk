import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { SalesPersonDashboardComponent } from "./components/sales-person-dashboard/sales-person-dashboard.component";

const routes: Routes = [
  {
    path: "",
    component: SalesPersonDashboardComponent,
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SalesPersonDashboardRoutingModule {}
