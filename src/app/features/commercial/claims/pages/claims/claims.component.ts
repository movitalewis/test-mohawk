import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { Config, Columns, DefaultConfig } from "ngx-easy-table";
import { BreadcrumbItems } from "src/app/features/shared/interfaces";
import { ClaimsService } from "../../services/claims.service";
import { StorageService } from "src/app/features/http-services/storage.service";

@Component({
    selector: "xchange-claims",
    templateUrl: "./claims.component.html",
    styleUrls: ["./claims.component.scss"],
    standalone: false
})
export class ClaimsComponent implements OnInit {
  @ViewChild('scrollTop') scrollTop!: ElementRef;
  breadcrumbItems: BreadcrumbItems = [
    {
      name: "Home",
      path: "/commercial",
      active: false,
    },
    {
      name: "Claims",
      path: "/",
      active: true,
    },
  ];
  claimTypesData = [
    {
      title: "Freight Billing Error",
      description:
        "Choose this option for an issue with freight charges, fuel charges, or drop charges.",
      link: "/commercial/claims/freight-billing-error",
      imageUrl:
        "/assets/icons/Xchange_frieght-billing-error-claim-icon.svg",
    },
    {
      title: "Pricing Billing Error",
      description:
        "Choose this option for issues with product pricing.",
      link: "/commercial/claims/pricing-billing-error",
      imageUrl:
        "/assets/icons/Xchange_pricing-billing-error-claim-icon.svg",
    },
    {
      title: "Tax Billing Error",
      description:
        "Tax only issues",
      link: "/commercial/claims/tax-billing-error",
      imageUrl:
        "/assets/icons/Xchange_tax-billing-error-claim-icon.svg",
    },
    {
      title: "Accomodation Return",
      description:
        "Choose this option to request a return authorization for material that is uninstalled and not suspected to be defective. Note: Restocking and freight fees may apply.",
      link: "/commercial/claims/accommodation-return",
      imageUrl:
        "/assets/icons/Xchange_accomodation-return-claim-icon.svg",
    },
    {
      title: "Order Error Claim",
      description:
        "Choose this option for errors created by Mohawk during the order entry process",
      link: "/commercial/claims/order-error-claim",
      imageUrl:
        "/assets/icons/Xchange_frieght-billing-error-claim-icon.svg",
    },
    {
      title: "Defective Product Claim",
      description:
        "Choose this option if you suspect the product is defective in some way. Note: Do not use this option for damage, wrong or mislabeled product, or quantity errors",
      link: "/commercial/claims/defective-product-claim",
      imageUrl:
        "/assets/icons/Xchange_defective-product-claim-icon.svg",
    },
    {
      title: "Wrong Product Claim",
      description:
        "Choose this option if the product received was something other than what was ordered.",
      link: "/commercial/claims/wrong-product-claim",
      imageUrl: "/assets/icons/Xchange_wrong-product-claim-icon.svg",
    },
    {
      title: "Damage Claim",
      description:
        "Choose this option if product was delivered with shipping/handling damage. Note: Visible must be reported within 10 days.",
      link: "/commercial/claims/damage-claim",
      imageUrl: "/assets/icons/Xchange_damage-claim-icon.svg",
    },
    {
      title: "Quantity Claim",
      description:
        "Choose this option if the quantity of product received was more or less than the quantity ordered.",
      link: "/commercial/claims/quantity-claim",
      imageUrl: "/assets/icons/Xchange_quantity-claim-icon.svg",
    },
    {
      title: "Cancellation Fees",
      description:
        "Choose this option if you feel you were incorrectly charged cancellation fees because of a cancelled order.",
      link: "/commercial/claims/cancellation-fees",
      imageUrl: "/assets/icons/Xchange_cancellation-fee-claim-icon.svg",
    },
    {
      title: "Assurance Warranty Claim",
      description:
        "Choose this option only if your product is covered by a 30,60,90, or 120 day assurance warranty as outlined in your warranty document. Note: These claims are not defect related.",
      link: "/commercial/claims/assurance-warranty-claim",
      imageUrl:
        "/assets/icons/Xchange_assurance-warranty-claim-icon.svg",
    },
    {
      title: "Add Labor to an Existing Claim",
      description:
        "Choose this option when you need to add labor to an existing claim.",
      link: "/commercial/claims/add-labor-claim",
      imageUrl:
        "/assets/icons/Labor-color-circle.svg",
        buttonLabel: "ADD LINE CLAIM"

    }
  ];

  constructor(
    private claimsService: ClaimsService,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    this.storageService.removeItem("claimNumber");
    this.claimsService.selectedProductLines.next([]);
    this.claimsService.resetSelctedInvoiceLines();
    this.claimsService.selectedInvoiceLines.isFromClaimHistory = false;
  }

  createNewClaim(additionalInfoNotes: string, reasonForClaimNotes: string) {}
  scrollToTop() {
    this.scrollTop.nativeElement.scrollIntoView({ top:0, behavior: 'smooth' });
  }
}
