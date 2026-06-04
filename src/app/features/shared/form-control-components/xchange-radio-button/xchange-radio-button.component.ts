import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'xchange-radio-button',
    templateUrl: './xchange-radio-button.component.html',
    styleUrls: ['./xchange-radio-button.component.scss'],
    standalone: false
})
export class XchangeRadioButtonComponent implements OnInit {

  @Input('type') type: string = 'radio';
  @Input('id') id: string = Date.now().toString();
  @Input('value') value: any;
  @Input('name') name: string = '';
  @Input('disabled') disabled: boolean = false;
  @Input('label') label: string = '';
  @Input('rtl') rtl: boolean = false;
  @Input('className') className: string = '';
  @Input('classNames') classNames: string = '';
  @Input('checked') isChecked: boolean = false;

  onChange: any = () => { };
  onTouch: any = () => { };

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  constructor() { }

  ngOnInit() { }

  checked!: boolean;
  writeValue(checked: boolean) {
    this.checked = checked;
  }

  onControlChange(e: boolean) {
    this.checked = e;
    this.onChange(e);
  }

}
