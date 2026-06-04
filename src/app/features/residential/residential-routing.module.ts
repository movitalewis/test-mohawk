import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { CSRGuard } from "../http-services/CSRGuard";
import { MashupGuard } from "../http-services/MashupGuard";
import { SSOGuard } from "../http-services/SSOGuard";
import { CustomerGuard } from "../http-services/customer.guard";
import { AccountTypeGuard } from "../http-services/accountTypeGuard";
import { DeactivateCloneOrdersGaurd } from "../http-services/deactivate-clone-orders-gaurd";
import { UserPermissionGuardService } from "../http-services/user-permission-guard.service";

const routes: Routes = [
  {
    path: "",
    canActivate: [
      SSOGuard,
      MashupGuard,
      CSRGuard,
      CustomerGuard,
      UserPermissionGuardService,
    ],
    loadChildren: () => import("./home/home.module").then((m) => m.HomeModule),
  },
  {
    path: "orders",
    canActivate: [
      SSOGuard,
      MashupGuard,
      CSRGuard,
      AccountTypeGuard,
      CustomerGuard,
      UserPermissionGuardService,
    ],
    loadChildren: () =>
      import("./orders/orders.module").then((m) => m.OrdersModule),
  },
  {
    path: "cloneorders",
    canActivate: [
      SSOGuard,
      MashupGuard,
      CSRGuard,
      AccountTypeGuard,
      CustomerGuard,
      UserPermissionGuardService,
    ],
    canDeactivate: [DeactivateCloneOrdersGaurd],
    loadChildren: () =>
      import("./clone-orders/clone-orders.module").then(
        (m) => m.CloneOrdersModule
      ),
  },
  {
    path: "finance",
    canActivate: [
      SSOGuard,
      MashupGuard,
      CSRGuard,
      AccountTypeGuard,
      CustomerGuard,
      UserPermissionGuardService,
    ],
    loadChildren: () =>
      import("./finance/finance.module").then((m) => m.FinanceModule),
  },
  {
    path: "products",
    canActivate: [
      SSOGuard,
      MashupGuard,
      CSRGuard,
      CustomerGuard,
      UserPermissionGuardService,
    ],
    loadChildren: () =>
      import("./products/products.module").then((m) => m.ProductsModule),
  },
  {
    path: "claims",
    canActivate: [
      SSOGuard,
      MashupGuard,
      CSRGuard,
      AccountTypeGuard,
      CustomerGuard,
      UserPermissionGuardService,
    ],
    loadChildren: () =>
      import("./claims/claims.module").then((m) => m.ClaimsModule),
  },
  {
    path: "cart",
    canActivate: [
      SSOGuard,
      MashupGuard,
      CSRGuard,
      CustomerGuard,
      UserPermissionGuardService,
    ],
    canDeactivate: [DeactivateCloneOrdersGaurd],
    loadChildren: () => import("./cart/cart.module").then((m) => m.CartModule),
  },
  {
    path: "company",
      //canActivate: [
      //   SSOGuard,
      //   MashupGuard,
      //   CSRGuard,
      //   AccountTypeGuard,
      //   CustomerGuard,
      //   UserPermissionGuardService,
      // ],
    loadChildren: () =>
      import("./company/company.module").then((m) => m.CompanyModule),
  },
  {
    path: "pricing",
    canActivate: [
      SSOGuard,
      MashupGuard,
      CSRGuard,
     // AccountTypeGuard,
      CustomerGuard,
      UserPermissionGuardService,
    ],
    loadChildren: () =>
      import("./pricing/pricing.module").then((m) => m.PricingModule),
  },
  {
    path: "special-goods",
    canActivate: [
      SSOGuard,
      MashupGuard,
      CSRGuard,
      AccountTypeGuard,
      CustomerGuard,
     // UserPermissionGuardService,
    ],
    loadChildren: () =>
      import("./special-goods/special-goods.module").then(
        (m) => m.SpecialGoodsModule
      ),
  },
  {
    path: "account",
    canActivate: [
      SSOGuard,
      MashupGuard,
      CSRGuard,
      AccountTypeGuard,
      CustomerGuard,
      UserPermissionGuardService,
    ],
    loadChildren: () =>
      import("./account/account.module").then((m) => m.AccountModule),
  },
  {
    path: "my-profile",
    loadChildren: () =>
      import("./my-profile/my-profile.module").then((m) => m.MyProfileModule),
  },
  {
    path: "advance-search",
    canActivate: [
      SSOGuard,
      MashupGuard,
      CSRGuard,
      //AccountTypeGuard,
      CustomerGuard,
      UserPermissionGuardService,
    ],
    loadChildren: () =>
      import("./search/search.module").then((m) => m.SearchModule),
  },
  {
    path: "sample-budget",
    canActivate: [
      SSOGuard,
      MashupGuard,
      CSRGuard,
      //AccountTypeGuard,
      CustomerGuard,
      UserPermissionGuardService,
    ],
    loadChildren: () =>
      import("./budget/budget.module").then((m) => m.BudgetModule),
  },
  {
    // SalePersonDashboardModule
    path: "salesPersonDashboard",
    canActivate: [
      SSOGuard,
      MashupGuard,
      CSRGuard,
      AccountTypeGuard,
      CustomerGuard,
      UserPermissionGuardService,
    ],
    loadChildren: () =>
      import("./sales-person-dashboard/sales-person-dashboard.module").then(
        (m) => m.SalePersonDashboardModule
      ),
  },
  {
    path: "entitlement-manager",
    canActivate: [
      SSOGuard,
      MashupGuard,
      CSRGuard,
      // AccountTypeGuard,
      UserPermissionGuardService,
    ],
    loadChildren: () =>
      import("./entitlement-manager/entitlement-manager.module").then(
        (m) => m.EntitlementManagerModule
      ),
  },
  {
    path: "post-modification",
    canActivate: [
      SSOGuard,
      MashupGuard,
      CSRGuard,
      AccountTypeGuard,
      CustomerGuard,
      UserPermissionGuardService,
    ],
    loadChildren: () =>
      import("./post-modification/post-modification.module").then(
        (m) => m.PostModificationModule
      ),
  },
  {
    path: "contact-us",
    canActivate: [SSOGuard],
    loadChildren: () =>
      import("./contact-us/contact-us.module").then((m) => m.ContactUsModule),
  },
  {
    path: "terms-conditions",
    canActivate: [SSOGuard],
    loadChildren: () =>
      import("./terms-conditions/terms-conditions.module").then((m) => m.TermsConditionsModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ResidentialRoutingModule {}
