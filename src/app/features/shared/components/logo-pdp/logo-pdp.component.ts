import { Component, Input, OnInit, SimpleChanges } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { branndThumbUrl } from "src/app/features/shared/constants/brand-logo";

@Component({
    selector: "xchange-logo-pdp",
    templateUrl: "./logo-pdp.component.html",
    styleUrls: ["./logo-pdp.component.scss"],
    standalone: false
})
export class LogoPdpComponent implements OnInit {
  @Input("type") type: string = "commercial";
  @Input("theme") theme: string = "light";
  @Input("isInverted") isInverted: boolean = false;

  @Input("className") className: string = "";
  @Input("width") width!: number;
  @Input("height") height!: number;
  @Input("selectedPdpData") selectedPdpData: any;

    
    constructor(private router: Router) {}

  logoUrl: any = "";
  ngOnChanges(changes: SimpleChanges): void {}

  ngAfterContentInit() {
    let brandLogoUrl = "";
    branndThumbUrl.map(
      (item: {
        brandId: any;
        brandName: any;
        brandLogoURl: any;
        brandInvertedLogoURl: any;
      }) => {
        let itemBrandId = item?.brandId || "";
        let itemBrandName = item?.brandName || "";
        let selectedBrandId = this.selectedPdpData?.brandId || "";
        let selectedBrandName = this.selectedPdpData?.brandName || "";
        if (
          itemBrandId === selectedBrandId ||
          itemBrandName === selectedBrandName
        ) {
          brandLogoUrl = !this.isInverted
            ? item?.brandLogoURl || ""
            : item?.brandInvertedLogoURl || item?.brandLogoURl || "";
        }
      }
    );
    if (brandLogoUrl) {
      this.logoUrl = brandLogoUrl;
    } else {
      if (!this.isInverted) {
        this.logoUrl =
          "/assets/images/logo-" + this.type + "-" + this.theme + ".svg";
      } else {

        if (this.router.url.includes("residential")) {
          this.logoUrl =
            "https://s7d4.scene7.com/is/image/MohawkResidential/it_mohawk_white_banner_logo?fmt=png-alpha&op_sharpen=1";
        } else {
          this.logoUrl =
            "https://s7d4.scene7.com/is/image/MohawkResidential/it_mohawk_group_white_banner_logo?fmt=png-alpha&op_sharpen=1";
        }
      }
    }
  }

  ngOnInit(): void {
    this.logoUrl =
      "/assets/images/logo-" + this.type + "-" + this.theme + ".svg";
  }
}
