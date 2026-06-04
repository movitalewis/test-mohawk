import {
  Component,
  OnInit,
  TemplateRef,
  Output,
  ViewChild,
  EventEmitter,
  ChangeDetectionStrategy,
} from "@angular/core";
import { BsModalRef, BsModalService,ModalOptions } from "ngx-bootstrap/modal";
import {
  Config,
  Columns,
  DefaultConfig,
  APIDefinition,
  API,
} from "ngx-easy-table";
import { UserService } from "src/app/features/shared/user/services/user.service";
import { ProductAddressService } from "../services/product-address.service";
import { ProductService } from "../../pages/services/product.service";
import { debounceTime, map, mergeMap, Subject, take } from "rxjs";
import { ProgressModalComponent } from "src/app/features/shared/components/progress-modal/progress-modal.component";
import { MESSAGE_CONSTANTS } from "src/app/features/shared/constants/MESSAGE-CONSTANTS";

@Component({
    selector: "app-change-shipping-address",
    templateUrl: "./change-shipping-address.component.html",
    styleUrls: ["./change-shipping-address.component.scss"],
    standalone: false
})
export class ChangeShippingAddressComponent implements OnInit {
  allSelected = false; 
  isModalContentVisible: boolean = false;
  // @ViewChild("table", { static: true }) table!: APIDefinition;
  @Output() messageEvent = new EventEmitter<string>();
  selected: any;
  modalRef?: BsModalRef;
  pageIndex: number = 1;
  tableItemsSize: number = 10;
  totlRecords: any;
  allAddressData: any[] = [];
  configuration!: Config;
  columns!: Columns[];
  tableLoading = false;
  initialState: any;
  minRollLength: any;
  maxRollLength: any;
  uid: any;
  @ViewChild("showMinMaxChangeTemplate", { static: true })
  showMinMaxChangeTemplate!: TemplateRef<any>;
  isPriceSearch: boolean = false;
  enableDoneBtn: boolean = false;
  constructor(
    private modalService: BsModalService,
    private productService: ProductAddressService,
    private userService: UserService,
    public pdpProductService: ProductService
  ) {}

