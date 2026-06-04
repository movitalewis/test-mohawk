import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";
import { CloneOrdersComponent } from "./clone-orders/clone-orders.component";
import { CloneOrdersRoutingModule } from "./clone-orders-routing.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { SharedModule } from "../../shared/shared.module";
import { NgxPaginationModule } from "ngx-pagination";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { ResidentialSharedModule } from "../residential-shared.module";

@NgModule({
  declarations: [CloneOrdersComponent],
  imports: [
    CommonModule,
    FormsModule,
    CloneOrdersRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    MatSlideToggleModule,
    ResidentialSharedModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [DatePipe],
})
export class CloneOrdersModule {}
