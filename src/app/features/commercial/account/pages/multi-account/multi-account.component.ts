import {
  Component,
  ElementRef,
  OnInit,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { Router } from "@angular/router";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { Columns, Config, DefaultConfig } from "ngx-easy-table";
import { StorageService } from "src/app/features/http-services/storage.service";
import { UserService } from "src/app/features/shared/user/services/user.service";
import { ProductService } from "../../../products/pages/services/product.service";
import { CaptchaComponent } from "src/app/features/shared/components/captcha/captcha.component";
import { AccountService } from "../../services/account.service";
import { ManagementService } from "../../../company/services/management.service";
import { BreadcrumbItems } from "src/app/features/shared/interfaces";
import { CommercialSiteSelectorComponent } from "src/app/features/shared/components/commercial-site-selector/commercial-site-selector.component";
import { CommercialSiteSelectorService } from "src/app/features/http-services/commercial-site-selector.service";

@Component({
    selector: "app-multi-account",
    templateUrl: "./multi-account.component.html",
    styleUrls: ["./multi-account.component.scss"],
    standalone: false
})
export class MultiAccountComponent implements OnInit {
  data: any[] = [];
  cartData: any = {};
  hasCartItems: boolean = false;
  currentAccount: string = "";
  newAccount: string = "";
  @ViewChild("scrollToTop", { read: ElementRef }) scrollToTop: any;
  @ViewChild("confirmCart")
  confirmCart!: TemplateRef<any>;
  isImpersonate:boolean = false;
  constructor(
    private userService: UserService,
    private router: Router,
    private storageService: StorageService,
    public bsModalRef: BsModalRef,
    public modalService: BsModalService,
    public productService: ProductService,
    private accountService: AccountService,
    private mgmtService: ManagementService,
    private commercialSiteSelectorService: CommercialSiteSelectorService
  ) {}

  spinnerLoading = false;
  public configuration!: Config;
  public columns!: Columns[];
  showErrorMessage = false;
  errorMessage = "";
  breadcrumbItems: BreadcrumbItems = [
    {
      name: "Home",
      path: "/commercial/salesperson",
      active: false,
    },
    {
      name: "Accounts",
      path: "",
      active: true,
    },
  ];
  ngOnInit(): void {
    this.commercialSiteSelectorService.resetSelectedSiteForStorage();

    this.userService.setAccountInfoState(false);

    this.mgmtService.getAccountList().subscribe((res) => {
      this.data = res?.body?.filter((account: any) => account.company === "C");
    });
    this.getUserDetail();

    this.isImpersonate = sessionStorage.getItem("startSession") === "true";
    this.configuration = { ...DefaultConfig };
    this.configuration.tableLayout.striped = true;
    this.configuration.tableLayout.hover = false;
    this.configuration.paginationRangeEnabled = false;
    this.configuration.paginationEnabled = false;
    this.configuration.infiniteScroll = true;
    this.cartData = this.storageService.cartData;
    if (this.cartData && this.cartData.code !== undefined) {
      this.hasCartItems = true;
      this.currentAccount = this.cartData.shipTo;
    }
    this.columns = [
      { key: "Account", title: "Account #" },
      { key: "Account Name", title: "Account Name" },
      { key: "Address", title: "Address" },
      { key: "Phone", title: "Phone" },
    ];
    const accountNum = localStorage.getItem("accountNumber");
    this.setUnit();
  }
  setUnit() {
    this.userService.setUnit("").subscribe((res) => {
      this.userService.setAccountInfoState(false);
      this.storageService.setselectedAccount(null);
    });
  }
  activateAcount() {
    this.userService.setAccountInfoState(true);
    this.router.navigateByUrl("/commercial");
  }
  userDetail: any;
  userName: string = "";
  getUserDetail() {
    this.spinnerLoading = true;
    this.userService.getCurrentUserDetail().subscribe((res: any) => {
      this.userDetail = res.body;
      this.userName = res.body.name;
      if (this.userDetail.isCSR == false) {
        this.router.navigate(["commercial"]);
      }
      this.spinnerLoading = false;
    }),
      (err: any) => {
        this.spinnerLoading = false;
      };
  }
  removeAcount() {
    this.userService.setAccountInfoState(false);
    this.router.navigateByUrl("/commercial");
  }
  setAccount(uid: string, row?: any) {
    if (this.hasCartItems) {
      this.newAccount = uid;
      this.bsModalRef.hide();
      this.onShowConfirmModal(this.confirmCart);
      // this.onContinueModal(this.newAccount);
      return;
    }
    this.userService.getAddress(uid).subscribe((result: any) => {
      let res = result.body[0];
      this.userService.setUnit("?unitUid=" + uid).subscribe(() => {
        sessionStorage.setItem("isUidSet", "true");
        localStorage.setItem(
          "customerAddress",
          res.addresses[0].formattedAddress
        );
        localStorage.setItem("accountNumber", res.accountNumber);
        localStorage.setItem("customerName", res.name);
        // res.customerAddress = res.addresses[0].formattedAddress;

        // this.storageService.setItem("accountData", res);
        // this.storageService.setItem("uid", res.accountNumber);
        this.storageService.setselectedAccount(res?.accountNumber);
        // this.userService.currentUserDetails.next(null);
        // this.getUserInfo();

        this.bsModalRef.hide();
      });
    });
  }

  // getUserInfo() {
  //   this.userService.getCurrentUserDetail().subscribe((response: any) => {
  //     // let userinfo = {
  //     //   uid: response.body.uid,
  //     //   name: response.body.name,
  //     //   mobilePhone: response.body.mobilePhone,
  //     //   isCSR: response.body.isCSR,
  //     //   isProductManager: response.body.isProductManager,
  //     //   isSalesOps: response.body.isSalesOps,
  //     //   isSalesPerson: response.body.isSalesPerson,
  //     //   isCSRSuperAdmin: response.body.isCSRSuperAdmin,
  //     //   salesManRole: response.body.salesManRole,
  //     //   priceLabel: response.body.priceLabel,
  //     //   isCustomer: response.body.isCustomer,
  //     //   salesPersonAvailableSites: response.body.salesPersonAvailableSites,
  //     // };
  //     // // this.storageService.setselectedAccount(userinfo);
  //     // this.storageService.setItem("userInfo", userinfo);
  //   });
  // }
  displayCustNumber(custNo: any) {
    let displayCustNo = custNo.split("_")[0];
    return (displayCustNo * 1).toString();
    // return displayCustNo;
  }
  onShowConfirmModal(template: TemplateRef<any>) {
    this.bsModalRef = this.modalService.show(template, {
      id: 2,
      class: "modal-lg modal-dialog-centered",
      backdrop: "static",
      keyboard: false,
    });
    this.hasCartItems = false;
  }

  onCancelModal() {
    this.bsModalRef.hide();
    this.setAccount(this.currentAccount);
  }

  onContinueModal(uid: string, row?: any) {
    this.productService
      .removeAllFromCart(this.cartData?.code)
      .subscribe((res: any) => {
        this.cartData = res.body;
      });
    this.userService.getAddress(uid).subscribe((result: any) => {
      let res = result.body[0];
      this.userService.setUnit("?unitUid=" + uid).subscribe(() => {
        sessionStorage.setItem("isUidSet", "true");
        localStorage.setItem(
          "customerAddress",
          res.addresses[0].formattedAddress
        );
        localStorage.setItem("accountNumber", res.accountNumber);
        localStorage.setItem("customerName", res.name);
        this.storageService.setselectedAccount(res?.accountNumber);
        this.userService.currentUserDetails.next(null);
        // this.getUserInfo();
        this.bsModalRef.hide();
      });
    });
  }
  opencheckForPassKeyModal(data = {}) {
    const initialState: ModalOptions = {
      backdrop: true,
      ignoreBackdropClick: true,
      initialState: {
        ...data,
      },
    };
    this.bsModalRef = this.modalService.show(
      CaptchaComponent,
      Object.assign(initialState, {
        id: "captchaModal",
        class: "modal-md modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );
    this.bsModalRef.content.closeModalOnPrimaryAction = false;
  }
  scrollPageToTop() {
    this.scrollToTop.nativeElement.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "nearest",
    });
  }
  validatePasskey(value: any, row: any) {
    if (value != "") {
      let data = {
        unit: row?.customerNumber,
        passKey: value,
      };
      this.spinnerLoading = true;
      this.accountService.validatePasskey(data).subscribe({
        next: (res) => {
          this.spinnerLoading = false;
          this.scrollPageToTop();
          if (res?.body?.success) {
            this.onNext(row);
          } else {
            this.showErrorMessage = true;
            this.errorMessage =
              res?.error?.errors[0]?.message ||
              res?.body?.errorMessage ||
              "Please enter a valid PassKey";
          }
          this.closeCaptchaModal();
        },
      });
    }
  }
  closeCaptchaModal() {
    this.modalService.hide("captchaModal");
  }

  checkForPassKeyRequired(row: any) {
    row.companies = this.userDetail?.isCustomer ? row?.companies?.filter((company: string) => company != "H") : row?.companies; //customers should not have access H site
    if(row?.companies?.length > 1){
      if (this.userDetail?.isSalesPerson && this.isImpersonate) {
        this.commercialSiteSelectorService.setSelectedSite("C");
        this.onNext(row);
      } else {
        this.openSiteSelectionModal({
          companiesList: row?.companies,
          onPrimaryAction: (value: any) => {
            this.commercialSiteSelectorService.setSelectedSite(value);

            this.onNext(row);
          }
        });
      }
    }else{
    this.spinnerLoading = true;
    const selectedSite = row?.companies?.length > 0 ? row.companies[0] : 'C';
    this.commercialSiteSelectorService.setSelectedSite(selectedSite);
    this.onNext(row);
    }
  }

  
    openSiteSelectionModal(data = {}) {
      this.spinnerLoading = false;
      const initialState: ModalOptions = {
        backdrop: true,
        ignoreBackdropClick: true,
        initialState: {
          ...data,
        },
      };
      this.bsModalRef = this.modalService.show(
        CommercialSiteSelectorComponent,
        Object.assign(initialState, {
          id: "commercialSelector",
          class: "modal-lg modal-dialog-centered",
          backdrop: "static",
          keyboard: false,
        })
      );
      this.bsModalRef.content.accountData = data;
    }
    
  onNext(row: any) {
    this.spinnerLoading = true;
    this.storageService.uidForDuplicate = row.uid;
    localStorage.setItem("accountNumber", row.uid);
    localStorage.setItem("customerName", row.name);
    const customerAddress = row.addresses[0].formattedAddress;
    localStorage.setItem("customerAddress", customerAddress);
    this.userService.setAccountInfoState(true);

    this.storageService.setItem("accountData", row);
    this.storageService.setItem("uid", row?.uid);
    // this.getUserInfo();
    // this.storageService.setselectedAccount(row?.customerNumber);
    // setUnit() {
    this.userService
      .setUnit("?unitUid=" + localStorage.getItem("accountNumber"))
      .subscribe(
        (res) => {
          this.router.navigate([`/commercial`]);
          this.closeCaptchaModal();
          //  this.router.navigateByUrl(navigateURL);
          this.storageService.setselectedAccount(row?.accountNumber);
          // this.userService.currentUserDetails.next(null);
          // this.getUserInfo();
        },
        (err: any) => {
          this.spinnerLoading = false;
        }
      );
    // }
  }
}
