import { HttpClient, HttpParams } from "@angular/common/http";
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { Columns, Config, DefaultConfig } from "ngx-easy-table";
import { Observable } from "rxjs";
import { StorageService } from "src/app/features/http-services/storage.service";
import { UserService } from "src/app/features/shared/user/services/user.service";
import { environment } from "src/environments/environment";
import { STATES } from "src/app/features/shared/constants/States";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { CaptchaComponent } from "src/app/features/shared/components/captcha/captcha.component";
import { AccountService } from "../../services/account.service";
import { TabsetComponent } from "ngx-bootstrap/tabs";
@Component({
    selector: "app-account-search",
    templateUrl: "./account-search.component.html",
    styleUrls: ["./account-search.component.scss"],
    standalone: false
})
export class AccountSearchComponent implements OnInit, OnDestroy {
  public configuration!: Config;
  public columns!: Columns[];
  public legacycolumns!: Columns[];

  public customerBaseData: any = [];
  public phoneBaseData: any = [];
  public accBasedData: any = [];
  public zipBaseData: any = [];
  public customerForm!: FormGroup;
  public phoneForm!: FormGroup;
  public accountNameForm!: FormGroup;
  public zipCodeForm!: FormGroup;  
  public legacyCustomerForm!: FormGroup;
  public customerName: string = "";
  userDetail: any;
  bsModalRef?: BsModalRef;
  states = [...STATES[0]?.states, ...STATES[1]?.states];
  spinnerLoading = false;
  @ViewChild("scrollToTop", { read: ElementRef }) scrollToTop: any;
  showErrorMessage = false;
  errorMessage = "";
  tabId: any;

  customerBaseSort: any = "";
  customerBaseOrderBy: any = "desc";
  customerBaseLength: any = 0;
  phoneBaseSort: any = "";
  phoneBaseOrderBy: any = "desc";
  phoneBaseLength: any = 0;
  accBaseSort: any = "";
  accBaseOrderBy: any = "desc";
  accBaseLength: any = 0;
  zipBaseSort: any = "";
  zipBaseOrderBy: any = "desc";
  zipBaseLength: any = 0;

  constructor(
    private router: Router,
    private http: HttpClient,
    private storageService: StorageService,
    private fb: FormBuilder,
    private userService: UserService,
    private modalService: BsModalService,
    private accountService: AccountService,
    public bsModalRef1: BsModalRef,
    private zone: NgZone
  ) {}
  displayCustomerNumber: any;
  @ViewChild("staticTabs", { static: false }) staticTabs?: TabsetComponent;

  ngOnInit(): void {
    this.getUserDetail();
    this.createCustomerForm();
    this.createphoneForm();
    this.createaccountNameForm();
    this.createzipCodeForm();
    this.createLegacyForm();
    if (localStorage.getItem("accountInfo") === undefined) {
      localStorage.setItem("accountNumber", "");
      localStorage.setItem("customerName", "");
      localStorage.setItem("customerAddress", "");
      this.userService.setAccountInfoState(false);
    }

    this.configuration = { ...DefaultConfig };
    this.configuration.tableLayout.striped = true;
    this.configuration.tableLayout.hover = false;
    this.configuration.paginationRangeEnabled = false;
    this.configuration.paginationEnabled = false;
    this.columns = [
      {
        key: "customerNumber",
        title: "Customer #",
        cssClass: { includeHeader: true, name: "sorting-arrow" },
      },
      // { key: "companyCode", title: "Company Code", cssClass: { includeHeader: false, name: "color-red" } },
      // { key: "store", title: "Store #" },
      {
        key: "accountName",
        title: "Account name / Address",
        cssClass: { includeHeader: true, name: "sorting-arrow" },
      },
      {
        key: "city",
        title: "City / State / ZIP Code / Phone",
        cssClass: { includeHeader: true, name: "sorting-arrow" },
      },
    ];
    this.legacycolumns = [
      {
        key: "customerNumber",
        title: "Customer #",
        cssClass: { includeHeader: true, name: "sorting-arrow" },
      },
      {
        key: "suffix",
        title: "Suffix",
        cssClass: { includeHeader: true, name: "sorting-arrow" },
      },
      // { key: "companyCode", title: "Company Code", cssClass: { includeHeader: false, name: "color-red" } },
      // { key: "store", title: "Store #" },
      {
        key: "accountName",
        title: "Account name / Address",
        cssClass: { includeHeader: true, name: "sorting-arrow" },
      },
      {
        key: "city",
        title: "City / State / ZIP Code / Phone",
        cssClass: { includeHeader: true, name: "sorting-arrow" },
      },
    ];
    const accountNum = localStorage.getItem("accountNumber");
    if (accountNum && accountNum != "") {
      // this.clearB2BUnit();
    } else {
      this.setUnit();
    }
  }

