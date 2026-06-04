import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { AccountService } from "../../services/account.service";
import { Columns, Config, DefaultConfig } from "ngx-easy-table";
import { BreadcrumbItems } from "src/app/features/shared/interfaces";
import { debounceTime, Observable, Subject, switchMap, take } from "rxjs";
import { Router } from "@angular/router";
import { UserService } from "src/app/features/shared/user/services/user.service";
import { StorageService } from "src/app/features/http-services/storage.service";
import { environment } from "src/environments/environment";
import { HttpClient } from "@angular/common/http";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { CaptchaComponent } from "src/app/features/shared/components/captcha/captcha.component";
import { ErrorModalComponent } from "src/app/features/shared/components/error-modal/error-modal.component";
@Component({
    selector: "app-sales-account-search",
    templateUrl: "./sales-account-search.component.html",
    styleUrls: ["./sales-account-search.component.scss"],
    standalone: false
})
export class SalesAccountSearchComponent implements OnInit, OnDestroy {
  public configuration!: Config;
  public columns!: Columns[];
  public data = [];
  public salesHierarchyList: any = [];
  public salesHierarchyListMGR: any = [];
  public hierachyCode: any;
  spinnerLoading: boolean = false;
  public searchText: string = "";
  bsModalRef?: BsModalRef;
  subject = new Subject();
  userInfoSubject:any;
  accountListSearch = new Subject();
  itemsPerPage = 10;
  currentPage = 0;
  pageIndex: number = 1;
  pageIndex1: number = 1;
  totalRecords: any;
  breadcrumbItems: BreadcrumbItems = [
    {
      name: "Home",
      path: "/residential/salesperson",
      active: false,
    },
    {
      name: "Accounts",
      path: "",
      active: true,
    },
  ];
  public legacycolumns!: Columns[];

  public salesManRole: any;
  // Default sorting
  sortValue = {
    order:'asc',
    key:'name'
  }
  isSalesOps: boolean = false;
  isSalesPerson: boolean = false;
  searchRequestPayload = {
    salesHierarchyCode: "",
    salesHierarchyRole: "",
    searchtext: "",
    orderBy: "asc",
    sort: "name",
    totalNumberOfResults: "100",
    svpId: "",
    rvpId: "",
    dmId: "",
    mgrId:""
  };
  maxSize: any;
  customerBaseData: any;
  customerBaseLength: any;
  CamCustomer: boolean = false;
  isSalesManager:boolean = false;
  searchFlag: boolean = false;

  constructor(
    private accountService: AccountService,
    private userService: UserService,
    private storageService: StorageService,
    private router: Router,
    private http: HttpClient,
    public bsModalRef1: BsModalRef,
    private modalService: BsModalService,
  ) {}

