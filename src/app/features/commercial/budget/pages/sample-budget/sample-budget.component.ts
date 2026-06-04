import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import {
  API,
  APIDefinition,
  Columns,
  Config,
  DefaultConfig,
} from "ngx-easy-table";
import { BreadcrumbItems } from "src/app/features/shared/interfaces";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { SampleBudgetService } from "src/app/features/commercial/budget/services/sample-budget.service";
import { TransferPopupComponent } from "../../../budget/pages/transfer-popup/transfer-popup.component";
import { StorageService } from "src/app/features/http-services/storage.service";
import {
  Observable,
  Observer,
  map,
  noop,
  of,
  switchMap,
  tap,
  take,
} from "rxjs";
import { NgForm } from "@angular/forms";
@Component({
    selector: "app-sample-budget",
    templateUrl: "./sample-budget.component.html",
    styleUrls: ["./sample-budget.component.scss"],
    standalone: false
})
export class SampleBudgetComponent implements OnInit {
  breadcrumbItems: BreadcrumbItems = [
    {
      name: "Home",
      path: "/commercial/salesperson",
      active: false,
    },
    {
      name: "Sample Budget",
      path: "/",
      active: true,
    },
  ];
  modalRef?: BsModalRef;
  selectedFromName:any;
  selectedToName:any;
  selectedFromToName:any;
  spinnerLoading: boolean = false;
  constructor(
    private modalService: BsModalService,
    public bsModalRef: BsModalRef,
    private sampleBudgetService: SampleBudgetService,
    public storageService: StorageService
  ) {}
  productTypes = [
    "Business Unit1",
    "Business Unit2",
    "Business Unit3",
    "Business Unit4",
  ];
  transferBudget: any = {
    amount: null,
    fromProductType: undefined,
    fromTmNumber: "",
    isFutureBudget: false,
    toProductType: undefined,
    toTmNumber: "",
  };

  transferModal(f: NgForm) {
    this.spinnerLoading = true;
    this.sampleBudgetService.transferBudget(this.transferBudget).subscribe(
      (res: any) => {
        let dataObject = {
          err: false,
          budgetData: { ...this.transferBudget },
          selectedFromToName: this.selectedFromToName,
          selectedToName: this.selectedToName,
          heading: "Tranfer Success",
          type: "tranfer",
        };
        if (res?.body.status == "ERROR") {
          dataObject = {
            err: true,
            budgetData: res?.body?.message,
            selectedFromToName: this.selectedFromToName,
            selectedToName: this.selectedToName,
            heading: "Tranfer Error",
            type: "tranfer",
          };
        }
        this.spinnerLoading = false;
        const initialState: ModalOptions = {
          initialState: dataObject,
        };
        this.bsModalRef = this.modalService.show(
          TransferPopupComponent,
          Object.assign(initialState, {
            class: "modal-lg modal-dialog-centered",
            backdrop: "static",
            keyboard: false,
          })
        );
        f.reset();
      },
      (error) => {
        const initialState: ModalOptions = {
          initialState: {
            err: true,
            budgetData: error.error,
            heading: "Tranfer Error",
            type: "tranfer",
          },
        };
        this.bsModalRef = this.modalService.show(
          TransferPopupComponent,
          Object.assign(initialState, {
            class: "modal-lg modal-dialog-centered",
            backdrop: "static",
            keyboard: false,
          })
        );
      }
    );
  }
  public isFutureBuget:boolean = false;
  public configuration!: Config;
  public columns!: Columns[];
  public sampleBudgetcolumns!: Columns[];
  public ship!: Config;
  public districtcolumns!: Columns[];
  public territorycolumns!: Columns[];
  public sample!: Config;
  public samplecolumns!: Columns[];
  public salesManRole: any;
  public showCustomerBudget: boolean = false;
  public lastRun: boolean = false;

