import { Component, OnInit } from "@angular/core";
import { UserService } from "src/app/features/shared/user/services/user.service";

@Component({
    selector: "app-default-front-store",
    templateUrl: "./default-front-store.component.html",
    styleUrls: ["./default-front-store.component.scss"],
    standalone: false
})
export class DefaultFrontStoreComponent implements OnInit {
  selectCommercial: boolean = false;
  selectResidential: boolean = false;
  hasOnlyResidential: boolean = false;
  hasOnlyCommercial: boolean = false;
  storefront: string = "";
  spinnerLoading = false;
  alertData: any = {
    message: "success",
  };
  alertType: string = "success";
  alertTrigger: boolean = false;
  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.currentUserDetails.subscribe((res) => {
      if (res?.body?.isCustomer) {
        this.hasOnlyResidential = res?.body?.accounts?.every(
          (account: any) => account.company === "R"
        );
        this.hasOnlyCommercial = res?.body?.accounts?.every(
          (account: any) => account.company === "C"
        );
      }

      res?.body.defaultStorefront === "R"
        ? (this.selectResidential = true)
        : (this.selectCommercial = true);
    },(err)=>{
      this.userService.profileProgressHide()
    });
  }

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
    this.userService.profileProgress('defaultFrontStore')
    this.userService.setDefaultStorefront(this.storefront).subscribe({
      next: (res) => {
        this.userService.profileProgressHide()
        if (res?.body) {
          this.alertData = {
            message: res?.body?.message
              ? res?.body?.message
              : "Default Storefront is set for the current customer.",
          };
          this.alertType = "success";
          this.alertTrigger = true;
          this.stopAlert();
        }
      },
      error: (err) => {
        this.userService.profileProgressHide()
        this.alertData = {
          message: err,
        };
        this.alertType = "danger";
        this.alertTrigger = true;
        this.stopAlert();
      },
    });
  }
  stopAlert() {
    setTimeout(() => {
      this.alertTrigger = false;
    }, 6000);
  }
}
