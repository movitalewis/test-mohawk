import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AccommodationReturnComponent } from "./pages/accommodation-return/accommodation-return.component";
import { CancellationFeesComponent } from "./pages/cancellation-fees/cancellation-fees.component";
import { ClaimDetailsComponent } from "./pages/claim-details/claim-details.component";
import { ClaimsHistoryComponent } from "./pages/claims-history/claims-history.component";
import { ClaimsComponent } from "./pages/claims/claims.component";
import { CustomerSatisfactionComponent } from "./pages/customer-satisfaction/customer-satisfaction.component";
import { DamagedComponent } from "./pages/damaged/damaged.component";
import { DefectiveProductComponent } from "./pages/defective-product/defective-product.component";
import { FreightClaimComponent } from "./pages/freight-claim/freight-claim.component";
import { MohawkOrderErrorComponent } from "./pages/mohawk-order-error/mohawk-order-error.component";
import { PricingBillingErrorComponent } from "./pages/pricing-billing-error/pricing-billing-error.component";
import { TaxBillingErrorComponent } from "./pages/tax-billing-error/tax-billing-error.component";
import { WrongProductComponent } from "./pages/wrong-product/wrong-product.component";
import { WrongQuantityShortageComponent } from "./pages/wrong-quantity-shortage/wrong-quantity-shortage.component";
import { ClaimConfirmationComponent } from "./pages/claim-confirmation/claim-confirmation.component";
import { ClaimsConfirmationGuardService } from "./services/claims-confirmation-guard.service";
import { DeactivateGaurdService } from "../../http-services/deactivate-gaurd.service";
import { ClaimApprovalListComponent } from "./pages/claim-approval-list/claim-approval-list.component";
import { ClaimApprovalDetailsComponent } from "./pages/claim-approval-details/claim-approval-details.component";
import { LaborClaimComponent } from "./pages/labor-claim/labor-claim.component";

const routes: Routes = [
  {
    path: "createclaim",
    component: ClaimsComponent,
  },
  {
    path: "history",
    component: ClaimsHistoryComponent,
  },
  {
    path: "details",
    component: ClaimDetailsComponent,
  },
  {
    path: "freight-billing-error",
    component: FreightClaimComponent,
    canDeactivate: [DeactivateGaurdService],
  },
  {
    path: "pricing-billing-error",
    component: PricingBillingErrorComponent,
    canDeactivate: [DeactivateGaurdService],
  },
  {
    path: "tax-billing-error",
    component: TaxBillingErrorComponent,
    canDeactivate: [DeactivateGaurdService],
  },
  {
    path: "accommodation-return",
    component: AccommodationReturnComponent,
    canDeactivate: [DeactivateGaurdService],
  },
  {
    path: "assurance-warranty-claim",
    component: CustomerSatisfactionComponent,
    canDeactivate: [DeactivateGaurdService],
  },
  {
    path: "order-error-claim",
    component: MohawkOrderErrorComponent,
    canDeactivate: [DeactivateGaurdService],
  },
  {
    path: "defective-product-claim",
    component: DefectiveProductComponent,
    canDeactivate: [DeactivateGaurdService],
  },
  {
    path: "wrong-product-claim",
    component: WrongProductComponent,
    canDeactivate: [DeactivateGaurdService],
  },
  {
    path: "damage-claim",
    component: DamagedComponent,
    canDeactivate: [DeactivateGaurdService],
  },
  {
    path: "quantity-claim",
    component: WrongQuantityShortageComponent,
    canDeactivate: [DeactivateGaurdService],
  },
  {
    path: "cancellation-fees",
    component: CancellationFeesComponent,
    canDeactivate: [DeactivateGaurdService],
  },{
    path: ":claimType/confirmation",
    canActivate: [ClaimsConfirmationGuardService],
    component: ClaimConfirmationComponent,
  },
    {
      path: "approval-list",
      component: ClaimApprovalListComponent
    },
    {
      path:'approval-details',
      component: ClaimApprovalDetailsComponent
    },{
    path:'add-labor-claim',
    component:LaborClaimComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClaimsRoutingModule {}
