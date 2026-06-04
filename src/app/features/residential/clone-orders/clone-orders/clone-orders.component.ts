import { Component, OnInit } from "@angular/core";
import { takeUntil } from "rxjs";
import { BreadcrumbItems } from "src/app/features/shared/interfaces";
import { StorageService } from "src/app/features/http-services/storage.service";
import { Columns, Config, DefaultConfig } from "ngx-easy-table";
import { AccountService } from "src/app/features/residential/account/services/account.service";
import { CloneOrdersService } from "../services/clone-orders.service";
import { ProductService } from "../../products/pages/services/product.service";
import { FormControl, Validators } from "@angular/forms";
import { UserService } from "src/app/features/shared/user/services/user.service";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { ConfirmationDialogComponent } from "src/app/features/shared/components/confirmation-dialog/confirmation-dialog.component";
import { ProgressModalComponent } from "src/app/features/shared/components/progress-modal/progress-modal.component";
import { MESSAGE_CONSTANTS } from "src/app/features/shared/constants/MESSAGE-CONSTANTS";

@Component({
    selector: "app-clone-orders",
    templateUrl: "./clone-orders.component.html",
    styleUrls: ["./clone-orders.component.scss"],
    standalone: false
})
export class CloneOrdersComponent implements OnInit {
  constructor(
    public storageService: StorageService,
    private accountService: AccountService,
    private cloneOrdersService: CloneOrdersService,
    public productService: ProductService,
    private userService: UserService,
    public modalService: BsModalService,
  ) {}
  spinnerLoading: boolean = false;
  salesHierarchyList: any = [];
  selectedFilter: any = [];
  sampleSearchBy = null;
  sampleOrder: any = new FormControl("", [Validators.required]);
  columns!: Columns[];
  pageIndex: number = 1;
  data: any = [];
  searchByList = [
    {
      id: "code",
      name: "Order #",
    },
    {
      id: "accountNumber",
      name: "Account Number",
    },
  ];
  breadcrumbItems: BreadcrumbItems = [
    {
      name: "Home",
      path: "/residential/salesperson",
      active: false,
    },
    {
      name: "Clone A Sample Order",
      path: "",
      active: true,
    },
  ];
  accountSearch: string = "";
  salesHierarchyCode: any = "";
  salesManRole: any = "";
  tableItemsSize: number = 10;
  totalOrdersLength: number = 0;
  startValue: number =
    this.pageIndex * this.tableItemsSize - (this.tableItemsSize - 1);
  lastValue: number = this.startValue + this.tableItemsSize - 1;
  public configuration!: Config;
  showCloneOrders!: boolean;
  selectedItems: any = [];
  orderBy = "asc";
  sortBy = "uid";
  selectedAccountList: any[] = [];
  modalRef!: BsModalRef;
  public salesHierarchyListMGR: any = [];
  searchRequestPayload = {
    salesHierarchyCode: "",
    salesHierarchyRole: "",
    searchtext: "",
    orderBy: "asc",
    sort: "uid",
    svpId: "",
    rvpId: "",
    dmId: "",
    mgrId:""
  };
  isSalesManager: boolean = false;  
  public hierachyCode: any;

