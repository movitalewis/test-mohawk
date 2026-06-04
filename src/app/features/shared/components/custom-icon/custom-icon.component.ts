import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'xchange-custom-icon',
    templateUrl: './custom-icon.component.html',
    styleUrls: ['./custom-icon.component.scss'],
    standalone: false
})
export class CustomIconComponent implements OnInit {

  @Input('icon') icon: string = 'user';
  @Input('bgColor') bgColor: string = '#fff';
  @Input('borderRadius') borderRadius: number = 100;
  @Input('width') width: number = 44;
  @Input('height') height: number = 44;
  @Input('iconExt') iconExt: string = '.svg';
  @Input('path') path: string = '/assets/images/icons/';

  styles: any = {};

  constructor() { }

  ngOnInit(): void {

    this.styles['background'] = this.bgColor;
    this.styles['border-radius'] = this.borderRadius + '%';
    this.styles['width'] = this.width + 'px';
    this.styles['height'] = this.height + 'px';

  }

}
