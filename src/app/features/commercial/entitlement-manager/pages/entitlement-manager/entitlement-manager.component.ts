import { AfterViewInit, Component, OnInit, HostListener, ElementRef, ViewChild, ChangeDetectorRef } from "@angular/core";
import { BreadcrumbItems } from "src/app/features/shared/interfaces";
import {
  API,
  APIDefinition,
  Columns,
  Config,
  DefaultConfig,
} from "ngx-easy-table";
import { EntitlementManagerService } from "../../services/entitlement-manager.service";
import { UserService } from "src/app/features/shared/user/services/user.service";
import { ConfirmationDialogComponent } from "src/app/features/shared/components/confirmation-dialog/confirmation-dialog.component";
import { ModalOptions, BsModalRef, BsModalService } from "ngx-bootstrap/modal";
@Component({
    selector: 'app-entitlement-manager',
    templateUrl: './entitlement-manager.component.html',
    styleUrls: ['./entitlement-manager.component.scss'],
    standalone: false
})
export class EntitlementManagerComponent implements OnInit {

  spinnerLoading: boolean = false;
  searchOnclick: any =false;
  breadcrumbItems: BreadcrumbItems = [
    {
      name: "Home",
      path: "/commercial",
      active: false,
    },
    {
      name: "Pricing Manager",
      path: "/",
      active: true,
    },
  ];

  public configuration!: Config;
  public columns!: Columns[];
  public page: any = [];
  public productsData: any = [];
  pageIndex: number = 1;
  tableItemsSize: number = 50;
  startValue: number =
    this.pageIndex * this.tableItemsSize - (this.tableItemsSize - 1);
  lastValue: number = this.startValue + this.tableItemsSize - 1;
  productsDataLength: number = 0;
  filtersData:any = [];
  payload:any = {
    filterBy: '',
    filterValue: '',
    style: '',
    styleId:''
  }
  filterPayload = {
    filterBy: '',
    filterValue: '',
  }
  public selectedRows:any = [];
  alertData: any = {
    message: "success",
    showAlert: false
  };
  filteredStyles: any = [];
  showStyles:boolean = false;
  updateCustpayload:any = {
    "baseProductList": [],
    "operation" : '',
    "division": ''
  }
  uid:any;
  showBlockedBtn:boolean = false;
  showUnBlockedBtn: boolean = false;
  selectedProduct:any = [];
  styleBlocked:any = ["YES","NO"];
  isSalesOps: boolean = false;  
  allSelected: boolean = false;
  modalRef!: BsModalRef;
  @ViewChild("scrollToTop", { read: ElementRef }) scrollToTop: any;
  constructor(private entitlementMgrService: EntitlementManagerService,
    public userService: UserService, private modalService: BsModalService) { }

  ngOnInit(): void {
    this.getFiltersData();
    this.initTable();
    
    this.userService.getCurrentUserDetail().subscribe((res) => {
      this.uid = res?.body.orgUnit?.uid;
      this.isSalesOps = res?.body?.isSalesOps;
    });
  }

  getFiltersData(updateStyle = false){
    this.spinnerLoading = true;
    this.entitlementMgrService.getentitlementMgrFilters(this.filterPayload).subscribe((response: any) => {
      this.spinnerLoading = false;
      if(updateStyle){
        this.filtersData.styles = response?.body?.styles;
      }else{
        this.filtersData = response?.body;
        if( this.filtersData?.brands){
          this.filtersData?.brands.sort();
        }
        if(this.filtersData?.collection){
          this.filtersData?.collection.sort();
        }
        if(this.filtersData?.productClass){
          this.filtersData?.productClass.sort();
        }
        if(this.filtersData?.productLine){
          this.filtersData?.productLine.sort();
        }
       
      }
      this.getEntitleMentMgrData(0);
    });
  }

