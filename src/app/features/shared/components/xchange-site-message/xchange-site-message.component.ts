import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { SiteMessage } from '../../interfaces/site-message';

@Component({
    selector: 'xchange-site-message',
    templateUrl: './xchange-site-message.component.html',
    styleUrls: ['./xchange-site-message.component.scss'],
    standalone: false
})
export class XchangeSiteMessageComponent implements OnInit {

  @Input('data') Data!: SiteMessage;

  @ViewChild('editMessageInput') editMessageInput!: ElementRef;

  isEditMode: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

  onEditMessage() {
    const val = this.editMessageInput.nativeElement.value;
    this.Data.content = val;
    this.isEditMode = false;
  }

}



