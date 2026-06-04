import { SharedModule } from './../../shared/shared.module';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EntitlementManagerRoutingModule } from './entitlement-manager-routing.module';
import { EntitlementManagerComponent } from './pages/entitlement-manager/entitlement-manager.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';


@NgModule({
  declarations: [
    EntitlementManagerComponent
  ],
  imports: [
    EntitlementManagerRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
    CommonModule
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class EntitlementManagerModule { }
