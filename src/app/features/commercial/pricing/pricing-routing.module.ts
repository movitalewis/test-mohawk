import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PriceSearchComponent } from './pages/price-search/price-search.component';
import { PriceDownloadComponent } from './pages/price-download/price-download.component';

const routes: Routes = [
  {
    path: 'price-search',
    component: PriceSearchComponent
  },
  {
    path: 'price-download',
    component: PriceDownloadComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PricingRoutingModule { }
