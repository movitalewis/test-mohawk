import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FinanceRoutingModule } from "./finance-routing.module";
import { SharedModule } from "../../shared/shared.module";

@NgModule({
  declarations: [],
  imports: [CommonModule, FinanceRoutingModule, SharedModule],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class FinanceModule {}
