import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-rvp',
    templateUrl: './rvp.component.html',
    styleUrls: ['./rvp.component.scss'],
    standalone: false
})
export class RvpComponent implements OnInit {

  rvpAccessList: Array<any> = [
    {
      name: 'Claims Approval',
      icon: 'current-reserve',
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
      name: 'View Accounts',
      icon: 'open-sample-orders',
      iconExt: '.svg',
      link: ''
    },
    
  ]

  constructor() { }

  ngOnInit(): void {
  }

}
