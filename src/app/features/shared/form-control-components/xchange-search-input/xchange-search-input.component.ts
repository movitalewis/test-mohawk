import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { set } from 'idb-keyval';

@Component({
    selector: 'xchange-search-input',
    templateUrl: './xchange-search-input.component.html',
    styleUrls: ['./xchange-search-input.component.scss'],
    standalone: false
})
export class XchangeSearchInputComponent {
  @ViewChild("searchBoxInput") searchBoxInput!: ElementRef<any>;
  @ViewChild("suggestionBox") suggestionBox!: ElementRef<any>;

  @Input("disabled") disabled: boolean = false;
  @Input("placeholder") placeholder: string = "";
  @Input("value") value: string = "";
  @Input("isSuggestionBoxOpen") isSuggestionBoxOpen: Boolean = true;
  @Output() change: EventEmitter<string> = new EventEmitter<string>();
  @Output() input: EventEmitter<string> = new EventEmitter<string>();
  @Output() blur: EventEmitter<string> = new EventEmitter<string>();
  @Output() keypress: EventEmitter<string> = new EventEmitter<string>();
  @Output() keydown: EventEmitter<string> = new EventEmitter<string>();
  @Output() keyup: EventEmitter<string> = new EventEmitter<string>();
  @Output() sendValue: EventEmitter<string> = new EventEmitter<string>();
  @Output() focus: EventEmitter<any> = new EventEmitter<any>();
  @Output() suggestionClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() clearBtnClick: EventEmitter<any> = new EventEmitter<any>();


  @Input() searchByIcon = false;
  @Input() searchFlag: boolean = false;
  @Input() searchKey: any = "";
  @Input() searchResults: any = [];
  @Input() showSpinner: boolean = false;
  @Input() bindLabels: any = [];
  @Input() bindKey: any = '';
  @Input() allowPattern: any = '';


  searchDefaultValue: string = "";
  clearFlag: boolean = false;
  showClearButton: boolean = false;
  showNoResult = false;
  
@HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const clickedInsideInput = this.searchBoxInput?.nativeElement.contains(event.target);
    const clickedInsideSuggestionBox = this.suggestionBox?.nativeElement.contains(event.target);
    if(!clickedInsideInput && !clickedInsideSuggestionBox) {
      this.isSuggestionBoxOpen = false;
    } else if(clickedInsideInput) {
      this.isSuggestionBoxOpen = true;
    }

  }

  onSuggestionClick(suggestion: any) {
    this.suggestionClick.emit(suggestion);
    this.searchKey = suggestion[this.bindKey];
    this.isSuggestionBoxOpen = false;
  }

  onInputEvent(event: Event) {
    this.searchDefaultValue =
      (event.target as HTMLInputElement).value || "";
      this.enableShowNoResult();
    this.input.emit(this.searchDefaultValue);
    // this.showClearButton = !!this.searchDefaultValue && this.searchDefaultValue.length > 0;

  }

  onKeypress(event: any) {
    const regex = new RegExp(this.allowPattern);
    if(this.allowPattern.length > 0 && !regex.test(event.key)){
      event.preventDefault();
    }else{
    this.showSpinner = true;
      if (!this.searchByIcon) {
      this.searchDefaultValue = (event.target as HTMLInputElement).value || "";
      this.keypress.emit(this.searchDefaultValue);
      // this.showClearButton = !!this.searchDefaultValue && this.searchDefaultValue.length > 0;
    }
    }
  }

  onKeydown(event: Event) {
      this.searchDefaultValue = (event.target as HTMLInputElement).value || "";
      if (!this.searchByIcon) {
        this.keypress.emit(this.searchDefaultValue);
        // this.showClearButton = !!this.searchDefaultValue && this.searchDefaultValue.length > 0;
      }
  }
  onKeyup(event: any) {
     const regex = new RegExp(this.allowPattern);
    if(this.allowPattern.length > 0 && !regex.test(event.key)){
      return;
    }
      if (!this.searchByIcon) {
        this.searchDefaultValue =
          (event.target as HTMLInputElement).value || "";
    this.enableShowNoResult();

        this.keyup.emit(this.searchDefaultValue);
        // this.showClearButton = !!this.searchDefaultValue && this.searchDefaultValue.length > 0;
    }
  }

  onBlurEvent(event: Event) {
    if (!this.searchByIcon) {
      this.searchDefaultValue = (event.target as HTMLInputElement).value || "";
      this.blur.emit(this.searchDefaultValue);
    }
  }

  onEnter() {
    this.enableShowNoResult();
    this.sendValue.emit(this.searchKey);

  }

  onFocus() {
    this.focus.emit("");
    this.clearFlag = false;
  }

  onSearch() {
    this.focus.emit("");
    this.enableShowNoResult();
    this.sendValue.emit(this.searchKey);
    
    this.clearFlag = true;
  }
   onClearInput() {
    this.clearBtnClick.emit("");
    this.searchKey = "";
    this.input.emit(this.searchDefaultValue);
    this.searchDefaultValue = "";
    this.searchBoxInput.nativeElement.value = "";
    this.input.emit(this.searchDefaultValue);
    this.enableShowNoResult();
    this.sendValue.emit("");
    this.focus.emit("");
    this.clearFlag = false;
    // this.showClearButton = false;
  }

  enableShowNoResult(){
    this.showNoResult = false;
    setTimeout(() => {
      this.showNoResult = true;
    }, 1000);
  }
}
