import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

const routes: Routes = [
  {
    path: "bank",
    loadChildren: () => import("./bank/bank.module").then((m) => m.BankModule),
  },
  {
    path: "payments",
    loadChildren: () =>
      import("./payments/payments.module").then((m) => m.PaymentsModule),
  },
  {
    path: "invoices",
    loadChildren: () =>
      import("./invoices/invoices.module").then((m) => m.InvoicesModule),
  },
  {
    path: 'credit-memos',
    loadChildren: () => import('./credit-memos/credit-memos.module').then(m => m.CreditMemosModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FinanceRoutingModule {}
