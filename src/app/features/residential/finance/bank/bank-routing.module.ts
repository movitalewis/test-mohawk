import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AccountStatementDetailsComponent } from './pages/account-statement-details/account-statement-details.component';
import { AccountStatementsComponent } from './pages/account-statements/account-statements.component';
import { AccountsListComponent } from './pages/accounts-list/accounts-list.component';
import { AddAccountComponent } from './pages/add-account/add-account.component';
import { EarningStatementsComponent } from './pages/earning-statements/earning-statements.component';
import { EditAccountComponent } from './pages/edit-account/edit-account.component';
import { ManageUsersComponent } from '../../company/pages/manage-users/manage-users.component';

const routes: Routes = [
  {
    path: 'add-account',
    component: AddAccountComponent
  },
  {
    path: 'edit-account',
    component: EditAccountComponent
  },
  {
    path: 'accounts-list',
    component: AccountsListComponent
  },
  {
    path: 'earning-statements',
    component: EarningStatementsComponent
  },
  {
    path: 'account-statements',
    component: AccountStatementsComponent
  },
  {
    path: 'account-statement-details/:id',
    component: AccountStatementDetailsComponent
  },
  
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BankRoutingModule { }
