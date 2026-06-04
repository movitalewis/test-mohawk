import { Component, OnInit, TemplateRef } from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { Config, Columns, DefaultConfig } from "ngx-easy-table";

@Component({
    selector: "xchange-legend-popup",
    templateUrl: "./xchange-legend-popup.component.html",
    styleUrls: ["./xchange-legend-popup.component.scss"],
    standalone: false
})
export class LegendPopupComponent implements OnInit {
  modalRef?: BsModalRef;
  constructor(
    private modalService: BsModalService,
    public bsModalRef: BsModalRef
  ) {}

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      id: 1,
      class: "modal-lg modal-dialog-centered",
      backdrop: "static",
      keyboard: false,
    });
  }

  public configuration!: Config;
  public col2!: Columns[];
  public col3!: Columns[];
  public data2 = [
    {
      head: "ACHPY",
      text: "Unapplied payment NOT AVAILABLE FOR CUSTOMER USE",
    },
    {
      head: "ARI",
      text: "Unapplied payment NOT AVAILABLE FOR CUSTOMER USE",
    },
    {
      head: "CLCR",
      text: "Deduction for CARE assessment",
    },
    {
      head: "ER",
      text: "Remittance detail does not add correctly",
    },
  ];

  public data3 = [
    {
      head: "C/B or D/M",
      text: "Chargeback",
    },
    {
      head: "C/M",
      text: "Credit Item",
    },
    {
      head: "INT",
      text: "Interest",
    },
    {
      head: "INV",
      text: "Invoice",
    },
  ];

  ngOnInit(): void {
    this.configuration = { ...DefaultConfig };
    this.configuration.checkboxes = false;
    this.configuration.tableLayout.striped = true;
    this.configuration.tableLayout.hover = false;
    this.configuration.paginationRangeEnabled = false;
    this.configuration.paginationEnabled = false;
    this.col2 = [
      { key: "head", title: "Abbreviation" },
      { key: "text", title: "Description" },
    ];
    this.col3 = [
      { key: "head", title: "Abbreviation" },
      { key: "text", title: "Description" },
    ];
  }
  onHideModal() {
    this.bsModalRef.hide();
  }
}
