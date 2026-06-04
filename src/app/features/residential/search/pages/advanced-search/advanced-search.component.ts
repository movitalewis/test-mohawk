import { Component, OnInit } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ProductListService } from "src/app/features/commercial/products/services/product-list.service";
import { XchangeSearchControlService } from "src/app/features/shared/form-control-components/xchange-search-control/xchange-search-control.service";
import { BreadcrumbItems } from "src/app/features/shared/interfaces";
import { ProductService } from "../../../products/pages/services/product.service";
import { StorageService } from "src/app/features/http-services/storage.service";
import { ApiService } from "src/app/features/http-services/api.service";
import { XchangeDataLayerService } from "src/app/features/http-services/data-layer.service";
@Component({
    selector: "app-advanced-search",
    templateUrl: "./advanced-search.component.html",
    styleUrls: ["./advanced-search.component.scss"],
    standalone: false
})
export class AdvancedSearchComponent implements OnInit {
  breadcrumbItems: BreadcrumbItems = [
    {
      name: "Home",
      path: "/residential",
      active: false,
    },
    {
      name: "Advanced Search",
      path: "/",
      active: true,
    },
  ];
  advancedSearchForm: any;
  showDialog: boolean = false;
  searchKey = "";
  searchCurrentPage = 0;
  searchResultFields = "FULL";
  searchResultsPageSize = 20;
  suggestionsFields = "DEFAULT";
  suggestionMaxSize = 10;
  filteredProductsAll: any = [];
  payload: any = {
    styleName: "",
    styleNumber: "",
    colorName: "",
    colorNumber: "",
    backing: "",
    partNumber: "",
  };
  spinnerLoading = false;
  dataList: any = [];
  componentInitialized = false;

