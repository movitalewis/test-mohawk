import { Component, OnInit } from '@angular/core';
import { BreadcrumbItems } from 'src/app/features/shared/interfaces';

@Component({
    selector: 'commercial-contact-us',
    templateUrl: './contact-us.component.html',
    styleUrls: ['./contact-us.component.scss'],
    standalone: false
})
export class ContactUsComponent implements OnInit {

  constructor() { }

  breadcrumbItems: BreadcrumbItems = [
    {
      name: 'Home',
      path: '/commercial',
      active: false
    },

    {
      name: 'Contact Us',
      path: '/',
      active: true
    }
  ];

  ngOnInit(): void {
  }

}
