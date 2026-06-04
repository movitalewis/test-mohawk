import { MyProfileLayoutComponent } from "./components/my-profile-layout/my-profile-layout.component";
// import { EmailSubscriptionsComponent } from "./pages/email-subscriptions/email-subscriptions.component";
import { ProfileComponent } from "./pages/profile/profile.component";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { BillingAddressComponent } from "./pages/billing-address/billing-address.component";
import { DefaultFrontStoreComponent } from "./pages/default-front-store/default-front-store.component";
import { NotificationPreferencesComponent } from "./pages/notification-preferences/notification-preferences.component";
import { ShippingPreferencesComponent } from "./pages/shipping-preferences/shipping-preferences.component";

const routes: Routes = [
  {
    path: "",
    component: MyProfileLayoutComponent,
    children: [
      {
        path: "",
        pathMatch: "full",
        redirectTo: "profile",
      },
      {
        path: "profile",
        data: { component: "profile", name: 'Profile' },
        component: ProfileComponent,
      },
      {
        path: "billing-address",
        data: { component: "billing-address", name: 'Billing Address' },
        component: BillingAddressComponent,
      },
      {
        path: "default-front-store",
        data: { component: "default-front-store", name: 'Default Storefront' },
        component: DefaultFrontStoreComponent,
      },
      // {
      //   path: "email-subscriptions",
      //   data: { component: "email-subscriptions", name: 'Email Subscriptions' },
      //   component: EmailSubscriptionsComponent,
      // },
      {
        path: "notification-preferences",
        data: { component: "notification-preferences", name: 'Notification Preferences' },
        component: NotificationPreferencesComponent,
      },
      {
        path: "shipping-preferences",
        data: { component: "shipping-preferences", name: 'Shipping Preferences' },
        component: ShippingPreferencesComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyProfileRoutingModule {}
