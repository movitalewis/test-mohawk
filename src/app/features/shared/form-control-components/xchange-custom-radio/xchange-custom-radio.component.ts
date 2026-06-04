import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

@Component({
    selector: "xchange-custom-radio",
    templateUrl: "./xchange-custom-radio.component.html",
    styleUrls: ["./xchange-custom-radio.component.scss"],
    standalone: false
})
export class XchangeCustomRadioComponent implements OnInit {
  @Input("type") type: string = "radio";
  @Input("id") id: string = Date.now().toString();
  @Input("value") value: any;
  @Input("name") name: string = "";
  @Input("disabled") disabled: boolean = false;
  @Input("label") label: string = "";
  @Input("rtl") rtl: boolean = false;
  @Input("group") group: string = "";
  @Input("checked") checked!: boolean;
  @Output("model") model = new EventEmitter<any>();
  @Input("isInvalid") isInvalid: boolean = false;

  onChange: any = () => {
    let state = {
      state: this.checked,
      value: this.value,
      group: this.group,
    };
    this.model.emit(state);
  };
  onTouch: any = () => {};

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  constructor() {}

  ngOnInit() {}

  writeValue(checked: boolean) {
    this.checked = checked;
  }

  onControlChange(e: boolean) {
    this.checked = !this.checked;
    this.onChange(e);
  }
}
