import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-district-manager',
    templateUrl: './district-manager.component.html',
    styleUrls: ['./district-manager.component.scss'],
    standalone: false
})
export class DistrictManagerComponent implements OnInit {

  districtOption:Array<any> = [
    'User Name','User Name','User Name','User Name'
];

territoryOption:Array<any> = [
 'User Name1','User Name2','User Name3','User Name4'
];

districtManagerAccessList: Array<any> = [
 {
   name: 'Open Sample Orders',
   icon: 'open-sample-orders',
   iconExt: '.svg',
   link: ''
 },
 {
   name: 'Today’s Shipment',
   icon: 'todays-shipment',
   iconExt: '.svg',
   link: ''
 },
 {
   name: 'View Accounts',
   icon: 'open-sample-orders',
   iconExt: '.svg',
   link: ''
 },
 {
   name: 'Clone Sample Order',
   icon: 'open-claim',
   iconExt: '.svg',
   link: ''
 },
 {
   name: 'View Sample Budget',
   icon: 'active-quotes',
   iconExt: '.svg',
   link: ''
 },
 {
   name: 'Claims Approval',
   icon: 'current-reserve',
   iconExt: '.svg',
   link: ''
 }
]


  constructor() { }

  ngOnInit(): void {
  }

}
