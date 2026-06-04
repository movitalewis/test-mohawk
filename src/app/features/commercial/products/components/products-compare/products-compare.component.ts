import { Location, formatDate } from "@angular/common";
import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  OnDestroy,
  ViewChild,
  ViewChildren,
  QueryList,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Columns, Config, DefaultConfig } from "ngx-easy-table";
import { Subject, takeUntil } from "rxjs";
import { StorageService } from "src/app/features/http-services/storage.service";
import { BreadcrumbItems } from "src/app/features/shared/interfaces";
import { ProductService } from "../../pages/services/product.service";
import { CompareProductService } from "../services/compare-products.service";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { ProgressModalComponent } from "src/app/features/shared/components/progress-modal/progress-modal.component";
import { MESSAGE_CONSTANTS } from "src/app/features/shared/constants/MESSAGE-CONSTANTS";

@Component({
    selector: "app-products-compare",
    templateUrl: "./products-compare.component.html",
    styleUrls: ["./products-compare.component.scss"],
    standalone: false
})
export class ProductsCompareComponent implements OnInit, OnDestroy {
  @ViewChildren("hidden") hidden:
    | QueryList<ProductsCompareComponent>
    | undefined;
  breadcrumbItems: BreadcrumbItems = [
    {
      name: "Home",
      path: "/commercial",
      active: false,
    },
    {
      name: "Search Result",
      path: " ",
      active: false,
    },
    {
      name: "Compare",
      path: "/",
      active: true,
    },
  ];

  compareProducts: any;
  selectedProducts: any;
  public configuration!: Config;
  public prodDisColumns!: Columns[];
  public specColumns!: Columns[];
  public designColumns!: Columns[];
  public susColumns!: Columns[];
  public warrantColumns!: Columns[];
  spinnerLoading = false;
  stepTwoFlag: boolean = false;
    modalRef?: BsModalRef;
  constructor(
    private cpService: CompareProductService,
    private storageService: StorageService,
    private _location: Location,
    private activateRoute: ActivatedRoute,
    private productService: ProductService,
    private elRef: ElementRef,
    private router: Router,
    private modalService: BsModalService
  ) {}
  destroySubject: Subject<void> = new Subject();

  @ViewChild("scrollToTop", { read: ElementRef }) scrollToTop!: any;
  scrollPageToTop() {
    // this.scrollToTop.nativeElement.scrollIntoView({
    //   behavior: "smooth",
    //   block: "start",
    //   inline: "nearest",
    // });
    let top = document.getElementById("top");
    if (top !== null) {
      top.scrollIntoView();
      top = null;
    }
  }

