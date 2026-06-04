import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AddNewUserComponent } from "./pages/add-new-user/add-new-user.component";
import { ManageUsersComponent } from "./pages/manage-users/manage-users.component";
import { UserDetailsComponent } from "./pages/user-details/user-details.component";
import { EditUserComponent } from "./pages/edit-user/edit-user.component";

const routes: Routes = [
  {
    path: "manage-users",
    component: ManageUsersComponent,
  },
  {
    path: "add-new-user",
    component: AddNewUserComponent,
  },
  {
    path: "manage-users/:id",
    component: UserDetailsComponent,
  },
  {
    path: "manage-users/:id/edit",
    component: EditUserComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CompanyRoutingModule {}