  ngOnInit(): void {
    this.progressShow('loadingAccounts')
    this.showCloneOrders = true;
    if (
      this.storageService?.userInfo?.isSalesPerson ||
      this.storageService?.userInfo?.isSalesOps ||
      this.storageService?.userInfo?.isALCBDM ||
      this.storageService?.userInfo?.isResidentialManager
    ) {
      this.spinnerLoading = true;
      let salesManRole = this.storageService?.userInfo?.salesManRole;
      let isSalesPerson = this.storageService?.userInfo?.isSalesOps
        ? this.storageService?.userInfo?.isSalesOps
        : false;
      this.isSalesManager = this.storageService?.userInfo?.isALCBDM ||
        this.storageService?.userInfo?.isResidentialManager;
        this.accountService
        .getSalesHierarchyForUser(isSalesPerson)
        .subscribe((response) => {
          this.progressHide()
          if (response?.body) {
            let roles = ["SVP", "RVP", "DM", "TM"];
            let salesHierarchyMap = response.body.salesHierarchyMap;
            salesHierarchyMap.sort((a: any, b: any) => roles.indexOf(a.key) - roles.indexOf(b.key));
            this.salesHierarchyList = [...salesHierarchyMap,...this.salesHierarchyList];

            // this.salesHierarchyList = salesHierarchyMap;
              let tmValue = salesHierarchyMap[0]?.value
                ?.salesHierarchyUserAssignmentList[0]?.salesHierarchyCode;
              this.selectedFilter[salesManRole] = tmValue;  
              if(tmValue){
                this.getHierarchyValue(tmValue, salesManRole);
              }
            
          } else {
            this.salesHierarchyList = [];
          }
      
          this.spinnerLoading = false;
        },(err)=>{this.progressHide()});
        if(this.isSalesManager){
          this.salesHierarchyforSalesManager()
        }      
    }
    this.configuration = { ...DefaultConfig };
    // this.configuration.checkboxes = true;
    this.configuration.tableLayout.striped = true;
    this.configuration.tableLayout.hover = false;
    this.configuration.paginationRangeEnabled = false;
    this.configuration.paginationEnabled = false;
    this.columns = [
      { key: "", title: "" },
      { key: "uid", title: "Account #" },
      { key: "customerName", title: "Account Name #" },
      { key: "formattedAddress", title: "Address" },
      { key: "phoneNumber", title: "Phone" },
    ];
    if (this.storageService.selectedCloneOrders?.selectedLines.length > 0) {
      this.setUnit(
        this.storageService.selectedCloneOrders?.selectedLines[0]?.uid
      );
    }
  }
  getHierarchyValue(value: any,  name:any) {
    this.progressShow('loadingAccounts')
    this.hierachyCode = value == "All" ? "" : value;
    this.searchRequestPayload.salesHierarchyCode = this.hierachyCode;
    this.searchRequestPayload.salesHierarchyRole = name; 
    this.searchRequestPayload.searchtext = "";
    this.accountSearch = "";
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
    

    if (this.isSalesManager && name == "MNGR") {
      this.pageIndex = 1;
      this.getClonedOrders(this.pageIndex);
      // this.getAccountsList(this.searchRequestPayload, 0);
    }else{
      
    this.configuration.isLoading = true;
    this.accountService.getChildHierarchy(this.hierachyCode, name).subscribe(
      (response) => {
        if (response?.error) {
   
          // this.spinnerLoading = false;
          this.configuration.isLoading = false;
          this.progressHide()
        } else {
          this.progressHide()
          let updatedSalesHierarchyList = response?.body?.salesHierarchyMap;
          if (updatedSalesHierarchyList) {
            // this.spinnerLoading = false;
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
            this.progressHide()
            // this.spinnerLoading = false;
            this.configuration.isLoading = false;
          }
          // this.getAccountsList(this.searchRequestPayload, 0);
          this.pageIndex = 1;
          this.getClonedOrders(this.pageIndex);
        }
      },
      (error) => {
        this.progressHide()
        // this.spinnerLoading = false;
        this.configuration.isLoading = false;
      }
    );
    }
    // if (value != undefined) {
    //   this.salesHierarchyCode = value;
    //   this.pageIndex = 1;
    //   this.getClonedOrders(this.pageIndex);
    // }
  }

