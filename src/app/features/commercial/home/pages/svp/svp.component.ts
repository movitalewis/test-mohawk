import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-svp',
    templateUrl: './svp.component.html',
    styleUrls: ['./svp.component.scss'],
    standalone: false
})
export class SvpComponent implements OnInit {

  svpAccessList: Array<any> = [
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
