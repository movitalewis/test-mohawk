import {
  Component,
  OnInit,
  TemplateRef,
  Output,
  ViewChild,
  EventEmitter,
  ChangeDetectionStrategy,
} from "@angular/core";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import {
  Config,
  Columns,
  DefaultConfig,
  APIDefinition,
  API,
} from "ngx-easy-table";
import { UserService } from "src/app/features/shared/user/services/user.service";
import { PostModificationProductAddressService } from "../post-modification-services/post-modification-product-address.service";

@Component({
    selector: "app-post-modification-change-shipping-address",
    templateUrl: "./post-modification-change-shipping-address.component.html",
    styleUrls: ["./post-modification-change-shipping-address.component.scss"],
    standalone: false
})
export class PostModificationChangeShippingAddressComponent implements OnInit {
  allSelected = false;
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
  maxSize: any;

  constructor(
    private modalService: BsModalService,
    private productService: PostModificationProductAddressService,
    private userService: UserService
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
    this.maxSize = this.userService.updateMaxSize();
    this.getShippingAddress(0, "");

    this.configuration = { ...DefaultConfig };
    this.configuration.checkboxes = false;
    this.configuration.tableLayout.striped = true;
    this.configuration.tableLayout.hover = false;
    this.configuration.paginationRangeEnabled = false;
    this.configuration.paginationEnabled = false;
    this.configuration.selectCell = false;
    this.columns = [
      { key: "#", title: "", width: "7%" },
      { key: "ship", title: "Ship To Name/Ship To #" },
      { key: "address", title: "Address" },
      { key: "shipVia", title: "Shipping Method" },
      // { key: "remove", title: "Remove" },
    ];
  }

  getShippingAddress(currentPage: any, searchText: any) {
    this.pageIndex = currentPage + 1;
    this.totlRecords = 0;
    this.allAddressData = [...[], ...[]];
    this.tableLoading = true;
    this.productService
      .getDefaultAddress(
        this.userService.getUserEmail().toLowerCase(),
        currentPage,
        searchText
      )
      .subscribe(
        (res) => {
          const data = res.body?.addresses || [];
          this.allAddressData = [...[], ...data];
          this.tableLoading = false;
          this.totlRecords = res.body?.totalResults || 0;
        },
        (err: any) => {
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
    this.messageEvent.emit(this.selectedAddress);
    this.modalService.hide(id);
  }

  rowSelected(item: any, selectedIndex: number) {
    this.allAddressData.forEach((row: any, index: any) => {
      row.selected = false;
      if (selectedIndex == index && item.state == true) {
        row.selected = item.state;
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
}
