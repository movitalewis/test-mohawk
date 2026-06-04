import { Component, Input, OnInit } from "@angular/core";
import { NgxSpinnerService } from "ngx-spinner";
import { MenuConfigService } from "../../layouts/services/menu-config.service";
import { Router } from "@angular/router";

@Component({
    selector: "app-loader",
    templateUrl: "./loader.component.html",
    styleUrls: ["./loader.component.scss"],
    standalone: false
})
export class LoaderComponent implements OnInit {
  constructor(
    private spinner: NgxSpinnerService,
    private menuService: MenuConfigService,
    private router: Router
  ) {}
  @Input() loadersize: any = "medium";
  @Input() fullScreen: boolean = false;
  @Input() spinnerBackgroundColor: string = "";

  height: any;
  ngOnInit(): void {
    this.menuService.headerOffSetHeight.subscribe((res: any) => {
      this.height = res + "px";
    });
    if (
      this.router.url.includes("products/details/") ||
      this.router.url.includes("claims/details")
    ) {
      this.spinnerBackgroundColor = "rgba(0, 0, 0, 0.5)";
    }
    this.spinner.show();
  }
}
