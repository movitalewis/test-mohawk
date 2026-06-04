import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-registration-page',
    templateUrl: './registration-page.component.html',
    styleUrls: ['./registration-page.component.scss'],
    standalone: false
})
export class RegistrationPageComponent implements OnInit {

  bannerHeader: string = 'Create your';
  bannerSubContent: string = 'Mohawk Xchange Account';

  constructor() { }

  ngOnInit(): void {
  }

}