  pageSizes: number[] = [];
  initTable() {
    this.configuration = { ...DefaultConfig };
    this.configuration.tableLayout.striped = true;
    this.configuration.tableLayout.hover = false;
    this.configuration.paginationRangeEnabled = false;
    this.configuration.paginationEnabled = false;
    this.pageSizes = this.getPageSizes();
    this.configuration.rows = Math.max(...this.pageSizes);  
    this.configuration.checkboxes = true;
    
   
    this.columns = [
      // { key: "", title: "" , width: '2%'},
      { key: "styleId", title: "Style Code", width: '8.2%' },
      { key: "styleName", title: "Style Name" },
      { key: "brand", title: "Selling Group (Brand)", width: '10.2%' },
      { key: "productClass", title: "Product Class" },
      { key: "productLine", title: "Product Line" },
      { key: "collection", title: "Collection" },
      { key: "styleBlocked", title: "Hidden (Y/N)", width: '1%' },
      //{ key: "styleBlocked", title: "Status", width: '10%' },
    ];
  }
  getPageSizes(): number[] {
    return [10, 25, 50, 100];
  }

  getEntitleMentMgrData(pageIndex: number){
    this.spinnerLoading = true;
    this.entitlementMgrService.getEntitlementMgrData(this.payload,pageIndex, this.tableItemsSize).subscribe((response: any) => {
      this.spinnerLoading = false;
      this.allSelected = false;
      this.productsData = [];
      this.productsData = response?.body?.products || [];
      this.productsDataLength = response?.body?.pagination?.totalResults;
    });
  }

  onTableDataChange(event: any) {
    this.pageIndex = event;
    if (0 == event) {
      this.pageIndex = 1;
    }
    this.getEntitleMentMgrData(event - 1);
  }

  updateCustEntitlement(product:any, operation = '', action = '', from = ''){
    this.updateCustpayload.operation = operation;
    this.alertData='';
    this.updateCustpayload.division = this.uid.split("_")[3];
    if(from == "selectedStyles"){
      this.updateCustpayload.baseProductList = product;
    }else{
      this.updateCustpayload.baseProductList = [product?.code];
    }

    if(!action){
      this.updateCustpayload.customer = this.uid.split("_")[0];
      this.updateCustpayload.salesOrg = this.uid.split("_")[1];
      this.updateCustpayload.distributionChannel = this.uid.split("_")[2];
    }else{
      delete this.updateCustpayload.customer;
      delete this.updateCustpayload.salesOrg;
      delete this.updateCustpayload.distributionChannel;
    }
    
    this.spinnerLoading = true;
    this.entitlementMgrService.updateCustEntitlement(this.updateCustpayload).subscribe((response: any) => {
      this.spinnerLoading = false;
      this.selectedRows = [];
      this.selectedProduct = [];
      this.showBlockedBtn = false;
      this.showUnBlockedBtn = false;
      setTimeout(() => {
        this.allSelected = false;
        this.getEntitleMentMgrData(this.pageIndex - 1);
      },1000);
      this.alertData = {
        message: response.body?.status == 'success' ? "Price Entitlement Updated Successfully" : response.body?.message,
        type: (response.body?.status == 'success') ? 'success' : 'danger',
        showAlert: true
      };
      this.scrollPageToTop();
    },
    (err: any) => {
      this.spinnerLoading = false;
      this.alertData = {
        message: 'Pricing Update Failed',
        type: 'danger',
        showAlert: true
      };
     this.scrollPageToTop();
    }
    );
  }

  onFilterChange(event: any, type: string){
    if(type != 'entitled'){
      this.payload.filterBy = event ? type : '';
      this.payload.filterValue = event || '';
      this.filterPayload.filterBy = event ? type : '';
      this.filterPayload.filterValue = event || '';
    }
    this.payload.style = '';
    if(type == 'entitled' && event){
      this.payload.entitled = (event == "YES" ? 'N' : 'Y');
    }else if(type == 'entitled' && !event){
      delete this.payload.entitled;
    }
    this.pageIndex = 1;
    this.getFiltersData(true);
  }

