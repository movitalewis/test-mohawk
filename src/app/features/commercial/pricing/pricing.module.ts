import { SharedModule } from 'src/app/features/shared/shared.module';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PricingRoutingModule } from './pricing-routing.module';
import { PriceSearchComponent } from './pages/price-search/price-search.component';
import { PriceDownloadComponent } from './pages/price-download/price-download.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';


@NgModule({
  declarations: [
    PriceDownloadComponent,
    PriceSearchComponent
  ],
  imports: [
    CommonModule,
    PricingRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    NgxPaginationModule
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class PricingModule { }
