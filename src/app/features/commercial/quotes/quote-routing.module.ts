import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { RequestQuoteComponent } from "./pages/request-quote/request-quote.component";
import { QuoteDetailComponent } from "./pages/quote-detail/quote-detail.component";
import { QuoteComponent } from "./pages/quote/quote.component";

const routes: Routes = [
  {
    path: "quote",
    component: QuoteComponent,
  },
  {
    path: "quote-detail/:id",
    component: QuoteDetailComponent,
  },
  {
    path: "request-quote/:code",
    component: RequestQuoteComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QuoteRoutingModule {}
