import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'xchange-home-search',
    templateUrl: './xchange-home-search.component.html',
    styleUrls: ['./xchange-home-search.component.scss'],
    standalone: false
})
export class XchangeHomeSearchComponent implements OnInit {
  @Input() searchBy: boolean = false;
  @Input('label') label: string = '';
  @Output() selectedText: EventEmitter<any> = new EventEmitter<any>();
  @Input() type: any;
  @Input() searchFlag: boolean = false;
  SearchBy = [
    { value: 'order', label: 'Order' },
    { value: 'invoice', label: 'Invoice' },
    { value: 'claims', label: 'Claims' }
  ];
  selectedSearchBy: string = '';
  constructor() { }

  isSearchDisabled = false;
  ngOnInit(): void {
    if(this.searchBy){
      this.isSearchDisabled= true;
    }
  }
  searchValue: string= '';

  @Output() searchTextChanged: EventEmitter<any> = new EventEmitter<any>();

  onSearchTextChanged(value:any){
    // orderSearchValue = this.orderSearchValue
    this.searchTextChanged.emit({searchText:value , type : this.type});
  }
  getPlaceholder(): string {
    switch (this.selectedSearchBy) {
      case 'order':
        return 'Enter Order#';
      case 'invoice':
        return 'Enter Invoice#';
      case 'claims':
        return 'Enter Claim#';
      default:
        return 'Search...';
    }
  }
  onSearchByChange(selectedValue: string): void {
    this.selectedSearchBy = selectedValue; 
    this.isSearchDisabled = !this.selectedSearchBy;
    this.selectedText.emit(this.selectedSearchBy);
  }
  getDynamicPlaceholder(): string {
    if (this.searchBy && !this.selectedSearchBy) {
      return 'Select Search By';
    }
    let basePlaceholder = this.type === 'commercialInvoices' || this.type === 'residentialInvoices'
      ? 'Invoice#'
      : this.type === 'commercialNewOrder' || this.type === 'residentialNewOrder'
      ? 'Style Name or Style #'
      : 'Non-Sample Order#';
    if (this.selectedSearchBy === 'order') {
      basePlaceholder = 'Enter Order#';
    } else if (this.selectedSearchBy === 'invoice') {
      basePlaceholder = 'Enter Invoice#';
    } else if (this.selectedSearchBy === 'claims') {
      basePlaceholder = 'Enter Claim#';
    }
  
    return basePlaceholder;
  }
  
}