  ngOnInit(): void {
    if (
      this.storageService.userInfo?.orgUnit?.uid !== "EMPTY_B2BUNIT" &&
      this.storageService.userInfo?.isSalesOps && !this.storageService.userInfo?.isALCBDM 
          && !this.storageService.userInfo?.isResidentialManager
    ) {
      this.userService.setUnit("").subscribe((res) => {
        this.userService.setAccountInfoState(false);
        this.storageService.setselectedAccount(null);
        this.userService.currentUserDetails.next(null);
        const baseUrlPath = this.router.url.split("?")[0].includes("commercial")
          ? "commercial"
          : "residential";
        this.router.navigate(["/" + baseUrlPath + "/salesperson/view-accounts"]);
      },(err)=>{
        this.accountService.progressHide();
      });
    }
    this.maxSize = this.userService.updateMaxSize();
    this.configuration = { ...DefaultConfig };
    this.configuration.tableLayout.striped = true;
    this.configuration.tableLayout.hover = false;
    this.configuration.paginationRangeEnabled = false;
    this.configuration.paginationEnabled = false;
    this.configuration.isLoading = false;
    this.pageSizes = this.getPageSizes();
    this.configuration.rows = Math.max(...this.pageSizes);
    this.userInfoSubject =this.storageService.getItem("userInfo").subscribe((response: any) => {
      if(response){
      this.userInfoSubject.unsubscribe();
      this.salesManRole = response?.isSalesOps == true ? "SVP": (response?.salesManRole ? response?.salesManRole : (response?.isSalesPerson == true?"TM":"DM"));
      this.searchRequestPayload.salesHierarchyRole = this.salesManRole;
      this.isSalesOps = response?.isSalesOps ? response?.isSalesOps : false;
      this.isSalesPerson = response?.isSalesPerson ? response?.isSalesPerson : false;
      this.isSalesManager = response?.isALCBDM || response?.isResidentialManager;
      if (
        this.salesHierarchyList.length == 0 &&
        this.configuration.isLoading == false
      )
      this.getSalesHierarchyForUser(this.isSalesOps);
      if(this.isSalesOps){
        this.salesHierarchyforSalesManager()
      }
    }
    });

    this.columns = [
      { key: "uid", title: "Account #", orderEventOnly: true,
        cssClass: { includeHeader: true, name: 'sorting-arrow' }},
      { key: "camsAccountNumber", title: "Old Account #"},
      { key: "customerName", title: "Account Name #", orderEventOnly: true,
        cssClass: { includeHeader: true, name: 'sorting-arrow' } },
      { key: "formattedAddress", title: "Address"},
      { key: "defaultShippingMethod", title: "Default Shipping Method"},
      { key: "defaultShippingWarehouse", title: "Default Shipping Warehouse"},
      { key: "phoneNumber", title: "Phone", orderEventOnly: false},
    ];
    this.legacycolumns = [
      {
        key: "customerNumber",
        title: "Customer #",
        cssClass: { includeHeader: true, name: "sorting-arrow" },
      },
      {
        key: "accountNumber",
        title: "Old Account #",
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
        key: "defaultShippingMethod",
        title: "Default Shipping Method",
      },
      {
        key: "defaultShippingWarehouse",
        title: "Default Shipping Warehouse",
      }, 
      {
        key: "city",
        title: "City / State / ZIP Code / Phone",
        cssClass: { includeHeader: true, name: "sorting-arrow" },
      },
    ];
    this.subject.pipe(debounceTime(1000)).subscribe((searchText: any) => {
      if(this.isCamsSearch){
        this.selectCamCustomer(this.searchText, true);
      }else{
        this.getSalesHierarchy(searchText);
      }
    });
    this.accountListSearch.pipe(
      switchMap((res:any)=> {
        // this.configuration.isLoading = true;
        if (this.searchFlag) {
          this.configuration.isLoading = true;
          this.searchFlag = false;
        } else {
          this.accountService.progressShow('accountSearch');
        }
        this.data = [];
        return this.accountService
        .getsalesListAccounts(res.requestObj, res.pageIndex, this.tableItemsSize)
      }
    )).subscribe({
      next: (response: any) => {
         this.spinnerLoading = false;
        
        if (response?.body || response?.accountData) {
          this.data = response?.body?.accountData || response?.accountData || [];
          this.totalRecords = response?.body?.pagination?.totalResults || response?.pagination?.totalResults;
        } else {
          this.data = [];
        }
        this.configuration.isLoading = false;
        this.accountService.progressHide();
      },
      error: (err) => {
        this.accountService.progressHide();
         this.spinnerLoading = false;
        this.configuration.isLoading = false;
        this.data = [];
      },
    });
    this.setSortIcon();

    }
  getSalesHierarchyForUser(isSalesPerson: boolean) {
    this.configuration.isLoading = true;
    // this.spinnerLoading =true
    this.accountService.progressShow('salesHierarchy');
    this.accountService.getSalesHierarchyForUser(isSalesPerson).subscribe((response) => {
      this.configuration.isLoading = false;
      this.accountService.progressHide();
      if (response?.body) {
        this.spinnerLoading = false;
        let roles = ["SVP", "RVP", "DM", "TM","TEAM"];
        let salesHierarchyMap = response?.body?.salesHierarchyMap;
        salesHierarchyMap.sort((a: any, b: any) => roles.indexOf(a.key) - roles.indexOf(b.key));
  
        this.salesHierarchyList = salesHierarchyMap;
        roles.forEach((role: any) => {
          let roleHierarchy = this.salesHierarchyList.find((hierarchy: any) => hierarchy.key === role);
          if (roleHierarchy && roleHierarchy.value?.salesHierarchyUserAssignmentList?.length) {
            let hierarchyLength = roleHierarchy.value?.salesHierarchyUserAssignmentList?.length;
            // let hierarchyCode = roleHierarchy.value.salesHierarchyUserAssignmentList[0].salesHierarchyCode;
            // this.selectedFilter[role] = hierarchyLength == 1 ? hierarchyCode : 'All';
            this.selectedFilter[role] = 'All';
            if(this.salesManRole == "TM" || this.salesManRole == "TEAM"){
              this.salesManRole = "TM"
            }
            if (role === this.salesManRole) {
              // this.searchRequestPayload.salesHierarchyCode = hierarchyLength == 1 ? hierarchyCode : '';
              this.searchRequestPayload.salesHierarchyCode = '';
            }
          }
          if (this.salesManRole == "SVP") {
            this.selectedFilter['RVP'] = undefined;
            this.selectedFilter['DM'] = undefined;
            this.selectedFilter['TM'] = undefined;
          }else if(this.salesManRole == "RVP"){
            this.selectedFilter['DM'] = undefined;
            this.selectedFilter['TM'] = undefined;
          } else if (this.salesManRole == "DM") {
            this.selectedFilter['TM'] = undefined;
          }
          if (this.isSalesOps) {            
            this.selectedFilter['RVP'] = undefined;
            this.selectedFilter['DM'] = undefined;
            this.selectedFilter['TM'] = undefined;
          }
        });
        this.spinnerLoading =false
        if (this.isSalesOps || this.isSalesPerson) {
          this.getAccountsList(this.searchRequestPayload, 0);
        }
        
      } else {
        this.salesHierarchyList = [];
      }
    }, () => {
      this.accountService.progressHide();
    });
   
  }

