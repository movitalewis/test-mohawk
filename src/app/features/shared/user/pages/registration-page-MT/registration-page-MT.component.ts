import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-registration-page-MT',
    templateUrl: './registration-page-MT.component.html',
    styleUrls: ['./registration-page-MT.component.scss'],
    standalone: false
})
export class RegistrationPageMTComponent implements OnInit {
  bannerHeader: string = 'Create your';
  bannerSubContent: string = 'Mohawk Xchange Account';

  constructor() { }

  ngOnInit(): void {
  }
}
