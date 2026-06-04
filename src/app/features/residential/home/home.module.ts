import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { SalespersonComponent } from './pages/salesperson/salesperson.component';
import { TerritoryManagerComponent } from './pages/territory-manager/territory-manager.component';
import { RvpComponent } from './pages/rvp/rvp.component';
import { DistrictManagerComponent } from './pages/district-manager/district-manager.component';
import { SvpComponent } from './pages/svp/svp.component';
import { ProductOwnerComponent } from './pages/product-owner/product-owner.component';
import { SalesOpsComponent } from './pages/sales-ops/sales-ops.component';
import { EdgeDashboardComponent } from './pages/edge-dashboard/edge-dashboard.component';
import { SalesopsDashboardComponent } from './pages/salesops-dashboard/salesops-dashboard.component';


@NgModule({
  declarations: [
    HomePageComponent,
    SalespersonComponent,
    TerritoryManagerComponent,
    RvpComponent,
    SalesOpsComponent,
    DistrictManagerComponent,
    SvpComponent,
    ProductOwnerComponent,
    EdgeDashboardComponent,
    SalesopsDashboardComponent,
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    SharedModule
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class HomeModule { }
