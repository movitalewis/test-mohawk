import { Component, OnInit, ViewChild, ElementRef, Input } from "@angular/core";
import { BsModalService } from "ngx-bootstrap/modal";
import { StorageService } from "src/app/features/http-services/storage.service";


@Component({
    selector: "app-captcha",
    templateUrl: "./captcha.component.html",
    styleUrls: ["./captcha.component.scss"],
    standalone: false
})
export class CaptchaComponent implements OnInit {
  passKey: any = "";
  passCode: any =""

  @ViewChild("passKeyInput") passKeyInput!: ElementRef;
  @Input() closeModalOnPrimaryAction = true;

  constructor(
    private modalService: BsModalService,
    private storageService: StorageService
  ) {}

  onSecondaryAction: Function = () => {};
  onPrimaryAction: Function = (passkey: any) => {};

  handleAction(type: string) {
    type === "primary"
      ? this.onPrimaryAction(this.passKey)
      : this.onSecondaryAction();
    if (this.closeModalOnPrimaryAction) {
      this.modalService.hide("captchaModal");
    }
  }

  ngOnInit(): void {
    // const passKey = this.storageService.getItem("passKey");
    this.storageService.getItem("passKey").subscribe((res) => {
      this.passCode = res;
    });
    // Give the input focus when the modal is opened
    this.modalService.onShown.subscribe(() => {
      this.passKeyInput.nativeElement.focus();
    });
  }

  onHideModal(id: any) {
    this.modalService.hide(id);
  }
}
