import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewChildren,
} from "@angular/core";
import { BreadcrumbItems } from "src/app/features/shared/interfaces";
import { Columns, Config, DefaultConfig } from "ngx-easy-table";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Router } from "@angular/router";
import { DatePipe, DOCUMENT, formatDate } from "@angular/common";
import { ActivatedRoute } from "@angular/router";
import { OrderService } from "../../services/order.service";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { XchangeViewAllColorsComponent } from "src/app/features/shared/components/xchange-view-all-colors/xchange-view-all-colors.component";
import { ProductService } from "../../../products/pages/services/product.service";
import { AddCompanionProductsComponent } from "../../../products/components/add-companion-products/add-companion-products.component";
import { API_CONSTANTS } from "src/app/features/shared/constants/API-CONSTANTS";
import { StorageService } from "src/app/features/http-services/storage.service";
import { OrderDetailsCancelHoldModalComponent } from "../../modals/order-details-cancel-hold-modal/order-details-cancel-hold-modal.component";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { QuanityChangePopupComponent } from "src/app/features/shared/components/quanity-change-popup/quanity-change-popup.component";
import { ResidentialPlpTypes } from "src/app/features/shared/constants/menu/residential.config";
import { ChangeDyelotModalComponent } from "src/app/features/shared/components/change-dyelot-modal/change-dyelot-modal.component";
import { PostModificationAddCompanionProductsComponent } from "../../../post-modification/post-modification-products/post-modification-components/post-modification-add-companion-products/post-modification-add-companion-products.component";
import { faEllipsisVertical, faL } from "@fortawesome/free-solid-svg-icons";
import { ConfirmationDialogComponent } from "src/app/features/shared/components/confirmation-dialog/confirmation-dialog.component";
import { BuilderDetailsComponent } from "src/app/features/shared/components/builder-modals/builder-details/builder-details.component";
import { ShareViaEmailLightboxComponent } from "../../../products/components/share-via-email-lightbox/share-via-email-lightbox.component";
import { AddAccessoriesComponent } from "../add-accessories/add-accessories.component";
import { Observable, Observer, map, of, tap, switchMap } from "rxjs";
import { PostModificationProductService } from "../../../post-modification/post-modification-products/post-modification-pages/post-modification-services/post-modification-product.service";
import { TabService } from "../../services/tab.service";
import { UserService } from 'src/app/features/shared/user/services/user.service';
import { ProgressModalComponent } from "src/app/features/shared/components/progress-modal/progress-modal.component";
import { MESSAGE_CONSTANTS } from "src/app/features/shared/constants/MESSAGE-CONSTANTS";
import { AddNewLineComponent } from "../add-new-line/add-new-line.component";
import { ProductAddressService } from "../../../products/components/services/product-address.service"; 
import { STATES } from "src/app/features/shared/constants/States";


@Component({
    selector: "app-orders-history-details",
    templateUrl: "./orders-history-details.component.html",
    styleUrls: ["./orders-history-details.component.scss"],
    standalone: false
})
export class OrdersHistoryDetailsComponent implements OnInit {
  @ViewChildren("hidden") hidden:
    | QueryList<OrdersHistoryDetailsComponent>
    | undefined;
  @ViewChild("pdfModal") pdfModal!: TemplateRef<any>;
  @ViewChild(AddNewLineComponent, {static : true}) addNewLineComponent! : AddNewLineComponent;

  pdfContent: string = "";
  isCollapsed = false;
  minDate = new Date();
  orderIdData: any;
  updateComments = false;
  comments = "";
  itemList: any;
  selectedReason = "";
  cancellationFee: any = "";
  cancellationFreight: any = "";
  lineNumber: any;
  assignedStatus:any;
  breadcrumbItems: BreadcrumbItems = [
    {
      name: "Home",
      path: "/residential",
      active: false,
    },
    {
      name: "Orders",
      path: "/residential/orders",
      active: false,
    },
  ];
  originalDefaultShippingMethod:any;
  shippingQuestionFrom!: FormGroup;
  formBuilder: any;
  phonePattern = "[0-9]{9}";
  showAssignedSpec = false;
  showShippedSpec = false;
  deliveryCreated: any;
  incoTermsOptions: any = [];
  incoTermsSelectedOption: any = "";
  incoTermsSelectedHeaderOption: any = "";
  showMessage: boolean = false;
  currentDate = new Date().toLocaleString("en-US", {
    timeZone: "America/New_York",
    timeZoneName: "short",
  });
  builderOrderAllowed!: boolean;
  cancelOrderStepForm2: FormGroup;
  isShipTo: boolean = false;
  reqDelWarning: boolean = false;
  customerNames$?: Observable<any>;
  camsOrderDetails: any;
  orderStatus: any;
  eddMessage: any;
  rddMessage:any;
  camsOrders: any = [];
  isRequestedPriceChanged:boolean = false;
  states = [...STATES[0]?.states, ...STATES[1]?.states];