  public data = [
    {
      tm: "05-A-J5",
      name: "Todd Hutchens",
      role: "RVP",
      businessunit: "Residencial soft",
      remainingbudget: "$51,000.00",
      currency: "USD",
    },
    {
      tm: "05-A-J5",
      name: "Todd Hutchens",
      role: "RVP",
      businessunit: "Resilient",
      remainingbudget: "$1,000.00",
      currency: "USD",
    },
    {
      tm: "05-A-J5",
      name: "Bill song",
      role: "RVP",
      businessunit: "Wood & Laminate",
      remainingbudget: "$34,000.00",
      currency: "USD",
    },
    {
      tm: "05-A-J5",
      name: "Bill song",
      role: "RVP",
      businessunit: "Residencial soft",
      remainingbudget: "$10,000.00",
      currency: "USD",
    },
  ];

  public data1 = [];

  public data2 = [];

  sampleBudgetsDMList: any = [];
  sampleBudgetsRVPList: any = [];
  sampleBudgetsSVPList: any = [];
  sampleBudgetsTMList: any = [];
  sampleBudgetsList!: any;
  sampleBudgetsDMList1: any = [];
  sampleBudgetsRVPList1: any = [];
  sampleBudgetsTMList1: any = [];

  selectAllFlag: boolean = true;
  selectUSDFlag: boolean = false;
  selectCADFlag: boolean = false;
  pageIndex: number = 0;
  tableItemsSize: number = 5;
  startValue: number =
    this.pageIndex * this.tableItemsSize - (this.tableItemsSize - 1);
  lastValue: number = this.startValue + this.tableItemsSize - 1;
  totalSampleBudgetRVPLength: number = 0;
  totalSampleBudgetSVPLength: number = 0;
  totalSampleBudgetDMLength: number = 0;
  totalSampleBudgetTMLength: number = 0;
  payload: any = {
    currency: "",
    isFutureBudget: false,
    role: "DM",
    searchText: "",
  };
  fromTMsuggestions$?: Observable<any>;
  toTmNumberssuggestions$?: Observable<any>;
  showFromToError: boolean = false;
  showTransferBudget: boolean = false;
  showCreateBudget: boolean = false;
  isSalesOps: boolean = false;
  currencyLabel:string = 'USD/CAD';
  searchTextRVP: any = '';
  searchTextDM: any = '';
  searchTextTM: any = '';
  searchTextSVP: any = '';

  ngOnInit(): void {
    this.configuration = { ...DefaultConfig };
    this.configuration.tableLayout.striped = true;
    this.configuration.tableLayout.hover = false;
    this.configuration.paginationRangeEnabled = false;
    this.configuration.paginationEnabled = false;
    this.sampleBudgetcolumns = [
      { key: "tmNumber", title: "TM#", orderEventOnly:true,
        cssClass: { includeHeader: true, name: "sorting-arrow" }
      },
      { key: "salesManName", title: "Name", orderEnabled: false },
      { key: "role", title: "Role", orderEnabled: false },
      { key: "sampleGroupDesc", title: "Business Unit", orderEventOnly:true,
        cssClass: { includeHeader: true, name: "sorting-arrow" }
      },
      { key: "remainingbudget", title: "Remaining Available Budget", orderEventOnly:true,
        cssClass: { includeHeader: true, name: "sorting-arrow" }
      },
      { key: "currency", title: "Currency", orderEventOnly:true,
        cssClass: { includeHeader: true, name: "sorting-arrow" }
      },
    ];

    this.districtcolumns = [
      { key: "tm", title: "TM#", orderEnabled: false },
      { key: "name", title: "Name", orderEnabled: false },
      { key: "role", title: "Role", orderEnabled: false },
      { key: "businessunit", title: "Business Unit", orderEnabled: false },
      { key: "remainingbudget", title: "Remaining Available Budget", orderEnabled: false },
      { key: "currency", title: "Currency", orderEnabled: false },
    ];
    this.territorycolumns = [
      { key: "tm", title: "TM#", orderEnabled: false },
      { key: "name", title: "Name", orderEnabled: false },
      { key: "role", title: "Role", orderEnabled: false },
      { key: "businessunit", title: "Business Unit", orderEnabled: false },
      { key: "remainingbudget", title: "Remaining Available Budget", orderEnabled: false },
      { key: "currency", title: "Currency", orderEnabled: false },
    ];
    this.samplecolumns = [
      {
        key: "order",
        title: "Order", orderEnabled: false
      },
      { key: "orderDate", title: "Order Date", orderEnabled: false },
      { key: "po", title: "PO #" },
      { key: "orderStat", title: "Order Status", orderEnabled: false },
      { key: "submittedFor", title: "Submitted For", orderEnabled: false },
      { key: "sidemark", title: "Sidemark", orderEnabled: false },
    ];

    this.storageService.getItem("userInfo").pipe(take(1)).subscribe((response: any) => {
     
      this.salesManRole = response?.salesManRole;
      this.isSalesOps = response?.isSalesOps;
      this.showCustomerBudget =
        this.salesManRole == "DM" ||
        this.salesManRole == "RVP" ||
        this.salesManRole == "SVP" ||
        response?.isSalesOps;
      this.showTransferBudget =
        this.salesManRole == "DM" ||
        this.salesManRole == "RVP" ||
        this.salesManRole == "SVP" || response?.isSalesOps;;
      this.showCreateBudget = response?.isSalesOps;
      this.showBudgetList();
      if (this.showCustomerBudget) {
        this.getTMNumberList();
      }
    });
  }