  scrollerElement: any;
  currentComponent = "PLP";
  pagination: any;
  userInfo: any;
  salesTeamData: any;
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private xchangeSearchControlService: XchangeSearchControlService,
    public service: ProductListService,
    private activeRoute: ActivatedRoute,
    private productService: ProductService,
    private storageService: StorageService,
    private apiService: ApiService,
    private dataLayer: XchangeDataLayerService
  ) {}

  ngOnInit(): void {
    this.advancedSearchForm = this.fb.group({
      styleCode: ["", [Validators.minLength(1)]],
      styleName: ["", [Validators.minLength(1)]],
      colorCode: ["", [Validators.minLength(1)]],
      colorName: ["", [Validators.minLength(1)]],
      backing: ["", [Validators.minLength(1)]],
      part: ["", [Validators.minLength(1)]],
    });

    setTimeout(() => {
      this.scrollerElement =
        document.querySelectorAll(".custom-scrollbar");
      this.scrollerElement = document.getElementById("mainPage");

      this.scrollerElement.addEventListener("scroll", (ev: any) => {
        this.getNextProducts(ev);
        // this.componentInitialized = true;
      });
    }, 0);

    this.storageService.getItem("userInfo").subscribe((res: any) => {
      this.userInfo = res;
    });
  }
  public showSearchButton: boolean = true;
  enableSearch() {
    if (
      this.advancedSearchForm.value.styleCode != "" ||
      this.advancedSearchForm.value.styleName != "" ||
      this.advancedSearchForm.value.part != ""
    ) {
      this.showSearchButton = false;
    } else this.showSearchButton = true;
  }
  submit() {
    if (
      this.advancedSearchForm.value.styleCode == "" &&
      this.advancedSearchForm.value.styleName == "" &&
      this.advancedSearchForm.value.part == ""
    ) {
      this.showDialog = true;
    } else {
      this.payload.styleNumber = this.advancedSearchForm.value.styleCode;
      this.payload.styleName = this.advancedSearchForm.value.styleName;
      this.payload.colorName = this.advancedSearchForm.value.colorName;
      this.payload.colorNumber = this.advancedSearchForm.value.colorCode;
      this.payload.backing = this.advancedSearchForm.value.backing;
      this.payload.partNumber = this.advancedSearchForm.value.part;
      this.dataLayer.search("", "", {
        style_code: this.payload.styleNumber || "",
        style_name: this.payload.styleName || "",
        color_code: this.payload.colorNumber || "",
        color_name: this.payload.colorName || "",
        backing_number: this.payload.backing || "",
        part_number: this.payload.partNumber || "",
      });
      if (this.advancedSearchForm.value.styleCode != "") {
        this.searchKey = this.advancedSearchForm.value.styleCode;
      } else if (this.advancedSearchForm.value.styleName != "") {
        this.searchKey = this.advancedSearchForm.value.styleName;
      } else if (this.advancedSearchForm.value.part != "") {
        this.searchKey = this.advancedSearchForm.value.part;
      }
      this.showDialog = false;
      this.searchProducts();
    }
  }
  searchProducts() {
    this.filteredProductsAll = [];
    this.spinnerLoading = true;
    this.xchangeSearchControlService
      .advancedSearchResults(this.payload)
      .subscribe((res: any) => {
        this.spinnerLoading = false;
        if (res?.body?.productDetails) {
          this.filteredProductsAll = res?.body?.productDetails;
        }
        const styleCode = this.advancedSearchForm.value.styleCode.trim();
        const styleName = this.advancedSearchForm.value.styleName;
        const colorCode = this.advancedSearchForm.value.colorCode.trim();
        const colorName = this.advancedSearchForm.value.colorName;
        const backing = this.advancedSearchForm.value.backing;
        const part = this.advancedSearchForm.value.part;
        let serchObj = {
          styleCode: styleCode,
          styleName: styleName,
          colorCode: colorCode,
          colorName: colorCode,
          backing: backing,
          part: part,
        };
        this.compareSearchText(serchObj, "residential");
        const filteredProducts = this.filteredProductsAll.filter(
          (product: any) => {
            const styleMatch =
              !styleCode ||
              product?.sellingStyleId
                .toLowerCase()
                .includes(styleCode.toLowerCase());
            const nameMatch =
              !styleName ||
              product?.name.toLowerCase().includes(styleName.toLowerCase());
            const colorMatch =
              !colorCode ||
              product?.colorNumber.includes(colorCode.toUpperCase());
            const backingMatch =
              !backing ||
              product?.sellingBackingId.includes(backing.toUpperCase());
            const partMatch =
              !part || product?.erpProductId.includes(part.toUpperCase());

            return (
              styleMatch && nameMatch && colorMatch && backingMatch && partMatch
            );
          }
        );
        this.componentInitialized = filteredProducts.length === 0;
        this.redirectUrl(
          filteredProducts,
          styleCode,
          styleName,
          colorCode,
          colorName,
          backing,
          part
        );
      });
  }

  searchResultQuery: string = "";
  currentPage: number = 0;
  pageSize: number = 12;

  redirectUrl(
    filteredProducts: any,
    styleCode: any,
    styleName: any,
    colorCode: any,
    colorName: any,
    backing: any,
    part: any
  ) {
    if (filteredProducts.length == 1) {
      this.componentInitialized = false;
      let navigatePLPUrl = `/products/details/${filteredProducts[0].erpProductId}`;
      if (this.router.url?.split("?")[0].includes("residential")) {
        navigatePLPUrl = "/residential" + navigatePLPUrl;
      } else if (this.router.url?.split("?")[0].includes("commercial")) {
        navigatePLPUrl = "/commercial" + navigatePLPUrl;
      }
      this.searchKey = "";
      this.router.navigateByUrl(navigatePLPUrl);
    } else {
      this.searchResultQuery =
        styleCode || styleName || colorCode || colorName || backing || part;
      this.currentPage = 0;
      this.service
        .getSearchProductsForAdvanceSearch(
          this.searchResultQuery,
          this.currentPage,
          this.pageSize
        )
        .subscribe({
          next: (product: any) => {
            if (product?.products && product?.products.length == 1) {
              let navigatePLPUrl = `/products/details/${product?.products[0].code}`;
              if (this.router.url?.split("?")[0].includes("residential")) {
                navigatePLPUrl = "/residential" + navigatePLPUrl;
              } else if (
                this.router.url?.split("?")[0].includes("commercial")
              ) {
                navigatePLPUrl = "/commercial" + navigatePLPUrl;
              }
              this.router.navigateByUrl(navigatePLPUrl);
            } else {
              this.dataList = product?.products || [];
              this.pagination = product?.pagination;
              this.componentInitialized = true;
            }
          },
          error: (err: any) => {
            console.error("Error fetching products:", err);
            this.componentInitialized = true;
          },
        });
    }
  }

  getNextProducts(ev: any) {
    if (this.pagination?.currentPage + 1 < this.pagination?.totalPages) {
      if (
        ev.target.scrollHeight - 11 <
        ev.target.scrollTop + ev.target.offsetHeight
      ) {
        this.currentPage = this.pagination.currentPage + 1;
        this.pageSize = this.pagination.pageSize;
        this.service
          .getSearchProductsForAdvanceSearch(
            this.searchResultQuery,
            this.currentPage,
            this.pageSize
          )
          .subscribe({
            next: (product: any) => {
              this.dataList = [...this.dataList, ...(product?.products || [])];
              this.pagination = product?.pagination;
            },
            error: (err: any) => {
              console.error("Error fetching products:", err);
            },
          });
      }
    } else {
      console.log("getNextProducts Else case====>");
    }
  }

  compareSearchText(searchObj: any, module: any) {
    let sub = this.storageService
      .getItem("advanceSearchObject")
      .subscribe((obj: any) => {
        // if (obj?.searchText == searchText && obj?.module == module) {
        if (JSON.stringify(obj?.query) === JSON.stringify(searchObj)) {
          this.sendEmail(
            this.userInfo?.uid,
            this.userInfo?.orgUnit?.uid,
            searchObj
          );
          this.storageService.setItem("advanceSearchObject", obj);
        } else {
          const obj = { query: searchObj, module: module };
          this.storageService.setItem("advanceSearchObject", obj);
        }
        sub.unsubscribe();
      });
  }
  sendEmail(userId: any, accNumber: any, searchObj: any) {
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
                  max-width: 90%;
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
                margin: 10px auto;
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
                  margin: 3px auto;
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
                      ${
                        searchObj.styleCode
                          ? `<tr><td>Stye Code: </td> <td><b>${searchObj.styleCode}</b></td></tr>`
                          : ""
                      }
                      ${
                        searchObj.styleName
                          ? `<tr><td>Stye Name: </td> <td><b>${searchObj.styleName}</b></td></tr>`
                          : ""
                      }
                      ${
                        searchObj.colorCode
                          ? `<tr><td>Color Code: </td> <td><b>${searchObj.colorCode}</b></td></tr>`
                          : ""
                      }
                      ${
                        searchObj.colorName
                          ? `<tr><td>Color Name: </td> <td><b>${searchObj.colorName}</b></td></tr>`
                          : ""
                      }
                      ${
                        searchObj.backing
                          ? `<tr><td>Backing: </td> <td><b>${searchObj.backing}</b></td></tr>`
                          : ""
                      }
                      ${
                        searchObj.part
                          ? `<tr><td>Part: </td> <td><b>${searchObj.part}</b></td></tr>`
                          : ""
                      }
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
