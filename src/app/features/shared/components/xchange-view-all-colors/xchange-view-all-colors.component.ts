import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";

@Component({
    selector: "xchange-view-all-colors",
    templateUrl: "./xchange-view-all-colors.component.html",
    styleUrls: ["./xchange-view-all-colors.component.scss"],
    standalone: false
})
export class XchangeViewAllColorsComponent implements OnInit {
  colorVarient: any = [];
  activeSlideId: any;
  imageBaseUrl =
    "https://s7d4.scene7.com/is/image/MohawkResidential/O_28074_717";
  searchkey: any = "";
  result: any;
  searchBy: any = 'Color #';
  searchByList = ['Color #', 'Color Name'];
  placeholder: any = 'Search by Color #';
  constructor(
    private modalService: BsModalService,
    public bsModalRef: BsModalRef
  ) { }
  @Output() productCode = new EventEmitter<string>();

  ngOnInit(): void {
    this.result = this.modalService.config.initialState;
    this.colorVarient = this.result?.data;
    this.activeSlideId = this.colorVarient.find((res: any) => this.result?.selectedProduct == res?.value?.code);
  }
  getProductImage(imageurl: any) {
    return imageurl + '?$xchangeThumb$'
  }
  onHideModal() {
    this.modalService.hide("viewAllColors");
  }
  changeSelection(code: any) {
    this.activeSlideId = code;
  }

  submit() {
    this.productCode.emit(this.activeSlideId);
    this.onHideModal()
  }
  onSearch(event: any) {
    const colorList: any[] = this.result?.data ? [...this.result.data] : [];
    this.searchkey = event?.target?.value || '';
    if (this.searchkey) {
      const searchValue = this.searchkey.toLowerCase();
      if (this.searchBy === 'Color #') {
        this.colorVarient = colorList.filter((data: any) => {
          return data?.key?.toLowerCase().includes(searchValue);
        });
      } else if (this.searchBy === 'Color Name') {
        this.colorVarient = colorList.filter((data: any) => {
          return data?.value?.name?.toLowerCase().includes(searchValue);
        });
      }
    } else {
      this.colorVarient = [...colorList];
    }
  }
  
  
  

  onSearchBy(event: any) {
    this.placeholder = event === 'Color #' ? 'Search by Color #' : 'Search by Color Name';
    this.searchkey = '';
    this.onSearch('');
  }
}
