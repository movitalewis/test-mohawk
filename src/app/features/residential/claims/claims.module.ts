import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";
import { InvoiceSearchPopupComponent } from "./pages/invoice-search-popup/invoice-search-popup.component";
import { SharedModule } from "../../shared/shared.module";
import { ClaimsRoutingModule } from "./claims-routing.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ClaimsHistoryComponent } from "./pages/claims-history/claims-history.component";
import { ClaimsComponent } from "./pages/claims/claims.component";
import { ClaimDetailsComponent } from "./pages/claim-details/claim-details.component";
import { FreightClaimComponent } from "./pages/freight-claim/freight-claim.component";
import { AccommodationReturnComponent } from "./pages/accommodation-return/accommodation-return.component";
import { CancellationFeesComponent } from "./pages/cancellation-fees/cancellation-fees.component";
import { CustomerSatisfactionComponent } from "./pages/customer-satisfaction/customer-satisfaction.component";
import { DamagedComponent } from "./pages/damaged/damaged.component";
import { DefectiveProductComponent } from "./pages/defective-product/defective-product.component";
import { MohawkOrderErrorComponent } from "./pages/mohawk-order-error/mohawk-order-error.component";
import { PricingBillingErrorComponent } from "./pages/pricing-billing-error/pricing-billing-error.component";
import { TaxBillingErrorComponent } from "./pages/tax-billing-error/tax-billing-error.component";
import { WrongProductComponent } from "./pages/wrong-product/wrong-product.component";
import { WrongQuantityShortageComponent } from "./pages/wrong-quantity-shortage/wrong-quantity-shortage.component";
import { SelectInvoicePopupComponent } from "./pages/select-invoice-popup/select-invoice-popup.component";
import { SelectInvoiceLineComponent } from "./pages/select-invoice-line/select-invoice-line.component";
import { InvoiceSearchComponent } from "./pages/invoice-search/invoice-search.component";
import { OpenClaimsComponent } from './pages/open-claims/open-claims.component';
import { ClaimConfirmationComponent } from "./pages/claim-confirmation/claim-confirmation.component";
import { NgxPaginationModule } from "ngx-pagination";
import { ClaimApprovalListComponent } from './pages/claim-approval-list/claim-approval-list.component';
import { ClaimApprovalDetailsComponent } from './pages/claim-approval-details/claim-approval-details.component';
import { LaborClaimComponent } from "./pages/labor-claim/labor-claim.component";

@NgModule({
  declarations: [
    ClaimsComponent,
    ClaimsHistoryComponent,
    ClaimDetailsComponent,
    FreightClaimComponent,
    PricingBillingErrorComponent,
    TaxBillingErrorComponent,
    AccommodationReturnComponent,
    CustomerSatisfactionComponent,
    MohawkOrderErrorComponent,
    DefectiveProductComponent,
    WrongProductComponent,
    DamagedComponent,
    WrongQuantityShortageComponent,
    CancellationFeesComponent,
    SelectInvoicePopupComponent,
    SelectInvoiceLineComponent,
    InvoiceSearchPopupComponent,
    InvoiceSearchComponent,
    OpenClaimsComponent,
    ClaimConfirmationComponent,
    ClaimApprovalListComponent,
    ClaimApprovalDetailsComponent,
    LaborClaimComponent
  ],
  imports: [
    CommonModule,
    ClaimsRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  providers: [DatePipe],
})
export class ClaimsModule {}
