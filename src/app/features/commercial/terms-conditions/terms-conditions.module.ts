import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from "../../shared/shared.module";
import { TermsConditionsComponent } from './pages/terms-conditions/terms-conditions.component';
import { TermsConditionsRoutingModule } from './terms-conditions-routing.module';


@NgModule({
  declarations: [
    TermsConditionsComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    TermsConditionsRoutingModule
  ],
    schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class TermsConditionsModule { }
