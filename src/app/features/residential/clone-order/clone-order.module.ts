import { SharedModule } from "src/app/features/shared/shared.module";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CloneSampleOrderComponent } from "./pages/clone-sample-order/clone-sample-order.component";
import { CloneOrderRoutingModule } from "./clone-order-routing.module";
import { ResidentialSharedModule } from "../residential-shared.module";

@NgModule({
  declarations: [CloneSampleOrderComponent],
  imports: [
    CommonModule,
    CloneOrderRoutingModule,
    ResidentialSharedModule,
    SharedModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CloneOrderModule {}