  trackByCamsOrder = (_: number, item: any) => item?.camsOrderNumber ?? _;
  trackByEntryNumber = (_: number, item: any) => item?.entryNumber ?? _;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private orderService: OrderService,
    private modalService: BsModalService,
    private productService: ProductService,
    private productAddressService: ProductAddressService,
    public userService: UserService,
    public postProductService: PostModificationProductService,
    public storageService: StorageService,
    private datePipe: DatePipe,
    private fb: FormBuilder,
    public bsModalRef: BsModalRef,
    @Inject(DOCUMENT) private document: Document,
    private tabService : TabService
  ) {
    this.storageService.getItem("builderOrderAllowed").subscribe((res: any) => {
      this.builderOrderAllowed = res;
    });
    let emailregex = new RegExp(
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
    this.cancelOrderStepForm2 = this.fb.group({
      cancelledCustName: ["", [Validators.required]],
      cancelledCustEmail: [
        "",
        [Validators.required, Validators.pattern(emailregex)],
      ],
    });
  }
  public spinnerLoading: boolean = true;
  selectedProduct: any = {};
  public configuration!: Config;
  public columns!: Columns[];
  public orderId: any;
  public orderData: any;

  isOpen = false;
  ReqDelDate?: any;
  datesEnabled: any = [
    "20230127",
    "20230130",
    "20230131",
    "20230201",
    "20230202",
  ];
  daysToBeEnabled: any = [];
  paymentTerms: any;
  paymentTermList: any = [];
  shipMethods = ["Mohawk Arranged Delivery", "Customer pick up at Satellite"];
  shipVia: any = "";
  isEditable: boolean = false;
  modalRef?: BsModalRef;
  maxmodalRef?: BsModalRef;
  sideMarkValueForModal: any;
  submitFor: any = "";
  userList: any = [];
  customerFlag: boolean = false;
  salesPersonFlag: boolean=false;
  todayDate = new Date();
  disabledDate: any = [];
  poNumber: any = "";
  userInfo: any = "";
  sampleOrder: boolean = false;
  isCSR: boolean = false;
  errorShow: boolean = false;
  alertType = "danger";
  messageError = "";
  cancelOrderData: any;
  showRequestPrice: boolean = false;
  reInspect: boolean = false;
  invalidPO: boolean = false;
  invalidPOMessage = "";
  @ViewChild("showDateWarning", { static: true })
  showDateWarningTemplate!: TemplateRef<any>;
  changeRddWarningMessage: any;
  bto() {
    if( this.tabService.comingFromOrderpages() == true){
      this.tabService.setFlatFromHistory(true)
    }
    sessionStorage.setItem("reloadOrders", "true");
    this.router.navigate(["residential/orders"], {
      queryParams: this.backToOrdersQueryParams,
    });
  }
  deliveryAddress: any;
  soldToAddress:any;
  errorsArray: any = [];
  changeDateFormat(val: any) {
    let dateArray = val.split("");
    let year = dateArray.splice(0, 4);
    let month = dateArray.splice(0, 2);
    let date = dateArray.splice(0, 2);

    return `${month.join("")}/${date.join("")}/${year.join("")}`;
  }

  errorMessage: string = "";
  currentUrl: string = "";
  backToOrdersQueryParams: any = {};
  isTodayShipmentOrder: boolean = false;
  inHouseAccount: boolean = false;
  oldOrderCode:any='';

  cleanUrl(url: string): string {
    if (!url) return '';
    return url.replace(/^[,\s]+/, ''); // Removes leading commas and spaces
  }

  trackingURLs(shipmentUrls:any){
      if(shipmentUrls){
        return shipmentUrls?.split(",").map((url: string) => {
          return this.cleanUrl(url.trim());
        });
      }else{
        return [];
      }
  }    

  ngOnInit(): void {
    this.requestingNewPriceForm();
    this.route.queryParams.subscribe((params: any) => {
      this.backToOrdersQueryParams = params;
      this.isTodayShipmentOrder = params.selectedTab == 'shipmentsOrders';
    });
    this.storageService.getItem("userInfo").subscribe((res: any) => {
      this.userInfo = res;
      this.isShipTo = this.userInfo?.orgUnit?.accountType === "ZMSH";
      this.customerFlag = this.userInfo?.isCustomer;
      this.salesPersonFlag = this.userInfo?.isSalesPerson || this.userInfo?.isSalesOps;
      this.inHouseAccount = this.userInfo?.orgUnit?.inHouseAccount;
      if (
        this.userInfo?.isCSR == true ||
        this.userInfo?.isSalesPerson ||
        this.userInfo?.isSalesOps
      ) {
        this.showRequestPrice = false;
        this.isCSR = true;
      }
    });

    this.configuration = { ...DefaultConfig };
    this.configuration.checkboxes = false;
    this.configuration.tableLayout.striped = true;
    this.configuration.tableLayout.hover = false;
    this.configuration.paginationRangeEnabled = false;
    this.configuration.paginationEnabled = false;
    this.columns = [
      { key: "orderedQTY", title: "Ordered QTY" },
      { key: "quantityShipped", title: "Shipped QTY" },
      { key: "assignedQuantity", title: "Assigned QTY" },
      { key: "dyeLot", title: "Dyelot" },
      { key: "rollNumber", title: "Roll #" },
      { key: "plant", title: "Plant" },
    ];

    this.orderId = this.route.snapshot.paramMap.get("id");
    this.orderIdData = this.orderId;
    this.breadcrumbItems.push({
      name: "Orders Number # - " + this.orderId,
      path: "/",
      active: true,
    });
    this.getOrderIdDetails();
    this.shippingQuestionFormInit();
    this.currentUrl = window?.location?.href;

    this.customerNames$ = new Observable(
      (observer: Observer<string | undefined>) => {
        observer.next(this.cancelOrderStepForm2.value.cancelledCustName);
      }
    ).pipe(
      switchMap((query: string | undefined) => {
        if (query) {
          return this.orderService.getCustomerList(query).pipe(
            map((res: any) => {
              if (!res?.body?.users) {
                this.cancelOrderStepForm2.patchValue({
                  cancelledCustEmail: "",
                });
              }
              return res?.body?.users || [];
            })
          );
        } else {
          this.cancelOrderStepForm2.patchValue({
            cancelledCustEmail: "",
          });
        }
        return of([]);
      })
    );
  }
  postOrderEligibilityDetails: any;
  checkPostOrderEligibility() {
    this.apiCount = 2;
    this.errorMessage = "";
    this.orderService
      .postOrderEligibility(this.orderId)
      .subscribe((res: any) => {
        if (this.apiCount == 2 && !this.camOrderFlag) {          
        this.modalService.hide();
        }
        if (res && res.body && res.body?.errorCode == "error") {
          this.errorMessage = this.customerFlag
            ? "Action could not be completed. Sales document is currently being processed. "
            : "Action could not be completed. " + res.body?.errorMessage;
        } else {
          this.postOrderEligibilityDetails = res?.body;

          this.orderData.camsCartEntries.forEach((element: any) => {
            (element?.cartEntries || []).forEach((item: any) => {
              this.postOrderEligibilityDetails.lineItems.forEach((ele: any) => {
                if (ele.lineNumber == item.entryNumber) {
                  element.lineNumber = ele;
                }
              });
            });
          });

          this.spinnerLoading = false;
        }
      },(err:any)=>{
        this.modalService.hide();
      });
  }
  priceLabel:any;
  sampleCamsOrderNo:any;
  apiCount = 0;
  camOrderFlag= false;
  getOrderIdDetails(id?: any) {
    // this.messageError = "";
    // this.errorMessage = "";
    this.apiCount = 1;
    this.progressShow('getOrderIdDetails')
    this.orderService.getOrderDetails(this.orderId).subscribe((res: any) => {
      if (res && res.body && res.body?.errorCode == "error") {
        this.progressHide();
        this.errorMessage = res.body?.errorMessage;
      }
      if (res && res.body && res.body?.errorCode == "error") {
        this.progressHide();
        this.errorMessage = res.body?.errorMessage;
      }
      if (res.body?.messages && res.body?.messages[0]?.status == "Error") {
        this.progressHide();
        this.errorMessage = res.body?.messages[0]?.message;
        this.scrollPageToTop();
      }
      if (res.body?.messages && res.body?.messages[0]?.status == "Success") {
        this.progressHide();
        this.messageError = res.body?.messages[0]?.message;
        this.scrollPageToTop();
      } else {
        // this.errorMessage = res.body?.orderHistoryData?.submitOrderError || "";

        this.progressHide();
        this.spinnerLoading = false;
        this.orderData = res.body.orderHistoryData[0];
        this.priceLabel = res.body.orderHistoryData[0]?.total?.currencyIso;
        this.errorMessage = this.orderData.submitOrderError || "";
        this.selectedShipModal = this.orderData?.shipCompleteOrderFlag;
        this.shipAsGroup = this.orderData?.deliveryGrouping;
        this.sampleOrder = res.body.orderHistoryData[0].sampleOrder;
        this.sampleCamsOrderNo = res.body.orderHistoryData[0]?.camsCartEntries[0]?.camsOrderNumber;
        //this.changeShippingPreference();
        this.checkPostOrderEligibility();
        if(this.orderData?.statusDescription != "SUBMITTED" ){
          this.getCAMSOrdersDetails(this.orderData?.orderCode, this.orderData?.camsAccountNumber)
        }

        if((this.userInfo?.isCustomer || this.userInfo?.isSalesOps || this.userInfo?.isSalesPerson) && 
                !this.orderData?.sampleOrder && !this.isTodayShipmentOrder && this.orderData?.statusDescription === "SUBMITTED")
        {
          this.getViewOrderUpdates();
        }
        
        this.poNumber = this.orderData?.poNumber;
        this.reInspect = this.orderData.reInspect;

        this.comments = this.orderData?.comment;
        this.ReqDelDate = new Date(this.orderData?.requestedDeliveryDate) || "";
        this.deliveryAddress = res.body.orderHistoryData[0].shippingAddress;
        this.soldToAddress = res.body.orderHistoryData[0].soldToAddress;
        this.deliveryCreated = res.body.orderHistoryData[0].deliveryCreated;
        this.isRequestedPriceChanged = false;
        
        (this.orderData?.camsCartEntries || []).forEach((orderEntries: any) => {
            (orderEntries?.cartEntries || []).forEach((item: any) => {
              if ( item?.requestedPrice > 0 && item?.requestedPrice != item?.unitPrice.value) {
                this.isRequestedPriceChanged = true;
              }
          });
        });

        // if(this.orderData?.requestedSubTotalPrice?.formattedValue){
        //   let requestedSubTotalPrice = parseFloat(this.orderData?.requestedSubTotalPrice?.formattedValue.replace("$", ""));
        //   if(this.orderData?.subTotal == requestedSubTotalPrice){
        //     this.isRequestedPriceChanged = false;
        //   }
        // }
      }
    });
  }

  private delayPrint(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  printPage() {
    this.progressShow('printOrder');
    let printContents: any, popupWin: any;
    this.showDetailsFlag = true;
    this.hidelement(true);
    this.toggleAccordionElements(true);
    this.showElementForPdf(false);
    let printSection = this.document.getElementById("print-area");
    printContents = printSection?.innerHTML;
    popupWin = window.open("", "_blank", "top=0,left=0,height=100%,width=auto");
    popupWin.document.open();
    popupWin.document.write(`
      <html>
        <head>
        <title>&nbsp;</title>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">
        <link rel="stylesheet" href="/styles.css" crossorigin="anonymous">
        <link rel="stylesheet" href="/assets/print/order-details-print.css" crossorigin="anonymous">
        </head>
         <body onload="window.print()" style="background-color: #fff;">
        <img src="/assets/images/logo-residential-dark.png" width=250 style="margin:30px 0px">
        ${printContents}
        </body>
      </html>`
    );
    popupWin.document.close();
    popupWin.onafterprint = () => popupWin.close();
    if (!this.showDetailsFlag) {
      this.toggleAccordionElements(false);
    }
    this.showDetailsFlag = false;
    this.hidelement(false);
    this.showElementForPdf(true);
    this.progressHide();
  }
  private renderElement(element: any, isSafari: boolean): Promise<{imgData: string, imgHeight: number} | null> {
    const html2canvasOptions: any = {
      scale: 1,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      removeContainer: true,
      foreignObjectRendering: false,
      imageTimeout: 15000,
      ...(isSafari && {
        ignoreElements: (el: Element): boolean => {
          try {
            const computedStyle = window.getComputedStyle(el);
            const colorValue = computedStyle.color;
            return colorValue ? colorValue.includes('color(') : false;
          } catch (error) {
            return true;
          }
        }
      })
    };

    return html2canvas(element, html2canvasOptions).then(canvas => {
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const imgWidth = 190;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      return { imgData, imgHeight };
    }).catch(error => {
      console.error('Error processing element with html2canvas:', error);
      if (isSafari) {
        console.log('Attempting Safari fallback...');
        return html2canvas(element, {
          scale: 1,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          removeContainer: true,
          foreignObjectRendering: false,
          imageTimeout: 10000,
          ignoreElements: (el: Element): boolean => {
            return el.tagName.toUpperCase() === 'STYLE' ||
                   Boolean(el.classList.contains('problematic-css')) ||
                   Boolean(el instanceof HTMLElement && el.style && el.style.color && el.style.color.includes('color('));
          }
        }).then(canvas => {
          const imgData = canvas.toDataURL('image/jpeg', 1.0);
          const imgWidth = 190;
          const imgHeight = canvas.height * imgWidth / canvas.width;
          return { imgData, imgHeight };
        }).catch(fallbackError => {
          console.error('Safari fallback also failed:', fallbackError);
          return null;
        });
      }
      // Non-Safari: skip element and continue
      return null;
    });
  }

  processElements(elements: any, index: any, pdf: any, callback: any, lastPosition = 10) {
    if (index < elements.length) {
        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

        this.renderElement(elements[index], isSafari).then(result => {
            if (result) {
              let position = lastPosition;
              if (index > 0) {
                  position += 5;
              }
              if (position + result.imgHeight > pdf.internal.pageSize.getHeight() - 10) {
                  pdf.addPage();
                  position = 10;
              }
              pdf.addImage(result.imgData, 'JPEG', 10, position, 190, result.imgHeight);
              this.processElements(elements, index + 1, pdf, callback, position + result.imgHeight);
            } else {
              // Skip this element and continue with the next one
              this.processElements(elements, index + 1, pdf, callback, lastPosition);
            }
        });
    } else {
        callback();
    }
  }

  private renderPrintAreaToPdf(pdf: any, source: HTMLElement, headerOffsetMm: number, isSafari: boolean): Promise<void> {
    const html2canvasOptions: any = {
      scale: 1,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      removeContainer: true,
      foreignObjectRendering: false,
      imageTimeout: 5000,
      ...(isSafari && {
        ignoreElements: (el: Element): boolean => {
          try {
            const computedStyle = window.getComputedStyle(el);
            const colorValue = computedStyle.color;
            return colorValue ? colorValue.includes('color(') : false;
          } catch (error) {
            return true;
          }
        }
      })
    };

    return html2canvas(source, html2canvasOptions).then((canvas: any) => {
      const padding = 10;
      const pdfWidth = pdf.internal.pageSize.getWidth() - padding * 2;
      const pdfPageHeight = pdf.internal.pageSize.getHeight();
      const pxPerMm = canvas.width / pdfWidth;
      const firstPageContentMm = Math.max(pdfPageHeight - headerOffsetMm - 10, 20);
      const restPageContentMm = pdfPageHeight - 20;

      let sliceTopPx = 0;
      let pageIndex = 0;
      while (sliceTopPx < canvas.height) {
        const isFirst = pageIndex === 0;
        const sliceHeightMm = isFirst ? firstPageContentMm : restPageContentMm;
        const sliceHeightPx = Math.min(Math.floor(sliceHeightMm * pxPerMm), canvas.height - sliceTopPx);

        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = sliceHeightPx;
        const ctx: any = pageCanvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
          ctx.drawImage(canvas, 0, sliceTopPx, canvas.width, sliceHeightPx, 0, 0, canvas.width, sliceHeightPx);
        }
        const sliceData = pageCanvas.toDataURL('image/jpeg', 0.85);
        const renderedHeightMm = sliceHeightPx / pxPerMm;

        if (!isFirst) {
          pdf.addPage();
        }
        const yPos = isFirst ? headerOffsetMm : 10;
        pdf.addImage(sliceData, 'JPEG', padding, yPos, pdfWidth, renderedHeightMm);

        sliceTopPx += sliceHeightPx;
        pageIndex++;
      }
    });
  }
  // viewPdf(from: any = "") {
  //   this.hidelement(true);
  //   this.progressShow('preparing');
  //   // await this.delayPrint(2000);
  //   this.showDetailsFlag = true;
  //   let printContents: any, popupWin: any;
  //   let accordianElements: any =
  //     this.document.getElementsByClassName("panel-collapse");
  //   this.showElementForPdf(false);
  //   for (let a = 0; a < accordianElements.length; a++) {
  //     accordianElements[a].style.display = "block";
  //   }
  //   printContents = this.document.getElementById("print-area")?.innerHTML;
  //   popupWin = window.open("", "_blank");
  //   if (from === "share" && popupWin) {
  //     this.spinnerLoading = true;
  //     window.focus();
  //   }
  //   popupWin.document.open();
  //   popupWin.document.write(`
  //     <html>
  //       <head>
  //       <title>&nbsp;</title>
  //       <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">
  //       <link rel="stylesheet" href="/styles.css" crossorigin="anonymous">
  //       <link rel="stylesheet" href="/assets/print/order-details-print.css" crossorigin="anonymous">
  //       <style>
  //       .pdf-progress-modal-backdrop { position: fixed; top: 0px; left: 0px; right: 0px; bottom: 0px; background-color: rgba(0, 0, 0, 0.9); display: flex; align-items: center; justify-content: center; z-index: 9999; }
  //       .pdf-modal-content { position: relative; display: flex; flex-direction: column; width: 100%; color: var(--mx-modal-color); pointer-events: auto; background-color: #ffff !important; background-clip: padding-box; box-shadow: rgba(0, 0, 0, 0.25) 0px 25px 50px 29px; outline: 0; border: none; border-radius: 13px; box-shadow: rgba(0, 0, 0, 0.25) 0px 25px 50px 29px; margin: auto !important; width: 300px !important; }
  //       .pdf-modal-header { display: flex; flex-shrink: 0; align-items: center; border-bottom: 1px solid #dee2e6; background-color: #383838; border-radius: 13px 13px 0px 0px; margin-bottom: 0; padding: 14px !important; }
  //       .pdf-text-center { text-align: center !important; }
  //       .pdf-w-100 { width: 100% !important; }
  //       .pdf-text-uppercase { text-transform: uppercase !important; }
  //         h4.pdf-modal-title { font-size: 14px !important; color: #fff; font-weight: bolder; margin-bottom: 0 !important; }
  //       .pdf-modal-body { position: relative !important; flex: 1 1 auto !important; padding: 16px 10px 4px 10px !important;    }
  //       .pdf-mx-2 { margin-right: 0.5rem !important; margin-left: 0.5rem !important; }
  //       .pdf-mb-3 { margin-bottom: 1rem !important; } 
  //       .pdf-h4 { font-size: 12px !important; font-weight: 600 !important; color: #4c4d4b !important; margin-bottom: 4px !important; }
  //       .pdf-progress, .pdf-progress-stacked { --mx-progress-height: 12px !important; --mx-progress-font-size: 0.75rem; --mx-progress-bg: var(--mx-secondary-bg); --mx-progress-box-shadow: var(--mx-box-shadow-inset); --mx-progress-bar-color: #fff; --mx-progress-bar-bg: #ce0e2d; --mx-progress-bar-transition: width 0.6s ease; display: flex; height: var(--mx-progress-height); overflow: hidden; font-size: 10px !important; background-color: var(--mx-progress-bg); border-radius: 10px !important; box-shadow: var(--mx-progress-box-shadow); }
  //       .pdf-progress-bar { display: flex; flex-direction: column; justify-content: center; overflow: hidden; color: var(--mx-progress-bar-color); text-align: center; white-space: nowrap; background-color: rgba(#ce0e2d, 0.9) !important; transition: var(--mx-progress-bar-transition); }
  //       .pdf-progress-bar-striped { background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent); background-size: var(--mx-progress-height) var(--mx-progress-height); background-position-x: calc(0% + 2.20382px); }
  //       .pdf-progress-bar-animated { animation: 1s linear infinite progress-bar-stripes; }
  //       .pdf-bg-info { --mx-bg-opacity: 1; background-color: rgba(var(--mx-info-rgb), var(--mx-bg-opacity)) !important; }
  //       @media (min-width: 576px) { .pdf-modal { --mx-modal-margin: 1.75rem; --mx-modal-box-shadow: var(--mx-box-shadow); } }
  //       </style>
  //       </head>
  //       <body >
  //       <div class="pdf-modal pdf-progress-modal-backdrop">
  //         <div class="pdf-modal-content">
  //           <div class="pdf-modal-header pdf-text-center">
  //             <h4 class="pdf-modal-title pdf-f-w w-100 pdf-text-uppercase">View PDF</h4>
  //           </div>
  //           <div class="pdf-modal-body pdf-p-20">
  //             <div class="pdf-white-bg">
  //               <div class="pdf-mx-2 pdf-mb-3">
  //                 <div class="pdf-mb-3">
  //                   <h4 class="pdf-h4">Generating PDF!</h4>
  //                   <div class="pdf-my-6">
  //                     <progressbar type="info" class="pdf-progress-striped pdf-active pdf-progress" max="100">
  //                       <bar role="progressbar" aria-valuemin="0" class="pdf-progress-bar-info pdf-bg-info pdf-progress-bar pdf-progress-bar-animated pdf-progress-bar-striped" aria-valuenow="100" aria-valuetext="100%" aria-valuemax="100" style="height: 100%; width: 100%;">
  //                         <i>Please wait...</i>
  //                       </bar>
  //                     </progressbar>
  //                   </div>
  //                 </div>
  //               </div>
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //       <div id="pdfOrderContent">
  //       <img src="/assets/images/logo-residential-dark.png" width=250 style="margin:30px 0px">
  //       ${printContents}
  //       </div>
  //       </body>
  //     </html>`
  //   );
  //   popupWin.document.close();
  //   this.progressHide();
  //   popupWin.onload = () => {
  //     const content = popupWin.document.getElementById('pdfOrderContent');
  //     html2canvas(content, { scale: from === 'share' ? 2 : 1, useCORS: true }).then((canvas: any) => {
  //       const data = canvas.toDataURL('image/jpeg');
  //       const pdf = new jsPDF("p", "mm", "a4", true);
  //       const props = pdf.getImageProperties(data);
  //       const padding = 5;
  //       const pageWidth = pdf.internal.pageSize.getWidth() - padding * 2;
  //       const pageHeight = pdf.internal.pageSize.getHeight();
  //       const imgProps = {
  //         width: pageWidth,
  //         height: (canvas.height * pageWidth) / canvas.width,
  //       };
  //       const totalPdfPages = Math.ceil(imgProps.height / pageHeight);
  //       for (let page = 0; page < totalPdfPages; page++) {
  //         const sourceY = (pageHeight * page * canvas.width) / pageWidth;
  //         const pageCanvas = document.createElement('canvas');
  //         pageCanvas.width = canvas.width;
  //         pageCanvas.height = pageHeight * (canvas.width / pageWidth);
  //         const ctx: any = pageCanvas.getContext('2d');
  //         ctx.canvas.style.border = "none"
  //         if (ctx) {
  //           ctx.drawImage(
  //             canvas,
  //             0,
  //             sourceY,
  //             canvas.width,
  //             pageCanvas.height,
  //             0,
  //             0,
  //             canvas.width,
  //             pageCanvas.height
  //           );
  //         }
  //         const pageImageData = pageCanvas.toDataURL('image/png');
  //         if (page > 0) {
  //           pdf.addPage();
  //         }
  //         if (page == 0) {
  //           pdf.addImage(pageImageData, 'JPEG', 5, 5, pageWidth, pageHeight - 20);
  //         } else {
  //           pdf.addImage(pageImageData, 'JPEG', 5, 10, pageWidth, pageHeight - 20);
  //         }
  //       }
  //       if (from === 'share') {
  //         let pdfContent = pdf.output("datauristring");
  //         let PDFData = pdfContent.split(",");
  //         this.spinnerLoading = false;
  //         this.openShareViaEmailModal(PDFData[1]);
  //       } else {
  //         const blob = pdf.output("blob");
  //         const url = URL.createObjectURL(blob);
  //         window.open(url, "_blank");
  //       }        
  //       popupWin.close();
  //     })
  //   }
  //   this.hidelement(false);
  //   if (!this.showDetailsFlag) {
  //     for (let a = 0; a < accordianElements.length; a++) {
  //       accordianElements[a].style.display = "none";
  //     }
  //   }
  //   this.showDetailsFlag = false;
  // }
  
  // captureScreen() {
  //   this.spinnerLoading = true;
  //   this.showDetailsFlag = true;
  //   setTimeout(() => {
  //     let currentDate = new Date();
  //     const cValue = formatDate(currentDate, "yyyy-MM-dd", "en-US");
  //     var data: any = document.getElementById("print-section");
  //     this.hidelement(true);
  //     html2canvas(data, { useCORS: true }).then((canvas) => {
  //       var imgWidth = 208;
  //       var pageHeight = 500;

  //       var imgHeight = (canvas.height * imgWidth) / canvas.width;
  //       var heightLeft = imgHeight;
  //       const contentDataURL = canvas.toDataURL("image/png");
  //       let pdf = new jsPDF("p", "mm", "a4");
  //       var position = 10;
  //       const logo = "/assets/images/logo-residential-dark.png";
  //       pdf.addImage(logo, "PNG", 10, position, 50, 10);
  //       heightLeft -= pageHeight;
  //       pdf.addImage(
  //         contentDataURL,
  //         "PNG",
  //         0,
  //         position + 10,
  //         imgWidth,
  //         imgHeight
  //       );
  //       let today = new Date();
  //       // pdf.save(`Quote-history-${cValue}.pdf`);
  //       var blob = pdf.output("blob");
  //       window.open(URL.createObjectURL(blob));
  //       this.hidelement(false);
  //     });
  //     this.spinnerLoading = false;
  //     this.showDetailsFlag = false;
  //   }, 1000);
  // }
  showDetailsFlag: boolean = false;
  pdfAction: string = ''; 
  hidelement(result: boolean) {
    this.hidden?.toArray().forEach((element: any) => {
      element.nativeElement.hidden = result;
    });
  }
  showElementForPdf(bool: boolean) {
    this.document.querySelectorAll(".print-element").forEach((element: any) => {
      element.style.display = bool == true ? "block" : "none";
    });
  }
  getProductImage(imageurl: any) {
    const urlPattern = /^(https?:\/\/[^\s]+)$/;
    if (urlPattern.test(imageurl)) {
      return imageurl + "?$xchangeThumb$";
    }
    return "https://s7d4.scene7.com/is/image/MohawkResidential/missing";
  }
  setDateFormat(d: Date) {
    const date = new Date(d);
    const weekday = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return `${
      date.getMonth() + 1 <= 9
        ? "0" + (date.getMonth() + 1)
        : date.getMonth() + 1
    }/${
      date.getDate() <= 9 ? "0" + date.getDate() : date.getDate()
    }/${date.getFullYear()}`;
  }

  onValueChange(e: Date) {
    this.ReqDelDate = e;
  }
  modalAction(data: any, template3: any) {
    this.messageError = "";
    if (data?.type == "hold") {
      delete data.type;
      this.spinnerLoading = true;
      this.orderService
        .editPostOrderModications(data)
        .subscribe((data: any) => {
          this.scrollPageToTop();
          this.spinnerLoading = false;
          if (data.body.messages) {
            this.errorShow = true;
            this.alertType = data.body.messages[0].status
              .toLowerCase()
              .includes("success")
              ? "success"
              : "danger";
            this.scrollPageToTop();
            this.modalRef?.hide();
            if (this.alertType == "danger") {
              this.messageError = this.customerFlag
                ? "Action could not be completed. Sales document is currently being processed. "
                : "Action could not be completed. " +
                  data.body.messages[0].message;
            } else {
              this.messageError = data.body.messages[0].message;
            }
            this.getOrderIdDetails();
          }
        },(err:any)=>{
          this.progressHide();
        });
    } else {
      delete data.type;
      this.cancelOrderline(data, template3);
    }
  }
  openHoldCancelModal(
    selectedData: any,
    type: any,
    template3: TemplateRef<any>,
    selectedReason = null
  ) {
    let isLineLevelCancel = selectedData ? true : false;
    this.cancelOrderModal({
      orderDetails: this.orderData,
      selectedData: selectedData,
      cancellationFee: this.cancellationFee,
      type: type,
      selectedReason: selectedReason,

      onPrimaryAction: (data: any) => this.cancelOrderOrLine(selectedData, data, isLineLevelCancel),
      onSecondaryAction: () => this.modalRef?.hide(),
    });
  }

  cancelOrderModal(data: any) {
    const initialState: ModalOptions = {
      initialState: {
        // Data to  popup
        ...data,
      },
    };
    this.modalRef = this.modalService.show(
      OrderDetailsCancelHoldModalComponent,
      Object.assign(initialState, {
        id: "1",
        class: "modal-lg modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );
  }

  requestPriceModal(template4: TemplateRef<any>) {
    this.modalRef?.hide();
    this.modalRef = this.modalService.show(template4, {
      id: 4,
      class: "modal-lg modal-dialog-centered",
      backdrop: "static",
      keyboard: false,
    });
  }
  shipViaSelected: any = "Mohawk Arranged";
  shipViaChange: any = "Mohawk Arranged";
  shipViaList = [
    {
      name: "Mohawk Arranged",
      value: "MA ",
    },
    {
      name: "Customer Arranged",
      value: "CA",
    },
    {
      name: "Pickup at satellite",
      value: "PS",
    },
    {
      name: "pick up at mill",
      value: "PM ",
    },
  ];
  shipViaSubmit() {
    if (this.shipViaType == "incoTerms" && this.incoTermType == "headerLevel") {
      this.openConfirmationModal({
        title: "Warning",
        content: `If the Inco Terms are updated at the order level, the changes will be reflected in the Inco Terms of all the lines.<br />Are you sure want to proceed?`,
        primaryActionLabel: "Yes",
        secondaryActionLabel: "No",
        onPrimaryAction: () => {
          this.onShipViaChange();
          this.hideConfirmationModal();
        },
        onSecondaryAction: () => this.hideConfirmationModal(),
      });
    } else {
      this.onShipViaChange();
    }
  }
  isShipViaOrShippingCodition: any = "";
  openConfirmationModal(data = {}) {
    const initialState: ModalOptions = {
      backdrop: true,
      ignoreBackdropClick: true,
      initialState: {
        ...data,
      },
    };
    this.modalRef = this.modalService.show(
      ConfirmationDialogComponent,
      Object.assign(initialState, {
        id: "confirmationModal",
        class: "modal-md modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );
  }
  hideConfirmationModal() {
    this.modalService.hide("confirmationModal");
  }

  onShipViaChange() {
    this.closeShipViaModal();
    this.spinnerLoading = true;
    this.messageError = "";

    const result = this.shipViaOptions.filter(
      (e: any) => e.key == this.shippingConditions
    );
    //this.shipViaSelected = result[0].value;
    const lineItemOBj: any = {
      incoTerms:
        this.incoTermsSelectedOption == ""
          ? undefined
          : this.incoTermsSelectedOption,
      lineNumber: this.incoTermModalData?.entryNumber,
      ProductCode: this.incoTermModalData?.product?.code,
    };
    let isEmptyObject = false;
    for (let key in lineItemOBj) {
      isEmptyObject = true;
      if (lineItemOBj[key] != undefined) {
        isEmptyObject = false;
        break;
      }
    }
    let payload = {
      postOrderIndicator: "POST",
      orderCode: this.orderIdData,
      comments: "",
      internalComment: "",
      shipComplete: this.selectedShipModal,
      deliveryGrouping: this.shipAsGroup,

      poNumber: "",
      requestedDeliveryDate: "",
      lineItems: !isEmptyObject ? [lineItemOBj] : [],
      shippingInfo: {},
      // shippingMethod: this.shippingConditions,
      shippingCondition: this.shippingConditions,
      incoTerms:
        this.incoTermsSelectedOption == ""
          ? undefined
          : this.incoTermsSelectedOption,
    };

    // if (this.incoTermType == "headerLevel") {
    //   payload.incoTerms = this.incoTermsSelectedHeaderOption;
    //   payload.lineItems = [];
    // }
    // if (this.incoTermType == "lineLevel") {
    //   delete payload.incoTerms;
    // }
    if (this.shipViaType == "incoTerms") {
      payload.postOrderIndicator = "POST";
    }
    if (this.shipViaType == "shippingMethod") {
      payload.postOrderIndicator = "POST";
    }
    this.orderService
      .editPostOrderModications(payload)
      .subscribe((data: any) => {
        this.scrollPageToTop();
        this.getOrderIdDetails();
        this.spinnerLoading = false;
        if (data.body.messages[0].status == "Error") {
          this.errorShow = true;
          this.alertType = "danger";
          this.scrollPageToTop();
          this.modalRef?.hide();
          this.messageError = this.customerFlag
            ? "Action could not be completed. Sales document is currently being processed. "
            : "Action could not be completed. " + data.body.messages[0].message;
        }
      },(err:any)=>{
        this.progressHide();
      });
  }
  shipViaOptions: any = [];
  shippingConditions: string = "";
  shipViaType: string = "";
  incoTermType: any = "";
  disableShippingMethod: boolean = false;
  errorMsgForShippingMethod: string = "";
  isSolutionDetailsClicked: boolean = false;
  incoTermModalData: any;
  

  getOrderQuantity(cartIndexData: any) {
    const userRequestedQuantity = cartIndexData?.userRequestedQuantity || "NA";
    if (cartIndexData?.uom?.name !== "Roll") {
      const uomInfo =
        cartIndexData?.uom?.code !== cartIndexData?.pricingUom
          ? `(${cartIndexData?.pricingUOMQuantity} ${cartIndexData?.pricingUomDescription})`
          : "";

      return `${userRequestedQuantity} ${
        cartIndexData?.uom?.name || ""
      } ${uomInfo}`.trim();
    } else {
      const uomInfo =
        cartIndexData?.uom?.code !== cartIndexData?.pricingUom
          ? cartIndexData?.pricingUOMQuantity != undefined
            ? `(${cartIndexData?.pricingUOMQuantity} ${cartIndexData?.pricingUomDescription})`
            : ""
          : "";

      const rollMax =
        cartIndexData?.uom?.code === "RO"
          ? cartIndexData?.product?.subProductType === "PAD_CUSHION"
            ? `(${cartIndexData?.pricingUOMQuantity} ${cartIndexData?.pricingUomDescription})`
            : cartIndexData?.solution && cartIndexData?.solution[0]?.orderMinInFeet != undefined && cartIndexData?.product?.subProductType != "UNDERLAYMENT" 
            ? `(${cartIndexData?.solution[0]?.orderMinInFeet} / ${cartIndexData?.solution[0]?.orderMaxInFeet})`
            : ""
          : uomInfo;

      return `${Math.round(userRequestedQuantity)} ${
        cartIndexData?.uom?.name || ""
      }(s) ${rollMax}`.trim();
    }
  }
  shipViaModal(
    template: TemplateRef<any>,
    lineItem: any,
    changeoption: any,
    isCompleteCart: boolean
  ) {
    this.shippingConditions = this.orderData?.shippingConditions;
    this.shipViaType = changeoption;

    this.shipViaOptions = [];
    this.isCompleteCart = isCompleteCart;
    this.productService
      .getShippingMethodWithOutFlag(
        this.deliveryAddress?.postalCode,
        this.orderData.oneTimeShipTo === undefined
          ? false
          : this.orderData.oneTimeShipTo,
        this.customerFlag || this.salesPersonFlag,
        this.shipViaSelectedOption
      )
      .subscribe((res: any) => {
        if (res?.body) {
          for (let key of Object.entries(res?.body)) {
            this.shipViaOptions.push({
              value: key[0],
              label: key[1],
            });
          }
          this.shipViaSelectedOption =
            lineItem?.shippingCondition || this.shipViaOptions[0];
          if (this.isCompleteCart) {
            this.shipViaSelectedOption = this.orderData?.shippingConditions;
          }
          this.incoTermsSelectedOption = lineItem?.incoTerms;
          this.currentSelectedCartEntry = lineItem;
          // debugger
          this.getIncoTerms(this.shipViaSelectedOption);
        }
        this.modalRef = this.modalService.show(template, {
          id: "shipViaModal",
          class: "modal-md modal-dialog-centered",
          backdrop: "static",
          keyboard: false,
        });
      });
  }
  isLineDate: boolean = false;
  lineChangeDate: any;
  changeDateModal(changeDataTemplate: TemplateRef<any>, rdd: any, isline: any) {
    if (isline == "lineItem") {
      this.lineChangeDate = rdd;
      this.isLineDate = true;
    }
    if (isline == "header") {
      this.isLineDate = false;
    }
    this.ReqDelDate = rdd.requestedDeliveryDate;
    let flag = false;
    const dateObject = new Date(this.ReqDelDate);
    let rDD:any = this.datePipe.transform(dateObject, "MM/dd/yyyy");
    if (this.isLineDate) {
      //deliveryCreated = false && maxTimeFence > given RDD
      if (this.lineChangeDate.deliveryCreated === false) {
        let lineMaxTimeFence = new Date(this.lineChangeDate.maxTimeFence);
        let linerDD = new Date(rDD);
        if (rDD != null && lineMaxTimeFence > linerDD) {
          flag = true;
        } else {
          flag = false;
        }
      } else {
        flag = false;
      }
    }
    if (!this.isLineDate) {
      this.orderData?.orderEntries.forEach((item: any) => {
        if (item.deliveryCreated === false) {
          let maxTimeFence = new Date(item.maxTimeFence);
          let headerRDD = new Date(rDD);
          if (rDD != null && maxTimeFence > headerRDD) {
            flag = true;
          } else {
            flag = false;
          }
        } else {
          flag = false;
        }
      });
    }
    if (flag === false) {
      this.changeRddWarningMessage =
        "Change in RDD at this time may deallocate/reallocate inventory assignment.";
    }
    this.orderService
      .getDeliveryDate("?shipToUnit=" + this.poNumber)
      .subscribe({
        next: (res) => {
          this.datesEnabled = res.body;

          this.datesEnabled = this.datesEnabled.map((el: any) => {
            return new Date(this.changeDateFormat(el));
          });

          this.daysToBeEnabled = this.datesEnabled;
          this.modalRef = this.modalService.show(changeDataTemplate, {
            id: "changeDateModal",
            class: "modal-md modal-dialog-centered",
            backdrop: "static",
            keyboard: false,
          });
        },
        error: (err:any) => {
          this.progressHide();
        },
      });
  }
  changePoModal(changePoTemplate: TemplateRef<any>) {
    this.invalidPO = true;
    this.invalidPOMessage = "";
    this.modalRef = this.modalService.show(changePoTemplate, {
      id: "changePoModal",
      class: "modal-md modal-dialog-centered",
      backdrop: "static",
      keyboard: false,
    });
  }
  openSideMarkModal(modalTemplate: TemplateRef<any>, sideMarkValue: any) {
    this.sideMarkValueForModal = sideMarkValue;
    this.modalRef = this.modalService.show(modalTemplate, {
      id: "changeSideMarkModal",
      class: "modal-md modal-dialog-centered",
      backdrop: "static",
      keyboard: false,
    });
  }
  solutionDetailsClicked() {
    this.isSolutionDetailsClicked = !this.isSolutionDetailsClicked;
  }
  closeShipViaModal() {
    this.modalService?.hide("shipViaModal");
  }
  changePO() {
    this.editPostOrderModications(this.poNumber, "", "");
  }
  changeRDD() {
    let flag = false;
    let delFlag = false;
    this.messageError = "";
    const dateObject = new Date(this.ReqDelDate);
    let rdd:any = this.datePipe.transform(dateObject, "MM/dd/yyyy");

    let lineItemOBj: any = [];
    if (this.isLineDate) {
      //deliveryCreated = false && maxTimeFence > given RDD
      if (this.lineChangeDate.deliveryCreated === false) {
        let lineMaxTimeFence = new Date(this.lineChangeDate.maxTimeFence);
        let linerDD = new Date(rdd);
        if (rdd != null && lineMaxTimeFence > linerDD) {
          flag = true;
        } else {
          flag = false;
        }
      } else {
        flag = false;
      }
      this.spinnerLoading = true;
      lineItemOBj = {
        incoTerms: "",
        postOrderIndicator: "RDD",
        lineNumber: this.lineChangeDate?.entryNumber,
        ProductCode: this.lineChangeDate?.product?.code,
        requestedDeliveryDate:
          this.ReqDelDate != ""
            ? this.datePipe.transform(this.ReqDelDate, "yyyyMMdd")
            : "",
      };
    }
    if (!this.isLineDate) {
      this.spinnerLoading = true;
      this.orderData?.orderEntries.forEach((item: any) => {
        if (item.deliveryCreated === false) {
          let maxTimeFence = new Date(item.maxTimeFence);
          let headerRDD = new Date(rdd);
          if (rdd != null && maxTimeFence > headerRDD) {
            flag = true;
          } else {
            flag = false;
          }
        } else {
          flag = false;
        }
        let newItem = {
          incoTerms: "",
          postOrderIndicator: "RDD",
          lineNumber: item.entryNumber,
          ProductCode: item.product?.code || "",
          requestedDeliveryDate:
            this.ReqDelDate != ""
              ? this.datePipe.transform(this.ReqDelDate, "yyyyMMdd")
              : "",
        };
        lineItemOBj.push(newItem);
      });
    }

    let payload = {
      orderCode: this.orderIdData,
      comments: "",
      internalComment: "",
      shipComplete: this.selectedShipModal,
      deliveryGrouping: this.shipAsGroup,

      poNumber: "",
      requestedDeliveryDate: !this.isLineDate
        ? this.ReqDelDate != ""
          ? this.datePipe.transform(this.ReqDelDate, "yyyyMMdd")
          : ""
        : "",
      lineItems: lineItemOBj,
      shippingInfo: {},
      // shippingMethod: this.shippingConditions,
      shippingCondition: this.shippingConditions,
      incoTerms:
        this.incoTermsSelectedOption == ""
          ? undefined
          : this.incoTermsSelectedOption,
    };
    this.orderService
      .editPostOrderModications(payload)
      .subscribe((data: any) => {
        this.scrollPageToTop();
        this.getOrderIdDetails();
        this.spinnerLoading = false;
        this.modalRef?.hide();

        if (data.body.messages[0].status == "Error") {
          this.errorShow = true;
          this.alertType = "danger";
          this.scrollPageToTop();
          this.modalRef?.hide();
          this.messageError = this.customerFlag
            ? "Action could not be completed. Sales document is currently being processed. "
            : "Action could not be completed. " + data.body.messages[0].message;
        }
        if (flag === false) {
          this.reqDelWarning = true;
          this.modalRef?.hide();
          this.changeRddWarningMessage =
            "Change in RDD at this time may deallocate/reallocate inventory assignment.";
          this.showDateWarning(this.showDateWarningTemplate);
          //  this.errorShow = true;
          this.spinnerLoading = false;
          this.alertType = "warning";
          this.scrollPageToTop();
        }
      },(err:any)=>{
        this.progressHide();
      });
  }
  showDateWarning(showDateWarning: TemplateRef<any>) {
    this.modalRef = this.modalService.show(showDateWarning, {
      id: "showDateWarning",
      class: "modal-md modal-dialog-centered",
      backdrop: "static",
      keyboard: false,
    });
  }
  closeRddInfo() {
    this.modalRef?.hide();
  }
  changeSideMark(inputRef: any,value:any,maxlengthTemplate :any) {
    if(value.length > 250){
      this.checkMaxLength(maxlengthTemplate)
      return
    }
    const obj = {
      lineNumber: this.sideMarkValueForModal?.entryNumber,
      ProductCode: this.sideMarkValueForModal?.product?.code,
      feet: "",
      inches: "",
      requestedUOM: "",
      requestedQty: "",
      sidemark: inputRef.value,
    };
    this.editPostOrderModications("", "", obj);
  }
  cancelRddChange() {
    this.ReqDelDate = new Date(this.orderData?.requestedDeliveryDate);
    this.messageError = "";
    this.modalRef?.hide();
  }

  editPostOrderModications(poNum: any, rdd: any, sideMark: any) {
    this.spinnerLoading = true;
    this.messageError = "";
    const payLoad = {
      orderCode: this.orderIdData,
      comments: "",
      internalComment: "",
      shipComplete: this.selectedShipModal,
      deliveryGrouping: this.shipAsGroup,

      poNumber: poNum,
      requestedDeliveryDate:
        rdd != "" ? this.datePipe.transform(rdd, "yyyyMMdd") : "",
      lineItems: sideMark == "" ? [] : [sideMark],
      shippingInfo: {},
      shippingMethod: "",
    };
    this.orderService
      .editPostOrderModications(payLoad)
      .subscribe((data: any) => {
        this.spinnerLoading = false;
        this.scrollPageToTop();
        this.getOrderIdDetails();
        if (data.body.messages) {
          this.errorShow = true;
          this.alertType = data.body.messages[0].status
            .toLowerCase()
            .includes("success")
            ? "success"
            : "danger";
          this.scrollPageToTop();
          this.modalRef?.hide();
          // this.messageError = data.body.messages[0].message;
          if (this.alertType == "danger") {
            this.messageError = this.customerFlag
              ? "Action could not be completed. Sales document is currently being processed. "
              : "Action could not be completed. " +
                data.body.messages[0].message;
          } else {
            this.messageError = data.body.messages[0].message;
          }
        }
        if (
          data?.body?.messages !== undefined &&
          data?.body?.messages?.length > 0 &&
          data?.body?.messages[0]?.status == "Error"
        ) {
          this.scrollPageToTop();
          this.errorShow = true;
          this.alertType = "danger";
          this.modalRef?.hide();
          this.messageError = this.customerFlag
            ? "Action could not be completed. Sales document is currently being processed. "
            : "Action could not be completed. " +
              (data.body?.messages?.length > 0
                ? data.body?.messages[0]?.message
                : "");
        } else {
          if (poNum != "") {
            this.orderData.poNumber = this.poNumber;
          }
          if (rdd != "") {
            this.ReqDelDate = rdd;
            this.orderData.requestedDeliveryDate = rdd;
          }
          if (sideMark != "") {
            this.sideMarkValueForModal.sideMark = sideMark?.sidemark;
          }
        }
        this.getOrderIdDetails();
      },(err:any)=>{
        this.progressHide();
      });
    this.modalRef?.hide();
  }
  closeChangeDateModal() {
    this.modalRef?.hide();
  }
  viewAllColors(data: any) {
    this.spinnerLoading = true;
    this.selectedProduct = data;
    this.productService
      .getPdpVariantRecords(data?.product?.code)
      .subscribe((res) => {
        this.spinnerLoading = false;
        this.progressHide();
        if (res?.error?.errorCode != "0000") {
          this.errorMessage = this.customerFlag
            ? "Action could not be completed. Sales document is currently being processed. "
            : "Action could not be completed. " + res?.error?.message;
          this.scrollPageToTop();
        }
        if (res.body) {
          const initialState: ModalOptions = {
            initialState: {
              // Data to  popup
              data: res.body?.productColorVariantOptions || [],
              selectedProduct: data?.product?.code,
            },
          };
          this.modalRef = this.modalService.show(
            XchangeViewAllColorsComponent,
            Object.assign(initialState, {
              id: "viewAllColors",
              class: "modal-xl modal-dialog-centered",
              backdrop: "static",
              keyboard: false,
            })
          );
          this.modalRef.content.productCode.subscribe(
            (product: any) => {
              // this.router.navigateByUrl("residential/products/details/" + data);
              const payLoad = {
                multiCutIndication: false,
                viewInventory: false,
                zipCode: this.orderData?.shippingAddress.postalCode,
                oneTimeShippingAddress: false,
                entries: [
                  {
                    dyeLot: data.requestedDyelot,
                    feet: "",
                    inches: "",
                    productCode: product.value.code,
                    requestUOM: data.uom.code,
                    requestedQty: data.quantity,
                    maxFeet: 0,
                    maxInches: 0,
                    minFeet: 0,
                    minInches: 0,
                    rollPrices: true,
                    sameDyeLot: true,
                  },
                ],
                shipTo: this.orderData?.companyCode,
                shippingAddressID: this.orderData?.companyCode,
                reqDeliveryDate:
                  this.orderData?.orderEntries.requestedDeliveryDate,
                soldTo: this.orderData?.companyCode,
              };

              const initialState: ModalOptions = {
                initialState: {
                  solutions: [payLoad],
                  openFromaddressModal: true,
                  showContinue: true,
                  shippingAddress: {
                    ...this.deliveryAddress,
                    ...{ id: undefined },
                  },
                  cartData: [],
                  feetyardForm: {
                    dyeLot: data.requestedDyelot,
                    feet: data.quantity,
                    inches: "",
                    productCode: product?.value?.code,
                    requestUOM: data.uom.code,
                    unit: data.uom.code,
                    requestedQty: data.quantity,
                  },
                  productType: "",
                  selectedProduct: product?.value?.code,

                  //  subProductType:this.initialState.solution[0].subProductType,
                },
              };
              this.modalRef = this.modalService.show(
                PostModificationAddCompanionProductsComponent,
                Object.assign(initialState, {
                  class: "modal-xl modal-dialog-centered",
                  backdrop: "static",
                  keyboard: false,
                })
              );

              this.modalRef.content.solutions = [payLoad];
              this.modalRef?.hide();
            },
            (err: any) => {
              this.progressHide();
              this.errorMessage = this.customerFlag
                ? "Action could not be completed. Sales document is currently being processed. "
                : "Action could not be completed. " + res?.body?.message;
              this.scrollPageToTop();
            }
          );
        }
      });
  }
  addComments(changeTemplateRef: TemplateRef<any>) {
    this.modalRef = this.modalService.show(changeTemplateRef, {
      id: "changeCommentModal",
      class: "modal-md modal-dialog-centered",
      backdrop: "static",
      keyboard: false,
    });
  }
  addPaymentTerms(changeTemplateRef: TemplateRef<any>) {
    this.paymentTerms = this.orderData?.termsCode;
    if (this.paymentTermList.length === 0) {
      this.getPaymentTermsList(this.orderData);
    }
    this.modalRef = this.modalService.show(changeTemplateRef, {
      id: "changePaymentModal",
      class: "modal-md modal-dialog-centered",
      backdrop: "static",
      keyboard: false,
    });
  }

  reqModification() {
    if(this.orderData?.oneTimeShipTo){
      this.oneTimeShipToForm();
    }else{
      this.getShippingAddressList(0, "");
    }
    this.paymentTerms = this.orderData?.termsCode;
    this.orderData?.camsCartEntries.map((cart:any) => {
      return this.getShippingMethods(cart);
    });

    if (this.paymentTermList.length === 0) {
      this.getPaymentTermsList(this.orderData);
    }
    this.isEditOrder = true;
  }

  transformResponse = (body: { [key: string]: any }): { value: string; label: string }[] => {
    if (!body) {
      return [];
    }
    return Object.entries(body).map(([key, value]) => ({
      value: key,
      label: value,
    }));
  };

  getShippingMethods(cartData: any) {
    const oneTimeShipTo = this.orderData?.oneTimeShipTo !== undefined ? this.orderData.oneTimeShipTo : false;
    this.productService
      .getShippingMethodWithOutFlag(
        this.deliveryAddress.postalCode,
        oneTimeShipTo,
        this.customerFlag || this.salesPersonFlag,
        cartData?.shippingConditions
      )
      .pipe(
        tap((res: any) => {
          if (res?.body) {
            cartData.shippingMethodOptions = this.transformResponse(res.body);
          }
        })
      )
      .subscribe(() => {
        if (this.customerFlag || this.salesPersonFlag) {
            cartData.shippingWareHouseOptions = [];
            cartData?.shippingWareHouseOptions.push({
              value: cartData?.shippingWarehouse,
              label: cartData?.shippingWarehouseDesc,
            });
            cartData.incoTermsOptions = [];
            cartData?.incoTermsOptions.push({
              value: cartData?.incoTerms,
              label: cartData?.incoTermsDesc
            });
            cartData.shipViaOptions = [];
            cartData.shipViaOptions.push({
              value: cartData?.shipVia,
              label: cartData?.shipVia
            })
        }else{
          this.getIncoTermsOptions(cartData?.shippingConditions, cartData);
          this.getShippingwareHouseOptions(cartData);
        }
      });
  }

  onChangeshippingMethod(event:any, cartData: any) {
    cartData.updatedShippingMethod = event;
    if (this.customerFlag || this.salesPersonFlag) {
        this.orderService
            .getShippingoptionForCustomers(
              this.deliveryAddress?.postalCode,
              event,
              cartData?.shippingWarehouse,
              this.orderData.oneTimeShipTo === undefined
                ? false
                : this.orderData?.oneTimeShipTo,
              this.userInfo.orgUnit.uid,
            )
            .subscribe({
              next: (res) => {
                this.spinnerLoading = false;
                cartData.incoTermsOptions = [];
                cartData.shipViaOptions = [];
                 cartData.incoTermsOptions.push({
                  value: res.body?.incoTerms,
                  label: res.body?.incoTermsDesc,
                });
                if(res.body.shipvia){
                   cartData?.shipViaOptions.push({
                    value: res.body?.shipvia,
                    label: res.body?.shipvia,
                  });
                }
                cartData.shippingWareHouseOptions = [];
                cartData?.shippingWareHouseOptions.push({
                  value: res?.body?.shippingWarehouse || cartData?.shippingWarehouse,
                  label: res?.body?.shippingWarehouseDesc || cartData?.shippingWarehouseDesc,
                });
                cartData.updatedIncoTerms = cartData?.incoTerms != res.body?.incoTerms ? res.body?.incoTerms : '';
                cartData.updatedShippingWarehouse = cartData?.shippingWarehouse != res.body?.shippingWarehouse ? res.body?.shippingWarehouse : '';
                cartData.updatedShipVia = cartData?.shipVia != res.body?.shipvia ? res.body?.shipvia : '';
              },
              error: (err:any) => {
                this.spinnerLoading = false;
              },
      });
    }else{
      this.getIncoTermsOptions(event, cartData);
      this.getShipViaOptions(cartData);
    }
  }

  onChangeIncoTerms(event:any, cartData: any) {
    cartData.updatedIncoTerms = event;
  }

  onChangeshippingWareHouse(event:any, cartData: any) {
    cartData.updatedShippingWarehouse = event;
    this.getShipViaOptions(cartData);
  }

  onChangeShipVia(event:any, cartData: any) {
    cartData.updatedShipVia = event;
  }

  getIncoTermsOptions(event:any, cartData: any) {
    let shippingCondition = event;
    this.orderService.getIncoTerms(shippingCondition).subscribe({
      next: (res) => {
        cartData.incoTermsOptions = this.transformResponse(res?.body);
      },
      error: (err: any) => {
        this.progressHide();
      },
    });
  }

  getShippingwareHouseOptions(cartData: any) {
    this.productService.getShippingWareHouseWithOutFlag().subscribe((res: any) => {
      cartData.shippingWareHouseOptions = this.transformResponse(res?.body);
      this.getShipViaOptions(cartData);
    });
  }

  getShipViaOptions(cartData: any) {
    const postalCode = this.deliveryAddress?.postalCode?.split('-')[0] || '';
    let shippingWarehouse = cartData?.updatedShippingWarehouse || cartData?.shippingWarehouse;
    let shippingConditions = cartData?.updatedShippingMethod || cartData?.shippingConditions;
    this.orderService
      .getIncoTermsLoc2(postalCode, shippingWarehouse, shippingConditions)
      .subscribe({
        next: (res) => {
          if (res?.body && Object.keys(res?.body).length > 0) {
            cartData.shipViaOptions = Object.values(res.body)
              .sort((a: any, b: any) => (a.shipvia > b.shipvia ? 1 : -1))
              .map((item: any) => ({
                value: item.shipvia,
                label: item.shipvia,
                preferred: item.preferred,
              }));
          } else {
            cartData.shipViaOptions = [];
          }
        },
        error: (err: any) => {
          console.error('Error fetching ship via options:', err);
        },
      });
  }

  onChangeSideMark(event:any, data: any){
    data.updatedSideMark = event?.currentTarget?.value;
  }

  onChangeOrderQty(event:any, data: any){
    data.updatedUserRequestedQuantity = event?.currentTarget?.value;
  }

  onRDDChange(date:any, data: any){
    let rddDate = this.datePipe.transform(date, "MM/dd/yyyy")
    if(rddDate && rddDate != data?.requestedDeliveryDate){
      data.updatedRequestedDeliveryDate = date;
    }
  }

  getPaymentTermsList(orderData: any) {
    this.productService.getPaymentTermsList(orderData).subscribe({
      next: (res) => {
        for (let key in res.body) {
          this.paymentTermList.push({ value: key, label: res.body[key] });
        }
        // this.daysToBeEnabled = this.datesEnabled;
      },
      error: (err:any) => {
        this.progressHide();
      },
    });
  }
  updateComment() {
    this.spinnerLoading = true;
    this.messageError = "";
    let payLoad = {};
    if (this.userInfo.isCSR) {
      payLoad = {
        orderCode: this.orderIdData,
        comments: this.comments,
        internalComment: "true",
        shipComplete: this.selectedShipModal,
        deliveryGrouping: this.shipAsGroup,

        poNumber: "",
        lineItems: [],
        shippingInfo: {},
        shippingMethod: "",
      };
    } else {
      payLoad = {
        orderCode: this.orderIdData,
        comments: this.comments,
        internalComment: "false",
        shipComplete: this.selectedShipModal,
        deliveryGrouping: this.shipAsGroup,

        poNumber: "",
        lineItems: [],
        shippingInfo: {},
        shippingMethod: "",
      };
    }
    this.orderService
      .editPostOrderModications(payLoad)
      .subscribe((data: any) => {
        this.spinnerLoading = false;
        if (
          data?.body?.messages !== undefined &&
          data?.body?.messages?.length > 0 &&
          data?.body?.messages[0]?.status == "Error"
        ) {
          this.scrollPageToTop();
          this.errorShow = true;
          this.alertType = "danger";
          this.modalRef?.hide();
          this.messageError = this.customerFlag
            ? "Action could not be completed. Sales document is currently being processed. "
            : "Action could not be completed. " +
              data.body?.messages[0]?.message;
        } else {
          this.scrollPageToTop();
          this.orderData.comment = this.comments;
          this.errorShow = true;
          this.alertType = "success";
          this.messageError = data.body?.messages[0]?.message;
          setTimeout(() => {
            this.errorShow = false;
            this.alertType = "danger";
            this.messageError = "";
          }, 4000);
          this.updateComments = !this.updateComments;
        }
        this.getOrderIdDetails();
      },(err:any)=>{
        this.progressHide();
      });
    this.modalRef?.hide();
  }

  cancelOrderline(data: any, template: TemplateRef<any>) {
    let payload = data;
    this.cancelOrderData = { ...payload };
    this.errorsArray = [];
    let entry = null;
    if (payload.entries) {
      entry = payload.entries;
      delete payload.entries;
    }

    if (data?.cancelFeeRequired) {
      this.selectedReason = "";
      this.cancellationFee = "";
      this.cancellationFreight = "";

      this.spinnerLoading = true;
      this.orderService.cancelOrderLine(payload, entry).subscribe(
        (data: any) => {
          this.spinnerLoading = false;
          this.selectedReason = "";
          this.cancellationFee = Number(data.body?.cancellationFee);
          this.cancellationFreight = Number(data.body?.cancellationFreight);
          if (
            data.body?.messages &&
            data.body?.messages[0]?.status == "Error"
          ) {
            this.errorsArray =
              data?.body?.messages?.length > 0
                ? data.body.messages.map((message: any) => {
                    return {
                      ...message,
                      message: this.customerFlag
                        ? "Action could not be completed. Sales document is currently being processed. "
                        : "Action could not be completed. " + message.message,
                    };
                  })
                : [{ message: "" }];
            this.scrollPageToTop();
            this.modalService.hide();
          } else {
            this.modalRef = this.modalService.show(template, {
              id: 2,
              class: "modal-lg modal-dialog-centered",
              backdrop: "static",
              keyboard: false,
            });
          }
        },
        (err: any) => {
          this.progressHide();
          this.spinnerLoading = false;
        }
      );
    }
    if (!data?.cancelFeeRequired) {
      this.spinnerLoading = true;
      this.orderService.cancelOrderLine(payload, entry).subscribe(
        (data: any) => {
          this.spinnerLoading = false;
          this.selectedReason = "";
          if (
            data.body?.messages &&
            data.body?.messages[0]?.status == "Error"
          ) {
            // this.errorMessage = data.body?.messages[0]?.message;
            this.errorsArray =
              data?.body?.messages?.length > 0
                ? data.body.messages.map((message: any) => {
                    return {
                      ...message,
                      message: this.customerFlag
                        ? "Action could not be completed. Sales document is currently being processed. "
                        : "Action could not be completed. " + message.message,
                    };
                  })
                : [{ message: "" }];
            this.scrollPageToTop();
            this.modalService.hide();
          } else {
            this.scrollPageToTop();
            setTimeout(() => {
              this.getOrderIdDetails();
            }, 3000);
            this.modalRef = this.modalService.show(template, {
              id: 3,
              class: "modal-lg modal-dialog-centered",
              backdrop: "static",
              keyboard: false,
            });
          }
        },
        (err: any) => {
          this.progressHide();
          this.spinnerLoading = false;
        }
      );
    }
  }

  cancelOrderStep2(canelOrderStep2: TemplateRef<any>) {
    this.cancelOrderData.cancelFeeRequired = false;
    if (this.userInfo.isCSR) {
      this.cancelOrderStepForm2.markAllAsTouched();
      if (this.cancelOrderStepForm2.valid) {
        this.cancelOrderData = {
          ...this.cancelOrderData,
          ...this.cancelOrderStepForm2.value,
        };
      }
    } else {
      this.cancelOrderData = {
        ...this.cancelOrderData,
        ...this.cancelOrderStepForm2.value,
      };
    }

    this.cancelOrderline(this.cancelOrderData, canelOrderStep2);
  }

  @ViewChild("scrollToTop", { read: ElementRef }) scrollToTop: any;
  scrollPageToTop() {
    this.scrollToTop?.nativeElement.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "nearest",
    });
  }
  onReasonChange() {
    this.cancellationFee = "";
    this.cancellationFreight = "";
    let payload = {
      orderCode: this.orderIdData,
      cancelFeeRequied: true,
      cancelCode: this.selectedReason,
    };
  }

  formatDateMessage(msg: string, skipISO: boolean = false) {
    const msgDate = Date.parse(msg);
    let returnVal = msg;

    if (isNaN(msgDate) == false) {
      if(skipISO){
        var d:any = new Date(msgDate);
      }else{
        var d:any = new Date(msgDate).toISOString().slice(0, 10);
      }
        
      returnVal = formatDate(d, "MM/dd/yyyy", "en-US");
    }

    return returnVal;
  }

  validatePO(e: any) {
    return /^[^{}[\]:;".\\]*$/.test(e.key);
  }

  selectedShipModal: boolean = false;
  openShipOrderModal(template: TemplateRef<any>) {
    this.changeShippingPreference();
    this.selectedShipModal = this.orderData?.shipCompleteOrderFlag;
    this.shipAsGroup = this.orderData?.deliveryGrouping;
    this.modalRef = this.modalService.show(template, {
      id: "selectedShipModal",
      class: "modal-md modal-dialog-centered",
      backdrop: "static",
      keyboard: false,
    });
  }
  allowShippingPreferenceChange: boolean = true;
  changeShippingPreference() {
    const uniqueRequestedDeliveryDates = new Set(
      this.orderData.camsCartEntries.map(
        (entry: any) => entry.requestedDeliveryDate
      )
    );
    const uniqueShippingConditions = new Set(
      this.orderData.camsCartEntries.map((entry: any) => entry.shippingCondition)
    );
    const uniqueIncoTerms = new Set(
      this.orderData.camsCartEntries.map((entry: any) => entry.incoTerms)
    );

    this.allowShippingPreferenceChange =
      uniqueRequestedDeliveryDates.size === 1 &&
      uniqueShippingConditions.size === 1 &&
      uniqueIncoTerms.size === 1;
  }
  shipModalSelected(event: any) {
    if (event.value == true) {
      this.selectedShipModal = true;
      this.shipAsGroup = false;
    } else {
      this.selectedShipModal = false;
      this.shipAsGroup = false;
    }

    this.changeShippingPreference();
  }
  // this.selectedShipModal = event.value;
  // }
  shipAsGroup: boolean = false;
  shipAsGroupSelected(event: any) {
    if (event.value == true) {
      this.shipAsGroup = true;
      this.selectedShipModal = false;
    } else {
      this.shipAsGroup = false;
    }
    this.changeShippingPreference();
  }
  submitShipOrder() {
    let payload = {
      orderCode: this.orderData?.orderCode,
      shipComplete: this.selectedShipModal,
      deliveryGrouping: this.shipAsGroup,
      postOrderIndicator: "POST",
    };
    this.spinnerLoading = true;
    this.messageError = "";
    this.orderService
      .editPostOrderModications(payload)
      .subscribe((data: any) => {
        this.scrollPageToTop();
        this.spinnerLoading = false;
        if (data?.body?.messages) {
          this.errorShow = true;
          this.alertType = data.body.messages[0].status
            .toLowerCase()
            .includes("success")
            ? "success"
            : "danger";
          this.scrollPageToTop();
          setTimeout(() => {
            this.errorShow = false;
            this.alertType = "danger";
            this.messageError = "";
          }, 4000);
          this.modalRef?.hide();
          if (this.alertType == "danger") {
            this.messageError = this.customerFlag
              ? "Action could not be completed. Sales document is currently being processed. "
              : "Action could not be completed. " +
                data.body.messages[0].message;
          } else {
            this.messageError = data.body.messages[0].message;
          }
          this.getOrderIdDetails();
        }
        if (
          data?.body?.messages !== undefined &&
          data?.body?.message?.length > 0 &&
          data?.body?.messages[0]?.status == "Error"
        ) {
          this.errorShow = true;
          this.alertType = "danger";
          this.scrollPageToTop();
          this.modalRef?.hide();
          this.messageError = this.customerFlag
            ? "Action could not be completed. Sales document is currently being processed. "
            : "Action could not be completed. " + data.body.messages[0].message;
        } else {
          this.modalRef?.hide();
          this.getOrderIdDetails();
        }
      },(err:any)=>{
        this.progressHide();
      });
  }

  selectedPriceComment: any = "";
  openPriceComment(value: any, template: TemplateRef<any>) {
    this.selectedPriceComment = value;
    this.modalRef = this.modalService.show(template, {
      id: "builder-details",
      class: "modal-md modal-dialog-centered",
      backdrop: "static",
      keyboard: false,
    });
  }
  selectedPriceIndex = 0;
  requestingPriceForm!: FormGroup;
  requestingNewPriceForm() {
    this.requestingPriceForm = this.fb.group({
      requestedPrice: [
        "",
        [Validators.required, Validators.pattern(/^\d+(\.\d+)?$/), , Validators.min(0.1)],
      ],
      priceComment: ["", [Validators.required]],
    });
  }
  selectedProductForPrice: any;
  requestPriceComment: any;
  priceRequestModal(
    template: TemplateRef<any>,
    selectedProduct: any,
    index: number
  ) {
    this.selectedPriceIndex = index;

    this.requestingPriceForm.patchValue({
      requestedPrice: this.orderData.orderEntries[index]?.requestedPrice
        ? this.orderData.orderEntries[index]?.requestedPrice
        : "",
      priceComment: this.orderData.orderEntries[index]?.priceComment
        ? this.orderData.orderEntries[index]?.priceComment
        : "",
    });

    this.selectedProductForPrice = selectedProduct;
    this.requestPriceComment = this.selectedProductForPrice?.commentsForPrice;
    let selectedPrice =
      this.selectedProductForPrice?.unitPrice?.formattedValue.replace("$", "");
    let control = this.requestingPriceForm.controls;
    control["requestedPrice"].setValidators([
      Validators.required,
      Validators.min(0.1),
      Validators.max(selectedPrice),
      Validators.pattern(/^\d+(\.\d+)?$/),
    ]);
    control["requestedPrice"].markAsUntouched();
    control["priceComment"].markAsUntouched();
    control["requestedPrice"].updateValueAndValidity();
    control["priceComment"].updateValueAndValidity();

    this.modalRef = this.modalService.show(template, {
      id: "shipViaModal",
      class: "modal-lg modal-dialog-centered",
      backdrop: "static",
      keyboard: false,
    });
  }
  numberAndDcecimalvaluesOnly(event: any): boolean {
    const value = event?.currentTarget?.value;
    const charCode = event.which ? event.which : event.keyCode;

    if (event?.key == "." && value.includes(event?.key)) {
      return false;
    }

    if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    if (value.includes(".")) {
      let val = value.split(".");
      val = val[val.length - 1].split("");
      if (val.length > 1) {
        return false;
      }
    }
    return true;
  }
  submitRequestForNewPrice() {
    this.messageError = "";
    if (this.requestingPriceForm.valid) {
      let payLoad = {
        orderCode: this.orderData.orderCode,
        lineItems: [
          {
            lineNumber: this.selectedProductForPrice?.entryNumber,
            requestedPrice: this.requestingPriceForm.value.requestedPrice,
            priceComment: this.requestingPriceForm.value.priceComment,
          },
        ],
      };
      this.spinnerLoading = true;
      this.orderService
        .editPostOrderModications(payLoad)
        .subscribe((data: any) => {
          this.scrollPageToTop();
          this.spinnerLoading = false;
          let priceStatus = data.body.messages && data.body.messages[0].status;
          if (priceStatus != "Success") {
            this.errorShow = true;
            this.alertType = "danger";
            this.modalRef?.hide();
            this.messageError = this.customerFlag
              ? "Action could not be completed. Sales document is currently being processed. "
              : "Action could not be completed. " +
                data.body.messages[0].message;
          } else {
            this.errorShow = true;
            this.alertType = "success";
            this.messageError = data.body.messages[0].message;
            this.getOrderIdDetails();
          }
        },(err:any)=>{
          this.progressHide();
        });
    }
  }
  cancelRequestForNewPrice() {
    this.modalRef?.hide();
  }
  selectedEntryForQunaityChange: any;
  openChangeQuantityPopUp(entry: any) {
    this.selectedEntryForQunaityChange = entry;
    this.changeQuantityPopUp({
      orderDetails: this.orderData,
      selectedEntry: entry,
      onPrimaryAction: (data: any) => this.updateChangeQuantiy(data),
      onSecondaryAction: () => this.modalRef?.hide(),
    });
  }
  changeQuantityPopUp(data: any) {
    const initialState: ModalOptions = {
      initialState: {
        // Data to  popup
        ...data,
      },
    };
    this.modalRef = this.modalService.show(
      QuanityChangePopupComponent,
      Object.assign(initialState, {
        id: "6",
        class: "modal-md",
        backdrop: "static",
        keyboard: false,
      })
    );
  }
  atpCheckProductTypes = JSON.parse(ResidentialPlpTypes.atpCheckProductTypes);
  isAtpCheck = true;
  updateChangeQuantiy(data: any) {
    this.isAtpCheck = this.atpCheckProductTypes.includes(
      this.selectedEntryForQunaityChange?.product?.subProductType
    );

    if (this.isAtpCheck) {
      const initialState: ModalOptions = {
        initialState: {
          solutions: [this.selectedEntryForQunaityChange],
          openFromaddressModal: true,
          showContinue: false,
          shippingAddress: {
            ...this.deliveryAddress,
            ...{ id: undefined },
          },
          cartData: [],
          feetyardForm: {
            dyeLot: "",
            feet: data.quantity,
            inches: data.inches,
            productCode: this.selectedEntryForQunaityChange?.product?.code,
            requestUOM: this.selectedEntryForQunaityChange?.uom.code,
            unit: this.selectedEntryForQunaityChange?.uom.code,
            requestedQty: data,
          },
          productType: "",
          selectedProduct: this.selectedEntryForQunaityChange,
          quantityChangeModal: true,
          onPrimaryAction: (response: any) =>
            this.updateQuantityPostModification(response, data),

          //  subProductType:this.initialState.solution[0].subProductType,
        },
      };
      this.modalRef = this.modalService.show(
        PostModificationAddCompanionProductsComponent,
        Object.assign(initialState, {
          class: "modal-xl modal-dialog-centered",
          backdrop: "static",
          keyboard: false,
        })
      );

      this.modalRef.content.solutions = [this.selectedEntryForQunaityChange];
      this.modalRef?.hide();
    } else {
    }
  }

  updateQuantityPostModification(data: any, value: any) {
    let payLoad = {
      orderCode: this.orderData?.orderCode,
      lineItems: [
        {
          feet: "",
          inches: "",
          lineNumber: this.selectedEntryForQunaityChange?.entryNumber,
          productCode: this.selectedEntryForQunaityChange?.product?.code,
          requestedQty: value,
          requestedUOM: this.selectedEntryForQunaityChange?.uom.code,
          solution: [data?.solutionEntries[0]],
        },
      ],
    };

    this.productService.continueFromOrdres(payLoad).subscribe({
      next: (res) => {
        this.getOrderIdDetails();
      },
      error: (err:any) => {
        this.progressHide();
      },
    });
  }
  routeToPostOrderModification() {
    this.router.navigate([
      "residential/post-modification/product-catalog-list/" + this.orderId,
    ]);
  }

  selectedEntryForDyeLotChange: any;
  openChangeDyeLotPopUp(entry: any) {
    this.selectedEntryForDyeLotChange = entry;
    this.changeDyeLotPopUp({
      orderDetails: this.orderData,
      selectedEntry: entry,
      onPrimaryAction: (data: any) => this.updateChangeDyeLot(data),
      onSecondaryAction: () => this.modalRef?.hide(),
    });
  }
  changeDyeLotPopUp(data: any) {
    const initialState: ModalOptions = {
      initialState: {
        // Data to  popup
        ...data,
      },
    };
    this.modalRef = this.modalService.show(
      ChangeDyelotModalComponent,
      Object.assign(initialState, {
        id: "8",
        class: "modal-md",
        backdrop: "static",
        keyboard: false,
      })
    );
  }

  updateChangeDyeLot(data: any) {
    this.isAtpCheck = this.atpCheckProductTypes.includes(
      this.selectedEntryForDyeLotChange?.product?.subProductType
    );

    if (this.isAtpCheck) {
      const initialState: ModalOptions = {
        initialState: {
          solutions: [this.selectedEntryForDyeLotChange],
          openFromaddressModal: true,
          showContinue: true,
          shippingAddress: {
            ...this.deliveryAddress,
            ...{
              id: undefined,
              defaultShippingMethod: this.orderData?.shippingConditions,
            },
          },
          cartData: [],
          feetyardForm: {
            dye: data,
            productCode: this.selectedEntryForDyeLotChange?.product?.code,
            requestUOM: this.selectedEntryForDyeLotChange?.uom.code,
            unit: this.selectedEntryForDyeLotChange?.uom.code,
            requestedQty:
              this.selectedEntryForDyeLotChange?.userRequestedQuantity,
          },
          productType: "",
          selectedProduct: this.selectedEntryForDyeLotChange,
          quantityChangeModal: true,
          onPrimaryAction: (response: any) =>
            this.updateDyeLotPostModification(response, data),

          //  subProductType:this.initialState.solution[0].subProductType,
        },
      };
      this.modalRef = this.modalService.show(
        PostModificationAddCompanionProductsComponent,
        Object.assign(initialState, {
          class: "modal-xl modal-dialog-centered",
          backdrop: "static",
          keyboard: false,
        })
      );
      this.modalRef.content.solutions = [this.selectedEntryForDyeLotChange];
      this.modalRef?.hide();
    } else {
    }
  }

  updateDyeLotPostModification(data: any, value: any) {
    let payLoad = {
      orderCode: this.orderData?.orderCode,
      lineItems: [
        {
          feet: this.selectedEntryForDyeLotChange?.quantity,
          inches: "",
          lineNumber: this.selectedEntryForDyeLotChange?.entryNumber,
          productCode: this.selectedEntryForDyeLotChange?.product?.code,
          specificDyeLot: "true",
          requestedQty: value,
          requestedUOM: this.selectedEntryForDyeLotChange?.uom.code,
          solution: data?.solutionEntries,
        },
      ],
    };
    this.messageError = "";
    this.spinnerLoading = true;
    this.productService.continueFromOrdres(payLoad).subscribe({
      next: (res: any) => {
        this.spinnerLoading = false;
        if (res?.body?.messages[0]?.status == "Error") {
          this.errorShow = true;
          this.alertType = "danger";
          this.messageError = this.customerFlag
            ? "Action could not be completed. Sales document is currently being processed. "
            : "Action could not be completed. " +
              res?.body?.messages[0]?.message;
          this.scrollPageToTop();
        } else {
          this.getOrderIdDetails();
        }
      },
      error: (err:any) => {
        this.progressHide();
        this.spinnerLoading = false;
        this.messageError = this.customerFlag
          ? "Action could not be completed. Sales document is currently being processed. "
          : "Action could not be completed. " + err?.body?.messages[0]?.message;
        this.scrollPageToTop();
      },
    });
  }

  cartIndexData: any = {};
  submittedShippingQues = false;
  shippingQuestionErrorMessage: string = "";
  shippingQuestionFormInit() {
    this.shippingQuestionFrom = this.fb.group({
      ContactName: [{ value: "", disabled: true }, [Validators.required]],
      Phone: [{ value: "", disabled: true }, [Validators.required]],
      Location: [{ value: null, disabled: true }],
      // notification: null,
      loading:  null,
      poleLiftRequired: null ,
      forkLiftRequired: null ,
      acknowledge: [false, [Validators.requiredTrue]],
      rdd: [new Date()],
      jobsiteDelivery: null ,
      appoinment: null,
      liftGate: null ,
      palletJack: { value: null, disabled: true } ,
      // insideDelivery: null,
      // whiteGloveDelivery: null,
      // multipleStops: null,
      storeNumber: { value: "", disabled: true } ,
      lastestacceptDate: { value: new Date(), disabled: true } ,
      truckSize: { value: null, disabled: true } ,
    });
  }

  shippingQuesValuePatch(responseData: any) {
    this.shippingQuestionFrom.setValue({
      ContactName: responseData?.siteContactName
        ? responseData?.siteContactName
        : "",
      Phone: responseData?.siteContactPhone
        ? responseData?.siteContactPhone
        : "",
      Location: responseData?.location ? responseData?.location : "",
      // notification: responseData?.requireNotification
      //   ? responseData?.requireNotification
      //   : false,
      loading: responseData?.loadingDock ? responseData?.loadingDock : false,
      poleLiftRequired: responseData?.poleLiftRequired
        ? responseData?.poleLiftRequired
        : false,
      forkLiftRequired: responseData?.forkLiftRequired
        ? responseData?.forkLiftRequired
        : false,
      acknowledge: responseData?.acknowledge
        ? responseData?.acknowledge
        : false,
      rdd: responseData?.rdd ? responseData?.rdd : new Date(),
      jobsiteDelivery: responseData?.jobSiteDelivery
        ? responseData?.jobSiteDelivery
        : false,
      appoinment: responseData?.apptNeeded ? responseData?.apptNeeded : false,
      liftGate: responseData?.liftGateAndPallet
        ? responseData?.liftGateAndPallet
        : false,
      palletJack: responseData?.palletJack ? responseData?.palletJack : false,
      // insideDelivery: responseData?.insideDelivery
      //   ? responseData?.insideDelivery
      //   : false,
      // whiteGloveDelivery: responseData?.whiteGloveDelivery
      //   ? responseData?.whiteGloveDelivery
      //   : false,
      // multipleStops: responseData?.multipleStops
      //   ? responseData?.multipleStops
      //   : false,
      storeNumber: responseData?.storeNumber ? responseData?.storeNumber : "",
      lastestacceptDate: responseData?.acceptDate
        ? new Date(responseData?.acceptDate)
        : new Date(),
      truckSize: responseData?.largestTruckSize
        ? responseData?.largestTruckSize
        : "",
    });
  }

  openShippingQuesForm(template: TemplateRef<any>, selectedProduct: any) {
    this.shippingQuestionFrom.reset();
    this.modalRef = this.modalService.show(template, {
      id: "shippingQuestionFormTemplate",
      class: "modal-xl modal-dialog-centered",
      backdrop: "static",
      keyboard: false,
    });

    if (this.orderData && this.orderData.shippingInfo) {
      this.shippingQuesValuePatch(this.orderData.shippingInfo);
    }
  }

  onSubmitShippingQuesForm(): void {
    this.submittedShippingQues = true;
    if (this.shippingQuestionFrom.valid) {
      let shippingQuesPayLoad = {
        orderCode: this.orderIdData,
        shippingInfo: {
          acceptDate: this.datePipe.transform(
            this.shippingQuestionFrom.value.lastestacceptDate,
            "yyyy-MM-dd"
          ), //"2023-02-20", //Date should be in yyyy-MM-dd format
          apptNeeded: this.shippingQuestionFrom.value.appoinment,
          forkLiftRequired: this.shippingQuestionFrom.value.forkLiftRequired,
          jobSiteDelivery: this.shippingQuestionFrom.value.jobsiteDelivery,
          liftGateAndPallet: this.shippingQuestionFrom.value.liftGate,
          loadingDock: this.shippingQuestionFrom.value.loading,
          palletJack: this.shippingQuestionFrom.value.palletJack,
          poleLiftRequired: this.shippingQuestionFrom.value.poleLiftRequired,
          largestTruckSize: this.shippingQuestionFrom.value.truckSize,
          location: this.shippingQuestionFrom.value.Location,
          siteContactName: this.shippingQuestionFrom.value.ContactName,
          siteContactPhone: this.shippingQuestionFrom.value.Phone,
          storeNumber: this.shippingQuestionFrom.value.storeNumber,
        },
      };
      this.spinnerLoading = true;
      this.orderService
        .editPostOrderModications(shippingQuesPayLoad)
        .subscribe((res: any) => {
          this.spinnerLoading = false;
          if (res.body && res.body.messages && res.body.messages.length > 0) {
            this.shippingQuestionErrorMessage = res.body.messages[0].message;
          }
          this.scrollToModalTop();
          this.scrollPageToTop();
          setTimeout(() => {
            this.shippingQuestionErrorMessage = "";
            this.getOrderIdDetails();
            this.modalRef?.hide();
          }, 1000);
        },(err:any)=>{
          this.progressHide();
        });
    }
  }

  private scrollToModalTop() {
    let top = document.getElementById("shipping-questions");
    if (top !== null) {
      top.scrollIntoView();
      top = null;
    }
  }

  onHideModal() {
    this.modalService.hide();
  }

  changeEventAcknowledge(event: any) {
    this.shippingQuestionFrom.patchValue({
      acknowledge: event?.state ? true : false,
    });
  }

  changeTickMark(
    val: boolean,
    id_first: string,
    id_second: string,
    key: string
  ) {
    this.shippingQuestionFrom.controls[key].setValue(val);
    if (this.shippingQuestionFrom.value[key]) {
      this.radioButtonCheckBoxes(id_first, true);
      this.radioButtonCheckBoxes(id_second, false);
    } else {
      this.radioButtonCheckBoxes(id_first, false);
      this.radioButtonCheckBoxes(id_second, true);
    }
  }

  radioButtonCheckBoxes(id: string, val: boolean) {
    let element: any = document.getElementById(id) as HTMLInputElement;
    element.checked = val;
  }

  get fques(): { [key: string]: AbstractControl } {
    return this.shippingQuestionFrom.controls;
  }

  validateNo(e: any) {
    const charCode = e.which ? e.which : e.keyCode;
    if (
      (charCode > 31 && (charCode < 48 || charCode > 57)) ||
      e.target.value.length == 13
    ) {
      return false;
    }
    return true;
  }

  checkPhoneValidation(e: any) {
    const phoneCharLength = 10;
    let val = e?.target?.value ? e.target.value : e;
    if (
      val.length == phoneCharLength &&
      this.shippingQuestionFrom.controls["Phone"].valid
    ) {
      this.shippingQuestionFrom.controls["Phone"].clearValidators();
      this.shippingQuestionFrom.controls["Phone"].updateValueAndValidity();
      this.shippingQuestionFrom.patchValue({
        Phone: this.convertToUsPhoneFormat(val),
      });

      this.shippingQuestionFrom.controls["Phone"].setValidators([
        Validators.required,
      ]);
      this.shippingQuestionFrom.controls["Phone"].updateValueAndValidity();
    } else {
      let onlyNumbers = this.clearSpeacialCharsFromPhoneNumber(val);
      if (onlyNumbers.length == phoneCharLength) {
        this.shippingQuestionFrom.patchValue({
          Phone: this.convertToUsPhoneFormat(onlyNumbers),
        });
        this.shippingQuestionFrom.controls["Phone"].setValidators([
          Validators.required,
        ]);
      } else {
        this.shippingQuestionFrom.patchValue({
          Phone: onlyNumbers,
        });
        this.shippingQuestionFrom.controls["Phone"].setValidators([
          Validators.required,
          Validators.pattern(this.phonePattern),
        ]);
      }
      this.shippingQuestionFrom.controls["Phone"].updateValueAndValidity();
    }
  }

  convertToUsPhoneFormat(val: any) {
    let formatedValue = "(";
    formatedValue += val.substring(0, 3) + ") ";
    formatedValue += val.substring(3, 6) + " ";
    formatedValue += val.substring(6, 10);
    return formatedValue;
  }

  clearSpeacialCharsFromPhoneNumber(val: any) {
    val = this.removeChar(val, " ");
    val = this.removeChar(val, " ");
    val = this.removeChar(val, "(");
    val = this.removeChar(val, ")");
    return val;
  }

  removeChar(val: any, char: any) {
    let index = val.indexOf(char);
    return index >= 0 ? val.slice(0, index) + val.slice(index + 1) : val;
  }
  navigateToProductPage(id: any) {
    this.router.navigate(["residential/products/details/" + id]);
  }
  showAssignedSqFtYrd(e: any) {
    if (e.checked) {
      this.showAssignedSpec = true;
    } else {
      this.showAssignedSpec = false;
    }
  }
  onSelectionChangeLargestTruck(event: any) {
    if (this.shippingQuestionFrom.value.truckSize) {
      this.showMessage = true;
    } else {
      this.showMessage = false;
    }
  }
  showShippedSqFtYrd(e: any) {
    if (e.checked) {
      this.showShippedSpec = true;
    } else {
      this.showShippedSpec = false;
    }
  }

  shipShippingMethod: any = [];
  // selectedShipShippingMethod: string = "";
  shipmethodDataForModal = {
    shippingMethod: "",
    carrierNumber: "",
    satelliteDesc: "",
    satellite: "",
  };
  selectedOrderItem: any = {};
  entryNumber: any = 0;
  carrierOptionList: any = [];
  selectedCarrierNumber: string = "";
  openShippingconditionModal(
    template: TemplateRef<any>,
    entryNumber: any,
    lineItem: any
  ) {
    this.shipmethodDataForModal = {
      shippingMethod:
        lineItem?.shippingConditions ||
        this.orderData?.shippingConditions ||
        "",
      carrierNumber: "",
      satelliteDesc: "",
      satellite: "",
    };
    this.deliveryAddress.satellite = undefined;
    if (this.shipmethodDataForModal.shippingMethod == "CA") {
      let shipTo = this.deliveryAddress?.shippingAddressID
        ? this.deliveryAddress?.shippingAddressID
        : this.deliveryAddress?.id;
      this.getVendorAccountNumbersForOrder(shipTo, shipTo);
    }
   /*  if (this.shipmethodDataForModal.shippingMethod == "PS") {
      this.shippingMethodZoneZipcodeDetermination(
        this.deliveryAddress.postalCode
      );
    } */
    this.carrierOptionList = [];
    this.selectedOrderItem = lineItem;
    this.entryNumber = entryNumber;
    this.shipShippingMethod = [];
    this.productService
      .getShippingMethodWithOutFlag(
        this.deliveryAddress.postalCode,
        this.orderData?.oneTimeShipTo === undefined
          ? false
          : this.orderData?.oneTimeShipTo,
        this.customerFlag || this.salesPersonFlag,
        this.shipViaSelectedOption
      )
      .subscribe((res: any) => {
        if (res?.body) {
          this.shipShippingMethod = [];
          for (let key of Object.entries(res?.body)) {
            this.shipShippingMethod.push({
              value: key[0],
              label: key[1],
            });
          }
        }
        this.modalRef = this.modalService.show(template, {
          id: "shipViaModal",
          class: "modal-md modal-dialog-centered",
          backdrop: "static",
          keyboard: false,
        });
      });
  }

  shippingMethodChange(event: any) {
    this.shipmethodDataForModal = {
      shippingMethod: event,
      carrierNumber: "",
      satelliteDesc: "",
      satellite: "",
    };
    this.carrierOptionList = [];
    this.deliveryAddress.satellite = undefined;
    if (event == "CA") {
      let shipTo = this.deliveryAddress?.shippingAddressID
        ? this.deliveryAddress?.shippingAddressID
        : this.deliveryAddress?.id;
      this.getVendorAccountNumbersForOrder(shipTo, shipTo);
    }
   /*  if (event == "PS") {
      this.shippingMethodZoneZipcodeDetermination(
        this.deliveryAddress.postalCode
      );
    } */
    this.getIncoTerms(event);
  }
  getIncoTerms(shipVia: any) {
    this.incoTermsOptions = [
      { value: "CLP", label: "Collect Beyond Prepaid" },
      { value: "PPA", label: "Prepay & add" },
      { value: "PPD", label: "Prepaid" },
      { value: "CLB", label: "Collect Beyond" },
    ];
    this.orderService.getIncoTerms(shipVia).subscribe({
      next: (res) => {
        if (Object.keys(res?.body).length > 0) {
          this.incoTermsOptions = [];
          for (let key of Object.entries(res?.body)) {
            this.incoTermsOptions.push({
              value: key[0],
              label: key[1],
            });
          }
        }
      },
        error: (err:any) => {
        this.progressHide();
      },
    });
  }

  getVendorAccountNumbersForOrder(shipTo: any, soldTo: any) {
    this.productService
      .getVendorAccountNumbersForOrderAPI(this.orderId, this.entryNumber)
      .subscribe((res: any) => {
        if (res?.status == 200) {
          this.carrierOptionList = res.body;
        } else {
          this.carrierOptionList = [
            "123453",
            "123451",
            "123452",
            "123455",
            "123454",
          ];
        }
      },(err:any)=>{
        this.progressHide();
      });
  }

  shippingMethodZoneZipcodeDetermination(zipcode: any) {
    this.productService
      .shippingMethodZoneZipcodeDeterminationAPI(zipcode)
      .subscribe((res: any) => {
        this.carrierOptionList = [];
        if (res?.status == 200) {
          this.deliveryAddress.satellite = res?.body;
          (this.shipmethodDataForModal.satellite = res?.body?.code),
            (this.shipmethodDataForModal.satelliteDesc =
              res?.body?.description);
        }
      },(err:any)=>{
        this.progressHide();
      });
  }

  getSelectedCarrierNumber(event: any) {
    //.log("getSelectedCarrierNumber=====>", event);
    this.shipmethodDataForModal.carrierNumber = event;
  }

  onSubmitViaSelectedCarrier() {
    const obj = {
      lineNumber: this.selectedOrderItem?.entryNumber,
      ProductCode: this.selectedOrderItem?.product?.code,
      feet: "",
      inches: "",
      requestedUOM: "",
      requestedQty: "",
      sidemark: "",
      shippingConditions: this.shipmethodDataForModal.shippingMethod,
      carrierNumber:
        this.shipmethodDataForModal.carrierNumber == ""
          ? undefined
          : this.shipmethodDataForModal.carrierNumber,
      satellite:
        this.shipmethodDataForModal.satellite == ""
          ? undefined
          : this.shipmethodDataForModal.satellite,
    };
    this.editPostOrderModications("", "", obj);
  }

  changeShippingMethod(value: any) {
    // debugger
    this.orderService.getIncoTerms(value).subscribe({
      next: (res) => {
        this.incoTermsOptions = [];
        for (let key of Object.entries(res?.body)) {
          this.incoTermsOptions.push({
            value: key[0],
            label: key[1],
          });
        }
        this.incoTermsSelectedOption = "";
      },
      error: (err:any) => {
        this.progressHide();
      },
    });
  }
  changeincoTermsOptions(event: any) {
    this.incoTermsSelectedOption = event;
  }

  viewBuilderDetails() {
    const initialState: ModalOptions = {
      initialState: {
        builderInfo: this.orderData?.builderInfo,
        fromPage: "orders",
      },
    };
    this.modalRef = this.modalService.show(
      BuilderDetailsComponent,
      Object.assign(initialState, {
        id: "builder-info",
        class: "modal-lg modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );
  }

  openShareViaEmailModal(pdfContent: any) {
    let mailSubject = `Mohawk Order details for ${this.orderIdData}`;
    const initialState: ModalOptions = {
      initialState: {
        mailSubject: mailSubject,
        content: pdfContent,
        senderInfo: this.userInfo,
      },
    };

    this.modalRef = this.modalService.show(
      ShareViaEmailLightboxComponent,
      Object.assign(initialState, {
        class: "modal-lg modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );
  }

  removeHoldCode(data: any, type: any, line?: any) {
    if (type == "head-level") {
      let pload = {
        holdCode: data.code,
        holdCodeAdded: false,
        lineItems: [],
        orderCode: this.orderData?.orderCode,
        type: "hold",
      };
      this.modalAction(pload, "");
    } else if (type == "line-level") {
      let pload = {
        lineItems: [
          {
            lineNumber: line,
            holdCode: data.code,
            holdCodeAdded: false,
          },
        ],
        orderCode: this.orderData?.orderCode,
        type: "hold",
      };
      this.modalAction(pload, "");
    }
  }
  isCompleteCart: boolean = false;
  selectedShipViaProduct: any;
  shippingWareHouseOptions: any = [];
  shippingWareHouseType: string = "";
  shipViaSelectedOption: any = "";
  shippingWareHouseSelectedOption: any = "";
  incoTermsLoc2SelectedOption: any;
  incoTermsLoc2SelectedHeaderOption: any;
  incoTermsLoc2Options: any = [];
  currentSelectedCartEntry: any = {};
  cartEntriesLength: any;
  pdbData: any;
  shippingWHDrodpDown:any;
  
  shipingWareHouseModal(
    template: TemplateRef<any>,
    type: any,
    cartIndexData: any,
    isCompleteCart: boolean
  ) {
    this.isCompleteCart = isCompleteCart;

    this.selectedShipViaProduct = cartIndexData;
    this.selectedShipViaProduct = cartIndexData;
   this.incoTermsSelectedOption = isCompleteCart ? this.orderData?.incoTerms || this.orderData?.defaultIncoTerms: cartIndexData.incoTerms || cartIndexData?.defaultIncoTerms;
    this.shippingWareHouseType = type;
    if (type === "shippingWareHouse" && !this.customerFlag && !this.salesPersonFlag) {
      this.shippingWareHouseOptions = [];
     
    this.shippingWareHouseSelectedOption =isCompleteCart ? this.orderData?.shippingWarehouse: cartIndexData.shippingWarehouse;
      this.productService
        .getShippingWareHouseWithOutFlag()
        .subscribe((res: any) => {
          if (res?.body) {
            if (!this.customerFlag && !this.salesPersonFlag) {
              this.shippingWareHouseOptions = [];
              for (let key of Object.entries(res?.body)) {
                this.shippingWareHouseOptions.push({
                  value: key[0],
                  label: key[1],
                });
              }
              this.incoTermsLoc2SelectedOption =
                cartIndexData?.shipVia ||
                cartIndexData?.defaultShipVia ||
                this.deliveryAddress?.defaultShipVia;
              this.getIncoTermsLoc2(
                this.isCompleteCart
                  ? this.orderData?.shippingWarehouse
                  : cartIndexData.shippingWarehouse
              );
            }
          }
          this.modalRef = this.modalService.show(template, {
            id: "shipingWareHouseModal",
            class: "modal-lg modal-dialog-centered",
            backdrop: "static",
            keyboard: false,
          });
        });
    } else {
      this.shippingWHDrodpDown = cartIndexData.shippingWarehouse;
      if (!this.customerFlag && !this.salesPersonFlag) {
        this.shippingWareHouseOptions.push({
          value: cartIndexData.shippingWarehouse,
          label: cartIndexData.shippingWarehouseDesc,
        });
        this.incoTermsLoc2SelectedOption = isCompleteCart? this.orderData?.shipVia:cartIndexData.shipVia || cartIndexData.defaultShipVia ||
          this.deliveryAddress?.defaultShipVia;
        this.getIncoTermsLoc2(
          this.isCompleteCart
            ? this.orderData?.shippingWarehouse
            : cartIndexData.shippingWarehouse
        );
      }
      this.modalRef = this.modalService.show(template, {
        id: "shipingWareHouseModal",
        class: "modal-lg modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      });
    }
  }

  getIncoTermsLoc2(shippingWareHouse: any) {
    this.spinnerLoading = true;

    let postalCode = this.deliveryAddress?.postalCode;
    if (this.deliveryAddress?.postalCode.includes("-")) {
      postalCode = this.deliveryAddress?.postalCode.split("-")[0];
    }
    this.orderService
      .getIncoTermsLoc2(
        postalCode,
        shippingWareHouse,
        this.shipViaSelectedOption
      )
      .subscribe({
        next: (res) => {
          this.incoTermsLoc2Options = [];

          if (res?.body && Object.keys(res?.body).length > 0) {
            const resObject = res?.body;
            const objectKeys = Object.keys(resObject).sort();
            objectKeys.forEach((key) => {
              this.incoTermsLoc2Options.push({
                value: resObject[key].shipvia,
                label: resObject[key].shipViaDesc,
                preferred: resObject[key].preferred
              });
            });
            this.spinnerLoading = false;
          } else {
            this.spinnerLoading = false;
          }
        },
        error: (err:any) => {
          this.progressHide();
          this.spinnerLoading = false;
        },
      });
  }
  closeShippingWareHouseModal() {
    this.modalService.hide("shipingWareHouseModal");
  }
  shippingWareHouseModalSubmit() {
    if (this.shipViaType === "incoTermsLoc2") {
      this.incoTermLoc2Submit();
      return;
    }
    const selectedShippingCondition = this.shipViaOptions.find(
      (item: any) => item.value === this.shipViaSelectedOption
    );

    const selectedIncoTerm = this.incoTermsOptions.find(
      (item: any) => item.value === this.incoTermsSelectedOption
    );

    const selectedItem = this.shippingWareHouseOptions.find(
      (item: any) => item.value === this.shippingWareHouseSelectedOption
    );
    const selectedIncoTermsItem = this.incoTermsLoc2Options.find(
      (item: any) => item.value === this.incoTermsLoc2SelectedOption
    );
    // this.getStorageService.getItem("shippingAddress").subscribe((res: any) => {
    // storedShippingAddress = res;

    if (selectedItem) {
      this.deliveryAddress.defaultShippingWarehouse = selectedItem?.value;
      this.deliveryAddress.defaultShippingWarehouseDesc = selectedItem?.label;
    }
    if (selectedIncoTermsItem) {
      this.deliveryAddress.defaultShipVia = selectedIncoTermsItem?.value;
      this.deliveryAddress.defaultShipViaDesc = selectedIncoTermsItem?.label;
    }
    // this.deliveryAddress.rdd =
    //   this.selectedShipViaProduct.requestedDeliveryDate;
    if (selectedShippingCondition) {
      this.deliveryAddress.defaultShippingMethod =
        selectedShippingCondition?.value;
      this.deliveryAddress.defaultShippingCondition =
        selectedShippingCondition?.value;
      this.deliveryAddress.defaultShippingConditionDesc =
        selectedShippingCondition?.label;
    }
    if (selectedIncoTerm) {
      this.deliveryAddress.defaultIncoTerms = selectedIncoTerm?.value;

      this.deliveryAddress.defaultIncoTermsDesc = selectedIncoTerm?.label;
    }

    // this.getStorageService.setItem(
    //   "shippingAddress",
    //   this.storedShippingAddress
    // );
    // });

    this.currentSelectedCartEntry = this.selectedShipViaProduct;
    //  if(this.totalItems>1){
    // this.getStorageService.setItem("updateIncoLine", this.currentSelectedCartEntry.entryNumber);
    // this.getStorageService.setItem("completeCart", this.cartData);
    if (this.isCompleteCart) {
      this.cartEntriesLength = this.orderData.orderEntries;
      // this.cancelCart();
      let currentIndex = 0;
      while (
        currentIndex < this.cartEntriesLength.length &&
        this.cartEntriesLength[currentIndex].status !== "IN PROGRESS" &&
        this.cartEntriesLength[currentIndex].status.includes("Cancelled")
      ) {
        currentIndex++;
      }

      if (currentIndex < this.cartEntriesLength.length) {
        const lineProduct = this.cartEntriesLength[currentIndex];
        this.getPdpData(lineProduct, "INC1");
      }
    } else {
      this.cartEntriesLength = [];
    
      this.getPdpData(this.currentSelectedCartEntry, "INC1");
      //  }
    }
  }

  getPdpDataForShipWarehouse(lineProduct: any) {
    this.productService
      .getPdpRecords(lineProduct.product.code, this.substituteProductFlag)
      .subscribe((res) => {
        if (res && res.status == 500) {
        }
        if (res && res.status == 400) {
        }
        if (res.body) {
          this.pdbData = res.body;
          // this.pdbData=[...this.pdbData]
          if (this.pdbData) {
            const initialState: ModalOptions = {
              initialState: {
                fromViewInventory: false,
                solutions: [this.pdbData],
                openFromaddressModal: false,
                shippingAddress: this.deliveryAddress,
                cartData: null,
                feetyardForm: {
                  unit: lineProduct.uom.code,
                  quantity: "",
                  feet: 0,
                  inches: 0,
                  dye: "",
                  targetLength: "",
                  minLength: "",
                  maxLength: "",
                  maxFeet: "",
                  maxInches: "",
                  minFeet: "",
                  minInches: "",
                  requestedQty: lineProduct.userRequestedQuantity,
                },
                productType: this.pdbData.productType.toUpperCase(),
                aptCheckEntrie: [],
                multiCutIndication: false,
                viewInventory: false,
                oneTimeShippingFlag: false,
                atpCheckFromCart: () => {
                  for (let i = 1; i < this.cartEntriesLength.length; i++) {
                    this.getPdpDataForShipWarehouse(this.cartEntriesLength[i]);
                  }
                },
              },

              id: "AddCompanionProductsComponent",
              class: "modal-xl modal-dialog-centered",
            };
            this.modalRef = this.modalService.show(
              PostModificationAddCompanionProductsComponent,
              Object.assign(initialState, {
                id: "AddCompanionProductsComponent",
                class: "modal-xl modal-dialog-centered",
                backdrop: "static",
                keyboard: false,
              })
            );

            this.modalRef.content.solutions = [this.pdbData];
            this.modalRef?.hide();
          }
          // this.productType = this.pdbData.productType;
        }
      });
  }
  changeIncoTermsLoc2Options(event: any) {
    //  if (this.isCompleteCart == false) {
    this.incoTermsLoc2SelectedOption = event;
    //   this.incoTermsLoc2SelectedHeaderOption = "";
    // } else {
    //   this.incoTermsLoc2SelectedOption = "";
    //   this.incoTermsLoc2SelectedHeaderOption = event;
    // }
  }
  changeShippingWareHouseOptions(event: any) {
    this.shippingWareHouseSelectedOption = event;

    this.getIncoTermsLoc2(this.shippingWareHouseSelectedOption);
  }
  incoTermModalSubmit() {
    let lineItemOBj: any = [];
    this.messageError = "";
    if (this.isCompleteCart == false) {
      lineItemOBj = {
        incoTerms: this.incoTermsSelectedOption,
        postOrderIndicator: "POST",
        lineNumber: this.lineChangeDate?.entryNumber,
        ProductCode: this.lineChangeDate?.product?.code,
        //    requestedDeliveryDate:this.lineChangeDate?.requestedDeliveryDate,
      };
    } else {
      this.spinnerLoading = true;
      this.orderData?.orderEntries?.forEach((item: any) => {
        let newItem = {
          incoTerms: this.incoTermsSelectedOption,
          postOrderIndicator: "POST",
          lineNumber: item.entryNumber,
          ProductCode: item.product?.code || "",
          //    requestedDeliveryDate:item.requestedDeliveryDate,
        };
        lineItemOBj.push(newItem);
      });
    }

    let payload = {
      postOrderIndicator: "POST",
      orderCode: this.orderIdData,
      comments: "",
      internalComment: "",
      shipComplete: this.selectedShipModal,
      deliveryGrouping: this.shipAsGroup,

      poNumber: "",
      // requestedDeliveryDate: this.requestDeliveryDate,
      lineItems: lineItemOBj,
      shippingInfo: {},
      // shippingMethod: this.shippingConditions,
      shippingCondition: this.shippingConditions,
      incoTerms:
        this.incoTermsSelectedOption == ""
          ? undefined
          : this.incoTermsSelectedOption,
    };
    this.orderService
      .editPostOrderModications(payload)
      .subscribe((data: any) => {
        this.scrollPageToTop();
        this.getOrderIdDetails();
        this.spinnerLoading = false;
        this.modalRef?.hide();

        if (data.body.messages[0].status == "Error") {
          this.errorShow = true;
          this.alertType = "danger";
          this.scrollPageToTop();
          this.modalRef?.hide();
          this.messageError = this.customerFlag
            ? "Action could not be completed. Sales document is currently being processed. "
            : "Action could not be completed. " + data.body.messages[0].message;
        }
      },(err:any)=>{
        this.progressHide();
      });
  }

  incoTermLoc2Submit() {
    let lineItemOBj: any = [];
    if (this.isCompleteCart == false) {
      lineItemOBj = {
        shipVia: this.incoTermsLoc2SelectedOption,
        postOrderIndicator: "POST",
        lineNumber: this.lineChangeDate?.entryNumber,
        ProductCode: this.lineChangeDate?.product?.code,
        //    requestedDeliveryDate:this.lineChangeDate?.requestedDeliveryDate,
      };
    } else {
      this.spinnerLoading = true;
      this.orderData?.orderEntries?.forEach((item: any) => {
        let newItem = {
          shipVia: this.incoTermsLoc2SelectedOption,
          postOrderIndicator: "POST",
          lineNumber: item.entryNumber,
          ProductCode: item.product?.code || "",
          //    requestedDeliveryDate:item.requestedDeliveryDate,
        };
        lineItemOBj.push(newItem);
      });
    }

    let payload = {
      postOrderIndicator: "POST",
      orderCode: this.orderIdData,
      comments: "",
      internalComment: "",
      shipComplete: this.selectedShipModal,
      deliveryGrouping: this.shipAsGroup,
      poNumber: "",
      // requestedDeliveryDate: this.requestDeliveryDate,
      lineItems: lineItemOBj,
      shippingInfo: {},
      // shippingMethod: this.shippingConditions,
      shippingCondition: this.shippingConditions,
      shipVia:
        this.incoTermsLoc2SelectedOption == ""
          ? undefined
          : this.incoTermsLoc2SelectedOption,
    };
    this.orderService
      .editPostOrderModications(payload)
      .subscribe((data: any) => {
        this.scrollPageToTop();
        this.getOrderIdDetails();
        this.spinnerLoading = false;
        this.modalRef?.hide();

        if (data.body.messages[0].status == "Error") {
          this.errorShow = true;
          this.alertType = "danger";
          this.scrollPageToTop();
          this.modalRef?.hide();
          this.messageError = this.customerFlag
            ? "Action could not be completed. Sales document is currently being processed. "
            : "Action could not be completed. " + data.body.messages[0].message;
        }
      },(err:any)=>{
        this.progressHide();
      });
  }
  incoTermSubmit() {
    // this.getStorageService.setItem("completeCart", this.cartData);
    if (this.shipViaType === "incoTerms") {
      this.incoTermModalSubmit();
      return;
    }
    if (this.isCompleteCart) {
      this.cartEntriesLength = this.orderData.orderEntries;
      // debugger
      // this.cancelCart();
      this.getPdpData(this.cartEntriesLength[0], "POST");
    } else {
      this.cartEntriesLength = [];
      this.getPdpData(this.currentSelectedCartEntry, "POST");
      // };
    }
  }
  substituteProductFlag: boolean = false;
  getPdpData(lineProduct: any, postOrderIndicator: any) {
    // debugger
    this.productService
      .getPdpRecords(lineProduct.product.code, this.substituteProductFlag)
      .subscribe((res) => {
        // this.setLoadAPI("pdpData");
        // this.scrollPageToTop();
        if (res && res.status == 500) {
          // this.exceptionErrorMessage = res.error;
          // this.setLoadAPI("uomData");
        }
        if (res && res.status == 400) {
          // this.exceptionErrorMessage = res.error.message
          // ? res.error.message
          // : res.message;
          // this.setLoadAPI("uomData");
        }
        if (res.body) {
          this.pdbData = res.body;
          const atpCheckProductTypes = JSON.parse(
            ResidentialPlpTypes.atpCheckProductTypes
          );
          let isAtpCheck = atpCheckProductTypes.includes(
            this.pdbData.subProductType
          );

          this.productService
            .getUOMDetails(res.body.code)
            .subscribe((result) => {
              if (
                this.pdbData.subProductType == "RESILIENT_VINYL" &&
                // (this.pdbData.sellingBackingName == "VINYL TILE" ||
                //   this.pdbData.sellingBackingName == "Vinyl Tile") &&
                result?.body?.erpProductCategory == "S"
              ) {
                isAtpCheck = false;
              }

              this.addAccessoriesAddcart(
                lineProduct,
                isAtpCheck,
                postOrderIndicator
              );
            });

          // this.pdbData=[...this.pdbData]

          // this.productType = this.pdbData.productType;
        }
      },(err:any)=>{
        this.progressHide();
      });
  }
  addAccessoriesAddcart(
    lineProduct: any,
    isAtpCheck: boolean,
    postOrderIndicator: any
  ) {
    // debugger
    this.messageError = "";
    const feetYardFormData = {
      unit: lineProduct.uom.code,
      quantity: "",
      feet: 0,
      inches: 0,
      dye: "",
      targetLength: "",
      minLength: "",
      maxLength: "",
      maxFeet: "",
      maxInches: "",
      minFeet: "",
      minInches: "",
      requestedQty: lineProduct.userRequestedQuantity,
      productCode: lineProduct.product?.code,
    };
    if (isAtpCheck) {
      if (this.pdbData) {
        const initialState: ModalOptions = {
          initialState: {
            shippingAddress: {
              ...this.deliveryAddress,
              ...{
                id: undefined,
              },
            },
            orderData: this.orderData,
            orderCode: this.orderData?.orderCode,
            atpUniqueId: lineProduct.atpUniqueId,
            fromViewInventory: false,
            aptCheckEntrie: [],
            solutions: [this.pdbData],
            feetyardForm: feetYardFormData,
            lineProduct: lineProduct,
            incoTerms: this.deliveryAddress.defaultIncoTerms,
            shippingCondition: this.deliveryAddress.defaultShippingCondition,
            shippingWarehouse: this.deliveryAddress.defaultShippingWarehouse,
            shipVia: this.deliveryAddress.defaultShipVia,
            postOrderIndicator: postOrderIndicator,
            multiCutIndication: false,
            viewInventory: false,
            rdd: this.orderData.requestedDeliveryDate,
            productType: this.pdbData.productType.toUpperCase(),
            forShippingReATP: true,
            entryNumber: lineProduct.entryNumber,
            entryLength: this.cartEntriesLength.length,
            ...(lineProduct.specifiedDyeLot === true
              ? { specifiedDyeLot: lineProduct.specifiedDyeLot }
              : {}),
            //  ...(this.atpFromCart === true ? { reInspect: entriesData?.isReinspect || false } : {}),
            // isReinspect:this.reInspect,
            ...(this.reInspect === true && this.orderData.reInspect === false
              ? { reInspect: this.reInspect }
              : {}),

            atpCheckFromCart: (entryNumber: any) => {
              this.entryNumber = this.entryNumber + 1;
              let currentIndex = this.entryNumber;
              while (
                currentIndex < this.cartEntriesLength.length &&
                this.cartEntriesLength[currentIndex].status !== "IN PROGRESS" &&
                this.cartEntriesLength[currentIndex].status.includes(
                  "Cancelled"
                )
              ) {
                currentIndex++;
              }

              if (currentIndex < this.cartEntriesLength.length) {
                this.getPdpData(
                  this.cartEntriesLength[currentIndex],
                  postOrderIndicator
                );
              } else {
                //  this.cancelReserve();
              }

              // for (
              //   let i = entryNumber;
              //   i < this.cartEntriesLength.length;
              //   i++
              // ) {
              //   setTimeout(() => {
              //     this.getPdpData(this.cartEntriesLength[i], postOrderIndicator);
              //   }, 5000);

              // }
            },
          },

          id: "AddCompanionProductsComponent",
          class: "modal-xl modal-dialog-centered",
        };

        this.modalRef = this.modalService.show(
          PostModificationAddCompanionProductsComponent,
          Object.assign(initialState, {
            id: "AddCompanionProductsComponent",
            class: "modal-xl modal-dialog-centered",
            backdrop: "static",
            keyboard: false,
          })
        );

        this.modalRef.content.solutions = [this.pdbData];
        this.spinnerLoading = false;
        //   this.modalRef?.hide();
      }
    } else {
      let lineItemOBj: any = [];
      if (this.isCompleteCart == false) {
        this.spinnerLoading = true;
        lineItemOBj = {
          shipVia:
            lineProduct.shipVia === this.incoTermsLoc2SelectedOption
              ? ""
              : this.incoTermsLoc2SelectedOption,

          postOrderIndicator: "POST",
          lineNumber: lineProduct?.entryNumber,
          ProductCode: lineProduct?.product?.code,
          shippingCondition:
            lineProduct?.shippingCondition === this.shipViaSelectedOption
              ? ""
              : this.shipViaSelectedOption,
          shippingWarehouse:
            lineProduct?.shippingWarehouse ===
            this.shippingWareHouseSelectedOption
              ? ""
              : this.shippingWareHouseSelectedOption,
          incoTerms:
            lineProduct?.incoTerms === this.incoTermsSelectedOption
              ? ""
              : this.incoTermsSelectedOption,
          ...(this.reInspect === true && this.orderData.reInspect === false
            ? { reInspect: this.reInspect }
            : {}),
          sameDyeLot: this.orderData.sameDyeLot || true,
          solution: [],
          //    requestedDeliveryDate:this.lineChangeDate?.requestedDeliveryDate,
        };
      } else {
        this.spinnerLoading = true;

        //   this.orderData?.orderEntries?.forEach((item: any) => {
        let newItem = {
          shipVia:
            lineProduct?.shipVia === this.incoTermsLoc2SelectedOption
              ? ""
              : this.incoTermsLoc2SelectedOption,
          postOrderIndicator: "POST",
          lineNumber: lineProduct?.entryNumber,
          ProductCode: lineProduct?.product?.code,
          shippingCondition:
            lineProduct?.shippingCondition === this.shipViaSelectedOption
              ? ""
              : this.shipViaSelectedOption,
          shippingWarehouse:
            lineProduct?.shippingWarehouse ===
            this.shippingWareHouseSelectedOption
              ? ""
              : this.shippingWareHouseSelectedOption,
          incoTerms:
            lineProduct?.incoTerms === this.incoTermsSelectedOption
              ? ""
              : this.incoTermsSelectedOption,
          ...(this.reInspect === true && this.orderData.reInspect === false
            ? { reInspect: this.reInspect }
            : {}),
          sameDyeLot: this.orderData.sameDyeLot || true,
          solution: [],
        };
        lineItemOBj.push(newItem);
        //   });
      }

      let payload = {
        orderCode: this.orderIdData,

        // shipComplete: this.selectedShipModal,
        // deliveryGrouping: this.shipAsGroup,
        lineItems: lineItemOBj,
      
      };
      this.postProductService
        .updatePostOrder(payload)
        .subscribe((data: any) => {
          if (data.statusText === "Unknown Error" || data.ok === false) {
            this.errorShow = true;
            this.alertType = "danger";
            this.scrollPageToTop();
            this.messageError = "Add to Cart Time Out";
            // this.getOrderIdDetails();
            this.spinnerLoading = false;

            this.modalRef?.hide();
          } else if (data?.body?.messages[0].status == "Error") {
            this.errorShow = true;
            this.alertType = "danger";
            this.scrollPageToTop();
            this.modalRef?.hide();
            this.spinnerLoading = false;

            this.modalRef?.hide();
            this.messageError = this.customerFlag
              ? "Action could not be completed. Sales document is currently being processed. "
              : "Action could not be completed. " +
                data.body.messages[0].message;
          } else if (
            (data?.statusText == "OK" && data?.status === 200) ||
            data?.body?.messages[0].status === "Success"
          ) {
            if (this.isCompleteCart) {
              this.entryNumber = this.entryNumber + 1;
              // this.atpCheckFromCart();
              if (lineProduct.entryNumber < this.cartEntriesLength.length) {
                this.getPdpData(
                  this.cartEntriesLength[lineProduct.entryNumber],
                  "POST"
                );
              } else {
                this.scrollPageToTop();
                this.getOrderIdDetails();
                this.spinnerLoading = false;

                this.modalRef?.hide();
              }
            } else {
              this.scrollPageToTop();
              this.modalRef?.hide();
              this.getOrderIdDetails();
              this.spinnerLoading = false;
            }
          } else {
            this.scrollPageToTop();
            this.getOrderIdDetails();
            this.spinnerLoading = false;
            this.modalRef?.hide();
          }
        },(err:any)=>{
          this.progressHide();
        });

      // this.submitPoModifications(lineProduct, postOrderIndicator);
    }
  }
  submitPoModifications(lineProduct: any, postOrderIndicator: any) {
    let lineItemOBj: any = [];
    this.messageError = "";
    if (this.isCompleteCart == false) {
      lineItemOBj = {
        shipVia: this.incoTermsLoc2SelectedOption,
        postOrderIndicator: postOrderIndicator,
        lineNumber: lineProduct?.entryNumber,
        ProductCode: lineProduct?.product?.code,
        shippingCondition: this.shipViaSelectedOption,
        shippingWarehouse: this.shippingWareHouseSelectedOption,
        incoTerm: this.incoTermsSelectedOption,

        //    requestedDeliveryDate:this.lineChangeDate?.requestedDeliveryDate,
      };
    } else {
      this.spinnerLoading = true;
      this.orderData?.orderEntries?.forEach((item: any) => {
        let newItem = {
          shipVia: this.incoTermsLoc2SelectedOption,
          postOrderIndicator: postOrderIndicator,
          lineNumber: item.entryNumber,
          ProductCode: item.product?.code || "",
          shippingCondition: this.shipViaSelectedOption,
          shippingWarehouse: this.shippingWareHouseSelectedOption,
          requestedDeliveryDate: item.requestedDeliveryDate,
          incoTerm: this.incoTermsSelectedOption,
        };
        lineItemOBj.push(newItem);
      });
    }

    let payload = {
      postOrderIndicator: postOrderIndicator,
      orderCode: this.orderIdData,
      comments: "",
      internalComment: "",
      shipComplete: this.selectedShipModal,
      deliveryGrouping: this.shipAsGroup,

      poNumber: "",
      // requestedDeliveryDate: this.requestDeliveryDate,
      lineItems: lineItemOBj,
      shippingInfo: {},
      // shippingMethod: this.shippingConditions,
      shippingCondition: this.shipViaSelectedOption,
      shipVia:
        this.incoTermsLoc2SelectedOption == ""
          ? undefined
          : this.incoTermsLoc2SelectedOption,
      incoTerms: this.incoTermsSelectedOption,
      shippingWarehouse: this.shippingWareHouseSelectedOption,
    };
    this.orderService
      .editPostOrderModications(payload)
      .subscribe((data: any) => {
        this.scrollPageToTop();
        this.getOrderIdDetails();
        this.spinnerLoading = false;
        this.modalRef?.hide();

        if (data.body.messages[0].status == "Error") {
          this.errorShow = true;
          this.alertType = "danger";
          this.scrollPageToTop();
          this.modalRef?.hide();
          this.messageError = this.customerFlag
            ? "Action could not be completed. Sales document is currently being processed. "
            : "Action could not be completed. " + data.body.messages[0].message;
        }
      },(err:any)=>{
        this.progressHide();
      }); 
  }
  errorType: string = "danger";
  openAccessoriesModal(data: any) {
    const initialState: ModalOptions = {
      initialState: {
        productCode: data?.product?.code,
        data: data,
        getUpdatedAccessories: (obj: any) => {
          this.modalRef?.hide();
          this.getOrderIdDetails();
          this.errorsArray =
            obj.msg?.length > 0
              ? obj.msg.map((message: any) => {
                  return {
                    ...message,
                    message:
                      obj?.status?.toLowerCase() == "error"
                        ? this.customerFlag
                          ? "Action could not be completed. Sales document is currently being processed. "
                          : "Action could not be completed. " + message.message
                        : message.message,
                  };
                })
              : [{ message: "" }];
          this.scrollPageToTop();
          this.errorType =
            obj?.status?.toLowerCase() == "success" ? "success" : "danger";
        },
      },
    };
    this.bsModalRef = this.modalService.show(
      AddAccessoriesComponent,
      Object.assign(initialState, {
        class: "modal-xl modal-dialog-centered residentialOrderAddAccessories",
        backdrop: "static",
        keyboard: false,
      })
    );
  }

  onSelectCustomerName(event: any) {
    if (event?.item) {
      let fullName = `${event?.item?.firstName}  ${event?.item?.lastName}`;
      const email = event?.item?.email;
      this.cancelOrderStepForm2.patchValue({
        cancelledCustName: fullName,
        cancelledCustEmail: email,
      });
    }
  }

  combinedShippingWarehouse: boolean = false;
  combineChangeshippingWareHOuseOptions(event: any) {
    this.shippingWareHouseSelectedOption = event;
    this.getIncoTermsLoc2(event);
    this.combinedShippingWarehouse = true;
  }
  changeshippingWareHOuseOptions(event: any) {
    this.shippingWareHouseSelectedOption = event;
  }

  combinedShippingInfo(templateType: any, lineItem: any, isCompleteCart: any) {
    this.shipViaOptions = [];
    this.isCompleteCart = isCompleteCart;
    this.selectedShipViaProduct = lineItem;
    this.shipViaSelectedOption =
    isCompleteCart ? this.orderData?.shippingConditions:lineItem?.shippingCondition;
    this.shippingWareHouseSelectedOption = isCompleteCart ?
      this.orderData?.shippingWarehouse || "":lineItem?.shippingWarehouse;
    this.productService
      .getShippingMethodWithOutFlag(
        this.deliveryAddress?.postalCode,
        this.orderData?.oneTimeShipTo === undefined
          ? false
          : this.orderData?.oneTimeShipTo,
        this.customerFlag || this.salesPersonFlag,
        this.shipViaSelectedOption
      )
      .subscribe((res: any) => {
        if (res?.body) {
          for (let key of Object.entries(res?.body)) {
            this.shipViaOptions.push({
              value: key[0],
              label: key[1],
            });
          }

          this.shipViaSelectedOption = isCompleteCart ? this.orderData?.shippingConditions:
            lineItem?.shippingCondition || this.shipViaOptions[0];

          this.shippingWareHouseSelectedOption = isCompleteCart ?  this.orderData?.shippingWarehouse:
            lineItem?.shippingWarehouse || this.shipViaOptions[0];
          this.incoTermsSelectedOption = isCompleteCart ? this.orderData?.incoTerms :lineItem?.incoTerms;
          this.shippingWareHouseOptions = [];
            this.shippingWareHouseOptions.push({
              value: isCompleteCart ? this.orderData?.shippingWarehouse:lineItem?.shippingWarehouse,
              label: isCompleteCart ? this.orderData?.shippingWarehouseDesc:lineItem?.shippingWarehouseDesc,
            });
          this.selectedOption = this.shipViaOptions.find(
            (item: any) => item.value === this.shipViaSelectedOption
          );
          this.currentSelectedCartEntry = lineItem;
          if (this.customerFlag || this.salesPersonFlag) {
            this.shipViaSelectedOption = isCompleteCart ? this.orderData?.shippingConditions || this.deliveryAddress?.defaultShippingMethod ||
            this.shipViaOptions[0]?.value: lineItem?.shippingCondition ||
              this.deliveryAddress?.defaultShippingMethod ||
              this.shipViaOptions[0]?.value;
            this.incoTermsSelectedOption = isCompleteCart ? this.orderData?.incoTermsDesc:
              lineItem?.defaultIncoTermsDesc || this.incoTermsOptions[0]?.label;
            this.shippingWareHouseOptions = [];
            this.shippingWareHouseOptions.push({
              value: isCompleteCart ? this.orderData?.shippingWarehouse:lineItem?.shippingWarehouse,
              label: isCompleteCart ? this.orderData?.shippingWarehouseDesc:lineItem?.shippingWarehouseDesc,
            });
            this.incoTermsOptions = [];
            this.incoTermsOptions.push({
              value: isCompleteCart ? this.orderData?.incoTerms:lineItem?.incoTerms || lineItem?.defaultIncoTerms,
              label: isCompleteCart ? this.orderData?.incoTermsDesc:lineItem?.incoTermsDesc  || lineItem?.defaultIncoTermsDesc
            });
            this.incoTermsLoc2Options = [];
            this.incoTermsLoc2Options.push({
              value: isCompleteCart ? this.orderData?.shipVia:lineItem?.shipVia || lineItem?.defaultShipVia,
              label: isCompleteCart ? this.orderData?.shipVia:lineItem?.shipViaDesc  || lineItem?.defaultShipViaDesc
            })
            this.incoTermsLoc2SelectedOption = isCompleteCart ? this.orderData?.shipVia:lineItem.shipVia;
           
          }
          if (!this.customerFlag && !this.salesPersonFlag) {
            this.getIncoTerms(this.shipViaSelectedOption);
          }
        }
        if (this.isCompleteCart) {
          this.shipingWareHouseModal(
            templateType,
            "shippingWareHouse",
            lineItem,
            true
          );
        } else {
          this.shipingWareHouseModal(
            templateType,
            "shippingWareHouse",
            lineItem,
            false
          );
        }
      });
   
  }
  selectedOption: any;
  changeshipViaOptions(event: any) {
    this.incoTermsLoc2SelectedOption = null;
    if (this.selectedOption?.value != event) {
      /* let originalShippingMethod = this.userInfo?.isCustomer || this.userInfo?.isSalesOps || this.userInfo?.isSalesPerson ? this.selectedOption.value == 'MA' || this.selectedOption.value == 'MN' ? 'MF':this.selectedOption.value:this.selectedOption.value;
      let originalShippingTo = this.userInfo?.isCustomer || this.userInfo?.isSalesOps || this.userInfo?.isSalesPerson ? event == 'MA' || event == 'MN' ? 'MF':event:event;
      this.orderService
        .isShippingMethodReAtpRequired(originalShippingMethod, originalShippingTo)
        .subscribe((result: any) => {
          this.combinedShippingWarehouse = result.body;
        }); */
    }
    this.selectedOption = this.shipViaOptions.find(
      (item: any) => item.value === event
    );
    
    this.storageService.setItem("atpCheckFromCart", this.selectedOption);
    this.shipViaSelectedOption = event;
    if (this.customerFlag || this.salesPersonFlag) {
      this.spinnerLoading = false;

      
      this.orderService
        .getShippingoptionForCustomers(
          this.deliveryAddress?.postalCode,
          this.shipViaSelectedOption,
          this.shippingWareHouseSelectedOption,
          this.orderData.oneTimeShipTo === undefined
            ? false
            : this.orderData?.oneTimeShipTo,
           this.userInfo.orgUnit.uid,
        )
        .subscribe({
          next: (res) => {
            this.spinnerLoading = false;
            this.incoTermsSelectedOption = null;
            this.incoTermsSelectedHeaderOption = null;
            this.incoTermsOptions = [];
            this.incoTermsLoc2SelectedOption = [];
            this.incoTermsLoc2Options = [];
            this.originalDefaultSM = res.body?.originalDefaultShippingMethod;
            this.originalDefaultShippingMethod = res.body?.originalDefaultShippingMethod;
            this.deliveryAddress.originalDefaultShippingMethod  = res.body?.originalDefaultShippingMethod;
            this.incoTermsOptions.push({
              value: res.body.incoTerms,
              label: res.body.incoTermsDesc,
            });

            
            if(res.body.shipvia){
              this.incoTermsLoc2Options.push({
                value: res.body.shipvia,
                label: res.body.shipViaDesc,
              });
            }
            this.shippingWareHouseOptions = [];

            this.shippingWareHouseOptions.push({
              value: res?.body?.shippingWarehouse ||  (this.isCompleteCart ? this.orderData?.shippingWarehouse : this.selectedShipViaProduct?.shippingWarehouse),
              label: res?.body?.shippingWarehouseDesc || (this.isCompleteCart ? this.orderData?.shippingWarehouseDesc :this.selectedShipViaProduct?.shippingWarehouseDesc),
            });
            this.incoTermsSelectedOption = this.incoTermsOptions[0].value;
            this.shippingWareHouseSelectedOption = this.shippingWareHouseOptions[0].value;
            this.incoTermsLoc2SelectedOption = res.body.shipvia;
          },
          error: (err:any) => {
            this.spinnerLoading = false;
            this.progressHide();
          },
        });
    }
    if (!this.customerFlag && !this.salesPersonFlag) {
      this.incoTermsSelectedOption = null;
      this.incoTermsSelectedHeaderOption = null;
      this.getIncoTerms(this.shipViaSelectedOption);
      this.getIncoTermsLoc2(this.shippingWareHouseSelectedOption);
    }
  }
  submitCombinedShippingInfo() {
    if (this.combinedShippingWarehouse == true) {
      this.openConfirmationModal({
        title: "Confirmation",
        content: `You're about to update the order details. Are you sure you want to continue?`,
        primaryActionLabel: "Confirm",
        secondaryActionLabel: "Cancel",
        onPrimaryAction: () => {
          this.shippingWareHouseModalSubmit();
          this.hideConfirmationModal()
        },
        onSecondaryAction: () => {
          this.closeShippingWareHouseModal();
          this.hideConfirmationModal()
        },
      });
    } else {
      this.changeShippingOption();
    }
  }
  changeReInspectEvent(event: any, isCompleteCart: boolean, lineItem: any) {
    console.log("inside of changeReInspectEvent");
    if (event.state == true && lineItem.reInspect == false) {
      this.reInspect = event.state;
      this.isCompleteCart = isCompleteCart;
      this.isAtpCheck = this.atpCheckProductTypes.includes(
        lineItem.product.subProductType
      );
      if (this.isAtpCheck === true) {
        this.selectedShipViaProduct = lineItem;

        this.shippingWareHouseModalSubmit();
      } else {
        this.orderData?.orderEntries.forEach((item: any) => {
          if (item.entryNumber == lineItem.entryNumber) {
            item.reInspect = this.reInspect;
          }
        });
        this.submitReInspect(lineItem);
      }
    }
  }
  submitReInspect(lineProduct: any) {
    let lineItemOBj: any = [];
    this.messageError = "";
    lineItemOBj = {
      postOrderIndicator: "POST",
      lineNumber: lineProduct?.entryNumber,
      ProductCode: lineProduct?.product?.code,

      reInspect: lineProduct.reInspect,

      //    requestedDeliveryDate:this.lineChangeDate?.requestedDeliveryDate,
    };

    let payload = {
      orderCode: this.orderIdData,

      shipComplete: this.selectedShipModal,
      deliveryGrouping: this.shipAsGroup,

      poNumber: "",
      // requestedDeliveryDate: this.requestDeliveryDate,
      lineItems: lineItemOBj,
      shippingInfo: {},
      // shippingMethod: this.shippingConditions,
      //shippingCondition: this.shipViaSelectedOption,
    };
    this.orderService
      .editPostOrderModications(payload)
      .subscribe((data: any) => {
        this.scrollPageToTop();
        this.getOrderIdDetails();
        this.spinnerLoading = false;
        this.modalRef?.hide();

        if (data.body.messages[0].status == "Error") {
          this.errorShow = true;
          this.alertType = "danger";
          this.scrollPageToTop();
          this.modalRef?.hide();
          this.messageError = this.customerFlag
            ? "Action could not be completed. Sales document is currently being processed. "
            : "Action could not be completed. " + data.body.messages[0].message;
        }
      },(err:any)=>{
        this.progressHide();
      });
  }

  changeShippingOption() {
    let lineItemOBj: any = [];
    let payload: any = [];
    this.messageError = "";
    if (this.isCompleteCart == false) {
      this.spinnerLoading = true;
      lineItemOBj = {
        shipVia:
          this.selectedShipViaProduct?.shipVia ===
          this.incoTermsLoc2SelectedOption
            ? ""
            : this.incoTermsLoc2SelectedOption,
        postOrderIndicator: "POST",
        lineNumber: this.selectedShipViaProduct?.entryNumber,
        ProductCode: this.selectedShipViaProduct?.product?.code,
        shippingCondition: 
          this.selectedShipViaProduct?.shippingCondition ===
          this.shipViaSelectedOption
            ? ""
            : this.customerFlag || this.salesPersonFlag ? this.originalDefaultShippingMethod :this.shipViaSelectedOption,
        shippingWarehouse:
          this.selectedShipViaProduct?.shippingWarehouse ===
          this.shippingWareHouseSelectedOption
            ? ""
            : this.shippingWareHouseSelectedOption,
        incoTerms:
          this.selectedShipViaProduct?.incoTerms ===
          this.incoTermsSelectedOption
            ? ""
            : this.incoTermsSelectedOption,

        //    requestedDeliveryDate:this.lineChangeDate?.requestedDeliveryDate,
      };

      payload = {
        orderCode: this.orderIdData,
        lineItems: lineItemOBj,
        shippingInfo: {},
      };
    } else {
      this.spinnerLoading = true;
      this.orderData?.orderEntries?.forEach((item: any) => {
        let newItem = {
          shipVia:
            item?.shipVia === this.incoTermsLoc2SelectedOption
              ? ""
              : this.incoTermsLoc2SelectedOption,
          postOrderIndicator: "POST",
          lineNumber: item?.entryNumber,
          ProductCode: item?.product?.code,
          shippingCondition: 
            item?.shippingCondition === this.shipViaSelectedOption
              ? ""
              : this.customerFlag || this.salesPersonFlag ? this.originalDefaultShippingMethod:this.shipViaSelectedOption,
          shippingWarehouse:
            item?.shippingWarehouse === this.shippingWareHouseSelectedOption
              ? ""
              : this.shippingWareHouseSelectedOption,
          incoTerms:
            item?.incoTerms === this.incoTermsSelectedOption
              ? ""
              : this.incoTermsSelectedOption,
        };
        lineItemOBj.push(newItem);
      });
      payload = {
        orderCode: this.orderIdData,

        shipComplete: this.selectedShipModal,
        deliveryGrouping: this.shipAsGroup,

        lineItems: lineItemOBj,
        shippingInfo: {},
        shippingCondition:
          this.orderData?.shippingCondition === this.shipViaSelectedOption
            ? ""
            : this.customerFlag || this.salesPersonFlag ? this.originalDefaultShippingMethod :this.shipViaSelectedOption,
        shipVia:
          this.orderData?.shipVia === this.incoTermsLoc2SelectedOption
            ? ""
            : this.incoTermsLoc2SelectedOption,
        incoTerms:
          this.orderData?.incoTerms === this.incoTermsSelectedOption
            ? ""
            : this.incoTermsSelectedOption,
        shippingWarehouse:
          this.orderData?.shippingWarehouse ===
          this.shippingWareHouseSelectedOption
            ? ""
            : this.shippingWareHouseSelectedOption,
      };
    }
    this.orderService
      .editPostOrderModications(payload)
      .subscribe((data: any) => {
        this.scrollPageToTop();
        this.getOrderIdDetails();
        this.spinnerLoading = false;
        this.modalRef?.hide();

        if (
          data?.body?.messages != null &&
          data?.body?.messages[0]?.status == "Error"
        ) {
          this.errorShow = true;
          this.alertType = "danger";
          this.scrollPageToTop();
          this.modalRef?.hide();
          this.messageError = this.customerFlag
            ? "Action could not be completed. Sales document is currently being processed. "
            : "Action could not be completed. " + data.body.messages[0].message;
        }
      },(err:any)=>{
        this.progressHide();
      });
    //  this.submitPoModifications(this.orderData,"SC")
  }
  dateConvert(d: any) {
    return new Date(d).toISOString().slice(0, 10);
  }
  updatePaymentTerms() {
    this.spinnerLoading = true;
    this.messageError = "";
    let payLoad = {};

    payLoad = {
      orderCode: this.orderIdData,
      shipComplete: this.selectedShipModal,
      deliveryGrouping: this.shipAsGroup,
      termsCode: this.paymentTerms,
      poNumber: "",
      lineItems: [],
      shippingInfo: {},
      shippingMethod: "",
    };
    this.orderService
      .editPostOrderModications(payLoad)
      .subscribe((data: any) => {
        this.spinnerLoading = false;
        if (
          data?.body?.messages !== undefined &&
          data?.body?.messages?.length > 0 &&
          data?.body?.messages[0]?.status == "Error"
        ) {
          this.scrollPageToTop();
          this.errorShow = true;
          this.alertType = "danger";
          this.modalRef?.hide();
          this.messageError = this.customerFlag
            ? "Action could not be completed. Sales document is currently being processed. "
            : "Action could not be completed. " +
              (data.body?.messages?.length > 0
                ? data.body?.messages[0]?.message
                : "");
        } else {
          this.scrollPageToTop();
          this.errorShow = true;
          this.alertType = "success";
          this.messageError =
            data.body?.messages?.length > 0
              ? data.body?.messages[0]?.message
              : "";
          setTimeout(() => {
            this.errorShow = false;
            this.alertType = "danger";
            this.messageError = "";
          }, 4000);
        }
        this.paymentTerms = null;
        this.getOrderIdDetails();
      },(err:any)=>{
        this.progressHide();
      });
    this.modalRef?.hide();  
  }
  validatePORequest(e?: any) {
    if (e.currentTarget.value.length < 1) return;
    this.invalidPOMessage = "";
    let isInvalidPO = /^[^{}[\]:;".\\]*$/.test(e.key) ? false : true;
    if(isInvalidPO) return;

    if (this.poNumber || e) {
      this.productService.validatePO(this.orderIdData, encodeURIComponent(this.poNumber)).subscribe(
        (res: any) => {
          if (res.body.status == "warning") {
            this.invalidPOMessage = res.body.message;
            this.invalidPO = false;
          } else if (res.body.status == "error") {
            this.invalidPOMessage = res.body.message;
            this.invalidPO = true;
          } else {
            this.invalidPO = false;
          }
        },
        (error: any) => {
          this.progressHide()
          this.invalidPOMessage = error.error.message;
          this.invalidPO = true;
        }
      );
    }
  }
  faEllipsisVertical: any = faEllipsisVertical;
  openToggles = true;
  openToggleshipped = true;
  shippedToggle() {
    this.openToggleshipped = !this.openToggleshipped;
  }
  toggleOpen() {
    this.openToggles = !this.openToggles;
  }
  showValidationError: boolean = false;
  validationErrorMessage: any;
  originalDefaultSM:any;
  validateShipViaAddress(type: any) {
    this.spinnerLoading = true;
    console.log(
      "this.shipViaSelectedOption",
      this.shipViaSelectedOption,
      this.incoTermsLoc2SelectedOption
    );
    let shipViaSelectedOption = this.shipViaSelectedOption;
    let incoTermsLoc2SelectedOption = this.incoTermsLoc2SelectedOption == undefined? '':
      this.incoTermsLoc2SelectedOption?.value ||
      this.incoTermsLoc2SelectedOption;
    let incoTermsSelectedOption = this.incoTermsSelectedOption;
    let shippingWareHouseSelectedOption = this.shippingWareHouseSelectedOption;

    incoTermsLoc2SelectedOption = typeof incoTermsLoc2SelectedOption == "object"
              ? incoTermsLoc2SelectedOption?.label.toUpperCase()
              : incoTermsLoc2SelectedOption;

    let cartSelectProductCode;
    if (this.isCompleteCart === true) {
      cartSelectProductCode = this.orderData.orderEntries[0].product.code;
    } else {
      cartSelectProductCode = this.selectedShipViaProduct.product.code;
    }
    if(!this.customerFlag && !this.salesPersonFlag) {
    this.productService
      .getUOMDetails(cartSelectProductCode)
      .subscribe((result) => {
        this.orderService
          .validateShippingOptions(
            shippingWareHouseSelectedOption,
            result?.body?.erpProductCategory,
            incoTermsLoc2SelectedOption
          )
          .subscribe({
            next: (res) => {
              if (res.body.status === "success") {
                this.orderService
                  .validateShipVia(
                    shipViaSelectedOption,
                    incoTermsLoc2SelectedOption
                  )
                  .subscribe({
                    next: (res) => {
                      if (res.body.status === "success") {
                        if (type == "changeShippingOption") {
                          this.spinnerLoading = false;
                          this.submitCombinedShippingInfo();
                          this.closeShippingWareHouseModal();
                        }
                      } else if (res.body.status === "error") {
                        this.showValidationError = true;
                        this.spinnerLoading = false;
                        this.validationErrorMessage = res.body.message;
                      }
                    },
                    error: (err:any) => {
                      this.progressHide();
                    },
                  });
              } else if (res.body.status === "error") {
                this.showValidationError = true;
                this.spinnerLoading = false;
                this.validationErrorMessage = res.body.message;
              }
            },
            error: (err:any) => {
              this.progressHide();
            },
          });
      },(err:any)=>{
        this.progressHide();
      });
    }else{
      if (type == "changeShippingOption") {
        this.spinnerLoading = false;
        this.originalDefaultShippingMethod = this.originalDefaultSM;
        this.deliveryAddress.defaultShippingMethod =
        this.originalDefaultShippingMethod;
        this.deliveryAddress.defaultIncoTerms =
          this.incoTermsSelectedOption;
        this.deliveryAddress.defaultShippingWarehouse =
          this.shippingWareHouseSelectedOption;
        this.deliveryAddress.defaultShipVia = this.incoTermsLoc2SelectedOption === undefined ? '':
          typeof this.incoTermsLoc2SelectedOption == "object"
            ? this.incoTermsLoc2SelectedOption?.label.toUpperCase()
            : this.incoTermsLoc2SelectedOption.toUpperCase();
        this.deliveryAddress.defaultShippingMethod =
          this.shipViaSelectedOption;
        this.submitCombinedShippingInfo();
        this.closeShippingWareHouseModal();
      }
     
    }
  }

  disableShipVia(){
    if((this.customerFlag || this.salesPersonFlag) 
          && this.orderData.oneTimeShipTo && this.shipViaSelectedOption == "CA"){
            return false;
    }else if((this.customerFlag || this.salesPersonFlag)){
      return true;
    }else {
      return false;
    }
  }

  validateShipVia(event: any) {
    console.log(event);
    this.showValidationError = false;
  }

  openViewReplacementOrderModal(template: any) {
    const initialState: ModalOptions = {
      initialState: {},
    };
    this.modalRef = this.modalService.show(
      template,
      Object.assign(initialState, {
        id: "viewReplacementOrderModal",
        class: "modal-md modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );
  }

  openTogglesDeliveryQty = true;
  showDeliveryQty = false;
  toggleOpensDeliveryQty() {
    this.openTogglesDeliveryQty = !this.openTogglesDeliveryQty;
  }

  showDeliverySqFtYrd(e: any) {
    this.showDeliveryQty = !this.showDeliveryQty;
  }
  showFullText = false; 

  toggleText() {
    this.showFullText = !this.showFullText; 
  }
  errorMaxLength: string = 'Maximum character limit of 250 exceeded.';
  isInvalid: boolean = false;
 
  checkMaxLength(maxlengthTemplate: TemplateRef<any>): void {
      this.maxmodalRef = this.modalService.show(maxlengthTemplate, {
        id: 9,
        class: 'modal-lg modal-dialog-centered',
        backdrop: 'static',
        keyboard: false,
      });
    }
    
  getFormattedDate(date: string) {
    if (date && date.length === 8) {
      const year = date.substring(0, 4);
      const month = date.substring(4, 6);
      const day = date.substring(6, 8);
      return `${month}/${day}/${year}`;
    }else{
    var d = new Date(date).toISOString().slice(0, 10);
    return formatDate(d, "MM/dd/yyyy", "en-US");
    }
  }

  camsOrderSpinner: boolean = false;
  getCAMSOrdersDetails(orderId: any, soldTo: any) {
    this.apiCount = 3;
    this.camOrderFlag = true;
    this.progressShow('getCAMSOrderIdDetails');
    let payload =
    {
      TRANSID: "ORDERDETAIL",
      CAMSID_SOLDTO: `R.${soldTo}`,
      ORDERNUMBER: orderId,
      CREDITPRIVILEGE: "TRUE",
      PRICEPRIVILEGE: "TRUE",
      ORDER: "12345",
      ORDLNE: "000",
      ERPPROFILE: "",
      XCHGSYS: "X"
    }
    /* {
      buID: "1",
      erpID: "1",
      creditPrivilege: true,
      pricePrivilege: true,
      orderNumber: orderId,
      erpSoldToID:  `R.${soldTo}`,
      erpOrderNumber: orderId,
      erpProfile: "",
      xchgSys: "B"
    } */
    this.orderService.getCAMSOrdersDetails(payload).subscribe((res: any) => {
      if (this.apiCount == 3 && this.camOrderFlag) {
        this.progressHide();
      }
      this.camsOrderDetails =  res.Response && res.Response[0] || [];
      if (this.camsOrderDetails['Error Code'] === "0000") {
        /* if(this.camsOrderDetails['CAMS Orders']){
          this.camsOrders = this.camsOrderDetails['CAMS Orders'].filter(
            (order:any) => order.AtpDateMessage !== '' && order.AtpDateMessage !== null
          ) || [];
        } */
        if(this.camsOrders == undefined || this.camsOrders.length === 0){
          this.camsOrders = this.camsOrderDetails['CAMS Orders'];
        }
        
        let status = this.camsOrders[0]?.OrderStatus;
        this.orderStatus = (this.camsOrders || []).every((line: any) => line?.OrderStatus == status) ? 
        this.lineStatusReplace(status)  : "SEE LINE DETAILS";
      
        let edd = this.camsOrders[0]?.EddDateMessage;
        let rdd = this.camsOrders[0]?.RequestDate;
        if (edd instanceof Date) {
          this.eddMessage =
            (this.camsOrders || []).every((line: any) =>
              this.datePipe.transform(line?.EddDateMessage, "MM/dd/yyyy") == this.datePipe.transform(edd, "MM/dd/yyyy"))
              ? edd : "See line details.";
        } else {
          this.eddMessage = (this.camsOrders || []).every((line: any) => line?.EddDateMessage == edd) ? edd : "In Process";
        }

        if (rdd instanceof Date) {
          this.rddMessage =
            (this.camsOrders || []).every((line: any) =>
              this.datePipe.transform(line?.RequestDate, "MM/dd/yyyy") == this.datePipe.transform(rdd, "MM/dd/yyyy"))
              ? rdd : "See line details.";
        } else {
          this.rddMessage = (this.camsOrders || []).every((line: any) => line?.RequestDate == rdd) ? rdd : "In Process";
        }

        (this.orderData?.camsCartEntries || []).forEach((orderEntries: any) => {
          (orderEntries?.cartEntries || []).forEach((prod: any) => {
               let flag=false;
          // Match camsOrdersSolution for each product
          prod.camsOrdersSolution = this.camsOrders.filter((line: any) => {
            // Normalize sapLineNumber
            let normalizedSapLineNumber = Math.floor(Number(prod?.camsLineNumber)) * 1000;
        
            // Normalize LineNumber
            let normalizedLineNumber = Math.floor(Number(line?.CAMSLine))* 1000;
        

            let normalizedSapLineNumbertemp = Math.floor(Number(prod?.entryNumber)) * 1000;
             
            let solutionSapLineNumbertemp = prod?.solution && Math.floor(Number(prod?.solution[0]?.sapLineNumber))- (Number(prod?.solution[0]?.sapLineNumber) % 1000);

            let camsLineNumbertemp = Math.floor(Number(line.LineNumber) / 1000) * 1000;

            let nonSolutionSapLineNumber = prod?.sapLineNumber;
       
            // Normalize LineNumber by removing leading zeros and converting to number
            let normalizedLineNumbertemp = Math.floor(Number(line?.LineNumber)) - (Number(line?.LineNumber) % 1000);


            // Compare normalized values
            if(prod?.camsOrderNumber){
              return (normalizedSapLineNumber === normalizedLineNumber  && prod?.camsOrderNumber == line?.CAMSOrder);
            }else{
              if(solutionSapLineNumbertemp === normalizedLineNumbertemp && flag===false){
                flag=true;
              return ( solutionSapLineNumbertemp === normalizedLineNumbertemp);
              }else if(nonSolutionSapLineNumber === camsLineNumbertemp){
                 flag=true;
                return (nonSolutionSapLineNumber === camsLineNumbertemp);

              }
              // else if(flag===false){
              //   flag=true;
              //   return ( normalizedSapLineNumbertemp === normalizedLineNumbertemp);
              // }
              else{
                flag=false;
                return false;

              }
            }
            
          });
        
          // Compute overallStatus
          // const statuses = prod.camsOrdersSolution.map((line: any) => line?.OrderStatus).filter((status: any) => !!status);
        
          // if (statuses.length === 1) {
          //   this.orderStatus = this.lineStatusReplace(statuses[0]);
          // } else if (statuses.every((status: any) => status === statuses[0])) {
          //   this.orderStatus= this.lineStatusReplace(statuses[0]); // All statuses are same
          // } else {
          //   this.orderStatus = 'SEE LINE DETAILS'; // Mixed statuses
          // }
        });
      });
      const allStatuses: string[] = [];
      (this.orderData?.camsCartEntries || []).forEach((orderEntries: any) => {
          let reqDevliveryDate: string | null = null;
          let allRDDSame = true;
          (orderEntries?.cartEntries || []).forEach((prod: any) => {
            // ... your existing camsOrdersSolution assignment logic ...
            const statuses = prod.camsOrdersSolution
              .map((line: any) => line?.OrderStatus)
              .filter((status: any) => !!status);

            allStatuses.push(...statuses); // Collect statuses from all lines
            for (const solution of prod?.camsOrdersSolution) {
              if (reqDevliveryDate === null) {
                reqDevliveryDate = solution.RequestDate;
              } else if (reqDevliveryDate !== solution.RequestDate) {
                allRDDSame = false;
                break;
              }
            }
          });
          if (allRDDSame && reqDevliveryDate !== null) {
            orderEntries.uniqueRequestDate = reqDevliveryDate;
          } else if(reqDevliveryDate) {
            orderEntries.uniqueRequestDate = 'As Requested';
          }else {
            orderEntries.uniqueRequestDate = orderEntries?.requestedDeliveryDate;
          }
        });

// Now, calculate overall orderStatus
        const uniqueStatuses = Array.from(new Set(allStatuses.filter(Boolean)));

      if (uniqueStatuses.length === 1) {
        this.orderStatus = this.lineStatusReplace(uniqueStatuses[0]);
      } else if (uniqueStatuses.length > 1) {
        this.orderStatus = 'SEE LINE DETAILS';
      } else {
        this.orderStatus = ''; // Or handle no status found
      }
      
      }
      
      if((this.userInfo?.isCustomer || this.userInfo?.isSalesOps || this.userInfo?.isSalesPerson) && 
              !this.orderData?.sampleOrder && !this.isTodayShipmentOrder && this.orderData?.statusDescription != "SUBMITTED")
      {
        this.getViewOrderUpdates();
      }
    }, () => { 
      this.modalService.hide();
      this.camsOrderSpinner = false; this.progressHide();
    });
  }

  lineStatusReplace(str:any){
    const searchString = ", Check";
    if(str){
      const position = str.indexOf(searchString); 
      if (position !== -1) {
        // Replace from the found position until the end of the string
        str = str.substring(0, position) + ".";
      }
    }

    return str
  }

  lineAssigned(str: any): string {
    if (typeof str === 'string' && (str.includes('Shipped') || str.includes('SHIPPED'))) {
        return 'SHIPPED';
    } else if (typeof str === 'string' && (str.includes('Delivered') || str.includes('DELIVERED'))) {
      return 'DELIVERED';
    } else if (typeof str === 'string' && (str.includes('Cancelled') || str.includes('CANCELLED'))) {
      return 'CANCELLED';
    }else if (typeof str === 'string' && (str.includes('Scheduled') || str.includes('SCHEDULED'))) {
      return 'SCHEDULED';
    }else {
        return 'ASSIGNED';
    }
  }


  gettFormattedValue(val: any) {
   return (val?.startsWith(".0") ? `0${val}` : val)
  }

  getLineStatus(status:any = ''){
    if(status){
      return status;
    }else if (this.orderStatus && (this.orderStatus.includes('Cancelled') || this.orderStatus.includes('CANCELLED'))) {
      return 'CANCELLED';
    }else if  (this.orderStatus && (this.orderStatus.includes('Shipped') || this.orderStatus.includes('SHIPPED'))) {
      return 'SHIPPED';
    }else {
      return "IN PROGRESS";
    }
  }

  getCAMSLineStatus(lineData:any){
    if(this.camsOrders?.length > 0){
      let lineStatus = lineData?.camsOrdersSolution && lineData?.camsOrdersSolution[0]?.OrderStatus;
      if (lineStatus && (lineStatus.includes('Cancelled') || lineStatus.includes('CANCELLED'))){
        return true;
      }
    }
    return false;
  }

 orderMessages = MESSAGE_CONSTANTS?.orderDetails;


  progressShow(msgType: any) {
      const messageConstants = MESSAGE_CONSTANTS?.orderDetails?.[msgType]
      this.openProgressModal({
        modalHeaderText: messageConstants?.headerText,
        progressText: messageConstants?.bodyText,
        progressBarText: messageConstants?.barText
      });
    }
    progressHide() {
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

  generatePdfSafariFallback(popupWin: any, from: any) {
    try {
     
      if (from === 'share') {
        const content = popupWin.document.getElementById('pdfOrderContent');
        if (!content) {
          if (popupWin && !popupWin.closed) {
            popupWin.hidePdfLoadingModal();
          }
          this.progressHide();
          popupWin.close();
          return;
        }
        
        
        const safariOptions = {
          scale: 1,
          useCORS: true,
          allowTaint: false, // More strict for Safari
          backgroundColor: '#ffffff',
          logging: false,
          removeContainer: true,
          foreignObjectRendering: false,
          imageTimeout: 30000, // Increased timeout for server environments
          scrollX: 0,
          scrollY: 0,
          windowWidth: popupWin.document.documentElement.offsetWidth,
          windowHeight: popupWin.document.documentElement.offsetHeight,
          onclone: (clonedDoc: any) => {
            const allElements = clonedDoc.querySelectorAll('*');
            allElements.forEach((el: any) => {
              const computedStyle = window.getComputedStyle(el);
              if (computedStyle.color === 'color' || computedStyle.backgroundColor === 'color') {
                el.style.color = '#000000';
                el.style.backgroundColor = 'transparent';
              }
              
              // Safari-specific distortion fixes
              if (computedStyle.position === 'relative' || computedStyle.position === 'absolute') {
                el.style.position = 'static';
              }
              
              // Fix flexbox issues in Safari
              if (computedStyle.display === 'flex') {
                el.style.display = 'block';
              }
              
              // Ensure proper text rendering
              el.style.fontSmoothing = 'antialiased';
              el.style.webkitFontSmoothing = 'antialiased';
              
              // Fix table layout issues
              if (el.tagName === 'TABLE') {
                el.style.tableLayout = 'fixed';
                el.style.width = '100%';
              }
              
              // Fix image scaling
              if (el.tagName === 'IMG') {
                el.style.maxWidth = '100%';
                el.style.height = 'auto';
              }
            });
          }
        };
        
        html2canvas(content, safariOptions).then((canvas: any) => {
          try {
            const data = canvas.toDataURL('image/jpeg', 0.9);
            const pdf = new jsPDF("p", "mm", "a4", true);
            const pageWidth = pdf.internal.pageSize.getWidth() - 10;
            const pageHeight = pdf.internal.pageSize.getHeight();
            const imgProps = {
              width: pageWidth,
              height: (canvas.height * pageWidth) / canvas.width,
            };
            const totalPdfPages = Math.ceil(imgProps.height / pageHeight);
            
            for (let page = 0; page < totalPdfPages; page++) {
              if (page > 0) {
                pdf.addPage();
              }
              const sourceY = (pageHeight * page * canvas.width) / pageWidth;
              const pageCanvas = document.createElement('canvas');
              pageCanvas.width = canvas.width;
              pageCanvas.height = pageHeight * (canvas.width / pageWidth);
              const ctx: any = pageCanvas.getContext('2d');
              
              if (ctx) {
                ctx.drawImage(
                  canvas,
                  0,
                  sourceY,
                  canvas.width,
                  pageCanvas.height,
                  0,
                  0,
                  canvas.width,
                  pageCanvas.height
                );
              }
              
              const pageImageData = pageCanvas.toDataURL('image/png', 0.9);
              pdf.addImage(pageImageData, 'JPEG', 5, 5, pageWidth, pageHeight - 20);
            }
            
          
            if (popupWin && !popupWin.closed) {
              popupWin.hidePdfLoadingModal();
            }
            
      
            let pdfContent = pdf.output("datauristring");
            let PDFData = pdfContent.split(",");
            this.spinnerLoading = false;
            this.openShareViaEmailModal(PDFData[1]);
            popupWin.close();
            
          } catch (pdfError) {
            console.error('Safari PDF generation failed:', pdfError);
          
            if (popupWin && !popupWin.closed) {
              popupWin.hidePdfLoadingModal();
            }
            this.progressHide();
            popupWin.close();
          }
        }).catch((canvasError: any) => {
          console.error('Safari canvas generation failed:', canvasError);
          if (popupWin && !popupWin.closed) {
            popupWin.hidePdfLoadingModal();
          }
          this.progressHide();
          alert('Unable to generate PDF in Safari. Please try again or use the print option instead.');
          popupWin.close();
        });
        
        return;
      }
      
      
      if (popupWin && !popupWin.closed) {
        popupWin.hidePdfLoadingModal();
      }
      popupWin.print();
      setTimeout(() => {
        popupWin.close();
      }, 1000);
      
    } catch (error) {
      console.error('Safari fallback failed:', error);
      if (popupWin && !popupWin.closed) {
        popupWin.hidePdfLoadingModal();
      }
      this.progressHide();
      popupWin.close();
    }
  }



  async mobileviewPdf(from: any = "") {
    // Set the PDF action for modal header
    this.pdfAction = from === 'share' ? 'share' : 'viewPdf';
    
    this.hidelement(true);
    this.progressShow('preparing');
    this.showDetailsFlag = true;
    await this.delayPrint(100);
    let printContents: any;
    this.toggleAccordionElements(true);
    this.showElementForPdf(false);
    // Remove interactive elements from DOM before capturing content
    const printArea = this.document.getElementById("print-area");
    const removedElements: Array<{element: Element, parent: Element, nextSibling: Element | null}> = [];



    // Store removed elements for restoration
    (this as any).removedElements = removedElements;

    printContents = this.document.getElementById("print-area")?.innerHTML;

    // Set PDF content for modal
    this.pdfContent = printContents || "";

    // Open the PDF modal with blur backdrop
    this.modalRef = this.modalService.show(this.pdfModal, {
      id: 'pdfModal',
      class: 'modal-xl modal-dialog-centered pdf-blur-modal',
      backdrop: 'static',
      keyboard: false
    });

    if (from === "share") {
      this.spinnerLoading = true;
    }

    // Wait for modal to render, then start PDF generation
    setTimeout(() => {
      this.generatePdfFromModal(from);
    }, 100);
  }
  showComments: boolean = false;
  // Helper method to detect mobile or iPad devices
  private isMobileOrIpad(): boolean {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /android|webos|iphone|ipod|blackberry|iemobile|opera mini|mobile/i.test(userAgent);
    const isIpad = /ipad/i.test(userAgent);
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    const isSmallScreen = window.innerWidth <= 768 || window.innerHeight <= 1024;
    const isIOS = /iphone|ipad|ipod/i.test(userAgent);
  
    return isMobile || isIpad || isIOS || (isTouchDevice && isSmallScreen);
  }

  viewPdf(from: any = "") {
    // Set the PDF action for modal header
    this.pdfAction = from === 'share' ? 'share' : 'viewPdf';
    
    // Detect Safari browser
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    if (isSafari) {
      console.log('Safari detected - using enhanced error handling for PDF generation');
    }

    if (this.isMobileOrIpad()) {
      this.mobileviewPdf(from);
      return;
    }

    if (from == null || from == "") {
      this.progressShow('viewPdf');
    }
    else{ 
      this.progressShow('preparing');
    }
    this.showComments = true
    this.hidelement(true);
    this.toggleAccordionElements(true)
    let pdf = new jsPDF("p", "mm", "a4");
    const printArea: any = document.getElementById('print-section');
    
    // Check if print area exists
    if (!printArea) {
      console.error('Print area not found');
      this.progressHide();
      this.hidelement(false);
      this.toggleAccordionElements(true);
      this.showComments = false;
      return;
    }
    
    const imgLogo = new Image();
    imgLogo.src = '/assets/images/logo-residential-dark.png';
    const isSafariBrowser = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const cleanupAfterPdf = () => {
      this.resetStyles();
      this.progressHide();
      this.hidelement(false);
      this.toggleAccordionElements(true);
      this.showComments = false;
    };
    imgLogo.onload = () => {
      try {
        const desiredWidth = 50;
        const aspectRatio = imgLogo.width / imgLogo.height;
        const calculatedHeight = desiredWidth / aspectRatio;
        pdf.addImage(imgLogo, 'JPEG', 10, 10, desiredWidth, calculatedHeight);
        const newContentStartY = 7 + calculatedHeight + 7;

        this.renderPrintAreaToPdf(pdf, printArea, newContentStartY, isSafariBrowser).then(() => {
          this.finalizePDF(pdf, from);
          cleanupAfterPdf();
        }).catch((error: any) => {
          console.error('Error rendering PDF:', error);
          cleanupAfterPdf();
        });
      } catch (error) {
        console.error('Error in PDF generation:', error);
        cleanupAfterPdf();
      }
    };
    imgLogo.onerror = () => {
      console.error("Failed to load logo image");
      cleanupAfterPdf();
    };
  }
  toggleAccordionElements(show: boolean): void {
    const accordianElements = this.document.querySelectorAll(".panel-collapse");
    accordianElements.forEach((el: any) => {
      el.style.display = show ? "block" : "none";
    });
  }
  finalizePDF(pdf : any, from : any) {
    try {
        const pageCount = pdf.internal.getNumberOfPages();
        for (let i = 0; i < pageCount; i++) {
            pdf.setPage(i + 1);
            pdf.setFontSize(8);
            const rightMargin = 10; // Distance from the right edge
            const topMargin = 5;  // Distance from the top edge
            const pageWidth = pdf.internal.pageSize.width;
            const pageHeight = pdf.internal.pageSize.height
            pdf.text(`Page ${i + 1} of ${pageCount}`, pageWidth - rightMargin, pageHeight - rightMargin, { align: 'right' });
            pdf.text(this.datePipe.transform(new Date(), 'MM-dd-yyyy'), pageWidth - rightMargin, topMargin, { align: 'right' });
         //   pdf.text(window.location.href, rightMargin, topMargin, { align: 'left' });
        }

        if (from === 'share') {
          let pdfContent = pdf.output("datauristring");
          let orderPDFData = pdfContent.split(",");
          this.progressHide();
          this.openShareViaEmailModal(orderPDFData[1]);
        } else {
          this.progressHide();
          const blobUrl = pdf.output('bloburl');
          window.open(blobUrl, '_blank');
          setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
        }
    } catch (error) {
        console.error('Error finalizing PDF:', error);
    } finally {
        this.progressHide();
        this.spinnerLoading = false;
    }
  }
  resetStyles() {
    const validateFields : any = document.querySelectorAll('.space-normalizer');
    for (let field of validateFields) {
      field.style.letterSpacing = 'normal';
    }
  }

  generatePdfFromModal(from: any = "") {
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    try {
      if (!this.modalRef) {
          this.progressHide();
          return;
        }

      const content = this.document.querySelector('#pdfModalContent');
        if (!content) {
          this.progressHide();
        this.modalRef.hide();
          return;
        }
        
      // Hide the loading overlay
      const hideLoadingModal = () => {
        const loadingModal = this.document.getElementById('pdfLoadingModal');
        if (loadingModal) {
          loadingModal.style.display = 'none';
        }
      };
      
        setTimeout(() => {
          const html2canvasOptions = {
            scale: 1,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false,
            removeContainer: true,
            foreignObjectRendering: false,
            imageTimeout: 5000,
          windowWidth: 1024,
          width: 1024
        };

                // Check for elements with no-page-break class for special processing
            const elements = content.querySelectorAll('.no-page-break');
        
          if (elements.length > 0) {
            const pdf = new jsPDF("p", "mm", "a4", true);
            const imgLogo = new Image();
            imgLogo.src = '/assets/images/logo-residential-dark.png';

            const finishModalPdf = () => {
              hideLoadingModal();
              if (from === 'share') {
                let pdfContent = pdf.output("datauristring");
                let PDFData = pdfContent.split(",");
                this.spinnerLoading = false;
                this.modalRef?.hide();
                this.resetPdfState();
                this.openShareViaEmailModal(PDFData[1]);
              } else {
                const blob = pdf.output("blob");
                const url = URL.createObjectURL(blob);
                window.open(url, "_blank");
                setTimeout(() => URL.revokeObjectURL(url), 60000);
                setTimeout(() => {
                  this.modalRef?.hide();
                  this.resetPdfState();
                }, 500);
              }
              this.progressHide();
            };

            imgLogo.onload = () => {
              const desiredWidth = 50;
              const aspectRatio = imgLogo.width / imgLogo.height;
              const calculatedHeight = desiredWidth / aspectRatio;
              pdf.addImage(imgLogo, 'JPEG', 10, 10, desiredWidth, calculatedHeight);
              const newContentStartY = 7 + calculatedHeight + 7;

              this.renderPrintAreaToPdf(pdf, content as HTMLElement, newContentStartY, isSafari).then(() => {
                finishModalPdf();
              }).catch((error: any) => {
                console.error('Error rendering PDF in modal:', error);
                hideLoadingModal();
                this.progressHide();
              });
            };

            imgLogo.onerror = () => {
              console.error("Failed to load logo image");
              hideLoadingModal();
              this.progressHide();
            };
          } else {
          // Use regular html2canvas for content without no-page-break elements
          html2canvas(content as HTMLElement, html2canvasOptions).then((canvas: any) => {
              try {
              hideLoadingModal();
              
                const data = canvas.toDataURL('image/jpeg', 0.95);
                const pdf = new jsPDF("p", "mm", "a4", true);
                const padding = 5;
              // Force consistent PDF width regardless of capture device
              const fixedPdfWidth = pdf.internal.pageSize.getWidth() - padding * 2; // Use full A4 width
                const pageHeight = pdf.internal.pageSize.getHeight();
                const imgProps = {
                width: fixedPdfWidth,
                height: (canvas.height * fixedPdfWidth) / canvas.width,
                };
                const totalPdfPages = Math.ceil(imgProps.height / pageHeight);
                
                for (let page = 0; page < totalPdfPages; page++) {
                  const sourceY = (pageHeight * page * canvas.width) / fixedPdfWidth;
                  const pageCanvas = document.createElement('canvas');
                  pageCanvas.width = canvas.width;
                  pageCanvas.height = pageHeight * (canvas.width / fixedPdfWidth);
                  const ctx: any = pageCanvas.getContext('2d');
                
                  if (ctx) {
                    ctx.drawImage(
                      canvas,
                      0,
                      sourceY,
                      canvas.width,
                      pageCanvas.height,
                      0,
                      0,
                      canvas.width,
                      pageCanvas.height
                    );
                  }
                
                  const pageImageData = pageCanvas.toDataURL('image/png', 0.95);
                  if (page > 0) {
                    pdf.addPage();
                  }
                  if (page == 0) {
                    pdf.addImage(pageImageData, 'JPEG', 5, 5, fixedPdfWidth, pageHeight - 20);
                  } else {
                    pdf.addImage(pageImageData, 'JPEG', 5, 10, fixedPdfWidth, pageHeight - 20);
                  }
                }
                
                if (from === 'share') {
                  let pdfContent = pdf.output("datauristring");
                  let PDFData = pdfContent.split(",");
                  this.spinnerLoading = false;
                // Close PDF modal first, then open share modal
                this.modalRef?.hide();
                this.resetPdfState();
                  this.openShareViaEmailModal(PDFData[1]);
                } else {
                  const blob = pdf.output("blob");
                  const url = URL.createObjectURL(blob);
                  window.open(url, "_blank");
                  setTimeout(() => URL.revokeObjectURL(url), 60000);
                // Close the modal after PDF opens
                setTimeout(() => {
                  this.modalRef?.hide();
                  this.resetPdfState();
                }, 500);
                }        
              
                this.progressHide();
              } catch (pdfError) {
              hideLoadingModal();
                this.progressHide();
              console.error('PDF generation error:', pdfError);
              }
            }).catch((canvasError: any) => {
            hideLoadingModal();
              this.progressHide();
            console.error('Canvas generation error:', canvasError);
            });
          }
        }, 50);
      } catch (error) {
        console.error('PDF generation failed:', error);
        this.progressHide();
    }
  }

  resetPdfState() {
    // Reset accordion elements
    if (!this.showDetailsFlag) {
      this.toggleAccordionElements(false);
    }

    // Restore removed elements back to DOM
    const removedElements = (this as any).removedElements || [];
    removedElements.forEach((item: any) => {
      if (item.nextSibling) {
        item.parent.insertBefore(item.element, item.nextSibling);
      } else {
        item.parent.appendChild(item.element);
      }
    });

    // Clear the stored removed elements
    (this as any).removedElements = [];

    // Reset flags and content
    this.showDetailsFlag = false;
    this.pdfContent = "";

    // Show elements that were hidden for PDF
    this.hidelement(false);
    this.showElementForPdf(true);
  }

  isEditOrder:boolean = false;
  showAddNewLine:boolean = false;
  addedLineItems:any = [];
  reqOrderUpdates:any=[];
  editSuccessMsg:any= '';
  editAlertType:string = 'success';
  showReqModification: boolean = false;
  shipToAddessList:any = [];
  selectedShipTodAddr:any;
  selectedShipToId:any;
  oneTimeShippingAddrForm!: FormGroup;
  isPoBoxFlag:boolean = false;
  isOneTimeAddrValid:boolean = false;
  hasInProgressStatus:any = true;
  approvedStatus:string= "Change has been completed";
  declineStatus:string= "Change has not been completed";
  orderModReq:boolean = false;
  getViewOrderUpdates(){
    this.apiCount = 4;
    this.progressShow('viewOrderUpdates');
    let payload = {
      "OrderNumber": +this.orderData?.orderCode
    }
    this.orderService.viewOrderUpdates(payload).subscribe({
      next: (res: any) => {
        if(res?.message == 'success'){
            this.reqOrderUpdates = res?.result || [];
            if (this.apiCount == 4) {
              this.modalService.hide();
              this.progressHide();
              this.hasInProgressStatus = false;
            }
            const lastModifiedDate = new Date(this.reqOrderUpdates?.LastModifiedDate);
            this.orderModReq = (this.userInfo?.isCustomer || this.userInfo?.isSalesPerson || this.userInfo?.isSalesOps) && 
                          this.getOrderStatus() != 'CANCELLED' && this.getOrderStatus() != 'SHIPPED' && !this.orderData?.sampleOrder && !this.isTodayShipmentOrder && this.orderData?.builderOrder == false;
            const millisecondsIn72Hours = 72 * 60 * 60 * 1000;
            this.showReqModification = !isNaN(lastModifiedDate.getTime()) && 
              (new Date().getTime() - lastModifiedDate.getTime() > millisecondsIn72Hours);
            const orderDetailsObj = this.reqOrderUpdates?.OrderDetails || {};
            if (Object.keys(orderDetailsObj).length > 0) {
              this.setUpdatedStatus(orderDetailsObj?.Comments, this.orderData?.b2bCommentData?.[0]?.comment);
              this.setUpdatedStatus(orderDetailsObj?.PaymentTerms, this.orderData?.termsCode);
              this.setUpdatedStatus(orderDetailsObj?.Po, this.orderData?.poNumber);  
              this.setUpdatedStatus(orderDetailsObj?.ShipCompleteOrder, this.orderData?.shipCompleteOrderFlag ? 'Y' : 'N'); 
              this.setUpdatedStatus(orderDetailsObj?.CancelledOrders, this.getOrderStatus());  
              const shipToId = this.orderData?.oneTimeShipTo
                  ? this.deliveryAddress?.line1
                  : this.deliveryAddress?.id.split("_")[0];
              this.setUpdatedStatus(orderDetailsObj?.ShipToAddress, shipToId, true); 
            }

            if (Object.keys(this.reqOrderUpdates?.CartDetails || {}).length > 0) {
              this.setLineLevelStatus(this.reqOrderUpdates?.CartDetails, this.showReqModification);
            }

            if(this.reqOrderUpdates?.AddedLineDetails?.length > 0){
              this.addLineStatusUpdate()
            }
        }
      },
      error: (err: any) => {
        if (this.apiCount == 4) {
          this.modalService.hide();
          this.progressHide();
        }
      }
    });
  }

  getOrderStatus(){
    if(this.camsOrders?.length > 0){
      if (this.orderStatus && (this.orderStatus.includes('Cancelled') || this.orderStatus.includes('CANCELLED'))) {
        return 'CANCELLED';
      }else if  (this.orderStatus && (this.orderStatus.includes('Shipped') || this.orderStatus.includes('SHIPPED'))) {
        return 'SHIPPED';
      }else {
        return 'IN PROGRESS';
      }
    }else{
      return this.orderData?.status;
    }
  }

  oneTimeShipToForm(){
    this.oneTimeShippingAddrForm = this.fb.group({
      name: ['', [Validators.required]],
      streetAddress: ['', Validators.required],
      streetAddress2: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: ['', Validators.required]
    });

    this.oneTimeShippingAddrForm.patchValue({
      name: this.deliveryAddress?.companyName,
      streetAddress: this.deliveryAddress?.line1,
      streetAddress2: this.deliveryAddress?.line2,
      city: this.deliveryAddress?.town,
      state: this.deliveryAddress?.region?.isocodeShort,
      zipCode: this.deliveryAddress?.postalCode, 
    });
  }

  getShippingAddressList(currentPage: any, searchText: any) {
    this.progressShow("shippingAddress");
    this.productAddressService
      .pricingAllAddress(
        this.userService.getUserEmail().toLowerCase(),
        50,
        currentPage,
        searchText
      )
      .subscribe(
        (res) => {
          const data = res.body?.addresses || [];
          this.shipToAddessList = [...[], ...data];
          this.progressHide();
          this.selectedShipToId = this.deliveryAddress?.id;
        },
        (err: any) => {
          this.progressHide()
        }
      );
  }

  
  onChangeShipToAddr(event:any){
    this.selectedShipToId = event;
    let address = this.shipToAddessList.filter(
      (item: any) => item?.id === event
    );
    
    this.selectedShipTodAddr = address && address[0];
    this.errorMessage = '';
    this.isPoBoxFlag = false;
    if(this.selectedShipTodAddr?.formattedAddress?.includes("PO BOX")){
      this.isPoBoxFlag = true;
      this.errorMessage = "This shipping address is not allowed, please choose other shipping address";
    }
  }

  
  validateAddressOnFormChange() {
    if (
      this.oneTimeShippingAddrForm.value.streetAddress.toLowerCase().includes("po box") ||
      this.oneTimeShippingAddrForm.value.streetAddress.toLowerCase().includes("p.o.box") ||
      this.oneTimeShippingAddrForm.value.streetAddress.toLowerCase().includes("po ") ||
      this.oneTimeShippingAddrForm.value.streetAddress
        .toLowerCase()
        .includes("post office box") ||
      this.oneTimeShippingAddrForm.value.streetAddress.toLowerCase().includes("p.o ") //||
    ) {
      this.oneTimeShippingAddrForm.controls["streetAddress"].setErrors({
        incorrect: true,
      });
    } else if (this.oneTimeShippingAddrForm.value.streetAddress.length > 0) {
      this.oneTimeShippingAddrForm.controls["streetAddress"].setErrors(null);
    }
    if (
      this.oneTimeShippingAddrForm.value.streetAddress2.toLowerCase().includes("po box") ||
      this.oneTimeShippingAddrForm.value.streetAddress2
        .toLowerCase()
        .includes("p.o.box") ||
      this.oneTimeShippingAddrForm.value.streetAddress2.toLowerCase().includes("po ") ||
      this.oneTimeShippingAddrForm.value.streetAddress2
        .toLowerCase()
        .includes("post office box") ||
      this.oneTimeShippingAddrForm.value.streetAddress2.toLowerCase().includes("p.o ") //||
    ) {
      this.oneTimeShippingAddrForm.controls["streetAddress2"].setErrors({
        incorrect: true,
      });
    } else if (this.oneTimeShippingAddrForm.value.streetAddress2.length > 0) {
      this.oneTimeShippingAddrForm.controls["streetAddress2"].setErrors(null);
    }
    if (
      this.oneTimeShippingAddrForm.controls["streetAddress"].valid &&
      this.oneTimeShippingAddrForm.controls["city"].valid &&
      this.oneTimeShippingAddrForm.controls["state"].valid &&
      this.oneTimeShippingAddrForm.controls["zipCode"].valid
    ) {
      const formValues = this.oneTimeShippingAddrForm.value;
      const payload = `(IvVstel='',` +
        `IvCity='${formValues.city}',` +
        `IvCountry='US',` +
        `IvPostalCode='${formValues.zipCode}',` +
        `IvProvideAlt=1,` +
        `IvRegion='${formValues.state}',` +
        `IvStreetLine='${encodeURIComponent(formValues.streetAddress)}')?$format=json`;
      this.productService.progressShow('validateAddress');
      this.errorMessage = '';
      this.isOneTimeAddrValid = false;
      this.productService.validateAddress(payload).subscribe({
        next: (res) => {
          this.productService.progressHide();
          const EvStatus = res?.d?.EvStatus;
          const EvMessage = res?.d?.EvMessage;
          if(EvStatus == "S"){
            this.isOneTimeAddrValid = true;
          }else if(EvStatus == "E" && EvMessage == "Invalid Address"){
            this.errorMessage = EvMessage;
            this.isOneTimeAddrValid = false;
          }else if(EvStatus == "E" && EvMessage == "Suggested Address"){
            let EsAddress = res?.d?.EsAddress;
            let suggestedAddress = `Suggested Address: ${EsAddress?.Addressline || ""}, 
                                    ${EsAddress?.Politicaldivision2 || ""}, ${EsAddress?.Politicaldivision1 || ""}, 
                                    ${EsAddress?.Postcodeprimarylow || ""}`;
            this.errorMessage = suggestedAddress;
            this.isOneTimeAddrValid = false;
          }else{
            this.errorMessage = "Invalid Address";
            this.isOneTimeAddrValid = false;
          }
        },
        error: (err) => {
            this.productService.progressHide();
        },
      });
    }
    
  }

  keyPressForZip(e: KeyboardEvent) {
    return /^[a-z,A-Z, ,0-9]$/i.test(e.key);
  }

  orderUpdatedDate(reqDate:any){
    const lastModifiedDate = new Date(reqDate);
    const millisecondsIn72Hours = 72 * 60 * 60 * 1000;
    return !isNaN(lastModifiedDate.getTime()) && 
      (new Date().getTime() - lastModifiedDate.getTime() > millisecondsIn72Hours);
  }

  setUpdatedStatus(headerField:any, itemValue:any, shipToAddress:boolean = false){
    if (!headerField) return; 
    headerField.map((field:any) => {
      if(field.Status === "CancelOrder" || field.Status === "cancel line" ){
        field.CXStatus = (itemValue?.includes('Cancelled') || itemValue === 'CANCELLED') ? this.approvedStatus : 
                          ((!itemValue?.includes('Cancelled') && itemValue != 'CANCELLED') && !this.orderUpdatedDate(field?.RequestedDate)) ? "In Progress" : 
                          this.declineStatus;
      } else if(shipToAddress){
        field.Status = (field?.Requested?.toLowerCase().includes(itemValue.toLowerCase())) ? this.approvedStatus : 
                          (field.Requested?.toLowerCase() !== itemValue.toLowerCase() && !this.orderUpdatedDate(field?.RequestedDate)) ? "In Progress" : 
                          this.declineStatus;
      }else{
        field.Status = (field.Requested == itemValue) ? this.approvedStatus : 
                          (field.Requested !== itemValue && !this.orderUpdatedDate(field?.RequestedDate)) ? "In Progress" : 
                          this.declineStatus;
      }
      
      if(field.Status == "In Progress" || field.CXStatus == "In Progress"){
        this.hasInProgressStatus = true;
      }
    });
  }

  setLineLevelStatus(orderUpdatedObj:any, isAllowed:boolean = false){
    
    for (const item of this.orderData?.camsCartEntries) {
      if(item.camsOrderNumber == ""){
        item.camsOrderNumber = null;
      }
      if (item?.camsOrderNumber == orderUpdatedObj[item.camsOrderNumber]?.CartNumber) {

        const header = orderUpdatedObj[item?.camsOrderNumber]?.Header;
        if (header?.ReqDeliveryDate) {
          const formattedRequestedDate = this.datePipe.transform(item?.uniqueRequestDate && item?.uniqueRequestDate !='As Requested' ? item?.uniqueRequestDate : item?.requestedDeliveryDate, "yyyy-MM-dd");
          this.setUpdatedStatus(header.ReqDeliveryDate, formattedRequestedDate);
        }
        
        this.setUpdatedStatus(header?.ShippingMethod, item?.shippingConditions);
       /*  this.setUpdatedStatus(header?.IncoTerms, item?.incoTerms);
        this.setUpdatedStatus(header?.ShippingWarehouse, item?.shippingWarehouse);
        this.setUpdatedStatus(header?.ShipVia, item?.shipVia); */

        const cartEntriesMap = new Map<string, any>();
        if (item.cartEntries) {
          item.cartEntries.forEach((entry: any) => {
            cartEntriesMap.set(String(entry.entryNumber), entry);
          });
        }

        if (orderUpdatedObj[item.camsOrderNumber]?.LineItems) {
          for (const lineItem of orderUpdatedObj[item.camsOrderNumber].LineItems) {
            const matchingCartEntry = cartEntriesMap.get(String(lineItem.LineNumber));
            if (matchingCartEntry) {
              lineItem.styleDetails = `${ matchingCartEntry?.product?.name } - ${ matchingCartEntry?.product?.styleNumber } -
              ${ matchingCartEntry?.product?.sellingColorName } - ${ matchingCartEntry?.product?.sellingColorId } -
              ${ matchingCartEntry?.product?.sellingSizeId }`;
              this.setUpdatedStatus(lineItem?.SideMark, matchingCartEntry?.sideMark);
              this.setUpdatedStatus(lineItem?.OrderQty, matchingCartEntry?.userRequestedQuantity);
              if(matchingCartEntry?.camsOrdersSolution && matchingCartEntry?.camsOrdersSolution[0]?.OrderStatus){
                this.setUpdatedStatus(lineItem?.CancelledLines, this.getLineStatus(matchingCartEntry?.camsOrdersSolution[0]?.OrderStatus));
              }else{
                this.setUpdatedStatus(lineItem?.CancelledLines, matchingCartEntry?.status);
              }
              
            }
          }
        }
      }
    }
  }

  addLineStatusUpdate() {
    const addedLines = new Set<string>();
    this.orderData?.camsCartEntries.forEach((order:any) => {
      order?.cartEntries?.forEach((entry:any) => {
        if (entry?.product) {
          addedLines.add(`${entry.product.styleNumber}-${entry.product.colorName}-${entry.quantity}`);
        }
      });
    });
    
    this.reqOrderUpdates.AddedLineDetails.map((item: any) => {
      const uniqueLineIdentifier = `${item?.StyleNumber}-${item?.ColorName}-${item?.Quantity}`;
      const status = addedLines.has(uniqueLineIdentifier)
        ? 'Approved'
        : (this.showReqModification ? this.declineStatus : 'In Progress');
      item.CXStatus = status;
      if(item.CXStatus == "In Progress"){
        this.hasInProgressStatus = true;
      }
    });
  }

  getObjectKeys(obj: object): string[] {
    if (obj) { // or if (obj !== null && obj !== undefined)
      return Object.keys(obj);
    }
    return []; 
  }

  formatDescription(key: string): string {
    switch (key) {
      case 'ReqDeliveryDate': return 'Requested Delivery Date';
      case 'ShippingMethod': return 'Shipping Method';
      case 'IncoTerms': return 'Inco Terms';
      case 'ShippingWarehouse': return 'Shipping Warehouse';
      case 'ShipVia': return 'Ship Via';
      case 'OrderQty': return 'Order Quantity';
      case 'ShipToAddress': return 'Ship-To Address';
      case 'PaymentTerms': return 'Payment Terms';
      case 'Po': return 'PO Number';
      case 'MA': return 'Mohawk Arranged';
      case 'PM': return 'Pickup At mill';
      case 'PS': return 'Pickup At Satellite';
      case 'MF': return 'Mohawk Fleet';
      case 'CA': return 'Customer Arranged';
      case 'ME': return 'Mohawk Expedited';
      case 'PA': return 'Parcel';
      case 'MN': return 'Mohawk Non Fleet';
      case 'SideMark': return 'Side Mark';
      case 'ShipCompleteOrder': return 'Ship Complete Order';
      default: return key;
    }
  }

  getUOMDesc(key: string): string {
    switch (key) {
      case 'YDK': return 'Square Yard';
      case 'FTK': return 'Square foot';
      case 'EA': return 'Each';
      case 'PAL': return 'Pal';
      case 'PF': return 'PF';
      case 'LF': return 'Linear FT';
      case 'ZCT': return 'Carton';
      case 'RO': return 'Roll';
      default: return key;
    }
  }

  numberOnly(event: any, type: any = ""): boolean {
    const value = event?.currentTarget?.value;
    const charCode = event.which ? event.which : event.keyCode;
    if (type === "YDK" || type === "FTK" || type == "LF" || type == "rolls") {
      if (event?.key == "." && value.includes(".")) {
        return false;
      }
      return this.isDecimalNumberKey(event, type);
    } else if (type === "ZCT") {
      if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false;
      }
      if (event?.key === ".") {
        return false;
      }
      return true;
    } else {
      if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false;
      }
      return true;
    }
  }

  isDecimalNumberKey(event: any, type:any='') {
    const value = event?.currentTarget?.value;

    var charCode = event.which ? event.which : event.keyCode;
    if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57))
      return false;
    
    if (value.includes(".")) {
      let val = value.split(".");
      val = val[val.length - 1].split("");
      if(parseFloat(val + event.key) > 11 && type == "LF"){
        return false;
      }
      if (val.length > 1) {
        return false;
      }
    }
    return true;
  }

  keyPressNumbers(e: any) {
    let inchesValue = e.currentTarget?.value ? e.currentTarget.value : 0;
    const currentValue = Number(inchesValue + e.key);
    const isTwoDigits = /^\d{0,2}$/.test(currentValue.toString());
    const isWithinRange = currentValue >= 0 && currentValue <= 11;
    
    if (e?.key == ".") {
      return false;
    }
    
    if (isTwoDigits && isWithinRange) {
      return true;
    } else {
      e.preventDefault();
      return false;
    }
  }

  restrictUptoTwoDecimal(e: any) {
    var t = e.target.value;
    e.target.value =
      t.indexOf('.') >= 0
        ? t.substr(0, t.indexOf('.')) + t.substr(t.indexOf('.'), 3)
        : t;
    if ((e.target.value + '')[0] === '0') {
      e.target.value = '';
    }
  }

  @ViewChild("scrollToAddLine", { read: ElementRef }) scrollToAddLine: any;
  addNewLine(event: Event){
    event.preventDefault();
    this.showAddNewLine = true;
    setTimeout(() => {
      this.scrollToAddLine?.nativeElement.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, 100);
    
  }


  deleteLineItem(index:number){
    this.addedLineItems.splice(index,1);
  }

  cancelOrderOrLine(data:any = {}, selectedReason:any={}, isLineLevel:boolean = false){
    const orderNumber = this.orderData?.orderCode;
    const lineNumber = isLineLevel ? data?.entryNumber : "";
    const cartNumber = isLineLevel ? data?.camsOrderNumber : "";
    const payload = [{
        "UserId": this.userInfo?.uid,
        "CustomerId": this.userInfo.orgUnit.uid,
        "StyleName": isLineLevel ? data?.product?.name : "",
        "StyleNumber": isLineLevel ? data?.product?.styleNumber : "",
        "ColorName": isLineLevel ? data?.product?.sellingColorName : "",
        "ColorNumber": isLineLevel ? data?.product?.sellingColorId : "",
        "SizeCode": isLineLevel ? data?.product?.sellingSizeId : "",
        "SizeDesc": isLineLevel ? data?.product?.sellingSizeDescription || "" : "",
        "Quantity": isLineLevel ? data?.userRequestedQuantity : "",
        "Uom": isLineLevel ? data?.uom?.name : "",
        "OrderNumber": +orderNumber,
        "LineNumber": +lineNumber,
        "CartNumber": +cartNumber,
        "CancelLine": isLineLevel,
        "CancelOrder": !isLineLevel,
        "CancelReason": selectedReason?.cancelDescription,
        "CancelCode": selectedReason?.cancelCode
    }];
    
    this.cancelOrder(payload);
  }

  cancelOrder(payload:any){
    this.progressShow('cancelOrderOrLine');
    this.orderService.cancelOrderOrLine(payload).subscribe({
      next: (res: any) => {
        this.showReqModification = false;
        this.hasInProgressStatus = true;
        this.hideConfirmationModal();
        this.editOrderSuccess("Cancelled successfully.");
      },
      error: (err: any) => {
        this.progressHide();
        this.hideConfirmationModal();
        this.hideEditMode();
      }
    });
  }

  editOrderSuccess(message: string = ''){
    this.progressHide();
    this.getOrderIdDetails();
    this.hideEditMode();
    this.showEditSuccess = true;
    this.editSuccessMsg = message;
    this.editAlertType = 'success';
    setTimeout(() => {
          this.showEditSuccess = false;
    }, 15000);
  }

  hideEditMode(){
    this.isEditOrder = false;
    this.showAddNewLine = false;
    this.addedLineItems = [];
    this.errorMessage = '';
  }

  handleAddLineFormChange(value: any = []) {
    this.addedLineItems.push(value);
  }

  submitAddLine(){
    //this.progressShow('addNewLineOrder');
    let payload = this.addedLineItems.map((item:any) => {
                  return {
                      OrderNumber: +this.orderData?.orderCode,
                      StyleNumber: item.sellingStyleId,
                      StyleName: item.sellingStyleName,
                      ColorNumber: item.sellingColorId,
                      ColorName: item.sellingColorName,
                      BackingCode: item.sellingBackingId,
                      BackingDesc: item.sellingBackingName,
                      SizeCode: item.sellingSizeId,
                      SizeDesc: item.size,
                      Uom: item.uom,
                      Quantity: item.qty,
                      RequestedPrice: item.requestedPrice,
                      ProductPrice1: item.productPrice1,
                      ProductPrice2: item.productPrice2,
                      PriceComment: item.priceComment,
                      "UserId": this.userInfo?.uid,
                      "CustomerId": this.userInfo.orgUnit.uid,
                  };
              });
    this.orderService.addNewLine(payload).subscribe({
      next: (res: any) => {
        //this.progressHide();
      },
      error: (err: any) => {
        //this.progressHide();
      }
    });
  }

  formatOrderCartData() {
    
    return {
      CartDetails: this.orderData?.camsCartEntries.map((cart:any) => ({
        CartNumber: +cart?.camsOrderNumber,
        Event: "",
        ReqDeliveryDate: {
          Existing: cart?.updatedRequestedDeliveryDate ? cart?.requestedDeliveryDate : "" ,
          Requested: cart?.updatedRequestedDeliveryDate && this.datePipe.transform(new Date(cart?.updatedRequestedDeliveryDate), "yyyy-MM-dd") || "",
          RequestedDate: ""
        },
        ShippingMethod: {
          Existing: cart?.updatedShippingMethod ? cart?.shippingConditions : "",
          Requested: cart?.updatedShippingMethod != cart?.shippingConditions ? cart?.updatedShippingMethod || '' : "",
          RequestedDate: ""
        },
        /* IncoTerms: {
          Existing: cart?.updatedIncoTerms ? cart?.incoTerms : "",
          Requested: cart?.updatedIncoTerms != cart?.incoTerms ? cart?.updatedIncoTerms || '' : "",
          RequestedDate: ""
        },
        ShippingWarehouse: {
          Existing: cart?.updatedShippingWarehouse ? cart?.shippingWarehouse : "",
          Requested: cart?.updatedShippingWarehouse != cart?.shippingWarehouse ?  cart?.updatedShippingWarehouse || ''  : "",
          RequestedDate: ""
        },
        ShipVia: {
          Existing: cart?.updatedShipVia ? cart?.shipVia : "",
          Requested: cart?.updatedShipVia != cart?.shipVia ? cart?.updatedShipVia || '' : "",
          RequestedDate: ""
        }, */
        LineDetails: cart.cartEntries.map((line: any) => ({
          LineNumber: line.entryNumber,
          StyleName: line?.product?.name,
          StyleNumber: line?.product?.styleNumber,
          ColorName: line?.product?.sellingColorName,   
          ColorNumber: line?.product?.sellingColorId,
          SizeCode: line?.product?.sellingSizeId,
          SizeDesc: line?.product?.sellingSizeDescription,
          BackingCode: line?.product?.sellingBackingId,
          BackingDesc: line?.product?.sellingBackingName,
          UomCode: line?.uom?.code,
          UomDesc: this.getUOMDesc(line?.uom?.code),
          SideMark: {
            Existing: line?.updatedSideMark && line?.updatedSideMark.trim()  ? line?.sideMark : "",
            Requested: line?.updatedSideMark && line?.updatedSideMark.trim() || "",
            RequestedDate: ""
          },
          OrderQty: {
            Existing: line?.updatedUserRequestedQuantity && line?.updatedUserRequestedQuantity != line?.userRequestedQuantity ? line?.userRequestedQuantity : "",
            Requested: line?.updatedUserRequestedQuantity && line?.updatedUserRequestedQuantity != line?.userRequestedQuantity ? line?.updatedUserRequestedQuantity : "",
            RequestedDate: ""
          }
        }))
      }))
    };
  }

  hasRequestedValue(obj:any): boolean {
    if (obj.Po.Requested.trim() || obj.ShipToAddress.Requested.trim() || obj.ShipCompleteOrder.Requested) {
      return true;
    }
    for (const cartDetail of obj?.CartDetails) {
      if (
        cartDetail.ReqDeliveryDate?.Requested ||
        cartDetail.ShippingMethod?.Requested
      ) {
        return true;
      }

      for (const lineDetail of cartDetail?.LineDetails) {
        if (lineDetail.SideMark?.Requested.trim() || lineDetail.OrderQty?.Requested.toString().trim()) {
          return true;
        }
      }
    }

    return false;
  }


  showEditSuccess: boolean = false;
  submitRequestedChanges(){
     let shipToAddr = '';
    let existingShipToAddr = `Ship To # ${this.deliveryAddress?.id.split('_')[0]} ${this.deliveryAddress?.formattedAddress}`;
    if (this.orderData?.oneTimeShipTo && this.isOneTimeAddrValid) {
      const formValue = this.oneTimeShippingAddrForm.value;
      shipToAddr = `${formValue?.name},  ${formValue?.streetAddress}, ${formValue?.streetAddress2}, ${formValue?.city}, ${formValue?.state}, ${formValue?.zipCode}`;
      existingShipToAddr = this.deliveryAddress?.formattedAddress;
    } else if(this.selectedShipTodAddr && this.selectedShipTodAddr?.id != this.deliveryAddress?.id 
              && !this.orderData?.oneTimeShipTo) {
      const shipToId = this.selectedShipTodAddr.id.split('_')[0];
      shipToAddr = `Ship To # (${shipToId}) ${this.selectedShipTodAddr.formattedAddress}`;
    }

    let shipCompleteOrderFlag = this.orderData?.shipCompleteOrderFlag ? 'Y' : 'N';
    
    let payload = {
      "Event": "",
      "OrderNumber": +this.orderData?.orderCode,
      "OrderDate": this.orderData?.placed && this.datePipe.transform(new Date(this.dateConvert(this.orderData?.placed)), "yyyy-MM-dd"),
      "UserId": this.userInfo?.uid,
      "CustomerId": this.orderData?.shippingAddress?.id,
      "SoldTo": this.orderData?.soldToAddress?.id,
      "OneTimeShipTo": this.orderData?.oneTimeShipTo,
      "Comments": {
          "Existing": "",
          "Requested": "",
          "RequestedDate": ""
      },
      "Po": {
          "Existing": this.poNumber && this.poNumber.trim() != this.orderData?.poNumber ? this.orderData?.poNumber || "" : "",
          "Requested": this.poNumber && this.poNumber.trim() != this.orderData?.poNumber ? this.poNumber.trim() : "",
          "RequestedDate": ""
      },
      "PaymentTerms": {
          "Existing": "",
          "Requested": "",
          "RequestedDate": ""
      },
      "ShipToAddress": {
          "Existing": existingShipToAddr,
          "Requested": shipToAddr,
          "RequestedDate": ""
      },
      "ShipCompleteOrder": {
          "Existing": this.shipCompleteOrderValue && shipCompleteOrderFlag != this.shipCompleteOrderValue ? shipCompleteOrderFlag : "",
          "Requested": this.shipCompleteOrderValue && shipCompleteOrderFlag != this.shipCompleteOrderValue ? this.shipCompleteOrderValue : "",
          "RequestedDate": ""
      },
      "CartDetails": this.formatOrderCartData().CartDetails
    }
    const hasQtyChange = this.orderData?.camsCartEntries?.some((cart: any) =>
      cart.cartEntries?.some((line: any) => line.updatedUserRequestedQuantity && line.updatedUserRequestedQuantity.toString().trim() 
                                              && line.updatedUserRequestedQuantity.toString() != line.userRequestedQuantity.toString())
    );

    let confirmContent = `Do you have any other changes to this order ? All updates must be submitted together`;
    const warningMsg = `<br/><br/><span class="qty-warning">Quantity changes may affect unit pricing. Please review before submitting your request.</span>`;
    if (hasQtyChange) {
      confirmContent += `${warningMsg}`;
    }

    if((this.hasRequestedValue(payload) || this.addedLineItems.length > 0)){
      this.openConfirmationModal({
        title: "Submit order changes",
        content: confirmContent,
        primaryActionLabel: "Submit Request",
        secondaryActionLabel: "Go Back",
        onPrimaryAction: () => {
          this.onSubmitRequested(payload);
        },
        onSecondaryAction: () => this.hideConfirmationModal(),
      });
    }else{
      this.onSubmitRequested(payload);
    }
  }

  onSubmitRequested(payload:any){
    if(this.hasRequestedValue(payload) || this.addedLineItems.length > 0){
      this.progressShow('updateOrderDetails');
      this.orderService.updateOrderDetails(payload).subscribe({
        next: (res: any) => {
          this.showReqModification = false;
          this.hasInProgressStatus = true;
          this.hideConfirmationModal()
          if(this.addedLineItems.length > 0){
            this.submitAddLine();
          }
          this.editOrderSuccess("Submitted requested changes successfully. Please allow up to 30 mins for these changes to be processed.");
          this.scrollPageToTop();
        },
        error: (err: any) => {
          this.progressHide();
          this.hideEditMode();
          this.hideConfirmationModal();
          this.scrollPageToTop();
        }
      });
    }else{
      this.editSuccessMsg = "Please update at least one value to submit your request.";
      this.editAlertType = 'danger';
      this.showEditSuccess = true;
      this.hideConfirmationModal();
      this.scrollPageToTop();
      setTimeout(() => {
          this.showEditSuccess = false;
      }, 10000);
    }
  }

  shipCompleteOrderValue:any = '';
  onShipOrderRadioSelected(value: string) {
    this.shipCompleteOrderValue = value;
    const uniqueShippingConditions = new Set(
      this.orderData.camsCartEntries.map((entry: any) => entry.shippingCondition)
    );
    let allowShippingPreferenceChange =  uniqueShippingConditions.size == 1;
    if (
      value === "Y" &&
      this.orderData?.shipCompleteOrderFlag === false
    ) {
      if (!allowShippingPreferenceChange) {
        this.allowShippingPreferenceChange = false;
      } else {
        this.allowShippingPreferenceChange = true;
      }
    }
  }
}