  getClonedOrders(pageIndex: number) {
    this.progressShow('loadingAccounts')
    let payload: any = {
      // searchtext: this.accountSearch,
      // salesHierarchyCode: this.salesHierarchyCode,
      isSampleOrder: true,
      currentPage: pageIndex - 1,
      // orderBy: "asc",
      // sort: "uid",
      orderBy: this.orderBy,
      sort: this.sortBy,
      totalNumberOfResults: "",
      salesHierarchyRole: this.isSalesManager ? "MNGR" : this.salesManRole,
      code: this.sampleOrder?.value
    };
    payload = {
      ...payload, ...this.searchRequestPayload
    };
    this.data = [];
    if (this.sampleSearchBy != null && this.sampleSearchBy != "") {
      payload[this.sampleSearchBy] = this.accountSearch;
    }
    this.configuration.isLoading = true;
    this.accountService
      .getsalesListAccounts(payload, pageIndex-1, this.tableItemsSize)
      .subscribe((response: any) => {
        this.progressHide()
        this.configuration.isLoading = false
        this.data = response?.body?.accountData || [];
        if (this.data.length > 0) {
          this.data.forEach((d: any) => {
              if (this.selectedItems?.some((item: any) =>d?.uid === item?.uid)) {
                d.selected = true;
              } else {
                d.selected = false;
              }
            });
        }
        this.totalOrdersLength = response?.body?.pagination?.totalResults || 0;
        this.startValue =
          this.pageIndex * this.tableItemsSize - (this.tableItemsSize - 1);
        this.lastValue = this.startValue + this.tableItemsSize - 1;
        this.lastValue =
          this.lastValue > this.totalOrdersLength
            ? this.totalOrdersLength
            : this.lastValue;
      }, () => {        
        this.progressHide()
        this.configuration.isLoading = false
      });
  }
  onTableDataChange(event: any) {
    this.pageIndex = event;
    if (0 == event) {
      this.pageIndex = 1;
    }
    this.startValue =
      this.pageIndex * this.tableItemsSize - (this.tableItemsSize - 1);
    this.lastValue = this.startValue + this.tableItemsSize - 1;
    this.lastValue =
      this.lastValue > this.totalOrdersLength
        ? this.totalOrdersLength
        : this.lastValue;
    this.getClonedOrders(this.pageIndex);
  }
  onSearch(event: any, pageIndex: any) {
    this.accountSearch = event;
    this.searchRequestPayload.searchtext = event;
    this.pageIndex = 1;
    this.getClonedOrders(pageIndex);
  }
  itemSelectionChange(acc: any) {
    this.selectedItems = this.selectedItems.filter((res: any) => res?.uid !== acc?.uid);
    let preSelectedItems = [... this.selectedItems]
    let selectedPageAccounts:any[] =  this.data.filter(
      (item: any) => item?.selected == true
    );
    if (preSelectedItems.length > 0) {
      selectedPageAccounts.forEach((pItem: any) => {
        if (preSelectedItems.every((item: any) => item.uid != pItem.uid)) {
          this.selectedItems.push(pItem);
        }
      });      
    } else {
      this.selectedItems = [...selectedPageAccounts];
    }
    this.selectedAccountList = this.selectedItems.map((data: any) => data?.uid);
    this.selectedAccountList = [...new Set(this.selectedAccountList)];
  }

