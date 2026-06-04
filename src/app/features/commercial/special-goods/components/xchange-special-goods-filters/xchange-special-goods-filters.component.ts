import {
  Component,
  HostListener,
  OnInit,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";

@Component({
  selector: "xchange-special-goods-filters",
  standalone: false,
  templateUrl: "./xchange-special-goods-filters.component.html",
  styleUrls: ["./xchange-special-goods-filters.component.scss"],
})
export class XchangeSpecialGoodsFiltersComponent implements OnInit {
  modalRef?: BsModalRef;
  screenWidth: number = window.innerWidth;
  @ViewChild("filterAccordion") filterAccordion: any;
  accordionGroupExpanded: boolean = false;

  sizeFilters: Array<any> = [
    {
      id: 1,
      label: '11.75" X 35.75"  (1)',
    },
    {
      id: 2,
      label: '12" X 12"  (1)',
    },
    {
      id: 3,
      label: '12" X 24"  (26)',
    },
    {
      id: 4,
      label: '12" X 36"  (1)',
    },
    {
      id: 5,
      label: '12"X12"  (1)',
    },
    {
      id: 6,
      label: '12"X24"  (7)',
    },
  ];

  styleFilters: Array<any> = [
    {
      id: 12,
      label: "Style 1",
    },
    {
      id: 13,
      label: "Style 2",
    },
    {
      id: 14,
      label: "Style 3",
    },
  ];

  constructor(private modalService: BsModalService) {}

  @HostListener("window:resize", ["$event"])
  onResize(event: any) {
    this.screenWidth = event.target.innerWidth;
    if (this.screenWidth <= 993) {
      this.accordionGroupExpanded = false;
    }
  }

  ngOnInit(): void {}

  openFilterModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {
      class: "flat-popup-window",
      backdrop: "static",
      keyboard: false,
    });
  }

  expandAll() {
    const accordionGroups = this.filterAccordion.groups;
    accordionGroups.forEach((el: any) => {
      if (this.accordionGroupExpanded) {
        el._isOpen = false;
      } else {
        el._isOpen = true;
      }
    });
    this.accordionGroupExpanded = !this.accordionGroupExpanded;
  }
}