  ngOnInit(): void {
    this.scrollableList = Array.from(
      (this.elRef.nativeElement as HTMLElement).getElementsByClassName(
        "scrollable"
      )
    );
  this.progressShow('compare')
    this.configuration = { ...DefaultConfig };
    this.configuration.checkboxes = false;
    this.configuration.tableLayout.striped = true;
    this.configuration.tableLayout.hover = false;
    this.configuration.paginationRangeEnabled = false;
    this.configuration.paginationEnabled = false;
    this.prodDisColumns = [
      { key: "masterStyleName", title: "Style Name" },
      { key: "numberOfColors", title: "Numer of Colors" },
      { key: "brandName", title: "Brand Name" },
    ];
    this.specColumns = [
      { key: "masterStyleName", title: "Style" },
      { key: "sellingColorName", title: "Color" },
      { key: "brandName", title: "Brand" },
      { key: "fiberCategorySet", title: "Fiber Category" },
      { key: "fiberType", title: "Fiber Brand" },
      { key: "subProductType", title: "Product Type" },
    ];
    this.designColumns = [
      { key: "construction", title: "Construction" },
      { key: "patternType", title: "Pattern Repeat" },
      { key: "gauge", title: "Guage" },
      { key: "weightPerPallet", title: "Certified Pile Weight" },
      { key: "totalWeight", title: "Total Weight" },
      { key: "densitySet", title: "Density" },
      { key: "dyeMethodDesc", title: "Dye method" },
      { key: "stichesPerInch", title: "Yarn Twists Per Inch" },
      { key: "primaryBacking", title: "Primary Backing" },
      { key: "secondaryBacking", title: "Secondary Backing" },
    ];

    this.susColumns = [
      { key: "fhaInfoSet", title: "FHA Information" },
      { key: "durability", title: "Durability Rating" },
      { key: "indoorAirQuality", title: "Indoor Air Quality" },
      { key: "flamability", title: "Flammability" },
    ];

    this.warrantColumns = [{ key: "installMethod", title: "Installation" }];

    this.storageService
      .getItem("selectedProducts")
      .pipe(takeUntil(this.destroySubject))
      .subscribe((res: any) => {
        this.selectedProducts = res;
        this.spinnerLoading = false;
        res.map((p: any) => {
          this.productService.getProductMedias(p.firstVariantCode).subscribe(
            (data: any) => {
              p.image = data?.body?.productImageURL;
            },
            () => {
            //  this.progressHide()
            }
          );
          //this.progressHide()
        });
        this.compareProductDetails(this.selectedProducts);
      },(err)=>{this.progressHide()});

    // this.cpService.getCompareProducts().subscribe((res: any) => {
    //   this.compareProducts = res;

    // });
    let queryParams: any = this.activateRoute.snapshot.queryParams;
    if (Object.keys(queryParams).length > 0) {
      // this.compareProductDetails(JSON.parse(queryParams?.selectedProducts));
    }
    this.storageService
      .getItem("selectedProducts")
      .pipe(takeUntil(this.destroySubject))
      .subscribe((res: any) => {
        this.selectedProducts = res;
        this.compareProductDetails(this.selectedProducts);
      });
  }

  compareProductDetails(data?: any) {
    let queryParam = "";
    data.forEach((element: any, index: number) => {
      if (index == 0) {
        queryParam = queryParam + "compareProducts=" + element.firstVariantCode;
      } else {
        queryParam =
          queryParam + "&compareProducts=" + element.firstVariantCode;
      }
    });

    this.spinnerLoading = true;
    let queryParams = data.join(",");
    this.productService.compareProducts(`${queryParam}&fields=FULL`).subscribe({
      next: (res) => {
        this.compareProducts = res?.body?.compareProducts;
      this.progressHide()
        this.scrollPageToTop();
        this.compareProducts.map((item: any) => {
          this.productService
            .getProductMedias(item.code)
            .subscribe((data: any) => {
              if (data?.body?.productImageURL) {
                item.image = data?.body?.productImageURL + "?$xchangeThumb$";
              } else {
                item.image =
                  "https://s7d4.scene7.com/is/image/MohawkResidential/missing?$xchangeThumb$";
              }
            });
          let newKeys: any[] = [];
          for (let k in item) {
            newKeys.push(k);
          }
          this.prodDisColumns.filter((col: any) => {
            let ak = [];
            ak.push(col.key);
            newKeys = [...ak, ...newKeys];
          });
          this.specColumns.filter((col: any) => {
            let ak = [];
            ak.push(col.key);
            newKeys = [...ak, ...newKeys];
          });
          this.designColumns.filter((col: any) => {
            let ak = [];
            ak.push(col.key);
            newKeys = [...ak, ...newKeys];
          });
          this.susColumns.filter((col: any) => {
            let ak = [];
            ak.push(col.key);
            newKeys = [...ak, ...newKeys];
          });
          this.warrantColumns.filter((col: any) => {
            let ak = [];
            ak.push(col.key);
            newKeys = [...ak, ...newKeys];
          });
          item.keys = [...new Set(newKeys)];
        });
      },
      error: (err) => {
        this.progressHide()
      },
    });
  }

  returnPreviousUrl() {
    this._location.back();
  }

