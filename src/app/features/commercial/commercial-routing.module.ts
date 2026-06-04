import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { CSRGuard } from "../http-services/CSRGuard";
import { MashupGuard } from "../http-services/MashupGuard";
import { SSOGuard } from "../http-services/SSOGuard";

import { CartComponent } from "./cart/pages/cart/cart.component";
import { EmptyCartComponent } from "./cart/pages/empty-cart/empty-cart.component";
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
        (m) => m.CloneOrdersModule,
      ),
  },
  // {
  //   path: "cloneorders1",
  //   canActivate: [
  //     SSOGuard,
  //     MashupGuard,
  //     CSRGuard,
  //     AccountTypeGuard,
  //     CustomerGuard,
  //     UserPermissionGuardService,
  //   ],
  //   loadChildren: () =>
  //     import("./clone-order/clone-order.module").then(
  //       (m) => m.CloneOrderModule
  //     ),
  // },
  {
    path: "quotes",
    canActivate: [
      SSOGuard,
      MashupGuard,
      CSRGuard,
      AccountTypeGuard,
      CustomerGuard,
      UserPermissionGuardService,
    ],
    loadChildren: () =>
      import("./quotes/quote.module").then((m) => m.QuoteModule),
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
    path: "company",
    // canActivate: [
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
    path: "advance-search",
    canActivate: [
      SSOGuard,
      MashupGuard,
      CSRGuard,
      // AccountTypeGuard,
      CustomerGuard,
      UserPermissionGuardService,
    ],
    loadChildren: () =>
      import("./search/search.module").then((m) => m.SearchModule),
  },
  {
    path: "pricing",
    canActivate: [
      SSOGuard,
      MashupGuard,
      CSRGuard,
      //AccountTypeGuard,
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
        (m) => m.SpecialGoodsModule,
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
    canActivate: [SSOGuard],
    loadChildren: () =>
      import("./my-profile/my-profile.module").then((m) => m.MyProfileModule),
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
        (m) => m.SalePersonDashboardModule,
      ),
  },
  {
    path: "pricing-manager",
    canActivate: [
      SSOGuard,
      MashupGuard,
      CSRGuard,
      // AccountTypeGuard,
      UserPermissionGuardService,
    ],
    loadChildren: () =>
      import("./entitlement-manager/entitlement-manager.module").then(
        (m) => m.EntitlementManagerModule,
      ),
  },
  {
    path: "clone-sample-order",
    canActivate: [
      SSOGuard,
      MashupGuard,
      CSRGuard,
      AccountTypeGuard,
      CustomerGuard,
      UserPermissionGuardService,
    ],
    loadChildren: () =>
      import("./clone-order/clone-order.module").then(
        (m) => m.CloneOrderModule,
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
        (m) => m.PostModificationModule,
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
      import("./terms-conditions/terms-conditions.module").then(
        (m) => m.TermsConditionsModule,
      ),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CommercialRoutingModule {}
