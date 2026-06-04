import { Component, OnInit } from '@angular/core';
import { BreadcrumbItems } from 'src/app/features/shared/interfaces';

@Component({
    selector: 'app-empty-cart',
    templateUrl: './empty-cart.component.html',
    styleUrls: ['./empty-cart.component.scss'],
    standalone: false
})
export class EmptyCartComponent implements OnInit {

  breadcrumbItems: BreadcrumbItems = [
    {
      name: 'Home',
      path: '/residential',
      active: false
    },
    
    {
      name: 'Empty Cart',
      path: '/',
      active: true
    }
  ]

  constructor() { }

  ngOnInit(): void {
  }

}
