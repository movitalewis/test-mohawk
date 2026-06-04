import { Component, Input, OnInit } from "@angular/core";
import { BsModalService } from "ngx-bootstrap/modal";
import {
  faUserLock,
  faAddressCard,
  faAngleLeft,
} from "@fortawesome/free-solid-svg-icons";
import { CommercialSiteIcons } from "../../../shared/constants/commercial-sites";
import { StorageService } from "src/app/features/http-services/storage.service";
import { take } from "rxjs";

@Component({
    selector: "app-commercial-site-selector",
    templateUrl: "./commercial-site-selector.component.html",
    styleUrls: ["./commercial-site-selector.component.scss"],
    standalone: false
})
export class CommercialSiteSelectorComponent implements OnInit {
  // lock = faUserLock;
  // computer = faAddressCard;
  commercialSiteIcon = CommercialSiteIcons;
  arrow = faAngleLeft;
  companiesList:any;
  spinnerLoading:boolean = false;
  constructor(private modalService: BsModalService,
     public storageService: StorageService,
  ) {
     
  }

  @Input() accountData = {};
  userInfo: any = "";
  commercialSites = [
    { name: "Core Commercial", id: "C" },
    { name: "International", id: "I" },
    { name: "Hospitality", id: "H" },
  ];
  selectedSite: string = "";
  onPrimaryAction: Function = (selectedId: any) => {};

  ngOnInit(): void {
    this.spinnerLoading = true;
    if(this.companiesList){
      this.commercialSites = this.commercialSites.filter(site => this.companiesList.includes(site.id));
      this.spinnerLoading = false;
    }
    else {
      this.storageService.getItem("userInfo").pipe(take(1)).subscribe((res: any) => {
        this.userInfo = res;
        const { isCSR, accounts } = this.userInfo;
        if(accounts?.length){
          const matchedAccount = this.userInfo?.accounts.find((account:any) => account.company === "C");
          if (matchedAccount?.companies?.length) {
            this.commercialSites = this.commercialSites.filter(site =>
              matchedAccount?.companies.includes(site.id)
            );
          }
        }
        this.spinnerLoading = false;
      });
    }
  }

  handleAction() {
    this.onPrimaryAction(this.selectedSite);
    this.onHideModal();
  }

  onHideModal() {
    this.modalService.hide("commercialSelector");
  }

  changeSite(event: any, siteId: string) {
    this.selectedSite = siteId;
  }
}
