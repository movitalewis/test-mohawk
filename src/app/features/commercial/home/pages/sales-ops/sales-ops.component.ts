import { Component, OnInit } from '@angular/core';
import { Columns, Config, DefaultConfig } from 'ngx-easy-table';

@Component({
    selector: 'app-sales-ops',
    templateUrl: './sales-ops.component.html',
    styleUrls: ['./sales-ops.component.scss'],
    standalone: false
})
export class SalesOpsComponent implements OnInit {

  seniorViceOption:Array<any> = [
    'User Name','User Name','User Name','User Name'
];

regionalViceOption:Array<any> = [
  'User Name','User Name','User Name','User Name','User Name','User Name'
];

  districtOption:Array<any> = [
    'User Name','User Name','User Name','User Name'
];

territoryOption:Array<any> = [
 'User Name1','User Name2','User Name3','User Name4','User Name','User Name'
];

shownOption:Array<any> = [
  '25','50','100','200'
 ];

 public configuration!: Config;
  public columns!: Columns[];

  public data = [{
    account: '9055356',
    accountName: 'User/Retailer Name',
    address: 'About All Floors(Suffix#0) 5 Maplewood Dr Hefner Holdings Llc Douglassville, US-PA 19518',
    phone: '800-111-2222'
  },
  {
    account: '9055356',
    accountName: 'User/Retailer Name',
    address: 'About All Floors(Suffix#0) 5 Maplewood Dr Hefner Holdings Llc Douglassville, US-PA 19518',
    phone: '800-111-2222'
  }
]

  constructor() { }

  ngOnInit(): void {
    this.configuration = { ...DefaultConfig };
    this.configuration.tableLayout.striped = true;
    this.configuration.tableLayout.hover = false;
    this.configuration.paginationRangeEnabled = false;
    this.columns = [
      { key: 'account', title: 'Account #', cssClass: { includeHeader: false, name: 'color-red' } },
      { key: 'accountName', title: 'Account Name' },
      { key: 'address', title: 'Address' },
      { key: 'phone', title: 'Phone' },
    ];
  }

}
