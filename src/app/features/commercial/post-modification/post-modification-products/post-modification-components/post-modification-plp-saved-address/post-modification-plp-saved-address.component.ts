import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
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
    selector: "commercial-post-modification-plp-saved-address",
    templateUrl: "./post-modification-plp-saved-address.component.html",
    styleUrls: ["./post-modification-plp-saved-address.component.scss"],
    standalone: false
})
export class PostModificationPlpSavedAddressComponent implements OnInit {
  @ViewChild("table", { static: true }) table!: APIDefinition;
  @Output() messageEvent = new EventEmitter<string>();
  selected: any;
  modalRef?: BsModalRef;
  constructor(
    private modalService: BsModalService,
    public bsModalRef: BsModalRef,
    private defaultAddress: PostModificationProductAddressService,
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

  public configuration!: Config;
  public columns!: Columns[];

  public data = [
    {
      suffixName: "About All Floors  (Suffix#1)",
      address:
        "assets/images/ap-1.p1050 Berkshire Blvd , Wyomissing,  PA 19610ng",
      shipVia: "Mohawk Truck",
      remove: "Delete",
    },
    {
      suffixName: "About All Floors  (Suffix#0)",
      address:
        "assets/images/ap-1.p1050 Berkshire Blvd , Wyomissing,  PA 19610ng",
      shipVia: "Mohawk Truck",
      remove: "Delete",
    },
    {
      suffixName: "About All Floors  (Suffix#2)",
      address:
        "assets/images/ap-1.p1050 Berkshire Blvd , Wyomissing,  PA 19610ng",
      shipVia: "Mohawk Truck",
      remove: "Delete",
    },
  ];

  ngOnInit(): void {
    this.configuration = { ...DefaultConfig };
    this.configuration.checkboxes = false;
    this.configuration.tableLayout.striped = true;
    this.configuration.tableLayout.hover = false;
    this.configuration.paginationRangeEnabled = false;
    this.configuration.paginationEnabled = false;
    this.columns = [
      { key: "#", title: "", width: "7%" },
      { key: "suffixName", title: "Suffix Name / Suffix #" },
      { key: "address", title: "Address" },
      { key: "shipVia", title: "Ship via" },
      { key: "remove", title: "Remove" },
    ];
    this.getShippingAddress();
  }

  sendValue(value: any): void {
    this.table.apiEvent({
      type: API.onGlobalSearch,
      value: value,
    });
  }

  eventEmitted($event: { event: string; value: { rowId: number } }): void {
    switch ($event.event) {
      case "onCheckboxSelect":
        this.table.apiEvent({
          type: API.toggleCheckbox,
          value: this.selected,
        });
        this.selected = $event.value.rowId;
        this.table.apiEvent({
          type: API.toggleCheckbox,
          value: $event.value.rowId,
        });
        break;
      case "onSelectAll":
        break;
    }
  }
  allAddressData: any;
  getShippingAddress() {
    this.defaultAddress
      .getDefaultAddress(this.userService.getUserEmail().toLowerCase(), 0, "")
      .subscribe((res: any) => {
        this.allAddressData = res.body;
      });
  }
  selectedAddress: any;
  onHideModal(plpsaves: string) {
    if (this.selectedAddress) {
      this.messageEvent.emit(this.selectedAddress);
    }
    this.modalService.hide(plpsaves);
  }

  onSubmitModal(item: any, plpsaves: string) {
    this.selectedAddress = item;
    this.messageEvent.emit(item);
    this.modalService.hide(plpsaves);
  }
}
