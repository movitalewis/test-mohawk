import { Component, OnInit, TemplateRef } from '@angular/core';
import { Config, Columns, DefaultConfig } from 'ngx-easy-table';
import { BreadcrumbItems } from 'src/app/features/shared/interfaces';

@Component({
    selector: 'app-clone-sample-order',
    templateUrl: './clone-sample-order.component.html',
    styleUrls: ['./clone-sample-order.component.scss'],
    standalone: false
})
export class CloneSampleOrderComponent implements OnInit {
  breadcrumbItems: BreadcrumbItems = [
    {
      name: 'Home',
      path: '/residential',
      active: false
    },
    {
      name: 'Clone A Sample Order',
      path: '/',
      active: true
    }
  ]
  public configuration!: Config;
  public columns!: Columns[];

 

  public data = [{
    account: '443300011',
    suffix: '245',
    accountname: 'St Bernand Villege',
    address: '123 Road St, Dockers, PN, 59941',
    phone: '+1988-899-8888',
  },
  {
    account: '443300011',
    suffix: '245',
    accountname: 'St Bernand Villege',
    address: '123 Road St, Dockers, PN, 59941',
    phone: '+1988-899-8888',
  },
  {
    account: '443300011',
    suffix: '245',
    accountname: 'St Bernand Villege',
    address: '123 Road St, Dockers, PN, 59941',
    phone: '+1988-899-8888',
  },
  {
    account: '443300011',
    suffix: '245',
    accountname: 'St Bernand Villege',
    address: '123 Road St, Dockers, PN, 59941',
    phone: '+1988-899-8888',
  },
  {
    account: '443300011',
    suffix: '245',
    accountname: 'St Bernand Villege',
    address: '123 Road St, Dockers, PN, 59941',
    phone: '+1988-899-8888',
  },

  ];


  ngOnInit(): void {
    this.configuration = { ...DefaultConfig };
    this.configuration.checkboxes = true;
    this.configuration.tableLayout.striped = true;
    this.configuration.tableLayout.hover = false;
    this.configuration.paginationRangeEnabled = false;
    this.configuration.paginationEnabled = false;
    this.columns = [
      { key: 'account', title: 'Account #' },
     { key: 'accountname', title: 'Account Name' },
      { key: 'address', title: 'Address' },
      { key: 'phone', title: 'Phone #' },
    ];
    
  }

}
