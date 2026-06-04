import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { TermsConditionsComponent } from "./pages/terms-conditions/terms-conditions.component";
const routes: Routes = [
  {
    path: "",
    component: TermsConditionsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TermsConditionsRoutingModule {}