  onCheckboxSeleted(product: any) {
    this.selectedRows = this.productsData.filter((p: any)=>p.isSelected).flatMap((item: any)=>[item.code]);
    this.showBlockedBtn  = (this.productsData.filter((item:any) => item.styleBlocked == false && item.isSelected).length > 0 ) ? true :  false;
    this.showUnBlockedBtn = (this.productsData.filter((item:any) => item.styleBlocked == true && item.isSelected).length > 0 )? true :  false;
    this.allSelected = this.productsData.every((item: any) => item.isSelected);
  }

  updateEntitlement(operation:string,action=''){
    if(action == "all"){
      let operationType:any = operation == "U" ? 'unblock' : 'block';
      this.openConfirmationModal({
        title: "Confirmation",
        content: `Are you sure you want to ${operationType} for all customers`,
        primaryActionLabel: "Confirm",
        secondaryActionLabel: "Cancel",
        onPrimaryAction: () => {
          let styleIds = this.selectedRows;
          this.updateCustEntitlement(styleIds,operation,action,'selectedStyles'); 
          this.modalService.hide("confirmationModal")
        },
        onSecondaryAction: () =>{ this.modalService.hide("confirmationModal") },
      });
    }else{
      let styleIds = this.selectedRows;
      this.updateCustEntitlement(styleIds,operation,action,'selectedStyles');
    }
  }

  openConfirmationModal(data = {}) {
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
        id: "confirmationModal",
        class: "modal-md modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );
  }

  getsearchStyles(value: any) {
    this.searchEntitlementMgr(value);
  }

  searchEntitlementMgr(value: any) {
    this.showStyles = false;
    this.pageIndex = 1;
    this.payload.style = value ? value.toUpperCase() : '';
    if (this.searchOnclick && value) {
      const selectedStyle = this.filtersData?.stylesMap?.entry.find(
        (style: any) => style.value === value
      );
      this.payload.styleId = selectedStyle?.key || '';
    } else {
      this.payload.styleId = '';
    }
    this.getEntitleMentMgrData(0);
  }

  setStyleValue(value:string){ 
    if(value){
      this.searchOnclick =true
      this.searchEntitlementMgr(value);
    }
  }

  onChange(event: any) {
    let value = event.target.value;
    value = value?.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '').trim();
    if (value && value.length > 2) {
      this.showStyles = true;
      this.filteredStyles = this.filtersData?.styles.filter((name: string) =>
        name.replace(/\s+/g, '').toLowerCase().includes(value.toLowerCase())
      );
    }

    if(value == '' || value == undefined) {
      this.filteredStyles = [];
      this.searchEntitlementMgr('');
    }
  }
  

  scrollPageToTop() {
    this.scrollToTop.nativeElement.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "nearest",
    });
  }

  @HostListener("document:click")
  clicked() {
    this.showStyles = false;
  }

  onPageSizeChange(e: any) {
    let value = e?.value;
    this.tableItemsSize = Number(value);
    this.pageIndex = 1; 
    this.getEntitleMentMgrData(0);
  }

  tableEventEmitted(e: any) {
    if (e?.event == "onSelectAll") {
      e.value = ((this.allSelected == true && e?.value == false) || (this.allSelected == false && e?.value == true)) ? this.allSelected : e?.value;
      this.productsData?.map((prod: any) => {
        prod.isSelected = e?.value;
      });
      this.selectedRows = this.productsData.filter((p: any)=>p.isSelected).flatMap((item: any)=>[item.code]);
      this.showBlockedBtn  =  (this.productsData.filter((item: any) => item.styleBlocked == false && item.isSelected).length > 0) ? true : false;
      this.showUnBlockedBtn = (this.productsData.filter((item: any) => item.styleBlocked == true && item.isSelected).length > 0) ? true : false;
      this.allSelected = this.productsData.every((item: any) => item.isSelected);
    }
  }
}