  getTMNumberList() {
    this.fromTMsuggestions$ = new Observable(
      (observer: Observer<string | undefined>) => {
        observer.next(this.selectedFromToName);
      }
    ).pipe(
    switchMap((query: string | undefined) => {
  this.showFromToError =
    this.transferBudget.toTmNumber &&
    this.transferBudget.fromTmNumber === this.transferBudget.toTmNumber;

  if (query && query.length > 1) {
    const searchText = query.toUpperCase();

    return this.sampleBudgetService
      .getFromTmNumbers(searchText, this.isFutureBuget, this.payload.currency)
      .pipe(
        map((res: any) => res?.body?.budgetList || []),
        tap(() => noop, (res) => {})
      );
  }
  return of([]);
})

    );

    this.selectedFromName = '';
    this.selectedToName = '';
    this.toTmNumberssuggestions$ = new Observable(
      (observer: Observer<string | undefined>) => {
        observer.next(
          this.selectedFromName || this.selectedToName
        );
      }
    ).pipe(
      switchMap((query: string | undefined) => {
        this.showFromToError =
          this.transferBudget.fromTmNumber &&
          this.transferBudget.toTmNumber === this.transferBudget.fromTmNumber;

        if (query && query.length > 1) {
          let searchText = query.toUpperCase();
          return this.sampleBudgetService.getToTMNUmbers(searchText).pipe(
            map((res: any) => {
              return res?.body?.budgetList || [];
            }),
            tap(
              () => noop,
              (res) => {}
            )
          );
        }
        return of([]);
      })
    );
  }
  showBudgetList() {
    this.payload.searchText = "";
    this.searchTextDM = "";
    this.searchTextTM = "";
    this.searchTextRVP = "";
    this.searchTextSVP = "";
    this.svpSortBy = "tmNumber";
    this.rvpSortBy = "tmNumber";
    this.dmSortBy = "tmNumber";
    this.tmSortBy = "tmNumber";
    this.svpOrderBy = "asc";
    this.rvpOrderBy = "asc";
    this.dmOrderBy = "asc";
    this.tmOrderBy = "asc";
    if (this.showCustomerBudget) {
      this.getCustomerBudgetsList(this.pageIndexRVP, "RVP");
    }
    if (this.salesManRole == "DM" || this.showCustomerBudget) {
      this.getCustomerBudgetsList(this.pageIndexDM, "DM");
    }
    if (
      (this.salesManRole == "SVP" || this.isSalesOps) &&
      this.showCustomerBudget
    ) {
      this.getCustomerBudgetsList(this.pageIndexDM, "SVP");
    }
    if (
      this.salesManRole == "TM" ||
      this.salesManRole == "DM" ||
      this.showCustomerBudget
    ) {
      this.getCustomerBudgetsList(this.pageIndexTM, "TM");
    }
  }

