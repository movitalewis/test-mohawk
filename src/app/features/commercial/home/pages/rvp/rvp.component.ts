import { Component, OnInit } from '@angular/core';
import { Columns, Config, DefaultConfig } from 'ngx-easy-table';

@Component({
    selector: 'app-rvp',
    templateUrl: './rvp.component.html',
    styleUrls: ['./rvp.component.scss'],
    standalone: false
})
export class RvpComponent implements OnInit {

  territoryManagerAccess: Array<any> = [
    {
      name: 'Today’s Shipment',
      icon: 'todays-shipment',
      iconExt: '.svg',
      link: ''
    },
    {
      name: 'Open Sample Orders',
      icon: 'open-sample-orders',
      iconExt: '.svg',
      link: ''
    }
  ]

  public configuration!: Config;
  public columns!: Columns[];

  public data = [{
    claim: '9068453',
    claimType: 'Installed',
    account: '02110121',
    customer: 'All About Floors',
    endUser: 'User Name',
    claimDate: '08/04/2022',
    invoice: '2123123'
  },
  {
    claim: '9068586',
    claimType: 'Uninstalled',
    account: '58910121',
    customer: 'All About Floors',
    endUser: 'User Name',
    claimDate: '08/04/2022',
    invoice: '2123123'
  }
]

  constructor() { }

  ngOnInit(): void {
    this.configuration = { ...DefaultConfig };
    this.configuration.tableLayout.striped = true;
    this.configuration.tableLayout.hover = false;
    this.configuration.paginationRangeEnabled = false;
    this.columns = [
      { key: 'claim', title: 'Claim #', cssClass: { includeHeader: false, name: 'color-red' } },
      { key: 'claimType', title: 'Claim Type' },
      { key: 'account', title: 'Account #' },
      { key: 'customer', title: 'Customer Name' },
      { key: 'endUser', title: 'End User' },
      { key: 'claimDate', title: 'Claim Date' },
      { key: 'invoice', title: 'Invoice #' },
    ];
  }

}
