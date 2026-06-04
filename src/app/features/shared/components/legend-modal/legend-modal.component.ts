import { Component, OnInit, TemplateRef } from "@angular/core";
import { Columns, Config, DefaultConfig } from "ngx-easy-table";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";

@Component({
    selector: "app-legend-modal",
    templateUrl: "./legend-modal.component.html",
    styleUrls: ["./legend-modal.component.scss"],
    standalone: false
})
export class LegendModalComponent implements OnInit {
  modalRef?: BsModalRef;
  constructor(private modalService: BsModalService) {}

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      id: 1,
      class: "modal-lg modal-dialog-centered",
      backdrop: "static",
      keyboard: false,
    });
  }

  public configuration!: Config;
  public columns!: Columns[];
  // public col2!: Columns[];

  public data = [
    {
      abbreviation: "ACHPY",
      description: "Unapplied payment NOT AVAILABLE FOR CUSTOMER USE",
    },
    {
      abbreviation: "ARI",
      description: "Unapplied payment NOT AVAILABLE FOR CUSTOMER USE",
    },
    {
      abbreviation: "CLCR",
      description: "Deduction for CARE assessment",
    },
    {
      abbreviation: "ER",
      description: "Remittance detail does not add correctly",
    },
  ];
  // public data2 = [
  // {
  //   transaction: 'C/B or D/M',
  //   description2: 'Chargeback',
  // },
  // {
  //   transaction: 'C/M',
  //   description2: 'Credit Item',
  // },
  // {
  //   transaction: 'INT',
  //   description2: 'Interest',
  // },
  // {
  //   transaction: 'INV',
  //   description2: 'Invoice',
  // },
  // {
  //   transaction: 'INV',
  //   description2: 'Payment posted but not yet applied to specific obligations. NOT AVAILABLE FOR CUSTOMER USE',
  // },

  // ];

  ngOnInit(): void {
    this.configuration = { ...DefaultConfig };
    this.configuration.checkboxes = false;
    this.configuration.tableLayout.striped = true;
    this.configuration.tableLayout.hover = false;
    this.configuration.paginationRangeEnabled = false;
    this.configuration.paginationEnabled = false;

    this.columns = [
      { key: "abbreviation", title: "Abbreviation" },
      { key: "description", title: "Description" },
    ];
    // this.col2 = [
    //   { key: 'transaction', title: 'Transaction Type'},
    //   { key: 'description2', title: 'Description',  }

    // ];
  }
}
