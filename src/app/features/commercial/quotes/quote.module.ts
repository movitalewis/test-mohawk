import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";

import { QuoteRoutingModule } from "./quote-routing.module";
import { SharedModule } from "src/app/features/shared/shared.module";
import { QuoteDetailComponent } from "./pages/quote-detail/quote-detail.component";
import { QuoteComponent } from "./pages/quote/quote.component";
import { CancelQuotePopupComponent } from "./pages/cancel-quote-popup/cancel-quote-popup.component";
import { ShareViaEmailComponent } from "./pages/share-via-email/share-via-email.component";
import { FormsModule } from "@angular/forms";
import { NgxPaginationModule } from "ngx-pagination";
import { ReactiveFormsModule } from "@angular/forms";
import { RejectQuotePopupComponent } from "./pages/reject-quote-popup/reject-quote-popup.component";
import { ChooseAddressLightboxComponent } from "./pages/choose-address-lightbox/choose-address-lightbox.component";
import { AddCompanionProductsComponent } from "./pages/add-companion-products/add-companion-products.component";
import { RequestQuoteComponent } from "./pages/request-quote/request-quote.component";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { AddAccessoriesComponent } from "./pages/add-accessories/add-accessories.component";
import { TypeaheadModule } from "ngx-bootstrap/typeahead";
import { XchangeAddQuoteAccessoriesLightboxComponent } from './pages/xchange-add-quote-accessories-lightbox/xchange-add-quote-accessories-lightbox.component';
import { PotentialMatchesQuotesComponent } from './pages/potential-matches-quotes/potential-matches-quotes.component';
@NgModule({
  declarations: [
    QuoteComponent,
    QuoteDetailComponent,
    CancelQuotePopupComponent,
    ShareViaEmailComponent,
    RejectQuotePopupComponent,
    ChooseAddressLightboxComponent,
    AddCompanionProductsComponent,
    RequestQuoteComponent,
    AddAccessoriesComponent,
    XchangeAddQuoteAccessoriesLightboxComponent,
    PotentialMatchesQuotesComponent,
  ],
  imports: [
    CommonModule,
    QuoteRoutingModule,
    SharedModule,
    FormsModule,
    NgxPaginationModule,
    ReactiveFormsModule,
    MatSlideToggleModule,
    TypeaheadModule.forRoot(),

  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  providers: [DatePipe],
})
export class QuoteModule {}