  ngOnDestroy(): void {
    this.spinnerLoading = false;
  }

  displayCustNumber(custNo: any) {
    let displayCustNo = custNo.split("_")[0];
    return (displayCustNo * 1).toString();
    // return displayCustNo;
  }
  setUnit() {
    this.userService.setUnit("").subscribe((res) => {
      this.userService.setAccountInfoState(false);
      localStorage.setItem("accountNumber", "");
      localStorage.setItem("customerName", "");
      localStorage.setItem("accountData", "");
      localStorage.removeItem("customerAddress");

      this.storageService.setselectedAccount(null);
    });
  }
  clearB2BUnit() {
    this.userService.clearB2BUnit().subscribe((res) => {
      this.userService.setAccountInfoState(false);
      localStorage.setItem("accountNumber", "");
      localStorage.setItem("customerName", "");
      localStorage.setItem("accountData", "");
      localStorage.removeItem("customerAddress");
      this.storageService.setselectedAccount(null);
    },(err)=>{
      this.accountService.progressHide();
    });
  }
  keyPressNumbers(e: KeyboardEvent) {
    return /^[0-9]$/i.test(e.key);
  }
  keyPressForZip(e: KeyboardEvent) {
    return /^[a-z,A-Z, ,0-9]$/i.test(e.key);
  }
  createCustomerForm() {
    this.customerForm = this.fb.group({
      customerNumber: [
        "",
        [Validators.required, Validators.pattern(/^[0-9 ]*$/)],
      ],
      storeNumber: [""],
    });
  }
  createphoneForm() {
    this.phoneForm = this.fb.group({
      mobile: [
        "",
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(10),
          Validators.pattern(/^[0-9]*$/),
        ],
      ],
    });
  }
  createaccountNameForm() {
    this.accountNameForm = this.fb.group({
      accountName: ["", [Validators.required, Validators.minLength(2)]],
      address: [""],
      city: [null, [Validators.minLength(3)]],
      state: [null],
    });
  }
  createzipCodeForm() {
    this.zipCodeForm = this.fb.group({
      zipCode: [
        "",
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(7),
          Validators.pattern(/^[a-zA-Z0-9 ]*$/),
        ],
      ],
    });
  }
  createLegacyForm() {
    this.legacyCustomerForm = this.fb.group({
      legacyCustomerNumber: [
        "",
        [Validators.required, Validators.pattern(/^[0-9 ]+(\.[0-9 ]+)?$/)],
      ],
    });
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
      // this.spinnerLoading = true;
      this.accountService.progressShow('passKeyValidate');
      this.accountService.validatePasskey(data).subscribe({
        next: (res) => {
          this.spinnerLoading = false;
          this.accountService.progressHide();
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
        error:() => {
          this.accountService.progressHide();
        }
      });
    }
  }
  closeCaptchaModal() {
    this.modalService.hide("captchaModal");
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

  checkForPassKeyRequired(row: any) {
    this.spinnerLoading = true;
    if (row?.passKeyProtected) {
      this.storageService.setItem("passKey", row?.passwordKey);      
      this.opencheckForPassKeyModal({
        onPrimaryAction: (value: any) => this.validatePasskey(value, row),
        onSecondaryAction: () => this.closeCaptchaModal(),
      });
      this.spinnerLoading = false;
    } else {
      this.onNext(row);
    }
  }
  onNext(row: any) {
    this.accountService.progressShow('navigateToDhashbord');
    // this.spinnerLoading = true;
    localStorage.setItem("accountNumber", row.customerNumber);
    localStorage.setItem("customerName", row.accountName);
    const addressLine2 = row.addressLine2 == undefined ? "" : row.addressLine2;

    localStorage.setItem(
      "customerAddress",
      addressLine2 +
        " " +
        row?.addressLine1 +
        ", " +
        row?.city +
        ", " +
        row?.state +
        " " +
        row?.zip
    );
    this.userService.setAccountInfoState(true);
    row.customerAddress =
      row.addressLine1 +
      " " +
      row.addressLine2 +
      " " +
      row.city +
      " " +
      row.state +
      " " +
      row.zip;
    this.storageService.setItem("accountData", row);
    this.storageService.setItem("uid", row?.customerNumber);
    this.storageService.uidForDuplicate = row?.customerNumber;
    // this.getUserInfo();
    // this.storageService.setselectedAccount(row?.customerNumber);
    // setUnit() {
    this.userService
      .setUnit("?unitUid=" + localStorage.getItem("accountNumber"))
      .subscribe(
        (res) => {
          // if (this.userService.currentUserDetails.getValue().body?.defaultStorefront == "R") {    
          //   this.router.navigate([`/residential`]);    
          // } else {
          //   this.router.navigate([`/commercial`]);    
          // }
          this.accountService.progressHide();
          this.router.navigate([`/residential`]);
          this.closeCaptchaModal();
          //  this.router.navigateByUrl(navigateURL);
          // this.storageService.setselectedAccount(row?.customerNumber);
          // this.userService.currentUserDetails.next(null);
          // this.getUserInfo();
        },
        (err: any) => {
          this.accountService.progressHide();
          this.spinnerLoading = false;
        }
      );
    // }
  }
  // getUserInfo() {
  //   this.userService.getCurrentUserDetail().subscribe((response: any) => {
  //     let userinfo = {
  //       uid: response.body.uid,
  //       name: response.body.name,
  //       mobilePhone: response.body.mobilePhone,
  //       isCSR: response.body.isCSR,
  //       isProductManager: response.body.isProductManager,
  //       isSalesOps: response.body.isSalesOps,
  //       isSalesPerson: response.body.isSalesPerson,
  //       isCSRSuperAdmin: response.body.isCSRSuperAdmin,
  //       salesManRole: response.body.salesManRole,
  //       priceLabel: response.body.priceLabel,
  //       isCustomer: response.body.isCustomer,
  //       salesPersonAvailableSites: response.body.salesPersonAvailableSites,
  //     };

  //     // this.storageService.setselectedAccount(userinfo);

  //     this.storageService.setItem("userInfo", userinfo);
  //   });
  // }
  ngAfterViewInit(): void {
    if (this.tabId) {
      if (this.staticTabs?.tabs[this.tabId]) {
        this.staticTabs.tabs[this.tabId].active = true;
      }
    } else {
      this.tabId = 0;
    }
  }

  selectTab(tabId: number) {
    if ((this.tabId === 0 && tabId !== 0) || (this.tabId === 4 && tabId !== 4)) {
      this.customerForm.reset(); 
      this.customerBaseData = []; 
      this.customerBaseLength = 0; 
      this.pageIndex = 1; 
      this.startValue = 0; 
      this.lastValue = 0;
    }
    this.tabId = tabId;
  }
  
  payload: any;
  onSearch(data: any, template3: TemplateRef<any>) {
    console.log("IS ZONE STABLE",     this.zone.isStable);
    console.log('Is in Angular zone?', NgZone.isInAngularZone());
    sessionStorage.setItem("tabId", this.tabId.toString());
    let currentPage;
    let pageSize;
    let orderBy;
    let sort;
    if (this.tabId == 0) {
      this.payload = {
        customerNumber: data.customerNumber?.replace(/\s+/g, ""),
        storeNumber: data.storeNumber,
        accountType: "R",
      };
      this.errorMessage = "Please provide a valid customer account number.";
      currentPage = this.pageIndex - 1;
      pageSize = this.tableItemsSize;
      orderBy = this.customerBaseOrderBy;
      sort = this.customerBaseSort;
    } else if (this.tabId == 1) {
      this.payload = {
        mobile: data.mobile,
        accountType: "R",
      };
      this.errorMessage =
        "Please provide a valid mobile number associated with an account.";
      currentPage = this.pageIndex2 - 1;
      pageSize = this.tableItemsSize2;
      orderBy = this.phoneBaseOrderBy;
      sort = this.phoneBaseSort;
    } else if (this.tabId == 2) {
      this.payload = {
        accountName: data.accountName,
        address: data.address,
        state: data.state,
        city: data.city,
        accountType: "R",
      };
      this.errorMessage = "Please provide valid detail.";
      currentPage = this.pageIndex3 - 1;
      pageSize = this.tableItemsSize3;
      orderBy = this.accBaseOrderBy;
      sort = this.accBaseSort;
    } else if (this.tabId == 3) {
      this.payload = {
        zipCode: data.zipCode,
        accountType: "R",
      };
      this.errorMessage = "Please provide a valid zip code.";
      currentPage = this.pageIndex4 - 1;
      pageSize = this.tableItemsSize4;
      orderBy = this.zipBaseOrderBy;
      sort = this.zipBaseSort;
    }else if (this.tabId == 4) {
      let customNumber: any = "";
      let suffix: any = '';
      if (data.legacyCustomerNumber?.includes('.')) {
        const value = data.legacyCustomerNumber?.split('.');
        customNumber = value[0];
        suffix = value[1];
      } else {
        customNumber = data.legacyCustomerNumber;
        suffix = "";
      }
      this.payload = {
        camsAccountNumber: customNumber?.replace(/\s+/g, ""),
        storeNumber: data.storeNumber ||"",
        accountType: "R",
        suffix: suffix,
      };
      this.errorMessage = "Please provide a valid customer account number.";
      currentPage = this.pageIndex - 1;
      pageSize = this.tableItemsSize;
      orderBy = this.customerBaseOrderBy;
      sort = this.customerBaseSort;
    }


    let url = `${
      environment.baseAPIURl
    }us_b2b_residential/users/${this.userService.getUserEmail().toLowerCase()}/csrcustomer/search?currentPage=${currentPage}&fields=DEFAULT&pageSize=${pageSize}&showMode=Page&orderby=${orderBy}&sort=${sort}`;
    // this.spinnerLoading = true;
    if (data) {
      this.accountService.progressShow('accountSearch');
      this.getUser(url, this.payload).subscribe(
        (res: any) => {
          this.accountService.progressHide();
          this.spinnerLoading = false;
          if (this.tabId == 0) {
            this.customerBaseData = res.soldTo;
            this.customerBaseLength = res?.totalNoOfResults || 0;
            this.startValue =
              this.pageIndex * this.tableItemsSize - (this.tableItemsSize - 1);
            this.lastValue = this.startValue + this.tableItemsSize - 1;
            this.lastValue =
              this.lastValue > this.customerBaseLength
                ? this.customerBaseLength
                : this.lastValue;
          } else if (this.tabId == 1) {
            this.phoneBaseData = res.soldTo;
            this.phoneBaseLength = res?.totalNoOfResults || 0;
            this.startValue =
              this.pageIndex * this.tableItemsSize - (this.tableItemsSize - 1);
            this.lastValue = this.startValue + this.tableItemsSize - 1;
            this.lastValue =
              this.lastValue > this.phoneBaseLength
                ? this.phoneBaseLength
                : this.lastValue;
          } else if (this.tabId == 2) {
            this.accBasedData = res.soldTo;
            this.accBaseLength = res?.totalNoOfResults || 0;
            this.startValue =
              this.pageIndex * this.tableItemsSize - (this.tableItemsSize - 1);
            this.lastValue = this.startValue + this.tableItemsSize - 1;
            this.lastValue =
              this.lastValue > this.accBaseLength
                ? this.accBaseLength
                : this.lastValue;
          } else if (this.tabId == 3) {
            this.zipBaseData = res.soldTo;
            this.zipBaseLength = res?.totalNoOfResults || 0;
            this.startValue =
              this.pageIndex * this.tableItemsSize - (this.tableItemsSize - 1);
            this.lastValue = this.startValue + this.tableItemsSize - 1;
            this.lastValue =
              this.lastValue > this.zipBaseLength
                ? this.zipBaseLength
                : this.lastValue;
          } else if(this.tabId == 4) {
            this.customerBaseData = res.soldTo;
            this.customerBaseLength = res?.totalNoOfResults || 0;
            this.startValue =
              this.pageIndex * this.tableItemsSize - (this.tableItemsSize - 1);
            this.lastValue = this.startValue + this.tableItemsSize - 1;
            this.lastValue =
              this.lastValue > this.customerBaseLength
                ? this.customerBaseLength
                : this.lastValue;
          }
          /* this.displayCustomerNumber = this.data[0].customerNumber.split("_")[0];
        while (
          this.displayCustomerNumber.length > 1 &&
          this.displayCustomerNumber.startsWith("0")
        ) {
          this.displayCustomerNumber = this.displayCustomerNumber.slice(1);
        }*/
        },
        (err: any) => {
          this.accountService.progressHide();
          this.spinnerLoading = false;

          if (err.status == 500) {
            this.errorMessage = this.errorMessage;
            this.bsModalRef = this.modalService.show(template3, {
              id: "onSearch-template-3",
              class: "modal-md modal-dialog-centered",
              backdrop: "static",
              keyboard: false,
            });
          }

          if (this.tabId == 0) {
            this.customerBaseData = [];
          } else if (this.tabId == 1) {
            this.phoneBaseData = [];
          } else if (this.tabId == 2) {
            this.accBasedData = [];
          } else if (this.tabId == 3) {
            this.zipBaseData = [];
          }
        }
      );
    } else {
      this.spinnerLoading = false;
    }
  }
  getUser(url: any, payload: any): Observable<any> {
    const requestPayLoad = JSON.parse(JSON.stringify({ accountType: "R" }));
    for (let key in payload) {
      requestPayLoad[key] = payload[key];
    }
    return this.http.post(url, requestPayLoad);
  }
  getUserDetail() {
    this.spinnerLoading = true;
    this.userService.getCurrentUserDetail().subscribe((res: any) => {
      this.userDetail = res.body;
      if (this.userDetail.isCSR == false) {
        this.router.navigate(["residential"]);
      }
      this.spinnerLoading = false;
      this.accountService.progressHide();
    }),
      (err: any) => {
        this.spinnerLoading = false;
        this.accountService.progressHide();
      };
  }
  checkValue() {
    this.customerForm.get("customerNumber")?.valueChanges.subscribe((value) => {
      if (!this.numberPattern.test(value)) {
        for (let i = 0; i < value.length; i++) {
          if (!(parseInt(value[i]) >= 0 && parseInt(value[i]) <= 9)) {
            this.customerForm.get("customerNumber")?.setValue("");
            break;
          }
        }
      }
    });
  }

  //Customer Table Pagination Logic
  pageIndex: number = 1;
  tableItemsSize: number = 10;
  startValue: number =
    this.pageIndex * this.tableItemsSize - (this.tableItemsSize - 1);
  lastValue: number = this.startValue + this.tableItemsSize - 1;
  onTableDataChange(event: any, formData: any, template: any) {
    this.pageIndex = event;
    if (0 == event) {
      this.pageIndex = 1;
    }
    this.onSearch(formData, template);
    // this.startValue =
    //   this.pageIndex * this.tableItemsSize - (this.tableItemsSize - 1);
    // this.lastValue = this.startValue + this.tableItemsSize - 1;
    // this.lastValue =
    //   this.lastValue > this.customerBaseData.length
    //     ? this.customerBaseData.length
    //     : this.lastValue;
  }

  //Phone Table Pagination Logic
  pageIndex2: number = 1;
  tableItemsSize2: number = 10;
  startValue2: number =
    this.pageIndex2 * this.tableItemsSize2 - (this.tableItemsSize2 - 1);
  lastValue2: number = this.startValue2 + this.tableItemsSize2 - 1;
  onTableDataChange2(event: any, formData: any, template: any) {
    this.pageIndex2 = event;
    if (0 == event) {
      this.pageIndex2 = 1;
    }
    this.onSearch(formData, template);
    // this.startValue2 =
    //   this.pageIndex2 * this.tableItemsSize2 - (this.tableItemsSize2 - 1);
    // this.lastValue2 = this.startValue2 + this.tableItemsSize2 - 1;
    // this.lastValue2 =
    //   this.lastValue2 > this.phoneBaseData.length
    //     ? this.phoneBaseData.length
    //     : this.lastValue2;
  }

  //Account Name Table Pagination Logic
  pageIndex3: number = 1;
  tableItemsSize3: number = 10;
  startValue3: number =
    this.pageIndex3 * this.tableItemsSize3 - (this.tableItemsSize3 - 1);
  lastValue3: number = this.startValue3 + this.tableItemsSize3 - 1;
  onTableDataChange3(event: any, formData: any, template: any) {
    this.pageIndex3 = event;
    if (0 == event) {
      this.pageIndex3 = 1;
    }
    this.onSearch(formData, template);
    // this.startValue3 =
    //   this.pageIndex3 * this.tableItemsSize3 - (this.tableItemsSize3 - 1);
    // this.lastValue3 = this.startValue3 + this.tableItemsSize3 - 1;
    // this.lastValue3 =
    //   this.lastValue3 > this.accBasedData.length
    //     ? this.accBasedData.length
    //     : this.lastValue3;
  }

  // ZipCode Table Pagination Logic
  pageIndex4: number = 1;
  tableItemsSize4: number = 10;
  startValue4: number =
    this.pageIndex4 * this.tableItemsSize4 - (this.tableItemsSize4 - 1);
  lastValue4: number = this.startValue4 + this.tableItemsSize4 - 1;
  onTableDataChange4(event: any, formData: any, template: any) {
    this.pageIndex4 = event;
    if (0 == event) {
      this.pageIndex4 = 1;
    }
    this.onSearch(formData, template);
    // this.startValue4 =
    //   this.pageIndex4 * this.tableItemsSize4 - (this.tableItemsSize4 - 1);
    // this.lastValue4 = this.startValue4 + this.tableItemsSize4 - 1;
    // this.lastValue4 =
    //   this.lastValue4 > this.zipBaseData.length
    //     ? this.zipBaseData.length
    //     : this.lastValue4;
  }
  numberPattern = /^[0-9 ]+$/;
  onPaste(event: Event, template3: TemplateRef<any>) {
    const clipboardEvent = event as ClipboardEvent;
    if (clipboardEvent.clipboardData) {
      const pastedData = clipboardEvent.clipboardData.getData("text");
      if (!this.numberPattern.test(pastedData)) {
        this.errorMessage =
          "The customer number you provided contains an invalid character. Please review and correct it.";
        this.bsModalRef = this.modalService.show(template3, {
          id: "onSearch-template-3",
          class: "modal-md modal-dialog-centered",
          backdrop: "static",
          keyboard: false,
        });
        clipboardEvent.preventDefault();
      }
    }
  }

  onTableEvent(e: any, type: string, formData: any, template: any) {
    if (
      e.event === "onOrder" &&
      (this.customerBaseData?.length > 0 ||
        this.phoneBaseData?.length > 0 ||
        this.accBasedData?.length > 0 ||
        this.zipBaseData?.length > 0)
    ) {
      if (type === "customerNumberBase") {
        this.customerBaseSort = e?.value?.key;
        this.customerBaseOrderBy =
          e?.value?.order == undefined ? "desc" : e?.value?.order;
        // this.pageIndex = 1;
        // this.onSearch(formData, template);
      } else if (type === "phoneBase") {
        this.phoneBaseSort = e?.value?.key;
        this.phoneBaseOrderBy =
          e?.value?.order == undefined ? "desc" : e?.value?.order;
        this.pageIndex2 = 1;
        // this.onSearch(formData, template);
      } else if (type === "accountBase") {
        this.accBaseSort = e?.value?.key;
        this.accBaseOrderBy =
          e?.value?.order == undefined ? "desc" : e?.value?.order;
        // this.pageIndex = 1;
        // this.onSearch(formData, template);
      } else if (type === "zipCodeBase") {
        this.zipBaseSort = e?.value?.key;
        this.zipBaseOrderBy =
          e?.value?.order == undefined ? "desc" : e?.value?.order;
        // this.pageIndex = 1;
        // this.onSearch(formData, template);
      }
      this.onSearch(formData, template);
      this.columns.map((item: any) => {
        if (item.key === e?.value?.key && item.hasOwnProperty("cssClass")) {
          if (e?.value?.order == "asc") {
            item.cssClass = {
              ...{},
              ...{ includeHeader: true, name: "sorting-arrow-active" },
            };
          } else if (e?.value?.order == "desc") {
            item.cssClass = {
              ...{},
              ...{ includeHeader: true, name: "sorting-arrow-down-icon" },
            };
          }
        } else if (item.hasOwnProperty("cssClass")) {
          item.cssClass = {
            ...{},
            ...{ includeHeader: true, name: "sorting-arrow" },
          };
        }
      });
      this.legacycolumns.map((item: any) => {
        if (item.key === e?.value?.key && item.hasOwnProperty("cssClass")) {
          if (e?.value?.order == "asc") {
            item.cssClass = {
              ...{},
              ...{ includeHeader: true, name: "sorting-arrow-active" },
            };
          } else if (e?.value?.order == "desc") {
            item.cssClass = {
              ...{},
              ...{ includeHeader: true, name: "sorting-arrow-down-icon" },
            };
          }
        } else if (item.hasOwnProperty("cssClass")) {
          item.cssClass = {
            ...{},
            ...{ includeHeader: true, name: "sorting-arrow" },
          };
        }
      });
    }
  }
  
  keyPressLegacy(e: KeyboardEvent): void {
    const  cValue= e.target as HTMLInputElement;
    const currentValue = cValue.value;
    const key = e.key;
    if (key >= '0' && key <= '9') {
      return;
    }
    if (key == '.') {
      if ((currentValue + key).startsWith('.') || ((currentValue + key).match(/\./g) || []).length > 1) {
        e.preventDefault();
        return;
      } else {
        return;
      }
    }
    e.preventDefault();
  }
}
