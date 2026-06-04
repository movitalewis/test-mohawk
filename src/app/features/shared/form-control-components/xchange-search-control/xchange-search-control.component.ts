import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { debounceTime, map, mergeMap, Subject, take } from "rxjs";
import { XchangeSearchControlService } from "./xchange-search-control.service";
import { ProductService } from "src/app/features/residential/products/pages/services/product.service";
import { StorageService } from "src/app/features/http-services/storage.service";
import { ApiService } from "src/app/features/http-services/api.service";
import { XchangeDataLayerService } from "src/app/features/http-services/data-layer.service";
declare var window: any;

@Component({
    selector: "xchange-search-control",
    templateUrl: "./xchange-search-control.component.html",
    styleUrls: ["./xchange-search-control.component.scss"],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            multi: true,
            useExisting: forwardRef(() => XchangeSearchControlComponent),
        },
    ],
    standalone: false
})
export class XchangeSearchControlComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild("searchBoxInput") searchBoxInput!: ElementRef<any>;
  @Input("disabled") disabled: boolean = false;
  @Input("placeholder") placeholder: string = "";
  @Input("value") value: string = "";
  @Input("isGlobalSearchEnabled") isGlobalSearchEnabled: Boolean = true;
  @Output() change: EventEmitter<string> = new EventEmitter<string>();
  @Output() input: EventEmitter<string> = new EventEmitter<string>();
  @Output() blur: EventEmitter<string> = new EventEmitter<string>();
  @Output() keypress: EventEmitter<string> = new EventEmitter<string>();
  @Output() keydown: EventEmitter<string> = new EventEmitter<string>();
  @Output() keyup: EventEmitter<string> = new EventEmitter<string>();
  @Output() sendValue: EventEmitter<string> = new EventEmitter<string>();
  @Output() focus: EventEmitter<any> = new EventEmitter<any>();
  @Input() searchByIcon = false;
  @Input() searchFlag: boolean = false;
  clearFlag: boolean = false;
  searchDefaultValue: string = "";
  searchCurrentPage = 0;
  searchResultFields = "GSVIEW";
  searchResultsPageSize = 20;
  suggestionsFields = "DEFAULT";
  suggestionMaxSize = 10;
  filteredProducts: any = [];
  @Input() searchKey: any = "";
  subject = new Subject();
  showSpinner = false;
  showDropdown = false;
  userInfo: any;
  salesTeamData: any;
  constructor(
    private xchangeSearchControlService: XchangeSearchControlService,
    private router: Router,
    private productService: ProductService,
    private storageService: StorageService,
    private apiService: ApiService,
    private dataLayer: XchangeDataLayerService,
    private zone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  onChange = (_: any) => {};
  onTouch = (_: any) => {};

  writeValue(value: string): void {
    this.searchDefaultValue = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }
  postModificationFlag: boolean = false;
  orderNumber: any;
  private onDocumentClick = (e: any): void => {
    if (document.getElementById("product-dropDown")?.contains(e.target)) return;
    if (this.filteredProducts.length) this.filteredProducts = [];
  };

  ngOnInit(): void {
    if (this.value) this.searchDefaultValue = this.value;
    if (this.searchDefaultValue != null) {
      this.searchKey = this.searchDefaultValue;
    }
    window.addEventListener("click", this.onDocumentClick);

    this.subject.pipe(debounceTime(500)).subscribe((searchText) => {
      if (searchText) this.getListOfProducts();
    });
    this.storageService.getItem("userInfo").pipe(take(1)).subscribe((res: any) => {
      this.userInfo = res;
    });
  }

  ngOnDestroy(): void {
    window.removeEventListener("click", this.onDocumentClick);
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (this.disabled && this.searchKey.length > 0) {
      this.searchKey = "";
    }
  }

  onClearInput() {
    this.searchKey = "";
    this.searchDefaultValue = "";
    this.searchBoxInput.nativeElement.value = "";
    this.input.emit(this.searchDefaultValue);
    this.sendValue.emit("");
    this.filteredProducts = [];
    this.focus.emit("");
    this.clearFlag = false;
  }
  onchange(event: Event) {
    if (!this.searchByIcon) {
      this.sendValue.emit(this.searchKey);
    }
  }

  onInputEvent(event: Event) {
    if (this.isGlobalSearchEnabled) {
      if (!this.searchByIcon) {
        this.searchDefaultValue =
          (event.target as HTMLInputElement).value || "";
        this.onChange(this.searchBoxInput);
        this.input.emit(this.searchDefaultValue);
        this.filteredProducts = [];
        if (this.searchDefaultValue.length >= 1) {
          if (this.isGlobalSearchEnabled) {
            this.subject.next(this.searchDefaultValue);
          }
        }
      }
    }
  }

  getListOfProducts() {
    this.showSpinner = true;
    this.showDropdown = true;
    this.xchangeSearchControlService
      .searchResults(
        this.searchCurrentPage,
        this.searchResultFields,
        this.searchResultsPageSize,
        this.searchKey
      )
      .subscribe(
        (res: any) => {
          this.zone.run(() => {
            this.showSpinner = false;
            if (res.products == undefined) {
              this.filteredProducts = [];
            } else this.filteredProducts = res.products;
            this.cdr.detectChanges();
          })
        },
        (err) => {
          this.showSpinner = false;
        }
      );
  }
  onSuggestionClick(productId: any) {
    this.dataLayer.search(
      `${
        this.filteredProducts?.filter(
          (product: any) => product?.firstVariantCode === productId
        )[0]?.styleName || ""
      } - ${
        this.filteredProducts
          ?.filter((product: any) => product?.firstVariantCode === productId)[0]
          ?.firstVariantCode?.split(".")[1] || ""
      }` || "",
      this.searchKey || ""
    );
    if (this.router.url.split("/")[2] == "post-modification") {
      this.postModificationFlag = true;
    } else {
      this.postModificationFlag = false;
    }
    if (this.postModificationFlag) {
      const url = this.router.url.split("?")[0];
      this.orderNumber = url.split("/")[4];
    }
    this.onClearInput();
    let navigateUrl = "";
    if (productId.substring(0, 1) === "R") {
      if (this.postModificationFlag) {
        navigateUrl =
          "/residential/post-modification/products/details/" +
          this.orderNumber +
          "/" +
          productId;
      } else {
        navigateUrl = "/residential/products/details/" + productId;
      }
    }
    if (productId.substring(0, 1) === "C") {
      if (this.postModificationFlag) {
        navigateUrl =
          "/commercial/post-modification/products/details/" +
          this.orderNumber +
          "/" +
          productId;
      } else {
        navigateUrl = "/commercial/products/details/" + productId;
      }
    }
    // let compInstance = document.getElementsByTagName("app-pdp");
    // if (compInstance.length > 0) {
    //   let instance = window["ng"].getComponent(compInstance[0]);
    //   if (instance) {
    //     instance.setSelectedProductItem({ code: productId });
    //   }
    // }
    localStorage.setItem("fromPlpFlag", "true");
    localStorage.setItem("pdpSizeNotSelected", "true");
    let compInstance = document.getElementsByTagName("app-pdp");
    if (compInstance.length > 0) {
      this.router.navigateByUrl("/", { skipLocationChange: true }).then(() => {
        this.router.navigateByUrl(navigateUrl);
        this.showDropdown = false;
      });
    } else {
      this.router.navigateByUrl(navigateUrl);
      this.filteredProducts = [];
    }
  }

  onBlurEvent(event: Event) {
    if (!this.searchByIcon) {
      this.searchDefaultValue = (event.target as HTMLInputElement).value || "";
      this.blur.emit(this.searchDefaultValue);
    }
  }

  onKeypress(event: Event) {
    if (!this.searchByIcon) {
      this.searchDefaultValue = (event.target as HTMLInputElement).value || "";
      this.keypress.emit(this.searchDefaultValue);
    }
  }

  onKeydown(event: Event) {
    if (this.isGlobalSearchEnabled) {
      this.searchDefaultValue = (event.target as HTMLInputElement).value || "";
      if (!this.searchByIcon) {
        this.keypress.emit(this.searchDefaultValue);
      }
    }
  }

  onKeyup(event: Event) {
    if (this.isGlobalSearchEnabled) {
      if (!this.searchByIcon) {
        this.searchDefaultValue =
          (event.target as HTMLInputElement).value || "";
        this.keyup.emit(this.searchDefaultValue);
      }
    }
  }
  onEnter() {
    // if (this.filteredProducts.length > 0) {
    //   let urlSegments = this.filteredProducts
    //     .find((product: any) => !!product.categoryName)
    //     .categoryName?.substring(
    //       1,
    //       this.filteredProducts.find((product: any) => !!product.categoryName)
    //         .categoryName.length - 1
    //     );
    //   let arr: Array<string> = urlSegments.split(',');
    //   let navigatePLPUrl = '';
    //   if (arr[2].toLowerCase().indexOf('wood') != -1) {
    //     navigatePLPUrl = '/products?name=Wood&page=View%20All%20Wood&type=wood';
    //   }
    //   if (arr[2].toLowerCase().indexOf('cushion') != -1) {
    //     navigatePLPUrl =
    //       '/products?name=Cushion&page=View%20All%20Cushion&type=cushionproduct';
    //   }
    //   if (arr[2].toLowerCase().indexOf('carpet') != -1) {
    //     navigatePLPUrl =
    //       '/products?name=Carpet&page=View%20All%20Carpet&type=carpetproduct';
    //   }
    //   if (arr[2].toLowerCase().indexOf('tile') != -1) {
    //     navigatePLPUrl = '/products?name=Tile&page=View%20All%20Tile&type=tile';
    //   }
    //   if (
    //     arr[2].toLowerCase().indexOf('resilient') != -1 ||
    //     arr[2].toLowerCase().indexOf('vinyl') != -1
    //   ) {
    //     navigatePLPUrl =
    //       '/products?name=Resilient%2FVinyl&page=View%20All%20Resilient%2FVinyl&type=resilient_vinyl';
    //   }
    //   if (arr[2].toLowerCase().indexOf('merchandising') != -1) {
    //     navigatePLPUrl =
    //       '/products?name=Merchandising&page=View%20All%20Merchandising&type=merchandising';
    //   }
    //   if (
    //     arr[2].toLowerCase().indexOf('accessories') != -1 ||
    //     arr[2].toLowerCase().indexOf('installation') != -1
    //   ) {
    //     navigatePLPUrl =
    //       '/products?name=Installation%20Accessories&page=View%20All%20Installation%20Accessories&type=accessories';
    //   }
    //   if (urlSegments.toLowerCase().indexOf('residential') != -1) {
    //     navigatePLPUrl = '/residential' + navigatePLPUrl;
    //   }
    //   if (urlSegments.toLowerCase().indexOf('commercial') != -1) {
    //     navigatePLPUrl = '/commercial' + navigatePLPUrl;
    //   }
    //   this.router.navigateByUrl(navigatePLPUrl);
    //   this.filteredProducts = [];
    // }
    if (this.searchKey.length > 0) {
      this.dataLayer.search(this.searchKey || "", this.searchKey || "");
      if (this.isGlobalSearchEnabled) {
        this.navigateToPlp();
      } else if (this.searchKey.length > 2) {
        this.sendValue.emit(this.searchKey);
      }
    }
  }
  onSearch() {
    const searchValue = this.searchBoxInput?.nativeElement?.value || this.searchKey;
    if (searchValue) {
      this.searchKey = searchValue;
    }
    this.focus.emit("");
    this.sendValue.emit(this.searchKey);
    if (this.searchKey.length > 2) {
      if (this.isGlobalSearchEnabled) {
        this.dataLayer.search(this.searchKey || "", this.searchKey || "");
        this.navigateToPlp();
      }
    }
    this.clearFlag = true;
    // setImmediate(() => { this.clearFlag = false }, 5000);
  }
  navigateToPlp() {
    // if (this.filteredProducts.length == 0) {
    //   let navigatePLPUrl = `/advance-search`;
    //   if (this.router.url?.split("?")[0].includes("residential")) {
    //     navigatePLPUrl = "/residential" + navigatePLPUrl;
    //   } else if (this.router.url?.split("?")[0].includes("commercial")) {
    //     navigatePLPUrl = "/commercial" + navigatePLPUrl;
    //   }
    //   // const navigatePLPUrl = `/products?search=${this.searchKey}`;
    //   this.filteredProducts = [];
    //   this.searchKey = "";
    //   this.router.navigateByUrl(navigatePLPUrl);
    //   return;
    // }
    if (this.searchKey.length > 0) {
      let navigatePLPUrl = `/products?search=${this.searchKey}`;
      if (this.router.url?.split("?")[0].includes("residential")) {
        navigatePLPUrl = "/residential" + navigatePLPUrl;
        this.compareSearchText(this.searchKey, "residential");
      } else if (this.router.url?.split("?")[0].includes("commercial")) {
        navigatePLPUrl = "/commercial" + navigatePLPUrl;
        this.compareSearchText(this.searchKey, "commercial");
      }
      // const navigatePLPUrl = `/products?search=${this.searchKey}`;
      this.filteredProducts = [];
      this.searchKey = "";
      this.router.navigateByUrl(navigatePLPUrl);
    }
  }
  onFocus() {
    this.focus.emit("");
    this.clearFlag = false;
  }
  compareSearchText(searchText: any, module: any) {
    let sub = this.storageService
      .getItem("searchObject")
      .subscribe((obj: any) => {
        if (obj?.searchText == searchText && obj?.module == module) {
          this.sendEmail(
            this.userInfo?.uid,
            this.userInfo?.orgUnit?.uid,
            searchText
          );
          this.storageService.setItem("searchObject", obj);
        } else {
          const obj = { searchText: searchText, module: module };
          this.storageService.setItem("searchObject", obj);
        }
        sub.unsubscribe();
      });
  }
  sendEmail(userId: any, accNumber: any, searchText: any) {
    this.apiService
      .getSalesTeam(this.userInfo?.orgUnit?.uid)
      .subscribe((data: any) => {
        this.salesTeamData = data?.custSalesPersonList;
        let emailIds = [
          "pad_narayanan@mohawkind.com",
          "savitha_nuguri@mohawkind.com",
          "phanindra_polavarapu@mohawkind.com",
          "sujith_samala@mohawkind.com",
        ];
        let recipients: any = [];
        emailIds.map((email: any) => {
          recipients.push({
            email: email.trim(),
            customer_ids: {
              email_id: email.trim(),
            },
            language: "en",
          });
        });

        let payload = {
          integration_id: "65987c6701781a56cf28625f",
          email_content: {
            html: `<html>
            <head>
            <style>
              body{
                width:100%;
                max-width: 100%;
              }
              *, p, b, span{
                font-size: 12px !important;
                font-family: "Proxima Nova", sans-serif !important;
              }
              .row{
                  flex-wrap: wrap;
                  margin: auto;
                  font-size:12px !impoertant;
                  width:90%;
              }

              .text-center {
                  text-align: center !important;
              }
              .text-start {
                text-align: start !important;
              }
              .text-end {
                  text-align: end !important;
              }
              .col-12 {
                  flex: 0 0 auto;
                  width: 100%;
              }
              .col-6 {
                  flex: 0 0 auto;
                  width: 50%;
              }
              p {
                  font-size: 12px;
                  margin:0px 0px 5px 0px;
              }
              .div-1{
              margin-bottom: 15px;
              }
              a {
                  color: #ce0e2d;
                  text-decoration: underline;
                  font-size: 12px;
              }
              .sales-team-container {
                  background-color: #F8F8F8;
              }
              .heading {
                padding: 15px;
              }
              .justify-content-center{
                display: flex;
                justify-content: center;
              }
              .not-available{
                color: #b1b1b1;
              }
              .session-details{
                display:block;
                text-align:center;
                margin: 10px 0px;
              }
              table{
                background: #f8f8f8;
              }
              td{
                padding: 5ppx 10px;
              }
              .sales-team-list{            
                width: 100%;
                display: flex;
                flex-wrap: wrap;
                justify-content: normal;
                margin: auto;
              }
              .team-member-container{
                width:50%;
                max-width:50%;
                margin: 3px auto;
              }
              @media only screen and (max-width: 420px) {
               .sales-team-list{            
                  width: 100%;
                  display:block;
                  justify-content: normal;
                  margin: auto;
                }
                .team-member-container{
                  display:block;
                  min-width:100%;
                  max-width: 100%;
                  margin: 10px auto;
                }
              }
            </style>
            </head>
            <body style="background-color:#fff; background:#fff;">
            <div class="row row-container">
              <!-- <div>
                <img src="/assets/images/logo-residential-dark.png" >
              </div> -->
              <div class="session-details"><b class="text-center"> Session Details</b></div>
              <div class="justify-content-center div-1">
                <div class="text-start">
                <table>
                  <tr>
                    <td>UID: </td>
                    <td><a href="mailto:${userId}">${userId}</a></td>
                  </tr>
                  <tr>
                    <td>Account: </td>
                    <td><b>${accNumber}</b></td>
                  </tr>
                  <tr>
                    <td>Search Query: </td>
                    <td><b>${searchText}</b></td>
                  </tr>
                </table>
                </div>
              </div>
              <div class="container sales-team-container">
                <div class="row">
                    <p class="text-center heading">If you know your Mohawk Sales Rep, contact them below:</p>
                    <div class="sales-team-list text-center">
                    ${this.salesTeamData
                      .map(
                        (item: any) => `
                        <div class="team-member-container text-center">
                              <b>${item?.name}</b>
                              <p >
                                Email: <span class="color-red"><a href="${
                                  item?.email
                                }">${item?.email}</a></span>
                              </p>
                              <p>
                                Mobile:
                                ${
                                  item?.mobilePhone
                                    ? `<span class="color-red"><a href="tel:${item?.mobilePhone}">${item?.mobilePhone}</a></span>`
                                    : `<span class="color-red not-available">Not Available</span>`
                                }                                
                              </p>                              
                          </div>
                      `
                      )
                      .join("")}                      
                    </div>
                  </div>
              </div>
            </div>
            </body>
          </html>`,
            subject: "Duplicate Product Search",
            sender_address: "Xchange_Support@mohawkind.com",
            sender_name: "XChange Support",
          },
          campaign_name: "Duplicate Product Search",
          recipient: recipients,
        };
        this.productService.shareViaEmail(payload).subscribe(
          (res: any) => {
            console.log(res);
          },
          (err: any) => {
            console.log(err);
          }
        );
      });
  }
}
