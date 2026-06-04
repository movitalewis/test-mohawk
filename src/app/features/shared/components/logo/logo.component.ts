import { Component, Inject, Input, OnInit, PLATFORM_ID } from "@angular/core";
import { branndThumbUrl } from "src/app/features/shared/constants/brand-logo";
import { isPlatformBrowser } from "@angular/common";
@Component({
    selector: "xchange-logo",
    templateUrl: "./logo.component.html",
    styleUrls: ["./logo.component.scss"],
    standalone: false
})
export class LogoComponent implements OnInit {
  @Input("type") type: string = "commercial";
  @Input("theme") theme: string = "light";
  @Input("className") className: string = "header-logo";
  @Input("width") width!: number;
  @Input("height") height!: number;
  @Input("selectedPdpData") selectedPdpData: any;

  logoUrl: any = "";
  logotype: any;
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterContentInit() {
    if (this.selectedPdpData) {
      let brandLogoUrl = "";
      branndThumbUrl.map(
        (item: { brandId: any; brandName: any; brandLogoURl: any }) => {
          let itemBrandId = item?.brandId || "";
          let itemBrandName = item?.brandName || "";
          let selectedBrandId = this.selectedPdpData?.brandId || "";
          let selectedBrandName = this.selectedPdpData?.brandName || "";
          if (
            itemBrandId === selectedBrandId ||
            itemBrandName === selectedBrandName
          ) {
            brandLogoUrl = item?.brandLogoURl || "";
          }
        }
      );
      if (brandLogoUrl) {
        this.logoUrl = brandLogoUrl;
      } else {
        this.logoUrl =
          "/assets/images/logo-" + this.type + "-" + this.theme + this.logotype;
      }
    } else {
      this.logoUrl =
        "/assets/images/logo-" + this.type + "-" + this.theme + this.logotype;
    }
  }

  ngOnInit(): void {
    if (
      !navigator.userAgent.includes("Chrome") &&
      navigator.userAgent.includes("Safari")
    ) {
      this.logotype = ".png";
      const setLogoheight = document.querySelectorAll(".header-logo ");
      setLogoheight.forEach((element) => {
        const elem = element as HTMLElement;
        if(window.innerWidth <= 768){
          elem.style.height = '37px';
        }
        else{
          elem.style.height = '44px';
          elem.style.marginTop = '13px';
        }
       
      });
    
    } else {
      this.logotype = ".svg";
    }
    this.logoUrl =
      "/assets/images/logo-" + this.type + "-" + this.theme + this.logotype;
  }
}