  getCustomerBudgetsList(pageIndex: number, role: any) {
    let orderBy = "asc";
    let sortBy = "tmNumber";
    let tableRowsSize = 5;
    if (role == "RVP") {
      this.payload.role = "RVP";
      this.payload.searchText = this.searchTextRVP;
      orderBy = this.rvpOrderBy;
      sortBy = this.rvpSortBy;
    } else if (role == "DM") {
      this.payload.role = "DM";
      this.payload.searchText = this.searchTextDM;
      orderBy = this.dmOrderBy;
      sortBy = this.dmSortBy;
    } else if (role == "TM") {
      this.payload.role = "TM";
      this.payload.searchText = this.searchTextTM;
      orderBy = this.tmOrderBy;
      sortBy = this.tmSortBy;
    } else if (role == "SVP") {
      this.payload.role = "SVP";
      this.payload.searchText = this.searchTextSVP;
      orderBy = this.svpOrderBy;
      sortBy = this.svpSortBy;
    }

    this.sampleBudgetService
      .getCustomerBudgetsList(this.payload, pageIndex, tableRowsSize, sortBy, orderBy)
      .subscribe((res: any) => {
        if (role == "RVP") {
          this.sampleBudgetsRVPList = res?.body?.sampleBudgetList || [];
          this.totalSampleBudgetRVPLength = res.body?.totalCount || 0;
        }
        if (role == "DM") {
          this.sampleBudgetsDMList = res?.body?.sampleBudgetList || [];
          this.totalSampleBudgetDMLength = res.body?.totalCount || 0;
        }
        if (role == "TM") {
          this.sampleBudgetsTMList = res?.body?.sampleBudgetList || [];
          this.totalSampleBudgetTMLength = res.body?.totalCount || 0;
        }
        if (role == "SVP") {
          this.sampleBudgetsSVPList = res?.body?.sampleBudgetList || [];
          this.totalSampleBudgetSVPLength = res.body?.totalCount || 0;
        }
      });
  }

  onTableDataChange(event: any, role: any) {
    this.setPageIndex(role, event);
    //this.pageIndex = event;
    this.getCustomerBudgetsList(event - 1, role);
  }

  pageIndexRVP: number = 0;
  pageIndexDM: number = 0;
  pageIndexTM: number = 0;
  pageIndexSVP: number = 0;

  setPageIndex(role: any, pageNumber: any) {
    switch (role) {
      case "TM":
        this.pageIndexTM = pageNumber;
        break;
      case "DM":
        this.pageIndexDM = pageNumber;
        break;
      case "RVP":
        this.pageIndexRVP = pageNumber;
        break;
      case "SVP":
        this.pageIndexSVP = pageNumber;
        break;
    }
  }

  changeRadioButton(e: any) {
    if (e.state) {
      this.pageIndexRVP = 0;
      this.pageIndexDM = 0;
      this.pageIndexTM = 0;
      this.pageIndexSVP = 0;
      this.createTransfer.currency = undefined;
      this.currencyArray = [
        {
          key: 'USD',
          value: 'USD',
        },
        {
          key: 'CAD',
          value: 'CAD',
        },
      ];
      switch (e.group) {
        case "Both":
          this.selectAllFlag = e.state;
          this.selectCADFlag = !e.state;
          this.selectUSDFlag = !e.state;
          this.basedOnGroup("");
          this.currencyLabel = "USD/CAD";
          break;
        case "USD":
          this.selectAllFlag = !e.state;
          this.selectCADFlag = !e.state;
          this.selectUSDFlag = e.state;
          this.basedOnGroup("USD");
          this.currencyLabel = "USD";
          this.currencyArray = [
            {
              key: 'USD',
              value: 'USD',
            }
          ];
          break;
        case "CAD":
          this.selectAllFlag = !e.state;
          this.selectCADFlag = e.state;
          this.selectUSDFlag = !e.state;
          this.basedOnGroup("CAD");
          this.currencyLabel = "CAD";
          this.currencyArray = [
            {
              key: 'CAD',
              value: 'CAD',
            },
          ];
          break;
      }
    }
  }

  basedOnGroup(currency: any) {
    this.payload.currency = currency;
    this.showBudgetList();
  }

