import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SharedModule } from "../../shared/shared.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ContactUsRoutingModule } from "./contact-us-routing.module";
import { ContactUsComponent } from "./pages/contact-us/contact-us.component";

@NgModule({
  declarations: [
    ContactUsComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ContactUsRoutingModule,
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
})
export class ContactUsModule {}
