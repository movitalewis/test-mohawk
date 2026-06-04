import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CloneSampleOrderComponent } from './pages/clone-sample-order/clone-sample-order.component';

const routes: Routes = [
  {
    path: '',
    component: CloneSampleOrderComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CloneOrderRoutingModule { }
