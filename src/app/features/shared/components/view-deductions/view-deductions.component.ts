import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { Config, Columns, DefaultConfig } from "ngx-easy-table";
import { take } from "rxjs/operators";
import { StorageService } from "src/app/features/http-services/storage.service";

@Component({
    selector: "xchange-view-deductions",
    templateUrl: "./view-deductions.component.html",
    styleUrls: ["./view-deductions.component.scss"],
    standalone: false
})
export class ViewDeductionsComponent implements OnInit {
  @Input() deductions!: any;
  modalRef?: BsModalRef;

  constructor(private modalService: BsModalService, private storageService: StorageService) {}

  closeModal() {
    this.modalService.hide(this.modalService.config.id);
  }

  public configuration!: Config;
  public columns!: Columns[];
  priceLabel:any;

  ngOnInit(): void {

    this.storageService.getItem('userInfo').pipe(take(1)).subscribe(({priceLabel}: any) => {
      this.priceLabel = `${priceLabel}`;
      this.configuration = { ...DefaultConfig };
      this.configuration.checkboxes = false;
      this.configuration.tableLayout.striped = true;
      this.configuration.tableLayout.hover = false;
      this.configuration.paginationRangeEnabled = false;
      this.configuration.paginationEnabled = false;
      this.columns = [
        { key: "amount", title: `Deduction Amount (${priceLabel})` },
        { key: "description", title: "Deduction description" },
        { key: "comments", title: "Comment" },
      ];
    });
  }
}
