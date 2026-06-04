import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-territory-manager',
    templateUrl: './territory-manager.component.html',
    styleUrls: ['./territory-manager.component.scss'],
    standalone: false
})
export class TerritoryManagerComponent implements OnInit {

  territoryOption:Array<any> = [
    'User Name1','User Name2','User Name3','User Name4'
  ];

  productFeaturesList: Array<any> = [
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