  onGlobalSearch(event: any, role: any) {
    let value: any;
    if (event.target?.value) {
      value = event.target?.value.toUpperCase();
      this.payload.searchText = value;
    } else {
      value = "";
      this.payload.searchText = "";
    }
    let pageIndex: any = 0;
    if (role == "DM") {
      this.searchTextDM = value;
      this.pageIndexDM = 1;
      this.dmOrderBy = "asc";
      this.dmSortBy = "tmNumber";
    } else if (role == "TM") {
      this.searchTextTM = value;
      this.pageIndexTM = 1;
      this.tmOrderBy = "asc";
      this.tmSortBy = "tmNumber";
    } else if (role == "RVP") {
      this.searchTextRVP = value;
      this.pageIndexRVP = 1;
      this.rvpOrderBy = "asc";
      this.rvpSortBy = "tmNumber";
    } else if (role == "SVP") {
      this.searchTextSVP = value;
      this.pageIndexSVP = 1;
      this.svpOrderBy = "asc";
      this.svpSortBy = "tmNumber";
    }
    this.getCustomerBudgetsList(pageIndex, role);
  }

  resetRequestObj() {
    this.createTransfer = {
      tmNumber: "",
      productType: undefined,
      amount: "",
      currency: undefined,
      action: undefined,
      isFutureBudget: this.isFutureBuget,
    };

    this.transferBudget = {
      amount: null,
      fromProductType: undefined,
      fromTmNumber: "",
      isFutureBudget: this.isFutureBuget,
      toProductType: undefined,
      toTmNumber: "",
    };
    this.showFromToError = false;
    this.selectedFromName = '';
    this.selectedToName= '';
    this.selectedFromToName = '';
    this.pageIndexTM = 0;
    this.pageIndexDM = 0;
    this.pageIndexRVP = 0;
  }

  selectTab(tabId: any) {
    if (this.showCustomerBudget) {
      this.resetRequestObj();
    }

    if (tabId == 1) {
      this.payload.isFutureBudget = false;
      
      this.isFutureBuget = false;
      this.createTransfer.isFutureBudget = false;
      this.transferBudget.isFutureBudget = false;
      const index = this.sampleBudgetcolumns.findIndex(
        (item) => item.key === "remainingbudget"
      );
      if (index !== -1) {
        this.sampleBudgetcolumns.splice(index, 1, {
          key: "remainingbudget",
          title: "Remaining Available Budget",
        });
      }
    }
    if (tabId == 2) {
      this.payload.isFutureBudget = true;
      this.isFutureBuget = true;
      this.createTransfer.isFutureBudget = true;
      this.transferBudget.isFutureBudget = true;
      const index = this.sampleBudgetcolumns.findIndex(
        (item) => item.key === "remainingbudget"
      );
      if (index !== -1) {
        this.sampleBudgetcolumns.splice(index, 1, {
          key: "remainingbudget",
          title: "Future Budget",
        });
      }
      if (!this.lastRun) {
        this.lastRun = true;
        this.showBudgetList();
      }
    }
  }

  productTypesArray: any = [
    {
      key: "Residential Soft",
      value: "RESIDENTIAL_SOFT_GRP_CODE",
    },
    {
      key: "Resilient",
      value: "RESILIENT_GRP_CODE",
    },
    {
      key: "Wood & Laminate",
      value: "NON_RESILIENT_GRP_CODE",
    },
  ];
  currencyArray: any = [
    {
      key: "USD",
      value: "USD",
    },
    {
      key: "CAD",
      value: "CAD",
    },
  ];
  actionArray: any = [
    {
      key: "CREATE",
      value: "add",
    },
    {
      key: "UPDATE",
      value: "update",
    },
    {
      key: "REDUCE",
      value: "reduce",
    },
  ];

  createTransfer: any = {
    tmNumber: "",
    productType: undefined,
    amount: "",
    currency: undefined,
    action: undefined,
    isFutureBudget: false,
  };

