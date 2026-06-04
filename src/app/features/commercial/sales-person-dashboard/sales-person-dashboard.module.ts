import { CommonModule } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ModalModule } from "ngx-bootstrap/modal";
import { CarouselModule } from "ngx-owl-carousel-o";
import { SharedModule } from "../../shared/shared.module";
import { SalesPersonDashboardComponent } from "./components/sales-person-dashboard/sales-person-dashboard.component";
import { SalesPersonDashboardRoutingModule } from "./sales-person-dashboard-routing.module";

@NgModule({
  declarations: [SalesPersonDashboardComponent],
  imports: [
    CommonModule,
    FormsModule,
    SalesPersonDashboardRoutingModule,
    SharedModule,
    ModalModule,
    CarouselModule,
    ReactiveFormsModule,
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  providers: [],
})
export class SalePersonDashboardModule {}
