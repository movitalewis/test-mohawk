import { Component, OnInit } from '@angular/core';
import { Columns, Config, DefaultConfig } from 'ngx-easy-table';

@Component({
    selector: 'app-sales-ops',
    templateUrl: './sales-ops.component.html',
    styleUrls: ['./sales-ops.component.scss'],
    standalone: false
})
export class SalesOpsComponent implements OnInit {

  salesOpsAccessList: Array<any> = [
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
    claim: 'NA',
    claimType: 'NA',
    account: '121545',
    customer: 'NA',
    endUser: 'NA',
    claimDate: '01/01/2022',
    invoice: 'NA'
  },
  {
    claim: 'NA',
    claimType: 'NA',
    account: '121545',
    customer: 'NA',
    endUser: 'NA',
    claimDate: '01/01/2022',
    invoice: 'NA'
  }
]


  constructor() { }

  ngOnInit(): void {
    this.configuration = { ...DefaultConfig };
    this.configuration.tableLayout.striped = true;
    this.configuration.tableLayout.hover = false;
    this.configuration.paginationRangeEnabled = false;
    this.columns = [
      { key: 'claim', title: 'Claim #' },
      { key: 'claimType', title: 'Claim Type' },
      { key: 'account', title: 'Account #' },
      { key: 'customer', title: 'Customer #' },
      { key: 'endUser', title: 'End User' },
      { key: 'claimDate', title: 'Claim Date' },
      { key: 'invoice', title: 'Invoice #' },
    ];
  }

}