  salesHierarchyforSalesManager(){
    // this.spinnerLoading =true
    //this.accountService.progressShow('salesHierarchy');
    this.accountService.salesHierarchyforSalesManager().subscribe((response:any) => {
      //this.accountService.progressHide();
      this.spinnerLoading = false;
      if (response?.body) {
        let salesHierarchyMap = response?.body?.salesHierarchyMap;
        this.salesHierarchyListMGR = salesHierarchyMap;
      }
      else {
        this.salesHierarchyListMGR = [];
      }
    }, () => {
      this.accountService.progressHide();
    });
  }

  selectedFilter: any = [];
  getSalesList(value: any, name: any) {
    this.CamCustomer = false
    this.hierachyCode = value == "All" ? "" : value;
    this.searchRequestPayload.salesHierarchyCode = this.hierachyCode;
    this.searchRequestPayload.salesHierarchyRole = name; 
    this.searchRequestPayload.searchtext = "";
    this.searchText = "";
    // this.spinnerLoading = true;
    if (name == "SVP") {
      this.selectedFilter['RVP'] = undefined;
      this.selectedFilter['DM'] = undefined;
      this.selectedFilter['TM'] = undefined;
      this.selectedFilter['MNGR'] = undefined;
      this.searchRequestPayload.svpId = this.hierachyCode;
      this.searchRequestPayload.rvpId = "";
      this.searchRequestPayload.dmId = "";
      this.searchRequestPayload.mgrId = "";
    }else if(name == "RVP"){
      this.selectedFilter['DM'] = undefined;
      this.selectedFilter['TM'] = undefined;
      this.selectedFilter['MNGR'] = undefined;
      this.searchRequestPayload.rvpId = this.hierachyCode;
      this.searchRequestPayload.dmId=""
      this.searchRequestPayload.mgrId = "";
    } else if (name == "DM") {
      this.selectedFilter['TM'] = undefined;
      this.selectedFilter['MNGR'] = undefined;
      this.searchRequestPayload.dmId = this.hierachyCode;
      this.searchRequestPayload.mgrId = "";
    }else if (name == "MNGR") {
      this.selectedFilter['SVP'] = undefined;
      this.selectedFilter['RVP'] = undefined;
      this.selectedFilter['DM'] = undefined;
      this.selectedFilter['TM'] = undefined;
      this.searchRequestPayload.mgrId = this.hierachyCode;
      this.searchRequestPayload.svpId = "";
      this.searchRequestPayload.rvpId = "";
      this.searchRequestPayload.dmId = "";
    }

    if(this.isSalesOps && name == "MNGR"){
      this.getAccountsList(this.searchRequestPayload, 0);
    }else{
      
    this.configuration.isLoading = true;
      this.accountService.progressShow('childHierarchy');
    this.accountService.getChildHierarchy(this.hierachyCode, name).subscribe(
      (response) => {
        this.accountService.progressHide();
        if (response?.error) {
          // this.spinnerLoading = false;
          this.configuration.isLoading = false;
        } else {
          let updatedSalesHierarchyList = response?.body?.salesHierarchyMap;
          if (updatedSalesHierarchyList) {
            // this.spinnerLoading = false;
            this.configuration.isLoading = false;
            updatedSalesHierarchyList.map((sales: any) => {
              // this.selectedFilter[sales?.key] = undefined;
              this.salesHierarchyList.find((list: any, index: any) => {
                if (name != list.key && sales.key == list.key) {
                  this.selectedFilter[name] = value;
                  this.salesHierarchyList[index].value = sales.value;
                }
              });
            });
          } else {
            // this.spinnerLoading = false;
            this.configuration.isLoading = false;
          }
          this.getAccountsList(this.searchRequestPayload, 0);
        }
      },
      (error) => {
        // this.spinnerLoading = false;
        this.configuration.isLoading = false;
        this.accountService.progressHide();
      }
    );
    }
  }

