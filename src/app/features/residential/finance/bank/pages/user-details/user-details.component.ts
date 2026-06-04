import { Component, OnInit } from '@angular/core';
import { BreadcrumbItems } from 'src/app/features/shared/interfaces';

@Component({
    selector: 'app-user-details',
    templateUrl: './user-details.component.html',
    styleUrls: ['./user-details.component.scss'],
    standalone: false
})
export class UserDetailsComponent implements OnInit {
  breadcrumbItems: BreadcrumbItems = [
    {
      name: 'Home',
      path: '/residential',
      active: false,
    },
    {
      name: 'Finance',
      path: ' ',
      active: false,
    },
    {
      name: 'Add Bank Account',
      path: '/',
      active: true,
    },
  ];

  constructor() {}

  ngOnInit(): void {}
}
