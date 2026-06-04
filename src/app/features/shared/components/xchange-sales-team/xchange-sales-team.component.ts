import { Component, Input, OnInit } from "@angular/core";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { Config, Columns, DefaultConfig } from "ngx-easy-table";
import { ApiService } from "src/app/features/http-services/api.service";
import { StorageService } from "src/app/features/http-services/storage.service";
import { ProgressModalComponent } from "../progress-modal/progress-modal.component";
import { MESSAGE_CONSTANTS } from "../../constants/MESSAGE-CONSTANTS";

@Component({
    selector: "app-xchange-sales-team",
    templateUrl: "./xchange-sales-team.component.html",
    styleUrls: ["./xchange-sales-team.component.scss"],
    standalone: false
})
export class XchangeSalesTeamComponent implements OnInit {
  uid: any = "";
  isCommercial: boolean = false;
  modalRef!: BsModalRef;
  constructor(
    public bsModalRef: BsModalRef,
    private apiService: ApiService,
    public storageService: StorageService,
    public modalService: BsModalService,
  ) {
    this.storageService.getItem("uid").subscribe((uid: any) => {
      this.uid = uid;
      this.isCommercial = uid?.split("_")[3] === "82";
    });
    // this.spinnerLoading = true;
    this.progressShow('getSalesTeamList');
    this.apiService.getSalesTeam(this.uid).subscribe((data: any) => {
      this.spinnerLoading = false;
      this.salesTeamData = data?.custSalesPersonList;
      this.progressHide();
    }, () => {
      this.progressHide();
    });
  }

  public configuration!: Config;
  public columns!: Columns[];

  public data = [
    {
      qty: "",
      productImage:
        "https://s7d4.scene7.com/is/image/MohawkResidential/SmartCushion_PSC1_P_3",
      description: "Smartcushion",
      size: "6Ft 00In",
      density: "",
      thickness: "",
      price: "N/A",
    },
    {
      qty: "",
      productImage: "https://s7d4.scene7.com/is/image/MohawkResidential/CW87_3",
      description: "Fresh Protector 7/16",
      size: "6Ft 00In",
      density: "",
      thickness: "",
      price: "N/A",
    },
    {
      qty: "",
      productImage: "https://s7d4.scene7.com/is/image/MohawkResidential/P61_3",
      description: "Viking Medium 7/16",
      size: "6Ft 00In",
      density: "",
      thickness: "",
      price: "N/A",
    },
  ];
  @Input() cardsData: any = [];
  salesTeamData: any = [];
  spinnerLoading = false;

  ngOnInit(): void {
    // getSalesTeam
    this.configuration = { ...DefaultConfig };
    this.configuration.checkboxes = false;

    this.configuration.tableLayout.striped = true;
    this.configuration.tableLayout.hover = false;
    this.configuration.paginationRangeEnabled = false;
    this.configuration.paginationEnabled = false;
    this.columns = [
      { key: "qty", title: "Qty(Rolls)" },
      { key: "productImage", title: "Product Image" },
      { key: "description", title: "Description" },
      { key: "size", title: "Size" },
      { key: "density", title: "Density" },
      { key: "thickness", title: "Thickness" },
      { key: "price", title: "Price (USD)" },
    ];
  }
  progressShow(msgType:any){
    const messageConstants = MESSAGE_CONSTANTS?.mohawkSalesTeam?.[msgType]
     this.openProgressModal({
       modalHeaderText: messageConstants?.headerText,
       progressText: messageConstants?.bodyText,
       progressBarText: messageConstants?.barText
     });
   }
   progressHide(){
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