  changeAddressModal(template1: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template1, {
      id: 1,
      class: "modal-xl modal-dialog-centered",
      backdrop: "static",
      keyboard: false,
    });
  }

  ngOnInit(): void {
    this.getShippingAddress(0, "");
    this.initialState = this.modalService.config.initialState;
    this.userService.getCurrentUserDetail().subscribe((res: any) => {
      this.uid = res.body.orgUnit?.uid;
    });
    this.isPriceSearch = this.initialState?.isPriceSearch == true;
    this.configuration = { ...DefaultConfig };
    this.configuration.checkboxes = false;
    this.configuration.tableLayout.striped = true;
    this.configuration.tableLayout.hover = false;
    this.configuration.paginationRangeEnabled = false;
    this.configuration.paginationEnabled = false;
    this.configuration.selectCell = false;
    this.configuration.horizontalScroll = true;
    this.columns = [
      { key: "#", title: "", width: "7%",orderEnabled: false },
      { key: "ship", title: "Ship To Name/Ship To #",orderEnabled: false },
      { key: "address", title: "Address",orderEnabled: false },
      { key: "shipVia", title: "Shipping Method",orderEnabled: false },
      // { key: "remove", title: "Remove" },
    ];
  }

  getShippingAddress(currentPage: any, searchText: any) {
    this.progressShow("shippingAddress", "shippingAddressId")
    this.pageIndex = currentPage + 1;
    this.totlRecords = 0;
    this.allAddressData = [...[], ...[]];
    this.tableLoading = true;
    this.enableDoneBtn = false;
    this.productService
      .pricingAllAddress(
        this.userService.getUserEmail().toLowerCase(),
        this.tableItemsSize,
        currentPage,
        searchText
      )
      .subscribe(
        (res) => {
          this.progressHide("shippingAddressId");
          
          const data = res.body?.addresses || [];
          this.allAddressData = [...[], ...data];
          this.tableLoading = false;
          this.totlRecords = res.body?.totalResults || 0;
          if(this.initialState?.isForSelectAddress && this.initialState?.selectedAddress != null){
            const ind = this.allAddressData.findIndex(item=>item.id === this.initialState?.selectedAddress?.id);
            this.rowSelected({state:true},ind);
          }
          this.isModalContentVisible = true;
          
        },
        (err: any) => {
          this.progressHide("shippingAddressId");
          this.tableLoading = false;
        }
      );
  }

  onChange(event: any): void {
    this.getShippingAddress(0, event);
    // this.table.apiEvent({
    //   type: API.onGlobalSearch,
    //   value: event,
    // });
  }

  eventEmitted($event: {
    event: string;
    value: { rowId: number; row: any };
  }): void {
    this.selectedAddress = $event.value.row;
    switch ($event.event) {
      case "onCheckboxSelect":
        // this.table.apiEvent({
        //   type: API.toggleCheckbox,
        //   value: this.selected,
        // });
        this.selected = $event.value.rowId;
        // this.table.apiEvent({
        //   type: API.toggleCheckbox,
        //   value: $event.value.rowId,
        // });
        break;
      case "onSelectAll":
        break;
    }
  }

  selectedAddress: any;
  onHideModal(id: any) {
    this.modalService.hide(id);
  }

  onSubmitModal(id: any) {
    if(!this.initialState.hasOwnProperty('isForSelectAddress')){
      this.fetchMinMaxRollLength(this.selectedAddress.id);
    }
    this.messageEvent.emit(this.selectedAddress);
    this.modalService.hide(id);
  }

  rowSelected(item: any, selectedIndex: number) {
    this.allAddressData.forEach((row: any, index: any) => {
      row.selected = false;
      if (selectedIndex == index && item.state == true) {
        row.selected = item.state;
        this.enableDoneBtn = true;
      } else {
        row.selected = false;
      }
    });
  }
  onTablePageChange(event: any, searchCtrlRef: any) {
    this.pageIndex = event;
    this.getShippingAddress(event - 1, searchCtrlRef?.searchKey);

    // this.getShippingAddress(event-1);
  }

fetchMinMaxRollLength(shipToId: any) {
  this.pdpProductService
    .getMinMaxRollLength(
      this.initialState?.standardRollLength,
      this.uid,
      shipToId,
      this.initialState.productCode
    )
    .pipe(debounceTime(1000))
    .subscribe({
      next: (res: any) => {
        if (Object.keys(res?.body).length != 0) {
          this.minRollLength = res?.body?.minRoll;
          this.maxRollLength = res?.body?.maxRoll;
          if (this.minRollLength != null && this.maxRollLength != null) {
            if(    localStorage.getItem("selectedProductTab")=="Roll"){
            if (
              this.minRollLength != this.initialState.minRollLength ||
              this.maxRollLength != this.initialState.maxRollLength
            ) {
              const initialState: ModalOptions = {
                initialState: {},
              };
              this.modalRef = this.modalService.show(
                this.showMinMaxChangeTemplate,
                Object.assign(initialState, {
                  id: "viewReplacementOrderModal",
                  class: "modal-md modal-dialog-centered",
                  backdrop: "static",
                  keyboard: false,})
              );
                }
            }
          }
        }
      },
      error: (err) => {  this.progressHide()},
    });
}
useNewMinMaxValues(){
  localStorage.setItem("MinRollLength", this.minRollLength);
  localStorage.setItem("MaxRollLength", this.maxRollLength);
}
useOldMinMaxValues(){
  localStorage.setItem("MinRollLength",  this.initialState.minRollLength);
  localStorage.setItem("MaxRollLength",  this.initialState.maxRollLength);
 }
  progressShow(msgType: any, modalId: any = "progressModal", size: any = "md") {
    const messageConstants = MESSAGE_CONSTANTS?.pricing?.[msgType]
    this.openProgressModal({
      modalHeaderText: messageConstants?.headerText,
      progressText: messageConstants?.bodyText,
      progressBarText: messageConstants?.barText,
      isForSelectAddress: ''
    }, size, modalId);
  }
  progressHide(modalId: any = "progressModal") {
    this.modalService.hide(modalId);
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
