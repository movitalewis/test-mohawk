import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { ProductListService } from "src/app/features/commercial/products/services/product-list.service";

@Component({
    selector: "xchange-product-filters",
    templateUrl: "./xchange-product-filters.component.html",
    styleUrls: ["./xchange-product-filters.component.scss"],
    standalone: false
})
export class XchangeProductFiltersComponent implements OnInit {
  modalRef?: BsModalRef;
  screenWidth: number = window.innerWidth;
  @Output() clearFilterClick = new EventEmitter();
  @ViewChild("filterAccordion") filterAccordion: any;
  @Input() data: any;
  accordionGroupExpanded: boolean = false;
  filtersList: any[];
  constructor(
    private modalService: BsModalService,
    public productList: ProductListService
  ) {
    this.filtersList = [];
    productList.filters$.subscribe((filters) => {
      this.filtersList = filters;
    });
  }

  modelChange(selection: any) {
    if (selection.state) {
      this.productList.addFilter(selection.value, selection.group);
    } else this.productList.removeFilter(selection.value, selection.group);
  }

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
  showFilters = true;
  expandAll() {
    this.showFilters = !this.showFilters;
    const accordionGroups = this.filterAccordion?.groups;
    accordionGroups?.forEach((el: any) => {
      if (this.accordionGroupExpanded) {
        el._isOpen = false;
      } else {
        el._isOpen = true;
      }
    });
    this.accordionGroupExpanded = !this.accordionGroupExpanded;
  }

  clearProductFilters() {
    // this.productList.getNewProducts();
    this.clearFilterClick.emit(true);
  }
  clearFilter() {
    this.clearFilterClick.emit(true);
  }
}
