
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EntitlementManagerComponent } from './pages/entitlement-manager/entitlement-manager.component';

const routes: Routes = [
  {
    path: '',
    component: EntitlementManagerComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EntitlementManagerRoutingModule { }
