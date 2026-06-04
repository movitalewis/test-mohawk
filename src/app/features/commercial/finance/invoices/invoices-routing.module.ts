import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { InvoicesListComponent } from './pages/invoices-list/invoices-list.component';

const routes: Routes = [
  {
    path: '',
    component: InvoicesListComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InvoicesRoutingModule { }
