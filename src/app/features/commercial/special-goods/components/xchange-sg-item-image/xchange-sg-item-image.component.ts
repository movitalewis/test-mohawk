import { Component, Input, OnInit, ChangeDetectorRef } from "@angular/core";
import { SwitchButton } from "src/app/features/shared/interfaces/switch-button";

@Component({
  selector: "xchange-sg-item-image",
  standalone: false,
  templateUrl: "./xchange-sg-item-image.component.html",
  styleUrls: ["./xchange-sg-item-image.component.scss"],
})
export class XchangeSgItemImageComponent implements OnInit {
  @Input("data") data: any = "";
  @Input("index") index!: number;

  imageType: string = "swatch";

  imageUrl = "";

  switchBtnConfig!: SwitchButton;

  constructor(private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.imageUrl = this.data.swatchImg;
    this.switchBtnConfig = {
      leftLabel: "Swatch",
      leftValue: "swatch",
      rightLabel: "Room View",
      rightValue: "room",
      id: "image-mode" + this.index,
    };
  }

  onSwitch(imgType: any) {
    if (imgType === "swatch") {
      this.imageUrl = this.data.swatchImg;
    } else {
      this.imageUrl = this.data.roomImg;
    }
    this.cd.detectChanges();
  }
}