  getSalesHierarchy(searchText: any) {
    if (searchText) {
      this.searchRequestPayload.searchtext = (searchText.trim()).toUpperCase();
      this.getAccountsList(this.searchRequestPayload, 0);
    } else {
      this.hierachyCode = "";
    }
  }

  isCamsSearch:boolean = false;
  onSearchAccount(event: any) {
    this.searchFlag = true;
    if (this.CamCustomer) {
      if (event.target?.value) {
        this.searchText = (event.target?.value.trim()).toUpperCase();
        if (this.searchText.includes('.')) {
          const value = this.searchText.split('.');
          if (value[1]) {
            this.isCamsSearch = true;
            this.subject.next(this.searchText);
          }
        } else {
          this.isCamsSearch = true;
          this.subject.next(this.searchText);
        }
      }
    } else {
      this.searchText =event?.target?.value ? (event.target?.value.trim()).toUpperCase() : '';
      this.currentPage = 0;
      if (this.searchText?.length > 0) {
        this.searchRequestPayload.searchtext = this.searchText;
        this.CamCustomer = false;
        this.isCamsSearch = false;
        this.getAccountsList(this.searchRequestPayload, 0);
      } else if(!this.searchText) { 
        this.searchRequestPayload.searchtext = "";
        this.CamCustomer = false;
        this.isCamsSearch = false;
        this.getAccountsList(this.searchRequestPayload, 0);
      }
    }
  }

  getAccountsList(requestObj: any, pageIndex: any) {
    this.CamCustomer = false;
    this.searchRequestPayload = requestObj;
    requestObj.currentPage = pageIndex;
    requestObj.orderBy = this.sortValue.order;
    requestObj.sort = this.sortValue.key;
    // this.currentPage = pageIndex;
    if (this.searchFlag) {
      this.spinnerLoading = true;
    }
    this.configuration.isLoading = true;
    this.accountListSearch.next({requestObj:requestObj,pageIndex:pageIndex,itemsPerPage:this.tableItemsSize});
    // this.accountService
    //   .getsalesListAccounts(requestObj, pageIndex, this.itemsPerPage)
    //   .subscribe({
    //     next: (response: any) => {
    //        this.spinnerLoading = false;
    //       this.configuration.isLoading = false;
    //       if (response?.body || response?.accountData) {
    //         this.data = response?.body?.accountData || response?.accountData || [];
    //         this.totalRecords = response?.body?.pagination?.totalResults || response?.pagination?.totalResults;
    //       } else {
    //         this.data = [];
    //       }
    //     },
    //     error: (err) => {
    //        this.spinnerLoading = false;
    //       this.configuration.isLoading = false;
    //       this.data = [];
    //     },
    //   });
  }

  onTableDataChange(requestObj: any, pageIndex: any) {
    this.pageIndex = pageIndex;
    this.currentPage = pageIndex;
    this.getAccountsList(requestObj, pageIndex - 1);
  }

