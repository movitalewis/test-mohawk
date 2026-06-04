import { Component, OnInit, TemplateRef } from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { Config, Columns, DefaultConfig } from "ngx-easy-table";

@Component({
    selector: "xchange-legend-popup",
    templateUrl: "./xchange-legend-popup.component.html",
    styleUrls: ["./xchange-legend-popup.component.scss"],
    standalone: false
})
export class XchangeLegendPopupComponent implements OnInit {
  modalRef?: BsModalRef;
  constructor(
    private modalService: BsModalService,
    public bsModalRef: BsModalRef
  ) {}

  openModal1(template1: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template1, {
      id: 1,
      class: "modal-xl modal-dialog-centered",
      backdrop: "static",
      keyboard: false,
    });
  }

  public configuration!: Config;
  public configuration2!: Config;
  public columns!: Columns[];
  public col1!: Columns[];
  public col2!: Columns[];

  public data1 = [
    {
      open: "$83.12",
      deduction: "",
      netCharge: "N/A",
      desciption: "",
      comments: "",
    },
  ];

  public data2 = [
    {
      open1: "$83.12",
      deduction1: "$15.00",
      netCharge1: "$83.12",
      description1: "Fuel Surcharge",
      comments1: "Freight fuel difference",
      action: "",
    },
  ];

  ngOnInit(): void {
    this.configuration = { ...DefaultConfig };
    this.configuration.checkboxes = true;
    this.configuration.tableLayout.striped = true;
    this.configuration.tableLayout.hover = false;
    this.configuration.paginationRangeEnabled = false;
    this.configuration.paginationEnabled = false;
    this.configuration2 = { ...DefaultConfig };
    this.configuration2.checkboxes = false;
    this.configuration2.tableLayout.striped = true;
    this.configuration2.tableLayout.hover = false;
    this.configuration2.paginationRangeEnabled = false;
    this.configuration2.paginationEnabled = false;

    this.columns = [
      { key: "company", title: "Company" },
      { key: "type", title: "Type" },
      { key: "status", title: "Status" },
      {
        key: "document",
        title: "Document",
        cssClass: { includeHeader: false, name: "color-red" },
      },
      { key: "po", title: "PO" },
      { key: "documentDate", title: "Document Date" },
      { key: "openAmount", title: "Open Amount (USD)" },
      { key: "availableDiscountAmount", title: "Discount Amount (USD)" },
      { key: "scheduleAmount", title: "Schedule Amount (USD)" },
    ];
    this.col1 = [
      { key: "open", title: "Open" },
      { key: "deduction", title: "Deduction" },
      { key: "netCharge", title: "Net Charge" },
      { key: "desciption", title: "Desciption" },
      { key: "comments", title: "Comments" },
    ];
    this.col2 = [
      { key: "open1", title: "Open" },
      { key: "deduction1", title: "Deduction" },
      { key: "netCharge1", title: "Net Charge" },
      { key: "desciption1", title: "Desciption" },
      { key: "comments1", title: "Comments" },
      { key: "action", title: "" },
    ];
  }

  onHideModal() {
    this.bsModalRef.hide();
  }
}
