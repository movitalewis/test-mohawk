import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/features/shared/user/services/user.service';

@Component({
    selector: 'app-billing-address',
    templateUrl: './billing-address.component.html',
    styleUrls: ['./billing-address.component.scss'],
    standalone: false
})
export class BillingAddressComponent implements OnInit {
addresses: any
  constructor(private userService: UserService) { }

  ngOnInit(): void {
     this.userService.profileProgress('billingAddress')
     this.userService.getProfileShippingPreferences().subscribe({
       next: (res) => {
         this.userService.profileProgressHide();     
         this.addresses = res?.body.addresses;
       },
       error: (err) => {
         this.userService.profileProgressHide();        
      },
     });
  }

}
