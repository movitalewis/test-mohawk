import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { CreditMemoListComponent } from './pages/credit-memos-list/credit-memos-list.component';

const routes: Routes = [
  {
    path: '',
    component: CreditMemoListComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CreditMemosRoutingModule { }