  createSampleFund(f: NgForm) {
    this.spinnerLoading = true;
    this.sampleBudgetService
      .createOrUpdateSampleBudget(this.createTransfer)
      .subscribe(
        (res: any) => {
          this.spinnerLoading = false;
          let dataObject = {
            err: false,
            budgetData: this.createTransfer,
            heading: "Create Budget",
            type: "create",
          };
          if (res?.body?.status == "ERROR") {
            dataObject = {
              err: true,
              budgetData: res?.body?.message,
              heading: "Create Budget Error",
              type: "create",
            };
          } else {
            f.reset();
             dataObject = {
              err: false,
              budgetData: res?.body?.message,
              heading: "Create Budget",
              type: "create",
            };
            this.showBudgetList();
            this.resetRequestObj();
          }
          const initialState: ModalOptions = {
            initialState: dataObject,
          };
          this.bsModalRef = this.modalService.show(
            TransferPopupComponent,
            Object.assign(initialState, {
              class: "modal-lg modal-dialog-centered",
              backdrop: "static",
              keyboard: false,
            })
          );
        },
        (error) => {
          const initialState: ModalOptions = {
            initialState: {
              err: true,
              budgetData: error.error,
              heading: "Create Budget Error",
              type: "create",
            },
          };
          this.bsModalRef = this.modalService.show(
            TransferPopupComponent,
            Object.assign(initialState, {
              class: "modal-lg modal-dialog-centered",
              backdrop: "static",
              keyboard: false,
            })
          );
        }
      );
  }

  checkProductType(value: any) {
    this.transferBudget.toProductType = this.transferBudget.fromProductType;
  }

  onSelectToTM(event: any) {
    if (event.value) {
      this.showFromToError =
        this.transferBudget.fromTmNumber &&
        event?.value === this.transferBudget.fromTmNumber;
        this.selectedToName = `${event.item.tmNumber} | ${event.item.salesManName}`;
        this.transferBudget.toTmNumber = event.item.tmNumber;
    }
  }


  onSelectFromNumber(event: any){
    if (event.value) {
      this.selectedFromName = `${event.item.tmNumber} | ${event.item.salesManName}`;
      this.createTransfer.tmNumber = event.item.tmNumber;
    }
  }

  onSelectFromTM(event: any) {
    if (event.value) {
      this.showFromToError =
        this.transferBudget.toTmNumber &&
        event?.value === this.transferBudget.toTmNumber;
    }
  }

  typeaheadOnBlur(event: any, type: any) {
    this.transferBudget[type] = "";
  }

  typeaheadOnBlurCreate(event: any) {
    this.createTransfer.tmNumber = "";
  }

  keyPressNumbers(event: any) {
    const value = event?.currentTarget?.value;
    const currentValue:any = Number(value + event.key);
    if(isNaN(currentValue)){
      return false;
    }
    if (event?.key == "." && value.includes(".")) {
      return false;
    }
    return this.isDecimalNumberKey(event);
  }

  isDecimalNumberKey(event: any) {
    const value = event?.currentTarget?.value;
    var charCode = event.which ? event.which : event.keyCode;
    if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57))
      return false;
    if (value.includes(".")) {
      let val = value.split(".");
      val = val[val.length - 1].split("");
      if (val.length > 1) {
        return false;
      }
    }
    return true;
  }
  
  svpSortBy: any = "tmNumber";
  rvpSortBy: any = "tmNumber";
  dmSortBy: any = "tmNumber";
  tmSortBy: any = "tmNumber";
  svpOrderBy: any = "asc";
  rvpOrderBy: any = "asc";
  dmOrderBy: any = "asc";
  tmOrderBy: any = "asc";
  onTableEvent(e: any, role: any) {
    if (e?.event == "onOrder") {
      let sortBy =e?.value?.key;
      let orderBy =e?.value?.order;
      switch (role) {
        case "SVP":
          this.svpOrderBy = orderBy;
          this.svpSortBy = sortBy;
          this.pageIndexSVP = 1;
          // this.getCustomerBudgetsList(0, role);
          break;
        case "RVP":
          this.rvpOrderBy = orderBy;
          this.rvpSortBy = sortBy;
          this.pageIndexRVP = 1;
          // this.getCustomerBudgetsList(0, role);
          break;
        case "DM":
          this.dmOrderBy = orderBy;
          this.dmSortBy = sortBy;
          this.pageIndexDM = 1;
          // this.getCustomerBudgetsList(0, role);
          break;
        case "TM":
          this.tmOrderBy = orderBy;
          this.tmSortBy = sortBy;
          this.pageIndexTM = 1;
          // this.getCustomerBudgetsList(0, role);
          break;
      }
      this.getCustomerBudgetsList(0, role);
   }
  }
}
