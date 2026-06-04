import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { SwitchButton } from "../../interfaces/switch-button";

@Component({
    selector: "xchange-switch-button",
    templateUrl: "./xchange-switch-button.component.html",
    styleUrls: ["./xchange-switch-button.component.scss"],
    standalone: false
})
export class XchangeSwitchButtonComponent implements OnInit {
  @Input("config") config!: SwitchButton;

  @Output() change: EventEmitter<string> = new EventEmitter<string>();
  @Output() onValueOutput: EventEmitter<string> = new EventEmitter<string>();

  constructor() {}
  currentValue: any
  isToggleActive: boolean = false;

  ngOnInit(): void {
    this.currentValue = this.config.leftValue; // Assuming leftValue is the initial state
  }

  
  
  onChange(e: boolean) {
    const isChecked = e;

    if (this.config.rightLabel === "") {
      return;
    }
    if (isChecked && this.currentValue !== this.config.rightValue) {
      // this.change.emit(this.config.rightValue);
      this.currentValue = this.config.rightValue;
      this.isToggleActive=isChecked
      this.onValueOutput.emit(this.config.rightValue);
    } else if (!isChecked && this.currentValue !== this.config.leftValue){
      this.currentValue = this.config.leftValue;
      this.isToggleActive=isChecked

      // this.change.emit(this.config.leftValue);
      this.onValueOutput.emit(this.config.leftValue);
    }
  }
  
  onImitValue(value: string) {
    this.onValueOutput.emit(value);
  }
}
