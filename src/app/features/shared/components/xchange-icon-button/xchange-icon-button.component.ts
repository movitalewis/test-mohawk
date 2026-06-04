import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'xchange-icon-button',
    templateUrl: './xchange-icon-button.component.html',
    styleUrls: ['./xchange-icon-button.component.scss'],
    standalone: false
})
export class XchangeIconButtonComponent implements OnInit {

  @Input('icon') icon: string = 'view-pdf';
  @Input('label') label: string = 'View PDF';

  constructor() { }

  ngOnInit(): void {
  }

}
