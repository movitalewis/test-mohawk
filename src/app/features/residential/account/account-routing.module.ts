import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountSearchComponent } from './pages/account-search/account-search.component';
import { MultiAccountComponent } from './pages/multi-account/multi-account.component';
import { CsrListAccountsComponent } from './pages/csr-list-accounts/csr-list-accounts.component';
import { DeactivateGaurdService } from '../../http-services/deactivate-gaurd.service';

const routes: Routes = [
  {
    path: 'search',
    component: AccountSearchComponent
  },
  {
    path: 'multi-account',
    component: MultiAccountComponent
  },
  {
    path: 'accounts-list',
    component: CsrListAccountsComponent,
    canDeactivate: [DeactivateGaurdService],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountRoutingModule { }
