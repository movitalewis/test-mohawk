import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'xchange-registration-banner',
    templateUrl: './xchange-registration-banner.component.html',
    styleUrls: ['./xchange-registration-banner.component.scss'],
    standalone: false
})
export class XchangeRegistrationBannerComponent implements OnInit {

  @Input('headerText') headerText: string = 'Welcome to Mohawk Xchange';
  @Input('subContent') subContent: string = `Discover our extensive offering of carpet tile, broadloom, woven and area rugs.`;

  @Input('logoType') logoType: string = 'commercial';
  @Input('logoTheme') logoTheme: string = 'light';

  constructor() { }

  ngOnInit(): void {
  }

}
