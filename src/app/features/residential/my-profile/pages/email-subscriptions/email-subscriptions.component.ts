import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-email-subscriptions',
    templateUrl: './email-subscriptions.component.html',
    styleUrls: ['./email-subscriptions.component.scss'],
    standalone: false
})
export class EmailSubscriptionsComponent implements OnInit {


  mailSubscriptionList: Array<string> = [
    'Sign me up for monthly email',
    'Sign me up for Mohawk University upcoming courses and webinars',
    'Sign me up for upcoming promotions and sales',
    'Co-Op Statements',
    'Sign me up for announcements for new marketing products and/or services',
    'Sign me up for any pricing announcements'
  ]

  constructor() { }

  ngOnInit(): void {
  }

}
