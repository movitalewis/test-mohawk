import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";
import { ResidentialRoutingModule } from "./residential-routing.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { SharedModule } from "src/app/features/shared/shared.module";
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ResidentialRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [DatePipe],
})
export class ResidentialModule {}