  navigateToAccount(accountData: any) {  
    let accountId = accountData?.uid;
    // this.spinnerLoading = true;
    this.accountService.progressShow('navigateToDhashbord');
    this.accountService.getSalesTeam(accountId).subscribe((response) => {
      this.accountService.progressHide();
      localStorage.setItem("accountNumber", accountData.uid);
      localStorage.setItem("customerName", accountData.customerName);
      localStorage.setItem("customerAddress", accountData.formattedAddress);
      this.userService.setAccountInfoState(true);
      this.storageService.setItem("accountData", accountData);
      this.storageService.setItem("uid", accountData?.uid);
      this.storageService.uidForDuplicate = accountData?.uid;
      this.getUserInfo();
      this.spinnerLoading = false;
      this.userService
        .setUnit("?unitUid=" + localStorage.getItem("accountNumber"))
        .subscribe((res) => {
          this.router.navigate([`/residential`]);
          this.storageService.setselectedAccount(accountData.uid);
          this.userService.currentUserDetails.next(null);
          this.getUserInfo();
        });
    }, () => {
      this.accountService.progressHide();
    });
  }

  selectCamCustomer(selectedCamCustomer: any, isCamsSearch:boolean = false) {
    this.selectedCamCustomer = selectedCamCustomer;
    let payload:any = {
      camsAccountNumber: selectedCamCustomer?.camsAccountNumber?.split('.')[0],
      accountType: "R"
    };
    let suffix:any = false;
    if(isCamsSearch){
      if(!isNaN(selectedCamCustomer)){
        const value = selectedCamCustomer.split('.');
        if(value[1]){
          payload.camsAccountNumber = value[0];
          payload.suffix = value[1];
          suffix = true;
        }else{
          payload.customerNumber = value[0];
        }
      }else{
        payload.accountName = selectedCamCustomer;
      }
    }
    let camsAccoutNumber:any = this.formatAccount(selectedCamCustomer?.uid).toString()
    if(isCamsSearch == false && (camsAccoutNumber.startsWith("25")|| camsAccoutNumber.startsWith("11"))){
      this.navigateToAccount(selectedCamCustomer);
      return;
    }
    
    this.pageIndex1 = 0; 
    let pageSize = this.camsPageSize;
    let url = `${
      environment.baseAPIURl
    }us_b2b_residential/users/${this.userService.getUserEmail().toLowerCase()}/csrcustomer/search?currentPage=${this.pageIndex1}&fields=DEFAULT&pageSize=${pageSize}&showMode=Page`;
    // this.spinnerLoading = true;
    if (selectedCamCustomer) {
      this.accountService.progressShow("accountSearch");
      this.getUser(url, payload).subscribe(
        (res: any) => {
          this.accountService.progressHide();
          this.customerBaseData = [];
          // this.searchText = "";
         if (res.body?.error) {
            //this.openModal(res.body.error);
            this.spinnerLoading = false;
            return;
          }
          this.spinnerLoading = false;
          if(isCamsSearch && !suffix){
            this.customerBaseData = res.soldTo || [];
            this.customerBaseData.map((item:any)=>{
                item.customerName = item.accountName;
                item.camsAccountNumber = item.accountNumber;
                item.phoneNumber = item.phone;
                let fulladdress = `${item.addressLine1}, ${item.addressLine2}, ${item.city}, ${item.city}, ${item.state}, ${item.zip}`
                item.formattedAddress = fulladdress;
                item.uid = item.customerNumber;
            });
            this.pageIndex1 = 1;
            this.totalRecords = res.totalNoOfResults;
          }else{
            this.customerBaseData = res.soldTo || [];
            if(isCamsSearch && suffix || this.customerBaseData.length > 1){
              this.CamCustomer = true;
              this.pageIndex1 = 1;
            }else{
              this.navigateToAccount(selectedCamCustomer);
            }
          }
          this.customerBaseLength = res?.totalNoOfResults || 0;
      
          // Uncomment and refine this block as needed
          /*
          this.displayCustomerNumber = this.data[0].customerNumber.split("_")[0];
          while (
            this.displayCustomerNumber.length > 1 &&
            this.displayCustomerNumber.startsWith("0")
          ) {
            this.displayCustomerNumber = this.displayCustomerNumber.slice(1);
          }
          */
        },
        (error: any) => {
          this.accountService.progressHide();
          this.spinnerLoading = false;
          const errorMessage = error?.error || "An unexpected error occurred.";
          //this.openModal(errorMessage); // Handle errors from the API
        }
      );
      
    } else {
      this.spinnerLoading = false;
    }
  }
  modalRef!: BsModalRef;
  openModal(title: any) {
    const initialState: ModalOptions = {
      initialState: {
        title: title,
      },
    };
    this.bsModalRef = this.modalService.show(
      ErrorModalComponent,
      Object.assign(initialState, {
        id: "InvoiceSearchPopupComponent",
        class: "modal-lg modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );
  }
  getUserInfo() {
    this.userService.getCurrentUserDetail().subscribe((response: any) => {
      // let userinfo = {
      //   uid: response.body.uid,
      //   name: response.body.name,
      //   mobilePhone: response.body.mobilePhone,
      //   isCSR: response.body.isCSR,
      //   isProductManager: response.body.isProductManager,
      //   isSalesOps: response.body.isSalesOps,
      //   isSalesPerson: response.body.isSalesPerson,
      //   isCSRSuperAdmin: response.body.isCSRSuperAdmin,
      //   salesManRole: response.body.salesManRole,
      //   priceLabel: response.body.priceLabel,
      //   isCustomer: response.body.isCustomer,
      //   salesPersonAvailableSites: response.body.salesPersonAvailableSites,
      // };
      // this.storageService.setItem("userInfo", userinfo);
    });
  }
 getUser(url: any, payload: any): Observable<any> {
    const requestPayLoad = JSON.parse(JSON.stringify({ accountType: "R" }));
    for (let key in payload) {
      requestPayLoad[key] = payload[key];
    }
    return this.http.post(url, requestPayLoad);
  }
  formatAccount(account: any) {
    return parseInt(account);
  }

  onClear(name: any) {
    if (this.isSalesOps) {
      if (name == "DM") {
        if (this.selectedFilter['DM']) {
          this.getSalesList(this.selectedFilter['DM'], 'DM');
        } else {
          if (this.selectedFilter['RVP']) {
            this.getSalesList(this.selectedFilter['RVP'], 'RVP');
          } else {
            if (this.selectedFilter['SVP']) {
              this.getSalesList(this.selectedFilter['SVP'], 'SVP');
            } else {
              this.data = [];
            }
          }
        }
      } else if (name == "RVP") {
        if (this.selectedFilter['RVP']) {
          this.getSalesList(this.selectedFilter['RVP'], 'RVP');
        } else {
          if (this.selectedFilter['SVP']) {
            this.getSalesList(this.selectedFilter['SVP'], 'SVP');
          } else {
            this.data = [];
          }
        }
      } else if (name == "SVP") {
        if (this.selectedFilter['SVP']) {
          this.getSalesList(this.selectedFilter['SVP'], 'SVP');
        } else {
          this.data = [];
        }
      } else {
        this.data = [];
      }
    } else {
      this.getSalesList(this.selectedFilter[name], name);
    }
  }
  checkForPassKeyRequired(row: any) {
    // this.spinnerLoading = true;
    this.onNext(row);
    /* if (row?.passKeyProtected) {
      this.opencheckForPassKeyModal({
        onPrimaryAction: (value: any) => this.validatePasskey(value, row),
        onSecondaryAction: () => this.closeCaptchaModal(),
      });
      this.spinnerLoading = false;
    } else {
      this.onNext(row);
    } */
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
  validatePasskey(value: any, row: any) {
    if (value != "") {
      let data = {
        unit: row?.customerNumber,
        passKey: value,
      };
      // this.spinnerLoading = true;
      this.accountService.progressShow("passKeyValidate");
      this.accountService.validatePasskey(data).subscribe({
        next: (res) => {
          this.accountService.progressHide();
          this.spinnerLoading = false;
          this.scrollPageToTop();
          if (res?.body?.success) {
            this.onNext(row);
          } else {
           // this.showErrorMessage = true;
           // this.errorMessage =
              res?.error?.errors[0]?.message ||
              res?.body?.errorMessage ||
              "Please enter a valid PassKey";
          }
          this.closeCaptchaModal();
        },
        error: (res) => {
          this.accountService.progressHide();
        }
      });
    }
  }
  onNext(row: any) {
    // this.spinnerLoading = true;
    console.log("onNext",row)
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
    this.accountService.progressShow('navigateToDhashbord');
    this.userService
      .setUnit("?unitUid=" + localStorage.getItem("accountNumber"))
      .subscribe(
        (res) => {
          this.accountService.progressHide();
          //this.storageService.updateUidForDuplicate(localStorage.getItem("accountNumber"));
          // if (this.userService.currentUserDetails.getValue().body?.defaultStorefront == "R") {    
          //   this.router.navigate([`/residential`]);    
          // } else {
          //   this.router.navigate([`/commercial`]);    
          // }
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
  closeCaptchaModal() {
    this.modalService.hide("captchaModal");
  }
  @ViewChild("scrollToTop", { read: ElementRef }) scrollToTop: any;
  scrollPageToTop() {
    this.scrollToTop.nativeElement.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "nearest",
    });
  }

  selectedCamCustomer: any;
  onPageChangeEvent(index: any) {
    const payload:any = {
      camsAccountNumber: this.selectedCamCustomer.camsAccountNumber?.split('.')[0],
      accountType: "R",
    };
    if(!this.selectedCamCustomer.hasOwnProperty('camsAccountNumber')){
    if(!isNaN(Number(this.searchText))){
      
        payload['customerNumber'] = this.searchText;
    }else{
      payload.accountName = this.searchText;
    }
  }
    this.pageIndex1 = index;
    let indx = index - 1;
    let pageSize = this.camsPageSize;
    let url = `${
      environment.baseAPIURl
    }us_b2b_residential/users/${this.userService.getUserEmail().toLowerCase()}/csrcustomer/search?currentPage=${indx}&fields=DEFAULT&pageSize=${pageSize}&showMode=Page`;
    // this.spinnerLoading = true;
    if (this.selectedCamCustomer) {
      this.accountService.progressShow('accountSearch')
      this.getUser(url, payload).subscribe(
        (res: any) => {
          this.accountService.progressHide();
         if (res.body?.error) {
            this.openModal(res.body.error);
            this.spinnerLoading = false;
            return;
          }
          this.spinnerLoading = false;
          this.customerBaseData = res.soldTo;
          this.customerBaseLength = res?.totalNoOfResults || 0;
        },
        (error: any) => {
          this.accountService.progressHide();
          this.spinnerLoading = false;
          const errorMessage = error?.error || "An unexpected error occurred.";
          this.openModal(errorMessage); // Handle errors from the API
        }
      );
      
    } else {
      this.spinnerLoading = false;
    }
  }
  ngOnDestroy(): void {
    this.spinnerLoading = false;
    this.subject.unsubscribe();
    this.accountListSearch.unsubscribe();
  }

  onsort(e:any){
    if(e.event === 'onOrder'){
      const colItem = this.columns.find((col:any)=> col?.key === e.value.key)
      if(colItem?.orderEventOnly === true){
        this.sortValue = e.value;
        this.sortValue.key =  this.sortValue.key === 'customerName' ? 'name' : this.sortValue.key;
        this.currentPage = 0;
        this.getAccountsList(this.searchRequestPayload, 0);
          this.setSortIcon();
      }
    }
  }

  setSortIcon(){
    this.columns.map((item: any) => {
      if ((item.key === this.sortValue.key || (this.sortValue.key === 'name' && item.key === 'customerName')) && item.hasOwnProperty("cssClass")) {
        if (this.sortValue.order == "asc") {
          item.cssClass = {
            ...{},
            ...{ includeHeader: true, name: "sorting-arrow-active" },
          };
        } else if (this.sortValue.order == "desc") {
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

  tableItemsSize: number = 100;
  pageSizes: number[] = [];

  getPageSizes(): number[] {
    return [10, 25, 50, 100,200,300,400];
  }

  onPageSizeChange(e: any) {
    let value = e?.value;
    this.tableItemsSize = Number(value);
    this.pageIndex = 1; 
    this.currentPage = 0;
    this.searchRequestPayload.totalNumberOfResults = value;
    this.getAccountsList(this.searchRequestPayload, 0);
  }

  camsPageSize:any = 25;
  onCamsPageSizeChange(e: any) {
    let value = e?.value;
    this.camsPageSize = Number(value);
    this.onPageChangeEvent(1);
  }

}