  removeCompareItem(item: any) {
    let queryDetails: any[] = [];
    this.selectedProducts = this.compareProducts.filter((res: any) => {
      if (res.code != item.code) {
        res.firstVariantCode = res.code;

        queryDetails.push(res.code);
      }
      return res.code != item.code;
    });
    let path = this.router.url.split("?")[0];
    this._location.replaceState(
      path,
      `selectedProducts=${queryDetails.toString()}`
    );
    this.storageService.setItem("selectedProducts", this.selectedProducts);
    this.compareProductDetails(this.selectedProducts);
  }

  toKeys(a: any) {
    let keys = [];
    for (let key in a) {
      keys.push({ key: key, value: a[key] });
    }
    return keys;
  }

  scrollableList: any[] = [];
  elHover = null;

  @HostListener("mouseover", ["$event"])
  onMouseOver(evt: any) {
    this.elHover =
      this.scrollableList.find((scrollable) => scrollable === evt.target) ||
      null;
  }
  @HostListener("mouseout", ["$event"])
  onMouseOut(evt: any) {
    this.elHover = null;
  }
  updateScroll(evt: any) {
    const elHover = evt.target;
    const percentage =
      elHover.scrollLeft / (elHover.scrollWidth - elHover.offsetWidth);
    this.scrollableList
      .filter((scrollable) => scrollable !== this.elHover)
      .forEach((scrollable) => {
        scrollable.scrollLeft =
          percentage * (scrollable.scrollWidth - scrollable.offsetWidth);
      });
  }
  ngOnDestroy() {
    this.destroySubject.next();
  }

  captureScreen() {
      this.progressShow('viewpdf')
    let currentDate = new Date();
    this.spinnerLoading = true;
    const cValue = formatDate(currentDate, "yyyy-MM-dd", "en-US");
    var data: any = document.getElementById("print-section");
    this.hidelement(true);
    html2canvas(data, { useCORS: true }).then((canvas) => {
      var imgWidth = 208;
      var pageHeight = 10;
      var imgHeight = (canvas.height * imgWidth) / canvas.width;
      var heightLeft = imgHeight;
      const contentDataURL = canvas.toDataURL("image/png");
      let pdf = new jsPDF("p", "mm", "a4");
      var position = 10;
      const logo = "/assets/images/logo-residential-dark.png";
      pdf.addImage(logo, "PNG", 10, position, 100, 10);
      heightLeft -= pageHeight;
      pdf.addImage(
        contentDataURL,
        "PNG",
        0,
        position + 10,
        imgWidth,
        heightLeft
      );
      let today = new Date();
      // pdf.save(`products-compare-${cValue}.pdf`);
      var blob = pdf.output("blob");
      window.open(URL.createObjectURL(blob));
      this.hidelement(false);
    this.progressHide()
    });
  }

  hidelement(result: Boolean) {
    this.hidden?.toArray().forEach((element: any) => {
      element.nativeElement.hidden = result;
    });
  }
  
  getImage(imageurl: any) {
    let swatchImage = imageurl.includes("https");
    return swatchImage? imageurl + "?$xchangeThumb$":"https://s7d4.scene7.com/is/image/MohawkResidential/missing?$xchangeThumb$";
   // return image + "?$xchangeThumb$ ";
  }

    progressShow(msgType: any) {
        const messageConstants = MESSAGE_CONSTANTS?.compareProduct?.[msgType]
        this.openProgressModal({
          modalHeaderText: messageConstants?.headerText,
          progressText: messageConstants?.bodyText,
          progressBarText: messageConstants?.barText
        });
      }
        progressHide(){
          this.modalService.hide("progressModal");
        }
        openProgressModal(data = {}, size: any = "md", modalId = "progressModal") {
          const initialState: ModalOptions = {
            backdrop: true,
            ignoreBackdropClick: true,
            initialState: {
              ...data,
            },
          };
          this.modalRef = this.modalService.show(
            ProgressModalComponent,
            Object.assign(initialState, {
              id: modalId,
              class: `modal-${size} modal-dialog-centered`,
            })
          );
        }
}
