import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SampleBudgetComponent } from './pages/sample-budget/sample-budget.component';

const routes: Routes = [
  {
    path: '',
    component: SampleBudgetComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BudgetRoutingModule { }
