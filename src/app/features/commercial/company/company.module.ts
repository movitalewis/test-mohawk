import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CompanyRoutingModule } from "./company-routing.module";
import { SharedModule } from "../../shared/shared.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { AddNewUserComponent } from "./pages/add-new-user/add-new-user.component";
import { UserDetailsComponent } from "./pages/user-details/user-details.component";
import { ManageUsersComponent } from "./pages/manage-users/manage-users.component";
import { EditUserComponent } from "./pages/edit-user/edit-user.component";
import { NgxPaginationModule } from "ngx-pagination";
@NgModule({
  declarations: [
    ManageUsersComponent,
    AddNewUserComponent,
    UserDetailsComponent,
    EditUserComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    CompanyRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class CompanyModule {}
