import {
  Component,
  EventEmitter,
  OnInit,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { Config, DefaultConfig } from "ngx-easy-table";
import { UserService } from "../../services/user.service";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { Router } from "@angular/router";
import { StorageService } from "src/app/features/http-services/storage.service";
import { of } from "rxjs";

@Component({
    selector: "app-storefront-selector",
    templateUrl: "./storefront-selector.component.html",
    styleUrls: ["./storefront-selector.component.scss"],
    standalone: false
})
export class StorefrontSelectorComponent implements OnInit {
  public configuration!: Config;
  selectCommercial: boolean = false;
  selectResidential: boolean = false;
  storefront: string = "";
  loading: boolean = false;
  alertData: any = {
    message: "success",
  };
  alertType: string = "success";
  alertTrigger: boolean = false;
  optionSelected: EventEmitter<string> = new EventEmitter<string>();

  constructor(
    public bsModalRef: BsModalRef,
    public modalService: BsModalService,
    private userService: UserService
  ) {}

  ngOnInit(): void {}

  changeStorefront(e: any) {
    if (e.state) {
      switch (e.group) {
        case "Commercial":
          this.selectResidential = !e.state;
          this.selectCommercial = e.state;
          this.storefront = e.value;
          break;
        case "Residential":
          this.selectResidential = e.state;
          this.selectCommercial = !e.state;
          this.storefront = e.value;
          break;
      }
    }
  }

  onSave() {
    this.loading = true;
    this.userService.setDefaultStorefront(this.storefront).subscribe({
      next: (res) => {
        this.optionSelected.emit(this.storefront);
        this.loading = false;
        if (res?.body) {
          this.alertData = {
            message: res?.body?.message,
          };
          this.alertType = "success";
          this.alertTrigger = true;
        }
        this.bsModalRef.hide();
      },
      error: (err) => {
        this.bsModalRef.hide();
        this.loading = false;
        this.alertData = {
          message: err,
        };
        this.alertType = "danger";
        this.alertTrigger = true;
      },
    });
  }
}
