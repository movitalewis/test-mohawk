import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";
import { HomePageComponent } from "./pages/home-page/home-page.component";
import { SalespersonComponent } from "./pages/salesperson/salesperson.component";
import { TerritoryManagerComponent } from "./pages/territory-manager/territory-manager.component";
import { RvpComponent } from "./pages/rvp/rvp.component";
import { SalesOpsComponent } from "./pages/sales-ops/sales-ops.component";
import { DistrictManagerComponent } from "./pages/district-manager/district-manager.component";
import { SvpComponent } from "./pages/svp/svp.component";
import { ProductOwnerComponent } from "./pages/product-owner/product-owner.component";
import { SalesAccountSearchComponent } from "../account/pages/sales-account-search/sales-account-search.component";
import { DeactivateCloneOrdersGaurd } from "../../http-services/deactivate-clone-orders-gaurd";
import { CSRGuard } from "../../http-services/CSRGuard";

const routes: Routes = [
  {
    path: "",
    component: HomePageComponent,
    canDeactivate: [],
  },
  {
    path: "salesperson",
    component: SalespersonComponent,
  },
  {
    path: "salesperson/view-accounts",
    component: SalesAccountSearchComponent,
    canActivate: [CSRGuard],
  },
  {
    path: "territory-manager",
    component: TerritoryManagerComponent,
  },
  {
    path: "rvp",
    component: RvpComponent,
  },
  {
    path: "sales-ops",
    component: SalesOpsComponent,
  },
  {
    path: "district-manager",
    component: DistrictManagerComponent,
  },
  {
    path: "svp",
    component: SvpComponent,
  },
  {
    path: "product-owner",
    component: ProductOwnerComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeRoutingModule {}
