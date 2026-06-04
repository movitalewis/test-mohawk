import { Component, OnInit } from '@angular/core';
import { BreadcrumbItems } from 'src/app/features/shared/interfaces';
@Component({
    selector: 'app-advanced-search',
    templateUrl: './advanced-search.component.html',
    styleUrls: ['./advanced-search.component.scss'],
    standalone: false
})
export class AdvancedSearchComponent implements OnInit {
  
  breadcrumbItems: BreadcrumbItems = [
    {
      name: 'Home',
      path: '/commercial',
      active: false
    },
    
    {
      name: 'Advanced Search',
      path: '/',
      active: true
    }
  ]


  ngOnInit(): void {
  }

}






  