  proceed() {
    this.cloneOrdersValidation();
  }
  setUnit(uid: string) {
    // this.spinnerLoading = true;

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
        this.showCloneOrders = false;
        // this.spinnerLoading = false;
      });
    });
  }
  cloneOrdersValidation() {
    this.progressShow("cloneOrdersValidation")
    // this.spinnerLoading = true;
    this.cloneOrdersService
      .cloneOrdersValidation(this.sampleOrder?.value, this.selectedAccountList.toString())
      .subscribe((res: any) => {
        this.progressHide()
        if (res?.body?.status == "Success") {
          if (res?.body?.allAccountsNotEntitled == true) {
            this.openModal({
              title: "Warning",
              content: "All Accounts Not Entitled",
              secondaryActionLabel: 'Cancel',
              primaryActionLabel: 'Continue',
              onPrimaryAction: () => { this.modalService.hide();
                this.continueProceedFlow(res);  
               },
              onSecondaryAction: () => { this.modalService.hide(); }
            });
          } else {
            let accounts: any[] = res?.body?.accounts || [];
            let partiallyEntitledAcc: any[] = [];
            accounts.filter((data: any) => {
              if (data?.partiallyEntitled && !data?.fullyEntitled) {
                partiallyEntitledAcc.push(data?.accountNumber?.split("_")[0]);
              }
            });
            if (partiallyEntitledAcc.length > 0) {
              let msg = '<h2>Below accounts do not have entitlements for one or more products from the original order. So only entitled products will be closed. Do you want to continue?</h2>';
              let str: string = partiallyEntitledAcc.toString();
              this.openModal({
                title: "Warning",
                content: msg + '<h2>'+str+'</h2>',
                secondaryActionLabel: 'Cancel',
                primaryActionLabel: 'Continue',
                onPrimaryAction: () => { this.modalService.hide(); },
                onSecondaryAction: () => { this.modalService.hide(); }
              });
            }
          }
          if(res?.body?.allAccountsNotEntitled == false){
          this.continueProceedFlow(res);  
        }        
        } else if ((res?.body?.status == "Error")) {
          this.progressHide()
          this.openModal({
            title: "Error",
            content: res?.body?.message,
            secondaryActionLabel: '',
            primaryActionLabel: 'OK',
            onPrimaryAction: () => this.modalService.hide(),
          });
        }
        // this.spinnerLoading = false;
      });
  }
  continueProceedFlow(res:any){
    this.storageService.setItem("selectedCloneOrders", {
      sampleOrder: this.sampleOrder?.value,
      selectedLines: [...[], ...this.selectedItems],
      module: "residential",
      productNumber: res.body.productCode,
      isCloneOrders: true,
    });
    this.storageService.selectedCloneOrders = {
      sampleOrder: this.sampleOrder?.value,
      selectedLines: [...[], ...this.selectedItems],
      module: "residential",
      productNumber: res.body.productCode,
      isCloneOrders: true,
    };
    // this.showCloneOrders = false;
    this.setUnit(this.selectedItems[0].uid);
  }

  checkValue() {
    this.sampleOrder.valueChanges.subscribe((value: any) => {
      for (let i = 0; i < value.length; i++) {
        if (!(parseInt(value[i]) >= 0 && parseInt(value[i]) <= 9)) {
          this.sampleOrder.setValue("");
          break;
        }
      }
    });
  }

  keyPressNumbers(e: KeyboardEvent) {
    return /^[0-9]$/i.test(e.key);
  }

  sortingByColumns(e: any) {
    if (e.event === "onOrder" && this.totalOrdersLength > 0) {
      this.orderBy = e?.value?.order;
      this.sortBy = e?.value?.order ? e?.value?.key : "";
      this.pageIndex = 1;
      this.getClonedOrders(this.pageIndex);
    }
  }
  continueCloneOrderFlow() {
    this.showCloneOrders = true;
    // this.spinnerLoading = true;
    this.selectedItems = this.storageService.selectedCloneOrders?.selectedLines;
    this.proceed();
  }

  openModal(data = {}) {
    const initialState: ModalOptions = {
      backdrop: true,
      ignoreBackdropClick: true,
      initialState: {
        ...data,
      },
    };
    this.modalRef = this.modalService.show(
      ConfirmationDialogComponent,
      Object.assign(initialState, {
        id: "infoModal",
        class: "modal-md modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );
  }
  salesHierarchyforSalesManager(){
    this.spinnerLoading =true
    this.accountService.salesHierarchyforSalesManager().subscribe((response) => {
      this.spinnerLoading = false;
      if (response?.body) {
        let salesHierarchyMap = response?.body?.salesHierarchyMap;
        // this.salesHierarchyListMGR = salesHierarchyMap;
       this.salesHierarchyList = [...this.salesHierarchyList,...salesHierarchyMap];
      }
      else {
        // this.salesHierarchyListMGR = [];
      }
    });
  }

  
  progressShow(msgType: any) {

    const messageConstants = MESSAGE_CONSTANTS?.cloneOrders?.[msgType]
    this.openProgressModal({
      modalHeaderText: messageConstants?.headerText,
      progressText: messageConstants?.bodyText,
      progressBarText: messageConstants?.barText
    });
  }
  progressHide() {
    this.modalService.hide("progressModal");
  }
  openProgressModal(data = {}, size: any = "md", modalId = "progressModal") {
    const initialState: ModalOptions = {
      backdrop: true,
      ignoreBackdropClick: true,
      initialState: {
        ...data,
      },
    };
    this.modalRef = this.modalService.show(
      ProgressModalComponent,
      Object.assign(initialState, {
        id: modalId,
        class: `modal-${size} modal-dialog-centered`,
      })
    );
  }

}
