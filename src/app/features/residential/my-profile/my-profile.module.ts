import { SharedModule } from './../../shared/shared.module';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MyProfileRoutingModule } from './my-profile-routing.module';
import { ProfileComponent } from './pages/profile/profile.component';
import { ShippingPreferencesComponent } from './pages/shipping-preferences/shipping-preferences.component';
import { BillingAddressComponent } from './pages/billing-address/billing-address.component';
import { NotificationPreferencesComponent } from './pages/notification-preferences/notification-preferences.component';
// import { EmailSubscriptionsComponent } from './pages/email-subscriptions/email-subscriptions.component';
import { DefaultFrontStoreComponent } from './pages/default-front-store/default-front-store.component';
import { MyProfileLayoutComponent } from './components/my-profile-layout/my-profile-layout.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';


@NgModule({
  declarations: [
    ProfileComponent,
    ShippingPreferencesComponent,
    BillingAddressComponent,
    NotificationPreferencesComponent,
    // EmailSubscriptionsComponent,
    DefaultFrontStoreComponent,
    MyProfileLayoutComponent
  ],
  imports: [
    CommonModule,
    MyProfileRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class MyProfileModule { }
