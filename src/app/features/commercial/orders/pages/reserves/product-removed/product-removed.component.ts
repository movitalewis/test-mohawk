import { Component, OnInit } from '@angular/core';
import { BreadcrumbItems } from 'src/app/features/shared/interfaces';

@Component({
    selector: 'app-product-removed',
    templateUrl: './product-removed.component.html',
    styleUrls: ['./product-removed.component.scss'],
    standalone: false
})
export class ProductRemovedComponent implements OnInit {

  breadcrumbItems: BreadcrumbItems = [
    {
      name: 'Home',
      path: '/commercial',
      active: false
    },
    {
      name: 'Reserve #32023043',
      path: '/',
      active: true
    },
    
  ]

  constructor() { }

  ngOnInit(): void {
  }

}
