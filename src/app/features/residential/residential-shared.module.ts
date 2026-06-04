import { NgModule } from "@angular/core";
import { ChooseAddressLightboxComponent } from "./products/components/choose-address-lightbox/choose-address-lightbox.component";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { SharedModule } from "../shared/shared.module";

@NgModule({
  declarations: [ChooseAddressLightboxComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    SharedModule,
  ],
  exports: [ChooseAddressLightboxComponent],
})
export class ResidentialSharedModule {}
