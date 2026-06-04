import {
  Component,
  OnInit,
  ViewEncapsulation,
  QueryList,
  TemplateRef,
  ViewChildren,
  OnDestroy,
  ViewChild,
  ElementRef,
  Inject,
  HostListener,
} from "@angular/core";
import { BreadcrumbItems } from "src/app/features/shared/interfaces/breadcrumb-items";
import { ActivatedRoute } from "@angular/router";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { QuotesService } from "../../services/quotes.service";
import { Columns, Config, DefaultConfig } from "ngx-easy-table";
import { Router } from "@angular/router";
import { CancelQuotePopupComponent } from "../cancel-quote-popup/cancel-quote-popup.component";
import { jsPDF } from "jspdf";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import html2canvas from "html2canvas";
import { DatePipe, DOCUMENT, formatDate } from "@angular/common";
import { UserService } from "src/app/features/shared/user/services/user.service";
import { XchangeAddAccessoriesLightboxComponent } from "src/app/features/shared/components/xchange-add-accessories-lightbox/xchange-add-accessories-lightbox.component";
import { ProductService } from "../../../products/pages/services/product.service";
import { StorageService } from "src/app/features/http-services/storage.service";
import { CommercialPlpTypes } from "src/app/features/shared/constants/menu/commercial.config";
import { RejectQuotePopupComponent } from "../reject-quote-popup/reject-quote-popup.component";
import { ConfirmationDialogComponent } from "src/app/features/shared/components/confirmation-dialog/confirmation-dialog.component";
import { ChooseAddressLightboxComponent } from "../choose-address-lightbox/choose-address-lightbox.component";
import { debounceTime, of, Subscription, take } from "rxjs";

import { XchangeViewAllColorsComponent } from "src/app/features/shared/components/xchange-view-all-colors/xchange-view-all-colors.component";
import { AddAccessoriesComponent } from "../add-accessories/add-accessories.component";
import { PotentialMatchesQuotesComponent } from "../potential-matches-quotes/potential-matches-quotes.component";
import { AddCompanionProductsComponent } from "../add-companion-products/add-companion-products.component";
import { OrderService } from "src/app/features/residential/orders/services/order.service";
import { ProgressModalComponent } from "src/app/features/shared/components/progress-modal/progress-modal.component";
import { MESSAGE_CONSTANTS } from "src/app/features/shared/constants/MESSAGE-CONSTANTS";
import { ShareViaEmailLightboxComponent } from "../../../products/components/share-via-email-lightbox/share-via-email-lightbox.component";

@Component({
    selector: "app-quote-detail",
    templateUrl: "./quote-detail.component.html",
    styleUrls: ["./quote-detail.component.scss"],
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class QuoteDetailComponent implements OnInit, OnDestroy {
  @ViewChildren("hidden") hidden: QueryList<QuoteDetailComponent> | undefined;

  myusername: string = "";
  rollsPlaceholder = 200;
  isCollapsed = true;
  quoteId: any;
  quote: any;
  commentText: string = "";
  modalRef?: BsModalRef;
  quoteDetails: any[] = [];
  bsModalRef?: BsModalRef;
  productType: any;
  subProductType: any;
  quoteEntries: any = [];
  cartData: any = {};
  changeDeliveryType!: TemplateRef<any>;
  unitArray: any = [];
  detailedProductType: string = "";
  shippingAddress: any;
  feetYardFormData: any;
  uid: string = "";
  pdbData: any;
  spinnerLoading: boolean = true;
  minicartSubscription: any;
  enableCheckAvailability: any;
  @ViewChild("shippingOption", { static: true })
  shippingOption!: TemplateRef<any>;
  @ViewChild("changeDeliveryType", { static: true })
  enableOrderSample: any;
  enableRequestQuote: any;
  overAgesStringArray: any = [];
  showAssignedSpec = false;
  conversionUnit: any;
  isAtpCheck: boolean = false;
  atpCheckProductTypes = JSON.parse(CommercialPlpTypes.atpCheckProductTypes);
  quoteCode: any;
  reservesData: any;
  reserveNumberDetailing: any;
  feetValue: any = "";
  entry: any;
  cartCode: any;
  alertData: any = {
    message: "success",
  };
  alertType: any = "success";
  alertTrigger: any = false;
  commentTrigger: any = false;
  colorTrigger: any = false;
  quantityValue: any;
  // comments: any;
  hasShippingInfo = false;
  // submittedFor = "";
  // contactEmail = "";
  // submittedBy = "";
  totalPrice = "";
  enableConvertToOrder: boolean | any;
  size = 0;
  form!: FormGroup;
  formattedAddress: any;
  shippingMethod: string | undefined;
  shippingMethodAbreviation: string | undefined;
  shippingWarehouse: string | undefined;
  shipVia: string | undefined;
  shipTo: any;
  marketSegment: string | undefined;
  csrSuperAdmin: any = {};
  buyerOffered!: boolean;
  enableCancelQuote!: boolean;
  showAlert = false;
  alertMessage = "";
  isSolutionDetailsClicked: boolean = false;
  entryNumber: any;
  multiCutsForm: any;
  isAdhesivesAvailable = false;
  defaultIncoTerms: any;
  defaultIncoTermsDesc: any;
  commentsFlag: boolean = false;
  showTermsReason: boolean = false;
  pro: any;
  air: any;
  mini: any;
  sampleOrder: any;
  showComments: boolean = false;
  currentDate = new Date().toLocaleString("en-US", {
    timeZone: "America/New_York",
    timeZoneName: "short",
  });
  invalidProduct:boolean = false;
  constructor(
    private modalService: BsModalService,
    private route: ActivatedRoute,
    private quotesService: QuotesService,
    private router: Router,
    private userService: UserService,
    public productService: ProductService,
    private storageService: StorageService,
    private service: ProductService,
    private fb: FormBuilder,
    private orderService: OrderService,
    @Inject(DOCUMENT) private document: Document,
    private datePipe: DatePipe
  ) { }
  createFeetYardForm() {
    this.feetYardFormData = this.fb.group({
      unit: ["YDK", [Validators.required]],
      quantity: [""],
      feet: ["", [Validators.required]],
      inches: [""],
      dye: [""],
      targetLength: [""],
      minLengthFT: [{ value: '', disabled: true }],
      maxLengthFT: [{ value: '', disabled: true }],
      maxFeet: [""],
      maxInches: [""],
      minFeet: [""],
      minInches: [""],
    });
  }

  shareViaEmailModal(pdfContent: any, template2: TemplateRef<any>) {


    let mailSubject = `Mohawk Quote details for ${this.quote?.code}`;
    const initialState: ModalOptions = {
      initialState: {
        mailSubject: mailSubject,
        content: pdfContent,
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

  cancelQuoteModal() {
    const initialState: ModalOptions = {
      initialState: {
        quoteCode: this.quote.code,
      },
    };
    this.bsModalRef = this.modalService.show(
      CancelQuotePopupComponent,
      Object.assign(initialState, {
        class: "modal-md modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );
  }

  public configuration!: Config;
  public columns!: Columns[];
  public data = [
    {
      orderedQTY: "143’ 00” LF",
      shippedQTY: ".00",
      answeredQTY: "143’ 00” LF",
      dyelot: "601271",
      roll: "16772311",
    },
  ];
  breadcrumbItems: BreadcrumbItems = [
    {
      name: "Home",
      path: "/commercial",
      active: false,
    },
    {
      name: "Quotes",
      path: "commercial/quotes/quote",
      active: false,
    },
    {
      name: "Quote-detail",
      path: " ",
      active: true,
    },
  ];
  updateDataSubscription!: Subscription;
  mtClass: any;
  poMtclass: any;
  pLine: any;
  header: any;
  @HostListener("window:resize", ["$event"])
  onResize(event: any) {
    const { mtClass, poMtclass, pLine, header, pro, air, mini } =
      this.userService.getDeviceType();
    this.mtClass = mtClass;
    this.poMtclass = poMtclass;
    this.pLine = pLine;
    this.header = header;
    this.pro = pro;
    this.air = air;
    this.mini = mini;
  }
  ngOnInit(): void {
    const { mtClass, poMtclass, pLine, header, pro, air, mini } =
      this.userService.getDeviceType();
    this.mtClass = mtClass;
    this.poMtclass = poMtclass;
    this.pLine = pLine;
    this.header = header;
    this.pro = pro;
    this.air = air;
    this.mini = mini;
    this.form = this.fb.group({
      entries: this.fb.array([]),
    });
    this.storageService.getItem("miniCartCount").subscribe((res) => {
      this.cartData = res;
      this.sampleOrder = res?.sampleOrder;
    });
    this.getdata();

    this.updateDataSubscription = this.quotesService.updateData.subscribe(
      () => {
        this.getdata();
      },
      (err:any)=>{
        this.progressHide();
      }
    );
    
    this.storageService.getItem("userInfo").subscribe((res) => {
      this.csrSuperAdmin = res;
      this.showTermsReason =
        res?.isCSR == true || res?.isSalesPerson || res?.isSalesOps
          ? true
          : false;
    },(err:any)=>{
      this.progressHide();
    });
    this.shippingAddress = this.productService.getDefaulAddress();
    localStorage.setItem("currentPath", this.router.url);
    this.configuration = { ...DefaultConfig };
    this.configuration.checkboxes = false;
    this.configuration.tableLayout.striped = true;
    this.configuration.tableLayout.hover = false;
    this.configuration.paginationRangeEnabled = false;
    this.configuration.paginationEnabled = false;

    this.columns = [
      { key: "orderedQTY", title: "Ordered QTY" },
      { key: "shippedQTY", title: "Shipped QTY" },
      { key: "assignedQuantityInSY", title: "Assigned QTY" },
      { key: "dyeLot", title: "Dyelot" },
      { key: "rollNumber", title: "Roll #" },
    ];

    this.storageService.getItem("uid").subscribe((res) => {
      this.uid = res;
    },(err:any)=>{
      this.progressHide();
    });

    this.removeATPCart();
  }

  isDisabled: boolean = true;

  trackByCode = (_: number, item: any) => item?.product?.code ?? item?.code ?? _;
  trackByKey = (_: number, item: any) => item?.key ?? _;
  trackByName = (_: number, item: any) => item?.name ?? _;

  ngOnDestroy(): void {
    this.removeATPCart();
    this.updateDataSubscription.unsubscribe();
  }

  updateSelectedQuantity(entryNumber: number, event: any) {
    this.entryData[entryNumber].selectedAmount =
      event.target.value === "" || event.target.value === "0"
        ? ""
        : Number(event.target.value);
   /*  let entriesForm: any = this.form.controls["entries"];
    entriesForm["controls"][entryNumber].controls["selectedAmount"].setValue(
      this.entryData[entryNumber].selectedAmount
    ); */
  }

  excessQntyErrType = "";
  excessQntyErrMsg = "";
  checkExcessQuantity(entryNumber: number, uomType:any) {
    const value = Number(this.entryData[entryNumber].selectedAmount);
    const type = uomType;
    const minMsg =
      "Excessive quantity entered. Please verify the quantity entered is the desired amount.";
    const maxMsg =
      "Excessive quantity entered. Please contact customer service for ordering assistance or adjust the quantity to enable the Check Availability option.";
    this.excessQntyErrMsg = "";
    this.excessQntyErrType = "";
    this.entryData[entryNumber]?.product?.quantityValidation?.filter((d: any) => {
      if (d?.UOM === type) {
        if (value >= d?.warnLength && value < d?.stopLength) {
          this.excessQntyErrMsg = minMsg;
          this.excessQntyErrType = "warning";
        } else if (value >= d?.stopLength) {
          this.excessQntyErrMsg = maxMsg;
          this.excessQntyErrType = "danger";
        }
      }
    });
    
    return (this.excessQntyErrType == "danger") ? true : false;
  }
  
  convertOrderClick() {
    if (this.conflictingCartExists()) {
      this.openConfirmationModal({
        title: "Information",
        content:
          "We could see a quote cart present already. Proceeding with this will delete the current quote cart. Do you still want to continue?",
        primaryActionLabel: "Continue",
        secondaryActionLabel: "Cancel",
        onPrimaryAction: () => {

          this.productService
            .cancelCart(this.cartData?.code || "123456")
            .subscribe(
              (res: any) => {
                this.convertToQuoteCart();
              },
              (err: any) => {
                this.errorMessage = err?.errorMessage;
              },
            );
        },
      });
    } else {
      this.convertToQuoteCart();
    }
  }

  convertToQuoteCart() {
    if (this.quote?.isAdhesivesAvailable) {
      this.openConfirmationModal({
        title: "Information",
        content:
          "Mohawk Adhesives are required to ensure your product warranty. Would you like to add adhesives to your order",
        primaryActionLabel: "Accept",
        secondaryActionLabel: "Decline",
        onPrimaryAction: () => {
          this.openAddAcessoriesModal(false);
        },
        onSecondaryAction: () => {
          this.navigateToCheckout();
        },
      });
    } else {
      this.navigateToCheckout();
    }
  }

  convertCartClick() {
    this.router.navigateByUrl("/commercial/cart");
  }
  convertOrder() {
    if (this.conflictingCartExists()) {
      localStorage.setItem("quoteNumber", this.quoteId);
      this.openConfirmationModal({
        title: "Information",
        content:
          "We could see a quote cart present already. Proceeding with this will delete the current quote cart. Do you still want to continue?",
        primaryActionLabel: "Continue",
        secondaryActionLabel: "Cancel",
        onPrimaryAction: () => {
          this.spinnerLoading = true;

          this.productService
            .cancelCart(this.cartData?.code || "123456")
            .subscribe(
              (res: any) => {
                this.spinnerLoading = false;
                this.openAddAcessoriesModal();
              },
              (err: any) => {
                this.spinnerLoading = false;
                this.errorMessage = err?.errorMessage;
              }
            );
        },
      });
    } else {
      if (this.isAdhesivesAvailable) {
        this.openConfirmationModal({
          title: "Information",
          content:
            "Mohawk Adhesives are required to ensure your product warranty. Would you like to add adhesives to your order",
          primaryActionLabel: "Yes",
          secondaryActionLabel: "No",
          onPrimaryAction: () => {
            this.modalRef?.hide();
            const initialState: ModalOptions = {
              initialState: {
                quoteCode: this.quoteId,
                navigateToCheckoutAfter: true,
                buttonName: "Convert to order",
                getUpdatedAccessories: () => {
                  this.getdata();
                },
              },
            };
            this.bsModalRef = this.modalService.show(
              AddAccessoriesComponent,
              Object.assign(initialState, {
                class: "modal-xl modal-dialog-centered quoteAccessories",
                backdrop: "static",
                keyboard: false,
              })
            );
          },
          onSecondaryAction: () => {
            this.navigateToCheckout();
          },
        });
      } else {
        this.navigateToCheckout();
      }
    }
    // if (this.conflictingCartExists()) {

    //   this.openConfirmationModal({
    //     title: "Information",
    //     content:
    //       "We could see a quote cart present already. Proceeding with this will delete the current quote cart. Do you still want to continue?",
    //     primaryActionLabel: "Continue",
    //     secondaryActionLabel: "Cancel",
    //     onPrimaryAction: () => {
    //       this.spinnerLoading = true;

    //       this.productService
    //         .cancelCart(this.cartData?.code || "123456")
    //         .subscribe(
    //           (res: any) => {
    //             this.spinnerLoading = false;
    //             this.navigateToCheckout();
    //           },
    //           (err: any) => {
    //             this.spinnerLoading = false;
    //             this.errorMessage = err?.errorMessage;
    //           }
    //         );
    //     },
    //   });
    // } else {
    // }
  }
  openAddAcessoriesModal(showContinueShopping = true) {
    const initialState: ModalOptions = {
      initialState: {
        quoteCode: this.quoteId,
        navigateToCheckoutAfter: true,
        buttonName: "convert to order",
        showContinueShopping: showContinueShopping,
        getUpdatedAccessories: () => {
          this.getdata();
        },
      },
    };
    this.bsModalRef = this.modalService.show(
      AddAccessoriesComponent,
      Object.assign(initialState, {
        class: "modal-xl modal-dialog-centered quoteAccessories",
        backdrop: "static",
        keyboard: false,
      })
    );
  }
  navigateToCheckout() {
    this.quotesService.convertOrderClicked = true;
    this.quotesService.quoteCartCode = this.quote.code;
    this.userService.getCurrentUserDetail().subscribe((profileRes: any) => {
      this.progressShow('checkout')
      this.quotesService
        .convertOrder(this.quotesService.quoteCartCode)
        .subscribe(
          (res: any) => {
            this.quotesService.convertOrderClicked = false;
            this.cartCode = res.body.code;
            this.productService.getMiniCartData(this.uid).subscribe((res: any) => {
              this.storageService.setItem("miniCartCount", res.body);
              this.modalService.hide();
              this.router.navigateByUrl("/commercial/cart");
            },(err:any)=>{
              this.progressHide();
            });
          },
          (err: any) => {
            this.spinnerLoading = false;
            this.progressHide()
            this.errorMessage = err?.errorMessage;
          }
        );
    });









  }
  conflictingCartExists(): boolean {
    if (
      !!!this.storageService.cartData ||
      this.storageService.cartData?.errorMessage?.startsWith("No Cart") ||
      this.storageService.cartData?.errorMessage?.startsWith("Unit not") ||
      this.storageService.cartData?.errorMessage?.startsWith("Cart not found")
    )
      return false;

    if (!this.storageService.cartData.isQuote) return true;

    if (this.storageService.cartData.quoteNumber !== this.quote.code)
      return true;

    return false;
  }
  entryData: any = [];
  base: any;
  getdata() {
    this.updateDataSubscription = this.quotesService.checkError$
    .subscribe((isSuccess: boolean) => {
      if (!isSuccess) {
        this.progressShow('getData');
      }
    });
    this.createFeetYardForm();
    this.quoteId = this.route.snapshot.paramMap.get("id");
    this.quotesService
      .getQuoteDetails(this.userService.getUserEmail().toLowerCase(), this.quoteId)
      .subscribe(
        (res: any) => {
          this.scrollPageToTop();
          (this.form.get("entries") as FormArray).clear();
          this.quote = res.body;
          if (res?.error?.errorCode == "0001") {
            this.storageService.setItem(
              "showCancelQuoteMessage",
              res?.error?.message
            );
            this.router.navigate(["commercial/quotes/quote"]);
            return;
          }
          this.quoteEntries = res?.body?.entries ? res?.body?.entries : [];
          this.buyerOffered = this.quote?.state === "BUYER_OFFER";
          this.enableCancelQuote =
            this.quote?.state === "BUYER_OFFER" ||
            this.quote?.state === "BUYER_SUBMITTED";
          this.hasShippingInfo = !!this.quote?.deliveryAddress;
          this.shippingAddress = this.quote?.deliveryAddress;
          this.formattedAddress = this.quote?.deliveryAddress;
          this.shipTo = this.quote?.deliveryAddress?.id;
          this.shippingMethod =
            this.quote?.deliveryAddress?.shippingConditionDesc;
          this.shippingMethodAbreviation =
            this.quote?.deliveryAddress?.defaultShippingMethod;
          this.defaultIncoTerms = this.quote?.deliveryAddress?.defaultIncoTerms;
          this.defaultIncoTermsDesc =
            this.quote?.deliveryAddress?.defaultIncoTermsDesc;
          this.shippingWarehouse =
            this.quote?.deliveryAddress?.defaultShippingWarehouse;
          this.shipVia = this.quote?.deliveryAddress?.defaultShipVia;
          // this.submittedFor = this.quote?.submittedForName || "N/A";
          // this.contactEmail = this.quote?.contactEmail || "N/A";
          // this.submittedBy = this.quote?.submittedByName || "N/A";
          // this.comments = this.quote?.comments;
          this.marketSegment = this.quote?.marketSegment || "N/A";
          // this.marketSegmentName = this.quote?.marketSegmentName || "N/A";
          // this.endUser = this.quote?.endUserDescription || "N/A";
          // this.creUser = this.quote?.creUserDescription || "N/A";
          // this.gpoUser = this.quote?.gpoUserDescription || "N/A";
          // this.adUser = this.quote?.adUserDescription || "N/A";
          // this.preparedBy = {
          //   name: this.quote?.preparedByName || "N/A",
          //   email: this.quote?.preparedByEmail || "N/A",
          //   phone: this.quote?.preparedByPhone || "N/A",
          // };
          this.totalPrice =
            "$" +
            this.quote?.totalPriceWithTax?.value
              .toFixed(2)
              .replace(/\d(?=(\d{3})+\.)/g, "$&,");
          this.enableConvertToOrder = this.quote?.enableConvertToOrder || false;
          this.isAdhesivesAvailable = this.quote?.isAdhesivesAvailable;
          let entriesForms = this.form.get("entries") as FormArray;
          this.entryData = (this.quote?.entries || []).map((entry: any) => {
            let size = Number(entry.pricingUOMQuantity);
            this.base =
              Number(entry?.userRequestedQuantity) === 0
                ? 0
                : size / Number(entry?.userRequestedQuantity);
            entriesForms.push(
              this.fb.group({
                selectedAmount: [{
                  value: this.formatQuantity(entry?.userRequestedQuantity, entry?.userRequestedUOM?.code),
                  disabled: !entry?.enableQuoteCheckAvailability
                },
                [Validators.required],
                ],
                calc: this.conversionFunction2(entry.userRequestedQuantity, entry),
                specificDyeLot: [""],
                minLength: [""],
                maxLength: [""],
              })
            );
            this.feetYardFormData.patchValue({
              maxLengthFT: entry?.maxLengthFT + "." + entry?.maxLengthIN,
              maxLengthIN: entry?.maxLengthIN || "",
              minLengthFT: entry?.minLengthFT + "." + entry?.minLengthIN || "",
              minLengthIN: entry?.minLengthIN || "",
              feet: entry?.targetLength || "",
            });
            this.data = entry.solution;
            if (!this.subProductType) {
              this.subProductType =
                entry?.product?.productType != "Accessories"
                  ? entry?.product?.subProductType
                  : "";
            }
            return {
              ...entry,
              maxLengthFT: entry?.maxLengthFT + "." + entry?.maxLengthIN,
              maxLengthIN: entry?.maxLengthIN || "",
              minLengthFT: entry?.minLengthFT + "." + entry?.minLengthIN || "",
              minLengthIN: entry?.minLengthIN || "",
              feet: entry?.targetLength || "",
              checkUom: entry?.userRequestedUOM?.code,
              code: entry?.product?.code,
              entryNumber: entry?.entryNumber,
              styleName: entry?.product?.name,
              styleNumber: entry?.product?.styleNumber,
              selectedAmount: Number(entry?.userRequestedQuantity),
              product: entry?.product,
              unitPrice: entry.unitPrice,
              linePrice: entry.totalPrice,
              checkAvailability: entry.enableQuoteCheckAvailability || false,
              backingId: entry?.product?.sellingBackingId || "NA",
              backingName: entry?.product?.sellingBackingName || "NA",
              sizeId: entry?.product?.sellingSizeId || "",
              sizeDesc: entry?.product?.sellingSizeDescription || "",
              calcSize: size,
              uom: (entry?.product?.alternateUomData.filter((data: any) => data.alternateUom.code !== entry?.userRequestedUOM.code)).map((data: any) => data.alternateUom.name),
              uomCode: entry.priceUOM?.code,
              label: entry.priceUOM?.name,
              requestedDeliveryDate: entry?.requestedDeliveryDate,
              userRequestedUOM: entry.userRequestedUOM?.name,
              userRequestedUOMCode: entry.userRequestedUOM?.code,
              solution: entry?.solution,
              addAcessoriesCheckEntrylevel: entry?.enableAddAccessories,
              backorderDate: !!entry?.solution
                ? entry.solution[0]?.backorderDate
                : undefined,
              availabilityStatus: entry?.availabilityStatus,
              base: this.base,
              requestedDyelot: entry?.requestedDyelot,
              incoterms: entry?.incoTerms,
              incoTermsDesc: entry?.incoTermsDesc,
              shippingCondition: entry?.shippingCondition,
              shippingConditionsDesc: entry?.shippingConditionsDesc,
              comment: entry?.comment,
              quantity: entry?.userRequestedQuantity,
            };
          });
          entriesForms.controls.forEach((element) => {
            element.get("calc")?.disable();
          });
          this.invalidProduct = (this.quote?.entries || []).some((obj:any) => obj?.invalidProduct == true);
          if (this.entryData.length === 0) {
            this.modalService.hide();
            this.router.navigate(["commercial/quotes/quote"]);
          }
          this.getQuoteRecommendedAccessories();
          this.progressHide()
          this.spinnerLoading = false;
        },
        (err) => {
          this.progressHide()
          this.spinnerLoading = false;
          this.alertData = {
            message: "Failed to load quote",
          };
          this.alertMessage = err.error;
          this.showAlert = true;
        }
      );
  }
  calculateSize(selectedAmount: number, base: number): string {
    return (selectedAmount * base).toFixed(2);
  }
  solutionDetailsClicked() {
    this.isSolutionDetailsClicked = !this.isSolutionDetailsClicked;
  }

  addQuoteComments(commentText: string) {
    this.spinnerLoading = true;
    const payload = {
      text: commentText,
    };
    this.quotesService
      .addQuoteComments(this.userService.getUserEmail().toLowerCase(), this.quoteId, payload)
      .subscribe(
        (res: any) => {
          this.commentText = "";
          this.quoteDetails = res.body?.comments ? res.body?.comments : [];
          this.alertData = {
            message: "Comment added successfully",
          };
          this.alertType = "success";
          this.commentTrigger = true;
          this.stopAlert();
          this.getdata();
          this.spinnerLoading = false;
        },
        (err: any) => {
          this.spinnerLoading = false;
        }
      );
  }

  nagivateToQuotes() {
    this.router.navigate(["commercial/quotes/quote"]);
  }
  async printPage() {
    this.hidelement(true);
    this.commentsFlag = true;
    this.showComments = true
    await new Promise(resolve => setTimeout(resolve, 100));
    let printContents: any, popupWin: any;
    let accordianElements: any =
      this.document.querySelectorAll(".panel-collapse");
    //this.showElementForPdf(true);
    for (let a = 0; a < accordianElements.length; a++) {
      accordianElements[a].style.display = "block";
    }
    printContents = this.document.getElementById("print-section")?.innerHTML;
    popupWin = window.open("", "_blank", "top=0,left=0,height=100%,width=auto");
    popupWin.document.open();
    popupWin.document.write(`
      <html>
        <head>
        <title>${window.location.href}</title>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">
        <link rel="stylesheet" href="/assets/print/quote-details-print.css" crossorigin="anonymous">        
        </head>
        <body onload="window.print();window.close()" >
<img src="/assets/images/logo-residential-dark.png" width=220 style="margin:10px 0px">
        ${printContents}
        </body>
      </html>`);
    setTimeout(() => {
      popupWin.document.close();
    }, 1000);
    if (!this.showDetailsFlag) {
      for (let a = 0; a < accordianElements.length; a++) {
        accordianElements[a].style.display = "none";
      }
    }
    setTimeout(() => {
      this.hidelement(false);
      this.commentsFlag = false;
      this.showComments = false
    }, 500);

  }

  showElementForPdf(bool: boolean) {
    this.document.querySelectorAll(".print-element").forEach((element: any) => {
      element.style.display = bool == true ? "block" : "none";
    });
  }
  captureScreen() {
    this.spinnerLoading = true;
    let currentDate = new Date();
    const cValue = formatDate(currentDate, "yyyy-MM-dd", "en-US");
    var data: any = document.getElementById("print-section");
    let accordianElements: any =
      this.document.querySelectorAll(".panel-collapse");
    for (let a = 0; a < accordianElements.length; a++) {
      accordianElements[a].style.display = "block";
    }
    this.hidelement(true);
    html2canvas(data, { useCORS: true }).then((canvas) => {
      var imgWidth = 208;
      var pageHeight = 500;
      var imgHeight = (canvas.height * imgWidth) / canvas.width;
      var heightLeft = imgHeight;
      const contentDataURL = canvas.toDataURL("image/png");
      let pdf = new jsPDF("p", "mm", "a4");
      var position = 0;
      pdf.addImage(contentDataURL, "PNG", 0, position, imgWidth, imgHeight);
      let today = new Date();
      this.spinnerLoading = false;
      pdf.save(`Quote-Detail-${cValue}.pdf`);
      for (let a = 0; a < accordianElements.length; a++) {
        accordianElements[a].style.display = "none";
      }
      this.hidelement(false);
    });
  }
  showDetailsFlag: boolean = false;
  hidelement(result: Boolean) {
    this.hidden?.toArray().forEach((element: any) => {
      element.nativeElement.hidden = result;
    });
    this.document.querySelectorAll(".print-element").forEach((element: any) => {
      element.style.display = result == true ? "block" : "none";
    });
  }

  errorMessage = "";
  openAccessoriesModal(productId: any) {
    const initialState: ModalOptions = {
      initialState: {
        productCodeId: productId,
        buttonName: " ADD Accessories",
        postOrder: false,
      },
    };
    this.bsModalRef = this.modalService.show(
      XchangeAddAccessoriesLightboxComponent,
      Object.assign(initialState, {
        class: "modal-xl modal-dialog-centered xchangeaddaccessorieslightbox",
        backdrop: "static",
        keyboard: false,
      })
    );
    this.bsModalRef.content.type = 2;
  }
  productCode: string = '';

  defaultShipVia: any;
  defaultShippingMethod: any;
  defaultShippingMethodDesc: any;
  defaultShippingWarehouse: any;
  defaultShippingWarehouseDesc: any;
  defaultShippingConditionDesc: any;
  entryQuote: any;
  entryNo: any;
  originalDefaultShippingMethod: any;
  originalDefaultSM: any;
  originalShippingMethod: any;
  checkAvailability(entryNumber: any, entryIndex: number) {
    this.entryQuote = this.entryData[entryIndex];
    this.entryNo = entryNumber;
    this.isAtpCheck = this.atpCheckProductTypes.includes(this.entryData[entryIndex].product?.subProductType);
    if (this.entryData[entryIndex].product?.erpProductCategory === 'B') {
      this.isAtpCheck = true;
    }
    if ((this.entryData[entryIndex].product?.classification == "Accessories" &&
      !(this.entryData[entryIndex].product?.subProductType === 'CUSHION_PAD' && this.isAtpCheck))) {
      this.isAtpCheck = false;
    }

    if (!this.hasShippingInfo) {
      const initialState: ModalOptions = {
        initialState: {
          // Data to  popup
          quoteCode: this.quoteId,
          entry: this.entryData[entryIndex],
          entryIndex: entryNumber,
          isAtpCheck: this.isAtpCheck,
        },
      };

      this.bsModalRef = this.modalService.show(
        ChooseAddressLightboxComponent,
        Object.assign(initialState, {
          id: "ChooseAddressModal",
          class: "modal-xl modal-dialog-centered",
          backdrop: "static",
          keyboard: false,
        })
      );

      this.bsModalRef.content.isAtpCheck = this.isAtpCheck;
    } else {

      this.spinnerLoading = false;
      this.formattedAddress.incoTerms = this.quote?.incoTerms;
      this.formattedAddress.incoTermsDesc = this.quote?.incoTermsDesc;
      this.formattedAddress.shippingCondition = this.quote?.shippingConditions;
      this.formattedAddress.shippingConditionDesc = this.quote?.shippingConditionsDesc;
      this.formattedAddress.shippingWarehouse = this.quote?.shippingWarehouse;
      this.formattedAddress.shippingWarehouseDesc = this.quote?.shippingWarehouseDesc;
      this.formattedAddress.shipVia = this.quote?.shipVia;

      this.onShippingOptionSubmit();

      //   this.orderService
      //     .getShippingOptions(
      //       false,
      //       this.entryData[entryIndex].product.baseOptions[0].selected.code,
      //       this.quote?.deliveryAddress?.id,
      //       this.uid
      //     )
      //     .subscribe({
      //       next: (res) => {
      //         this.spinnerLoading = false;
      //         this.defaultIncoTerms = res.body?.defaultIncoTerms;
      //         this.defaultIncoTermsDesc = res.body?.defaultIncoTermsDesc;
      //         this.defaultShipVia = res.body?.defaultShipVia;
      //         this.defaultShippingMethod = res.body?.defaultShippingMethod;
      //         this.defaultShippingWarehouse =
      //           res.body?.defaultShippingWarehouse;
      //         this.defaultShippingWarehouseDesc =
      //           res.body?.defaultShippingWarehouseDesc;
      //         this.defaultShippingConditionDesc =
      //           res.body?.defaultShippingConditionDesc;
      //         this.defaultShippingMethodDesc =
      //           res.body?.defaultShippingConditionDesc;
      //         this.modalRef = this.modalService.show(this.shippingOption, {
      //           id: "shippingOptionsModal",
      //           class: "modal-lg modal-dialog-centered",
      //           backdrop: "static",
      //           keyboard: false,
      //         });
      //       },
      //       error: (err) => {
      //         this.spinnerLoading = false;
      //       },
      //     });

      // const initialState: ModalOptions = {
      //   initialState: {
      //     quoteCode: this.quoteId,
      //     entry: this.entryData[entryIndex],
      //     shippingAddress: this.formattedAddress,
      //     shippingMethod: this.shippingMethodAbreviation,
      //     entryIndex: entryNumber,
      //     shipTo: this.shipTo,
      //   },
      // };
      //   if(this.isAtpCheck === true){ 

      //     const initialState: ModalOptions = {
      //       initialState: {
      //         openFromaddressModal: true,
      //         shipTo: this.shippingAddress?.shippingAddressID
      //         ? this.shippingAddress?.shippingAddressID
      //         : this.shippingAddress?.id,
      //         quoteCode: this.quoteId,
      //         entry: this.entryData[entryIndex],
      //         shippingAddress: this.formattedAddress,
      //         entryIndex: entryNumber,
      //         productType: this.entryData[entryIndex]?.productType,
      //       //  aptCheckEntrie: this.aptCheckEntrie,
      //         oneTimeShippingFlag:
      //         this.shippingAddress?.oneTimeShippingFlag,
      //       },
      //     };

      //     this.modalRef = this.modalService.show(
      //       AddCompanionProductsComponent,
      //       Object.assign(initialState, {
      //         id: "AddCompanionProductsComponent",
      //         class: "modal-xl modal-dialog-centered",
      //         backdrop: "static",
      //         keyboard: false,
      //       })
      //     );
      // }else{
      //   this.addToQuote(this.entryData[entryIndex],entryNumber);
      // }
    }
  }

  closeShippingOptionsModalModal() {

    this.modalService.hide("shippingOptionsModal");
  }
  shippingWareHouseSelectedOption: any = "";
  incoTermsLoc2SelectedOption: any = "";
  incoTermsLoc2Options: any = [];

  shipViaSelectedOption: any = "";
  incoTermsSelectedOption: any = "";
  incoTermsOptions: any = [];
  shipViaOptions: any = [];
  shipViaType: string = "";
  shippingWareHouseOptions: any = [];
  shippingWareHouseType: string = "";
  shippingOptionsModal(template: TemplateRef<any>) {
    this.spinnerLoading = true;
    this.shippingWareHouseOptions = [];

    this.shippingWareHouseSelectedOption =
      this.shippingAddress?.defaultShippingWarehouse || this.defaultShippingWarehouse || "";
    this.shipViaOptions = [];
    this.spinnerLoading = true;
    this.shipViaSelectedOption =
      this.shippingAddress?.defaultShippingMethod || this.defaultShippingMethod;

    this.productService.getShippingMethodWithOutFlag(
      this.shippingAddress.postalCode,
      this.shippingAddress.isOneTimeShipTo == undefined ? false : this.shippingAddress.isOneTimeShipTo,
      this.csrSuperAdmin.isCustomer || this.csrSuperAdmin.isSalesOps || this.csrSuperAdmin.isSalesPerson,
      this.shipViaSelectedOption
    )
      .subscribe((res: any) => {
        if (res?.body) {
          this.shipViaOptions = [];
          for (let key of Object.entries(res?.body)) {
            this.shipViaOptions.push({
              value: key[0],
              label: key[1],
            });
          }
        }

        if (this.csrSuperAdmin.isCustomer || this.csrSuperAdmin.isSalesOps || this.csrSuperAdmin.isSalesPerson) {
          this.spinnerLoading = false;
          this.shipViaSelectedOption =
            this.shippingAddress?.defaultShippingMethod || this.defaultShippingMethod ||
            this.shipViaOptions[0].value;
          this.incoTermsSelectedOption =
            this.shippingAddress?.defaultIncoTermsDesc || this.defaultIncoTermsDesc ||
            this.incoTermsOptions[0].value;
          this.shippingWareHouseOptions = [];
          this.shippingWareHouseOptions.push({
            value: this.shippingAddress?.defaultShippingWarehouse || this.defaultShippingWarehouse,
            label: this.shippingAddress?.defaultShippingWarehouseDesc || this.defaultShippingWarehouseDesc,
          });
          this.orderService
            .getShippingoptionForCustomers(
              this.shippingAddress.postalCode,
              this.shipViaSelectedOption,
              this.shippingWareHouseSelectedOption,
              this.shippingAddress.isOneTimeShipTo === undefined ? false : this.shippingAddress.isOneTimeShipTo,
              ''
            )
            .subscribe({
              next: (res) => {
                this.spinnerLoading = false;
                this.incoTermsOptions = [];
                this.incoTermsOptions.push({
                  value: res.body.incoTerms,
                  label: res.body.incoTermsDesc,
                });
                this.incoTermsSelectedOption = this.incoTermsOptions[0].value;
                this.incoTermsLoc2Options = [];
                this.incoTermsLoc2Options.push({
                  value: res.body.shipvia,
                  label: res.body.shipvia,
                });
                this.incoTermsLoc2SelectedOption = res.body.shipvia;
              },
              error: (err) => {
                this.spinnerLoading = false;
              },
            });
        }
        if (!this.csrSuperAdmin.isCustomer && !this.csrSuperAdmin.isSalesOps && !this.csrSuperAdmin.isSalesPerson) {
          this.shipViaSelectedOption =
            this.shippingAddress?.defaultShippingMethod || this.defaultShippingMethod ||
            this.shipViaOptions[0]?.value;

          this.getIncoTerms(this.shipViaSelectedOption);
          this.incoTermsSelectedOption =
            this.shippingAddress?.defaultIncoTermsDesc || this.defaultIncoTermsDesc ||
            this.incoTermsOptions[0]?.value;

          this.productService.getShippingWareHouseWithOutFlag().subscribe(
            (res: any) => {
              if (res?.body) {
                this.shippingWareHouseOptions = [];
                for (let key of Object.entries(res?.body)) {
                  this.shippingWareHouseOptions.push({
                    value: key[0],
                    label: key[1],
                  });
                }
              }

              this.incoTermsLoc2SelectedOption =
                this.shippingAddress?.defaultShipVia || this.defaultShipVia;
              this.getIncoTermsLoc2(this.shippingWareHouseSelectedOption);
              this.incoTermsSelectedOption =
                this.shippingAddress?.defaultIncoTermsDesc || this.defaultIncoTermsDesc ||
                this.incoTermsOptions[0].value;
            }
          );
        }
        this.modalRef = this.modalService.show(template, {
          id: "changeShippingOptionsModal",
          class: "modal-lg modal-dialog-centered",
          backdrop: "static",
          keyboard: false,
        });
      });
  }

  validateShippingOptions() {
    //this.spinnerLoading = true;
    this.shippingWareHouseOptions = [];
    this.shippingWareHouseSelectedOption =
      this.shippingAddress?.defaultShippingWarehouse || "";
    this.shipViaOptions = [];

    this.shipViaSelectedOption =
      this.shippingAddress?.defaultShippingMethod ||
      this.shipViaOptions[0]?.value;

    this.incoTermsSelectedOption =
      this.shippingAddress?.defaultIncoTermsDesc ||
      this.incoTermsOptions[0]?.value;

    this.incoTermsLoc2SelectedOption = this.shippingAddress?.defaultShipVia;

    if (this.defaultShippingMethod) {
      this.shipViaSelectedOption = this.defaultShippingMethod;
    }
    if (this.defaultIncoTerms) {
      this.incoTermsSelectedOption = this.defaultIncoTerms;
    }
    if (this.defaultShippingWarehouse) {
      this.shippingWareHouseSelectedOption = this.defaultShippingWarehouse;
    }
    if (this.defaultShipVia) {
      this.incoTermsLoc2SelectedOption = this.defaultShipVia;
    }
    this.validateShipViaAddress("chooseSolution");
  }

  validateShipViaAddress(type: any) {
    this.shippingOptionChanged = type;

    // this.spinnerLoading = true;
    console.log(
      "this.shipViaSelectedOption",
      this.shipViaSelectedOption,
      this.incoTermsLoc2SelectedOption
    );
    let shipViaSelectedOption =
      this.shipViaSelectedOption || this.defaultShippingMethod || this.shippingAddress?.defaultShippingMethod;
    let incoTermsLoc2SelectedOption =
      this.incoTermsLoc2SelectedOption?.label ||
      this.incoTermsLoc2SelectedOption ||
      this.defaultShipVia ||
      this.shippingAddress?.defaultShipVia;
    let incoTermsSelectedOption =
      this.incoTermsSelectedOption ||
      this.defaultIncoTerms ||
      this.shippingAddress?.defaultIncoTerms;
    let shippingWareHouseSelectedOption =
      this.shippingWareHouseSelectedOption || this.defaultShippingWarehouse || this.shippingAddress?.defaultShippingWarehouse;

    incoTermsLoc2SelectedOption = incoTermsLoc2SelectedOption ? incoTermsLoc2SelectedOption.toUpperCase() : incoTermsLoc2SelectedOption;
    if (!this.csrSuperAdmin.isCustomer && !this.csrSuperAdmin.isSalesOps && !this.csrSuperAdmin.isSalesPerson) {
      this.orderService
        .validateShippingOptions(
          shippingWareHouseSelectedOption,
          this.erpProductCategory,
          incoTermsLoc2SelectedOption
        )
        .subscribe({
          next: (res) => {

            if (res.body?.status === "success") {
              this.orderService
                .validateShipVia(
                  shipViaSelectedOption,
                  incoTermsLoc2SelectedOption
                )
                .subscribe({
                  next: (resp) => {
                    if (resp.body.status === "success") {
                      if (type == "chooseSolution") {
                        this.spinnerLoading = true;
                        this.populateShippingOptions();
                        this.closeShippingOptionsModalModal();
                        this.onShippingOptionSubmit();



                      }

                      if (type == "changeShippingOption") {
                        this.spinnerLoading = false;
                        this.populateShippingOptions();
                        this.shippingOptionModalSubmit();



                      }
                    } else if (res.body?.status === "error") {
                      this.spinnerLoading = false;
                      this.showValidationError = true;
                      this.validationErrorMessage = resp.body.message;
                      // this.openModalError(res.body?.message);
                      // Handle error
                    }
                  },
                  error: (err) => { },
                });
            } else if (res.body?.status === "error") {
              this.spinnerLoading = false;
              this.showValidationError = true;
              this.validationErrorMessage = res.body?.message;
              // this.openModalError(res.body?.message);
              // Handle error
            }
          },
          error: (err) => { },
        });
    } else {
      if (type == "chooseSolution") {
        this.populateShippingOptions();
        this.closeShippingOptionsModalModal();
        this.onShippingOptionSubmit();
      }
      if (type == "changeShippingOption") {
        this.populateShippingOptions();
        this.shippingOptionModalSubmit();
      }
    }

  }
  onShippingOptionSubmit() {
    this.isAtpCheck = this.atpCheckProductTypes.includes(this.entryQuote?.product?.subProductType);
    if (this.entryQuote?.product?.erpProductCategory === 'B') {
      this.isAtpCheck = true;
    }
    if ((this.entryQuote?.product?.classification == "Accessories" &&
      !(this.entryQuote?.product?.subProductType === 'CUSHION_PAD' && this.isAtpCheck))) {
      this.isAtpCheck = false;
    }

    if (this.isAtpCheck === true) {
      const initialState: ModalOptions = {
        initialState: {
          openFromaddressModal: true,
          originalDefaultShippingMethod: this.originalDefaultShippingMethod || this.originalDefaultSM,
          shipTo: this.shippingAddress?.shippingAddressID
            ? this.shippingAddress?.shippingAddressID
            : this.shippingAddress?.id,
          quoteCode: this.quoteId,
          entry: this.entryQuote,
          shippingAddress: this.formattedAddress,
          entryIndex: this.entryNo,
          productType: this.entryQuote.productType,
          //  aptCheckEntrie: this.aptCheckEntrie,
          oneTimeShippingAddress:this.shippingAddress?.isOneTimeShipTo || false,
          oneTimeShippingFlag:
            this.shippingAddress?.isOneTimeShipTo || false,
        },
      };

      this.modalRef = this.modalService.show(
        AddCompanionProductsComponent,
        Object.assign(initialState, {
          id: "AddCompanionProductsComponent",
          class: "modal-xl modal-dialog-centered",
          backdrop: "static",
          keyboard: false,
        })
      );
    } else {
      this.addToQuote(this.entryQuote, this.entryNo);
    }

  }
  submitInfoChanges() {
    this.modalService.hide("changeDeliveryType");
    this.validateShipViaAddress("chooseSolution");
  }
  populateShippingOptions() {
    let shipViaSelectedOption =
      this.shipViaSelectedOption ||
      this.defaultShippingMethod ||
      this.shippingAddress?.defaultShippingMethod ||
      this.shippingAddress?.defaultShippingCondition;
    let incoTermsLoc2SelectedOption =
      this.incoTermsLoc2SelectedOption?.label ||
      this.incoTermsLoc2SelectedOption ||
      this.defaultShipVia;
    this.shippingAddress?.defaultShipVia;
    let incoTermsSelectedOption =
      this.incoTermsSelectedOption ||
      this.defaultIncoTerms ||
      this.shippingAddress?.defaultIncoTerms;
    let shippingWareHouseSelectedOption =
      this.shippingWareHouseSelectedOption || this.defaultShippingWarehouse;
    this.shippingAddress?.defaultShippingWarehouse;

    const shipViaSelectedOptionValue = this.shipViaOptions.find(
      (item: any) => item.value === shipViaSelectedOption
    );
    this.defaultShippingMethod =
      shipViaSelectedOption ||
      this.defaultShippingMethod ||
      this.shippingAddress?.defaultShippingMethod ||
      this.shippingAddress?.defaultShippingCondition;
    this.defaultShippingConditionDesc =
      shipViaSelectedOptionValue?.label ||
      this.defaultShippingConditionDesc ||
      this.shippingAddress?.defaultShippingConditionDesc;
    this.defaultShippingMethodDesc =
      shipViaSelectedOptionValue?.label ||
      this.defaultShippingMethodDesc ||
      this.shippingAddress?.defaultShippingConditionDesc;
    let incoTermSelectedOptionValue = this.incoTermsOptions.find(
      (item: any) => item.value === incoTermsSelectedOption
    );
    this.defaultIncoTermsDesc =
      incoTermSelectedOptionValue?.label ||
      this.defaultIncoTermsDesc ||
      this.shippingAddress?.defaultIncoTermsDesc;
    this.defaultIncoTerms = incoTermsSelectedOption || this.defaultIncoTerms;
    if (
      incoTermSelectedOptionValue === undefined ||
      incoTermSelectedOptionValue === null
    ) {
      incoTermSelectedOptionValue = this.incoTermsOptions.find(
        (item: any) => item.label === incoTermsSelectedOption
      );
      this.defaultIncoTermsDesc =
        incoTermSelectedOptionValue?.label ||
        this.defaultIncoTermsDesc ||
        this.shippingAddress?.defaultIncoTermsDesc;
      this.defaultIncoTerms =
        incoTermSelectedOptionValue?.value ||
        incoTermsSelectedOption ||
        this.defaultIncoTerms;
    }

    const shippingWHSelectedOptionValue = this.shippingWareHouseOptions.find(
      (item: any) => item.value === shippingWareHouseSelectedOption
    );
    this.defaultShippingWarehouseDesc =
      shippingWHSelectedOptionValue?.label ||
      this.defaultShippingWarehouseDesc ||
      this.shippingAddress?.defaultShippingWarehouseDesc;
    this.defaultShippingWarehouse =
      shippingWareHouseSelectedOption || this.defaultShippingWarehouse;

    this.defaultShipVia = incoTermsLoc2SelectedOption || this.defaultShipVia;
    this.shippingAddress.defaultShippingCondition = this.defaultShippingMethod;
    this.shippingAddress.defaultShippingMethod = this.defaultShippingMethod;
    this.shippingAddress.defaultShippingConditionDesc =
      this.defaultShippingConditionDesc;
    this.shippingAddress.defaultShippingMethodDesc =
      this.defaultShippingConditionDesc;

    this.shippingAddress.defaultShippingWarehouseDesc =
      this.defaultShippingWarehouseDesc;
    this.shippingAddress.defaultShippingWarehouse =
      this.defaultShippingWarehouse;

    this.shippingAddress.defaultIncoTerms = this.defaultIncoTerms;
    this.shippingAddress.defaultIncoTermsDesc = this.defaultIncoTermsDesc;

    this.shippingAddress.defaultShipVia = this.defaultShipVia;
  }
  validateShipVia(event: any) {
    console.log(event);
    this.showValidationError = false;
  }
  shippingOptionModalSubmit() {
    // this.shipViaModalSubmit();
    // this.shippingWareHouseModalSubmit();
    this.closeChangeShippingOptionModal();
    // this.modalService.hide("shippingOptionModal");
  }

  closeChangeShippingOptionModal() {
    this.spinnerLoading = false;
    this.modalService.hide("changeShippingOptionsModal");
  }

  getIncoTerms(shipVia: any) {
    this.incoTermsOptions = [];
    this.orderService.getIncoTerms(shipVia).subscribe({
      next: (res) => {
        const resObject = res?.body;
        const objectKeys = Object.keys(resObject).sort();
        objectKeys.forEach((key) => {
          this.incoTermsOptions.push({
            value: key,
            label: resObject[key],
          });
        });
        if (this.incoTermsOptions.length === 0) {
          this.incoTermsOptions.push({
            value: this.shippingAddress?.defaultIncoTerms,
            label: this.shippingAddress?.defaultIncoTermsDesc,
          });
        }
      },
      error: (err) => { },
    });
  }
  getIncoTermsLoc2(shippingWareHouse: any) {
    this.incoTermsLoc2Options = [];
    let postalCode = this.shippingAddress?.postalCode;
    if (this.shippingAddress?.postalCode.includes("-")) {
      postalCode = this.shippingAddress?.postalCode.split("-")[0];
    }
    this.incoTermsLoc2Options = [];

    let selectedShippingMethod = this.shipViaOptions.find(
      (item: any) => item.value.trim() === this.shipViaSelectedOption
    );
    if (selectedShippingMethod === undefined || selectedShippingMethod === "") {
      selectedShippingMethod = this.shipViaOptions.find(
        (item: any) => item.label.trim() === this.shipViaSelectedOption
      );
    }
    this.orderService
      .getIncoTermsLoc2(
        postalCode,
        shippingWareHouse,
        selectedShippingMethod?.value
      )
      .subscribe({
        next: (res) => {
          const resObject = res?.body;
          const objectKeys = Object.keys(resObject).sort();
          objectKeys.forEach((key) => {
            this.incoTermsLoc2Options.push({
              value: resObject[key].shipvia,
              label: resObject[key].shipvia,
              preferred: resObject[key].preferred
            });
          });
          // if (this.incoTermsLoc2Options.length === 0) {
          //   this.incoTermsLoc2Options.push({
          //     value: this.shippingAddress?.defaultShipVia,
          //     label: this.shippingAddress?.defaultShipVia,
          //   });
          // }
        },
        error: (err) => { },
      });
  }

  showValidationError: boolean = false;
  modalRefs: BsModalRef[] = [];
  validationErrorMessage: any;
  shippingInfoMessage: any;
  minicartSubscriptionForChange: any;
  shippingOptionChanged: any;

  closeModal(modalId?: number) {
    const ids: number[] = this.modalService["loaders"].map(
      (l: any) => l.instance.id
    );
    for (const id of ids) {
      this.modalService.hide(id);
    }
  }

  addtoCartFailed: boolean = false;
  addtoCartErrorMessage: any = [];
  addToQuote(entryData: any, entryIndex: any) {
    let payload = {};
    let rdd: any = "";
    payload = {
      shipToUnit: this.formattedAddress?.shippingAddressID
        ? this.formattedAddress?.shippingAddressID
        : this.formattedAddress?.id,
      shippingCondition: this.csrSuperAdmin?.isCustomer || this.csrSuperAdmin?.isSalesOps || this.csrSuperAdmin?.isSalesPerson ?
        this.formattedAddress?.originalDefaultShippingMethod || this.originalDefaultShippingMethod || this.originalDefaultSM || this.formattedAddress?.defaultShippingMethod :
        this.formattedAddress?.shippingCondition ||
        this.formattedAddress?.shippingMethod ||
        this.formattedAddress?.defaultShippingMethod ||
        this.formattedAddress?.defaultShippingCondition ||
        "",
      shipVia:
        this.formattedAddress?.shipVia || this.formattedAddress?.defaultShipVia,
      shippingWarehouse:
        this.formattedAddress?.shippingWarehouse ||
        this.formattedAddress?.defaultShippingWarehouse ||
        this.formattedAddress?.defaultShippingWarehouseDesc ||
        "",
      incoTerms:
        this.formattedAddress?.incoTerms ||
        this.formattedAddress?.defaultIncoTerms ||
        "",
      requestedDeliveryDate: this.entryData[entryIndex]?.requestedDeliveryDate,
      oneTimeShipTo: this.shippingAddress?.isOneTimeShipTo || false,
      oneTimeShippingAddress: this.shippingAddress?.isOneTimeShipTo || false,
      item: [
        {
          feet: "",
          inches: "",
          dyeLot: entryData.requestedDyelot,
          productCode: entryData.code,
          requestedQty: entryData.quantity.toString(),
          requestedUOM: entryData.checkUom,
          shippingCondition: this.csrSuperAdmin?.isCustomer || this.csrSuperAdmin?.isSalesOps || this.csrSuperAdmin?.isSalesPerson ?
            this.formattedAddress?.originalDefaultShippingMethod || this.originalDefaultShippingMethod || this.originalDefaultSM || this.formattedAddress?.defaultShippingMethod :
            this.formattedAddress?.shippingCondition ||
            this.formattedAddress?.shippingMethod ||
            this.formattedAddress?.defaultShippingMethod ||
            this.formattedAddress?.defaultShippingCondition ||
            "",
          shipVia:
            this.formattedAddress?.shipVia ||
            this.formattedAddress?.defaultShipVia,
          shippingWarehouse:
            this.formattedAddress?.shippingWarehouse ||
            this.formattedAddress?.defaultShippingWarehouse ||
            this.formattedAddress?.defaultShippingWarehouseDesc ||
            "",
          incoTerms:
            this.formattedAddress?.incoTerms ||
            this.formattedAddress?.defaultIncoTerms ||
            "",
          requestedDeliveryDate: this.entryData[entryIndex]?.requestedDeliveryDate,
          solution: [],
          sameDyeLot: this.entryData[entryIndex]?.sameDyeLot
        },
      ],
    };

    // this.spinnerLoading = true;
    this.progressShow('addToQuote')
    this.quotesService
      .addToQuote(
        this.quoteId,
        entryIndex,
        payload
      )
      .subscribe(
        (res) => {this.progressHide();
          console.log("res.body=====>", res.body);
          this.spinnerLoading = false;
          if (res.body.messages[0].status === "00001") {
            this.addtoCartFailed = true;
            this.addtoCartErrorMessage.push({
              message: res.body.messages[0].message,
            });
            this.scrollPageToTop();
          } else if (!res?.body?.errorMessages &&
            !(
              res.body.hasOwnProperty("messages") &&
              res?.body?.messages?.length > 0 &&
              (res?.body?.messages[0]?.status === "Error" ||
                res?.body?.messages[1]?.status === "Error" ||
                res?.body?.messages[0]?.status === "Failed")
            )
          ) {
            // this.showAlert = true;
            //   this.alertMessage = res.body.messages[0]?.message;
            this.modalService.hide("ChooseAddressModal");
            this.quotesService.updateData.next(true);
          } else {
            this.addtoCartErrorMessage = (res?.body?.messages || []).filter((err: any) => err?.status && err?.message);
            this.addtoCartFailed = true;
            this.scrollPageToTop();
          }
          this.quotesService.updateData.next(true);
        },
        (err: any) => {
          this.progressHide();
          this.spinnerLoading = false;
          this.quotesService.updateData.next(true);
        }
      );
  }
  selectedProduct: any = {};

  entries: any = [
    {
      dyeLot: "",
      feet: "",
      inches: "",
      multiCut: [],
      productCode: "",
      requestUOM: "",
      requestedQty: "",
    },
  ];

  removeEntry(entryNumber?: any) {
    this.openConfirmationModal({
      title: "Remove entry",
      content: "Do you really want to Remove?",
      primaryActionLabel: "YES",
      secondaryActionLabel: "NO",
      onPrimaryAction: () => this.remove(entryNumber),
    });
  }
  remove(entryNumber: any) {
    this.index = entryNumber;
    // this.spinnerLoading = true;
    this.progressShow('removeEntyFromQuote');
    this.quotesService
      .quoteEntryRemove(this.quote.code, entryNumber)
      .subscribe((res: any) => {
        this.spinnerLoading = false;
        this.progressHide();
        if (res) {
          this.alertData = {
            message: "Quote entry removed successfully",
          };
          this.alertType = "success";
          this.alertTrigger = true;
          this.stopAlert();
          this.getdata();
        }
      }),
      (err: any) => {
        this.progressHide();
        this.spinnerLoading = false;
      };
  }
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
        id: "confirmation",
        class: "modal-md modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );
  }
  showAssignedSqFtYrd(e: any) {
    if (e.checked) {
      this.showAssignedSpec = true;
    } else {
      this.showAssignedSpec = false;
    }
  }
  rejectQuoteModal() {
    const initialState: ModalOptions = {
      initialState: {
        quoteCode: this.quote.code,
      },
    };
    this.bsModalRef = this.modalService.show(
      RejectQuotePopupComponent,
      Object.assign(initialState, {
        class: "modal-md modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );
  }
  index: any;
  updatequantity(
    value: any,
    entryNumber: any,
    productCode: any,
    defaultQty: any,
    index: number
  ) {
    this.index = index;
    if (defaultQty == value) {
      this.alertData = {
        message: "Please enter a new quantity",
      };
      this.alertType = "danger";
      this.alertTrigger = true;
      this.stopAlert();
    } else {
      this.quantityValue = value;
      this.entry = entryNumber;
      this.quoteCode = this.quote.code;
      this.productCode = productCode;
      let payload = {
        quantity: this.quantityValue,
        quoteCode: this.quoteCode,
        quoteEntry: this.entry,
      };
      this.progressShow('saveQuantity');
      this.quotesService
        .updateQuoteEntry(payload, this.quoteCode)
        .subscribe((res: any) => {
          this.progressHide();
          if (res) {
            if (res) {
              this.alertData = {
                message: "Quantity Updated Successfully",
              };
              this.alertType = "success";
              this.alertTrigger = true;
              setTimeout(() => {
                this.getdata();
                this.stopAlert();
              }, 2000);

            }
          }
        }),
        (err: any) => {
          this.progressHide();
        };
    }
  }
  stopAlert() {
    setTimeout(() => {
      this.alertTrigger = false;
      this.commentTrigger = false;
      this.colorTrigger = false;
    }, 4000);
  }

  @ViewChild("scrollToTop", { read: ElementRef }) scrollToTop: any;
  scrollPageToTop() {
    this.scrollToTop?.nativeElement.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "nearest",
    });
  }

  viewAllColors(data: any, entrynumber: any, index: number) {
    this.entryNumber = entrynumber;
    this.productService
      .getQuoteVariantColor(data?.product?.code)
      .subscribe((res) => {
        if (res?.error?.errorCode != "0000") {
          this.errorMessage = res?.error?.message;
        }
        if (res.body) {
          let colorvariants: any = [];
          res.body?.products.map((product: any) => {
            colorvariants.push({
              key: product?.sellingColorId,
              value: { ...product, name: product?.sellingColorName },
            });
          });
          const initialState: ModalOptions = {
            initialState: {
              // Data to  popup
              data: colorvariants,
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
        }
        this.modalRef?.content.productCode.subscribe((product: any) => {
          let params = {
            quoteCode: this.quoteId,
            entryNumber: this.entryNumber,
            productCode: product?.value?.code,
            isColorChanged: false,
          };
          this.index = index;
          this.quotesService
            .updatecolour({}, { params: params })
            .subscribe((res: any) => {
              if (res) {
                if (res?.body.status == "success") {
                  this.alertData = {
                    message: "Color changed successfully",
                  };
                  this.alertType = "success";
                  this.colorTrigger = true;
                  this.stopAlert();
                  this.getdata();
                }
              }
            });
        });
      });
  }

  openAccessories(data: any) {
    if (!this.hasShippingInfo) {
      let entryQuote = data;
      this.isAtpCheck = this.atpCheckProductTypes.includes(entryQuote?.product?.subProductType);
      if (entryQuote?.product?.erpProductCategory === 'B') {
        this.isAtpCheck = true;
      }
      if ((entryQuote?.product?.classification == "Accessories" &&
        !(entryQuote?.product?.subProductType === 'CUSHION_PAD' && this.isAtpCheck))) {
        this.isAtpCheck = false;
      }
      const initialState: ModalOptions = {
        initialState: {
          // Data to  popup
          quoteCode: this.quoteId,
          entry: entryQuote,
          entryIndex: entryQuote?.entryNumber,
          isAtpCheck: this.isAtpCheck,
        },
      };

      this.bsModalRef = this.modalService.show(
        ChooseAddressLightboxComponent,
        Object.assign(initialState, {
          id: "ChooseAddressModal",
          class: "modal-xl modal-dialog-centered",
          backdrop: "static",
          keyboard: false,
        })
      );

      this.bsModalRef.content.isAtpCheck = this.isAtpCheck;
    } else {
      const initialState: ModalOptions = {
        initialState: {
          quoteCode: data,
          navigateToCheckoutAfter: false,
          getUpdatedAccessories: () => {
            this.getdata();
          },
        },
      };
      this.bsModalRef = this.modalService.show(
        AddAccessoriesComponent,
        Object.assign(initialState, {
          class: "modal-xl modal-dialog-centered quoteAccessories",
          backdrop: "static",
          keyboard: false,
        })
      );
    }
  }

  formatQuantity(quantity: any, uomCode: string): string {
    if (!quantity) return '0';
    const qty = quantity.toString();
    if (uomCode === 'LF' && qty.includes('.')) {
      const [feet, inches] = qty.split('.');
      const paddedInches = inches.length === 1 ? '0' + inches : inches;
      return feet + '.' + paddedInches;
    }
    return qty;
  }

  convertFeetInchesToDecimalFeet(quantity: any, uomCode: string): number {
    if (!quantity) return 0;
    const qty = quantity.toString();
    if (uomCode === 'LF' && qty.includes('.')) {
      const [feet, inches] = qty.split('.');
      const inchValue = inches.length === 1 ? Number(inches) : Number(inches);
      return Number(feet) + (inchValue / 12);
    }
    return Number(quantity);
  }

  numberOnly(event: any, type: any = ""): boolean {
    const value = event?.currentTarget?.value;
    const selectionStart = event?.currentTarget?.selectionStart ?? 0;
    const selectionEnd = event?.currentTarget?.selectionEnd ?? 0;
    if (type === "inch" && parseInt(value + event.key) > 11) {
      return false;
    }
    const charCode = event.which ? event.which : event.keyCode;
    if (type === "YDK" || type === "FTK" || type == "rolls" || type == "LF") {
      if (event?.key == "." && value.includes(".")) {
        return false;
      }
      return this.isDecimalNumberKey(event, selectionStart, selectionEnd);
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

  isDecimalNumberKey(event: any,selectionStart:any, selectionEnd:any) {
    const value = event?.currentTarget?.value;

    var charCode = event.which ? event.which : event.keyCode;
    if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57))
      return false;
    if (value.includes(".") && selectionStart === selectionEnd) {
      let val = value.split(".");
      val = val[val.length - 1].split("");
      if (val.length > 1) {
        return false;
      }
    }
    return true;
  }

  getTargetLength(event: any, index: number, item: any) {
    if (event) {
      let i = index;
      this.productCode = item?.code;
      this.getValues(event.target.value, i);
    }
  }

  getValues(value: any, i: number) {
    this.index = i;

    if (value) {
      this.productService
        .getMinMaxRollLength(value, this.uid, this.uid, this.productCode)
        .pipe(debounceTime(1000))
        .subscribe({
          next: (res: any) => {
            if (Object.keys(res?.body).length != 0) {
              this.entryData[i].minLengthFT = Number(res?.body?.minRoll);
              this.entryData[i].maxLengthFT = Number(res?.body?.maxRoll);
              this.entryData[i].feet = Number(value);
              // let control = this.feetYardFormData.controls;
              // control["minLength"].setValue(res?.body?.minRoll);
              // control["maxLength"].setValue(res?.body?.maxRoll);
              // control["minLength"].updateValueAndValidity();
              // control["maxLength"].updateValueAndValidity();
            }
          },
          error: (err) => { },
        });
    }
  }
  restrictUptoTwoDecimal(e: any) {
    var t = e.target.value;
    e.target.value =
      t.indexOf(".") >= 0
        ? t.substr(0, t.indexOf(".")) + t.substr(t.indexOf("."), 3)
        : t;
    if ((e.target.value + "")[0] === "0") {
      e.target.value = "";
    }
  }
  navigateToProductPage(id: any) {
    this.router.navigate(["commercial/products/details/" + id]);
  }

  viewAllPotentialMatches(quoteCode: string) {
    const initialState: ModalOptions = {
      initialState: {
        quoteCode: quoteCode,
      },
    };
    this.bsModalRef = this.modalService.show(
      PotentialMatchesQuotesComponent,
      Object.assign(initialState, {
        id: "commercialPotentialMatchesQuotesComponent",
        class: "modal-xl modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );
  }

  uomDetails: any;
  isQuantityValid: any;
  uomErrorMsg: any = "";
  showBlockedProductMsg: boolean = false;
  pdpInventoryUom: any = "";
  pdpPricingUOMValue: any = "";
  pdpPricingUOMCode: any = "";
  pdpInventoryUomValue: any = 0;
  pdpConvUnit: any;
  erpProductCategory: any = "";
  // getUOMDetails() {
  //   this.service.getUOMDetails(this.productCode).subscribe(
  //     (res) => {

  //       this.pdpPricingUOMCode = res?.body?.pricingUom.code;
  //       this.pdpPricingUOMValue = res?.body?.pricingUom.name;
  //       this.erpProductCategory = res?.body?.erpProductCategory;
  //       this.uomDetails = res?.body;
  //       this.conversionUnit = res?.body?.alternateUomData
  //         ? res?.body?.alternateUomData[0]?.alternateUomConversionUnit
  //         : "";
  //       if (res?.body?.alternateUomData) {
  //         this.unitArray = res?.body?.alternateUomData.map((element: any) => {
  //           return {
  //             type: element?.alternateUom.code,
  //             value: element?.alternateUom.name,
  //             alternateUomConversionUnit: element?.alternateUomConversionUnit,
  //           };
  //         });

  //          this.selectedUom = res.body.alternateUomData.filter(
  //           (element: any) =>
  //             element.alternateUom.code != res?.body?.inventoryUom.code
  //         );

  //         this.pdpInvUOMCode = res?.body?.inventoryUom.code;
  //         this.pdpInvUOMValue = res?.body?.inventoryUom.name;
  //         this.pdpPricingUOMCode = res?.body?.pricingUom.code;
  //         this.pdpPricingUOMValue = res?.body?.pricingUom.name;

  //      this.pdpUomConversionRate = res.body.alternateUomData.filter(
  //           (element: any) =>
  //             element.alternateUom.code != res?.body?.alternateUomConversionUnit
  //         );
  //       }
  //       });

  // }
  // selectedUom:any;
  pdpUomConversionRate: any = [];
  // conversationZctToLf: any;
  pdpInvUOMCode: any = "";
  pdpInvUOMValue: any = "";
  inputUOM: any = "";
  requestedQty: any;
  convertPdpInvUOMValue: any = "";
  convAlternateUOM: any;
  conversionFunction1(selectedAmount: any, item: any) {
    this.pdpUomConversionRate = (item?.product?.alternateUomData)
    this.erpProductCategory = item?.product?.erpProductCategory;
    this.pdpInvUOMCode = item?.product?.inventoryUom.code;
    this.pdpInvUOMValue = item?.product?.inventoryUom.name;
    this.pdpPricingUOMCode = item?.product?.pricingUom.code;
    this.pdpPricingUOMValue = item?.product?.pricingUom.name;
    let requestedQuantity = item?.userRequestedQuantity;
    if (selectedAmount !== item.userRequestedQuantity) {
      requestedQuantity = selectedAmount;
    }

    if (Number(requestedQuantity) > 0) {
      this.inputUOM = item?.userRequestedUOM?.code || item?.checkUom;
      let outputQty: any = 0;
      let displayQtyUOM: any = "";

      let rate = this.pdpUomConversionRate?.filter(
        (element: any) =>
          element?.alternateUom?.code === (item?.userRequestedUOM?.code || item?.checkUom)
      );
      let lfRate: any = this.pdpUomConversionRate?.filter(
        (element: any) =>
          element?.alternateUom?.code !== (item?.userRequestedUOM?.code || item?.checkUom)
      );
      if(this.erpProductCategory === "B"){
            if (this.inputUOM === this.pdpInvUOMCode){
              let decimalQty =requestedQuantity / lfRate[0]?.alternateUomConversionUnit;
              let feetQty = JSON.stringify(decimalQty).split(".")[0];
              let inchQty = JSON.stringify(decimalQty).split(".")[1] ? (parseInt(JSON.stringify(decimalQty).split(".")[1].substring(0,2)) * 12) : 0;
              let inchQty2Digits =inchQty / Math.pow(10, JSON.stringify(inchQty).length);
              let inchFloat = parseFloat(inchQty2Digits.toFixed(1)) * 10;
              displayQtyUOM =
                parseFloat(feetQty) +
                " ft " +  
                (inchFloat == 0 ? '' : (parseFloat(inchFloat.toFixed(1)) +
                  " inches"));
              displayQtyUOM = displayQtyUOM ? (displayQtyUOM) : "";
              item.convAlternateUOM = lfRate[0]?.alternateUom.name;

            }
            else if(this.inputUOM==='LF'){
              let feetQty = Math.floor(requestedQuantity);
              let inchQty = Math.round((requestedQuantity - feetQty) * 10);
              let decimalInchQty = inchQty / 12;

              let decimalLFQty = (feetQty) + decimalInchQty;
              let lfRateLF = this.pdpUomConversionRate?.filter(
                (element: any) => element.alternateUom.code == "LF"
              );

              outputQty = (
                (
                  decimalLFQty * lfRateLF[0]?.alternateUomConversionUnit * 1000
                ) / 1000
              ).toFixed(2);
              displayQtyUOM = outputQty;
              item.convAlternateUOM = this.pdpInvUOMValue;

            }
            else if(this.inputUOM === 'FTK'){
              let feetSFQty = requestedQuantity;
              let lfRateSF = this.pdpUomConversionRate?.filter(
                (element: any) => element.alternateUom.code == "FTK"
              );
              outputQty = (
                feetSFQty * lfRateSF[0]?.alternateUomConversionUnit
              ).toFixed(2);
              displayQtyUOM = outputQty;
              item.convAlternateUOM = this.pdpInvUOMValue;;

            }
      }else{
        if(this.inputUOM === this.pdpInvUOMCode || this.inputUOM === this.pdpPricingUOMCode ){
          
          let conversionRate = this.pdpUomConversionRate.find(
            (rate: any) => rate.alternateUom.code === this.inputUOM
          );
          let feetSFQty = requestedQuantity;

          if (conversionRate?.alternateUomConversionUnit === 1) {
            let lfRateSF1 = this.pdpUomConversionRate?.filter(
                (element: any) => element.alternateUom.code != this.inputUOM
              );

            // If the conversion rate is 1, the quantity remains the same
            outputQty = Math.round(1 / lfRateSF1[0]?.alternateUomConversionUnit) * feetSFQty;
          } else {
            feetSFQty = requestedQuantity;
          let lfRateSF = this.pdpUomConversionRate?.filter(
            (element: any) => element.alternateUom.code == this.inputUOM
          );
          let res =  (feetSFQty * lfRateSF[0]?.alternateUomConversionUnit
        );
        if (res - Math.floor(res) < 0.000005) {
          outputQty = Math.floor(res);
        } else {
          outputQty = Math.ceil(res);
        }
        outputQty = outputQty <= 0 ? 1 : outputQty;

          }
          let displayUOM = this.pdpUomConversionRate.find(
            (rate: any) => rate.alternateUom.code != this.inputUOM
          );
          displayQtyUOM = outputQty;
          item.convAlternateUOM = displayUOM?.alternateUom.name;

        }
        if (this.inputUOM != this.pdpInvUOMCode) {
          let feetSFQty = requestedQuantity;

          let conversionRate = this.pdpUomConversionRate.find(
            (rate: any) => rate.alternateUom.code === this.inputUOM
          );
        
          if (this.inputUOM === "ZCT") {
            // Display square yards for ZCT
            outputQty = (feetSFQty / (conversionRate?.alternateUomConversionUnit || 1)).toFixed(2);
            displayQtyUOM = `${outputQty}`;
            item.convAlternateUOM = "Square Yards";
          } else if (this.inputUOM === "YDK") {
            // Display cartons for YDK
            outputQty = Math.max(
              Math.ceil(feetSFQty * (conversionRate?.alternateUomConversionUnit || 1)),
              1
            );
            displayQtyUOM = `${outputQty}`;
            item.convAlternateUOM = "Cartons";
          } else if (this.inputUOM === "FTK") {
            let res = feetSFQty * (conversionRate?.alternateUomConversionUnit || 1);
            if (res - Math.floor(res) < 0.000005) {
              outputQty = Math.floor(res);
            } else {
              outputQty = Math.ceil(res);
            }
            outputQty = outputQty <= 0 ? 1 : outputQty;
            let displayUOM = this.pdpUomConversionRate.find(
              (rate: any) => rate.alternateUom.code !== "FTK"
            );
            displayQtyUOM = `${outputQty}`;
            item.convAlternateUOM = `${displayUOM?.alternateUom.name || this.pdpInvUOMValue}`;
          }

          if (this.pdpInvUOMCode == "RO") {
            this.requestedQty = outputQty;
          }
        }
        if (this.inputUOM === "EA" && this.pdpUomConversionRate.length === 1) {
          displayQtyUOM = "";
          outputQty = requestedQuantity;
        }
      }

      this.requestedQty = this.inputUOM == "RO" ? requestedQuantity: outputQty;
      if (this.inputUOM === "ZCT") {
        this.convertPdpInvUOMValue =requestedQuantity;
      } else {
        this.convertPdpInvUOMValue = outputQty;
        if (this.inputUOM === "FTK") {
            if(this.subProductType != "HERO_RUBBER"){
            this.pdpConvUnit = this.uomDetails?.sqFtPerCarton ?
              (this.uomDetails?.sqFtPerCarton * outputQty).toFixed(2) +
              " " +
              "Square Foot" : "";
          }else{
              let conversionRate = this.pdpUomConversionRate.find(
              (rate: any) => rate.alternateUom.code === this.inputUOM
            );
              // If the conversion rate is 1, the quantity remains the same
            this.pdpConvUnit  = Math.round(1 / conversionRate?.alternateUomConversionUnit) * outputQty + " " + "Square Foot";
          }
          
        }

        if (this.inputUOM === "YDK") {
          this.pdpConvUnit =
            ((this.uomDetails?.sqFtPerCarton / 9) * outputQty).toFixed(2);
        }
      }
      if (
        requestedQuantity === "" ||
        requestedQuantity === null
      )
        return "";
      else return displayQtyUOM;
    } else {
      return "";
    }
  }

  inventoryUomQty: any = 0;
  fullInventoryUomQty: any = 0;
  pricingUomQty: any = 0;
  requestedYdkQty: any;

  conversionFunction2(selectedAmount: any, item: any): string {
    this.inputUOM = item?.userRequestedUOM?.code || item?.checkUom;
    this.pdpUomConversionRate = (item?.product?.alternateUomData)
    this.erpProductCategory = item?.product?.erpProductCategory;
    this.pdpInvUOMCode = item?.product?.inventoryUom.code;
    this.pdpInvUOMValue = item?.product?.inventoryUom.name;
    this.pdpPricingUOMCode = item?.product?.pricingUom.code;
    this.pdpPricingUOMValue = item?.product?.pricingUom.name;
    const userRequestedUOM = item?.userRequestedUOM?.code || item?.checkUom;
    let userRequestedQuantity = this.convertFeetInchesToDecimalFeet(item?.userRequestedQuantity, userRequestedUOM);
    if (selectedAmount !== item.userRequestedQuantity) {
      userRequestedQuantity = this.convertFeetInchesToDecimalFeet(selectedAmount, userRequestedUOM);
    }
    const inventoryUom = this.pdpInvUOMCode;
    const pricingUom = this.pdpPricingUOMCode;
    const conversionFactors = this.pdpUomConversionRate;
    const ceilingUoms = ['ZCT', 'RO', 'PF'];
    console.log("conversionFunction2 called with userRequestedQuantity:", userRequestedQuantity, "userRequestedUOM:", userRequestedUOM);
    console.log("inventoryUom:", inventoryUom, "pricingUom:", pricingUom);

    const getDecimalsForUom = (value: number): number => {
      return parseFloat(value.toFixed(8));
    };
    const getCeilQuantity = (value: number): number => {
      return Math.ceil(getRoundedQuantityTwoDecimals(value));
    };
    const getCeilQuantityThreeDecimals = (value: number): number => {
      return Math.ceil(getRoundedQuantityThreeDecimals(value));
    };
    const getRoundedQuantityTwoDecimals = (value: number): number => {
      return Number((Math.round((value + Number.EPSILON) * 100) / 100).toFixed(2));
    };
    const getRoundedQuantityThreeDecimals = (value: number): number => {
      return Number((Math.round((value + Number.EPSILON) * 1000) / 1000).toFixed(3));
    };

    const valueWithinOneCentRounding = (initialUomConversion: number): boolean => {
      const twoDecimalUomConversion = getRoundedQuantityTwoDecimals(initialUomConversion);
      const roundedUomConversion = Math.round(initialUomConversion);
      return roundedUomConversion === twoDecimalUomConversion - 0.01 || roundedUomConversion === twoDecimalUomConversion + 0.01;
    };

    // --- getFullQuantityInInventoryUOM (no rounding except ceiling UOMs) ---
    let fullInventoryUomQty = userRequestedQuantity;
    if (userRequestedUOM && userRequestedUOM !== inventoryUom) {
      for (const factor of conversionFactors) {
        if (factor.alternateUom.code === userRequestedUOM) {
          const inventoryUomConversion = getDecimalsForUom(factor.alternateUomConversionUnit);
          if (ceilingUoms.includes(inventoryUom)) {
            fullInventoryUomQty = getCeilQuantity(userRequestedQuantity * inventoryUomConversion);
          } else {
            fullInventoryUomQty = userRequestedQuantity * inventoryUomConversion;
          }
          break;
        }
      }
    }

    // --- getQuantityInInventoryUOM (with rounding) ---
    let inventoryUomQty = getRoundedQuantityTwoDecimals(userRequestedQuantity);
    if (userRequestedUOM && userRequestedUOM !== inventoryUom) {
      for (const factor of conversionFactors) {
        if (factor.alternateUom.code === userRequestedUOM) {
          const inventoryUomConversion = getDecimalsForUom(factor.alternateUomConversionUnit);
          if (ceilingUoms.includes(inventoryUom)) {
            inventoryUomQty = getCeilQuantity(userRequestedQuantity * inventoryUomConversion);
          } else {
            inventoryUomQty = getRoundedQuantityTwoDecimals(userRequestedQuantity * inventoryUomConversion);
          }
          break;
        }
      }
    }

    // --- getQuantityInPricingUOM (converts via full inventory qty to pricing UOM) ---
    let pricingUomQty = getRoundedQuantityTwoDecimals(userRequestedQuantity);
    if (userRequestedUOM && pricingUom && pricingUom !== userRequestedUOM) {
      const invQtyForPricing = fullInventoryUomQty;
      for (const factor of conversionFactors) {
        if (factor.alternateUom.code === pricingUom) {
          if (factor.alternateUomConversionUnit % 1 !== 0) {
            const initialUomConversion = 1 / getDecimalsForUom(factor.alternateUomConversionUnit);
            const pricingUomConversion = valueWithinOneCentRounding(initialUomConversion) ? Math.round(initialUomConversion) : initialUomConversion;
            if (ceilingUoms.includes(pricingUom)) {
              pricingUomQty = getCeilQuantityThreeDecimals(invQtyForPricing * pricingUomConversion);
            } else {
              pricingUomQty = getRoundedQuantityTwoDecimals(invQtyForPricing * pricingUomConversion);
            }
          } else {
            const pricingUomConversion = getDecimalsForUom(factor.alternateUomConversionUnit);
            if (ceilingUoms.includes(pricingUom)) {
              pricingUomQty = getCeilQuantityThreeDecimals(invQtyForPricing / pricingUomConversion);
            } else {
              pricingUomQty = getRoundedQuantityTwoDecimals(invQtyForPricing / pricingUomConversion);
            }
          }
          break;
        }
      }
    }
   
     if (userRequestedUOM && pricingUom && inventoryUom && pricingUom === userRequestedUOM && inventoryUom === userRequestedUOM && this.erpProductCategory === 'B' && (item?.product?.productType === 'SOFTSURFACE' || item?.product?.productType === 'SoftSurface')) {
      inventoryUomQty = getCeilQuantity(inventoryUomQty);
      pricingUomQty = getCeilQuantity(pricingUomQty);
      for (const factor of conversionFactors) {
        if (factor.alternateUom.code === 'LF') {
          const inventoryUomConversion = getDecimalsForUom(factor.alternateUomConversionUnit);
          if (ceilingUoms.includes(inventoryUom)) {
            inventoryUomQty = getCeilQuantityThreeDecimals(userRequestedQuantity / inventoryUomConversion);
             const wholeFeet = Math.floor(inventoryUomQty);                                                        
            const inches = Math.round((inventoryUomQty - wholeFeet) * 12);                                        
            if (inches > 0) {                                                  
               const inchesStr = inches < 10 ? '0' + inches : inches == 10 ? inches +"0" :'' + inches;
                inventoryUomQty = parseFloat(wholeFeet + "." + inchesStr);       
              }  
          } else {
           inventoryUomQty = getRoundedQuantityTwoDecimals(userRequestedQuantity / inventoryUomConversion);  
            const wholeFeet = Math.floor(inventoryUomQty);                                                        
            const inches = Math.round((inventoryUomQty - wholeFeet) * 12);                                        
             if (inches > 0) {                                                  
                const inchesStr = inches < 10 ? '0' + inches : inches == 10 ? inches +"0" :'' + inches;
                inventoryUomQty = parseFloat(wholeFeet + "." + inchesStr);       
              }  
          }
          break;
        }
      }

     }

    this.inventoryUomQty = inventoryUomQty;
    this.fullInventoryUomQty = fullInventoryUomQty;
    this.pricingUomQty = pricingUomQty;
    if(userRequestedUOM && userRequestedUOM !== inventoryUom){

      if(userRequestedUOM == "YDK"){
       this.requestedYdkQty = userRequestedQuantity;
      } else {
        this.requestedYdkQty = pricingUomQty;
      }
      this.requestedQty = inventoryUomQty;
      this.convertPdpInvUOMValue = inventoryUomQty;
      if (this.inputUOM === "YDK") {
          let ydkRate = this.pdpUomConversionRate?.find(
            (rate: any) => rate.alternateUom.code === "YDK"
          );
          let invRate = this.pdpUomConversionRate?.find(
            (rate: any) => rate.alternateUom.code !== "YDK"
          );
          if (ydkRate?.alternateUomConversionUnit && invRate?.alternateUomConversionUnit) {
            let sqYdPerUnit = invRate.alternateUomConversionUnit / ydkRate.alternateUomConversionUnit;
            this.pdpConvUnit = (sqYdPerUnit * this.requestedQty).toFixed(2) + " " + "Square Yard";
          } else {
            this.pdpConvUnit = "";
          }
        }
         if (this.inputUOM === "FTK") {
          let ftkRate = this.pdpUomConversionRate?.find(
            (rate: any) => rate.alternateUom.code === "FTK"
          );
          let invRate = this.pdpUomConversionRate?.find(
            (rate: any) => rate.alternateUom.code !== "FTK"
          );
          if (ftkRate?.alternateUomConversionUnit && invRate?.alternateUomConversionUnit) {
            let sqFtPerUnit = invRate.alternateUomConversionUnit / ftkRate.alternateUomConversionUnit;
            this.pdpConvUnit = (sqFtPerUnit * this.requestedQty).toFixed(2) + " " + "Square Foot";
          } else {
            this.pdpConvUnit = "";
          }
        }
      item.convAlternateUOM = this.uomCodeToUomName(inventoryUom);
      return `${inventoryUomQty}`;
    }
    else if(userRequestedUOM && userRequestedUOM !== pricingUom){
        if(userRequestedUOM == "YDK"){
       this.requestedYdkQty = userRequestedQuantity;
      } else {
        this.requestedYdkQty = inventoryUomQty;
      }
      this.requestedQty = inventoryUomQty;
      this.convertPdpInvUOMValue = inventoryUomQty;
      if (this.inputUOM === "YDK") {
          let ydkRate = this.pdpUomConversionRate?.find(
            (rate: any) => rate.alternateUom.code === "YDK"
          );
          let invRate = this.pdpUomConversionRate?.find(
            (rate: any) => rate.alternateUom.code !== "YDK"
          );
          if (ydkRate?.alternateUomConversionUnit && invRate?.alternateUomConversionUnit) {
            let sqYdPerUnit = invRate.alternateUomConversionUnit / ydkRate.alternateUomConversionUnit;
            this.pdpConvUnit = (sqYdPerUnit * this.requestedQty).toFixed(2) + " " + "Square Yard";
          } else {
            this.pdpConvUnit = "";
          }
        }
         if (this.inputUOM === "FTK") {
          let ftkRate = this.pdpUomConversionRate?.find(
            (rate: any) => rate.alternateUom.code === "FTK"
          );
          let invRate = this.pdpUomConversionRate?.find(
            (rate: any) => rate.alternateUom.code !== "FTK"
          );
          if (ftkRate?.alternateUomConversionUnit && invRate?.alternateUomConversionUnit) {
            let sqFtPerUnit = invRate.alternateUomConversionUnit / ftkRate.alternateUomConversionUnit;
            this.pdpConvUnit = (sqFtPerUnit * this.requestedQty).toFixed(2) + " " + "Square Foot";
          } else {
            this.pdpConvUnit = "";
          }
        }
      item.convAlternateUOM = this.uomCodeToUomName(pricingUom)
      return `${pricingUomQty}`;
    }
    else if(userRequestedUOM && pricingUom && inventoryUom && pricingUom === userRequestedUOM && inventoryUom === userRequestedUOM && this.erpProductCategory === 'B' && (item?.product?.productType === 'SOFTSURFACE' || item?.product?.productType === 'SoftSurface')){
        if(userRequestedUOM == "YDK"){
       this.requestedYdkQty = userRequestedQuantity;
       this.requestedQty = inventoryUomQty;
       this.convertPdpInvUOMValue = inventoryUomQty;
      } else {
        this.requestedYdkQty = inventoryUomQty;
        this.requestedQty = inventoryUomQty;
        this.convertPdpInvUOMValue = inventoryUomQty;
      }
      if (this.inputUOM === "YDK") {
          let ydkRate = this.pdpUomConversionRate?.find(
            (rate: any) => rate.alternateUom.code === "YDK"
          );
          let invRate = this.pdpUomConversionRate?.find(
            (rate: any) => rate.alternateUom.code !== "YDK"
          );
          if (ydkRate?.alternateUomConversionUnit && invRate?.alternateUomConversionUnit) {
            let sqYdPerUnit = invRate.alternateUomConversionUnit / ydkRate.alternateUomConversionUnit;
            this.pdpConvUnit = (sqYdPerUnit * this.requestedQty).toFixed(2) + " " + "Square Yard";
          } else {
            this.pdpConvUnit = "";
          }
        }
         if (this.inputUOM === "FTK") {
          let ftkRate = this.pdpUomConversionRate?.find(
            (rate: any) => rate.alternateUom.code === "FTK"
          );
          let invRate = this.pdpUomConversionRate?.find(
            (rate: any) => rate.alternateUom.code !== "FTK"
          );
          if (ftkRate?.alternateUomConversionUnit && invRate?.alternateUomConversionUnit) {
            let sqFtPerUnit = invRate.alternateUomConversionUnit / ftkRate.alternateUomConversionUnit;
            this.pdpConvUnit = (sqFtPerUnit * this.requestedQty).toFixed(2) + " " + "Square Foot";
          } else {
            this.pdpConvUnit = "";
          }
        }
        item.convAlternateUOM = "Linear FT"
        return `${inventoryUomQty}`;
    }
    else{
        if(userRequestedUOM == "YDK"){
       this.requestedYdkQty = userRequestedQuantity;
       this.convertPdpInvUOMValue = inventoryUomQty;
       this.requestedQty = inventoryUomQty; 
      } else {
        this.requestedYdkQty = inventoryUomQty;
        this.convertPdpInvUOMValue    = inventoryUomQty;
        this.requestedQty = inventoryUomQty;  
      }
       if (this.inputUOM === "YDK") {
          let ydkRate = this.pdpUomConversionRate?.find(
            (rate: any) => rate.alternateUom.code === "YDK"
          );
          let invRate = this.pdpUomConversionRate?.find(
            (rate: any) => rate.alternateUom.code !== "YDK"
          );
          if (ydkRate?.alternateUomConversionUnit && invRate?.alternateUomConversionUnit) {
            let sqYdPerUnit = invRate.alternateUomConversionUnit / ydkRate.alternateUomConversionUnit;
            this.pdpConvUnit = (sqYdPerUnit * this.requestedQty).toFixed(2) + " " + "Square Yard";
          } else {
            this.pdpConvUnit = "";
          }
        }
         if (this.inputUOM === "FTK") {
          let ftkRate = this.pdpUomConversionRate?.find(
            (rate: any) => rate.alternateUom.code === "FTK"
          );
          let invRate = this.pdpUomConversionRate?.find(
            (rate: any) => rate.alternateUom.code !== "FTK"
          );
          if (ftkRate?.alternateUomConversionUnit && invRate?.alternateUomConversionUnit) {
            let sqFtPerUnit = invRate.alternateUomConversionUnit / ftkRate.alternateUomConversionUnit;
            this.pdpConvUnit = (sqFtPerUnit * this.requestedQty).toFixed(2) + " " + "Square Foot";
          } else {
            this.pdpConvUnit = "";
          }
        }
       item.convAlternateUOM = this.uomCodeToUomName(inventoryUom)
       return `${inventoryUomQty}`;
    }
  }

  uomCodeToUomName(uomCode: string): string {
    const uom = this.pdpUomConversionRate?.find(
      (element: any) => element.alternateUom.code === uomCode
    );
    return uom ? uom.alternateUom.name : uomCode;
  }

  processElements(elements: any, index: any, pdf: any, callback: any, lastPosition = 10) {
    if (index < elements.length) {
      html2canvas(elements[index], { scale: 1, useCORS: true, }).then(canvas => {
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        const imgWidth = 190;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let position = lastPosition;
        if (index > 0) {
          position += 5;
        }
        if (position + imgHeight > pdf.internal.pageSize.getHeight() - 10) {
          pdf.addPage();
          position = 10; // Reset position for the new page,
        }

        pdf.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
        this.processElements(elements, index + 1, pdf, callback, position + imgHeight);
      }).catch(error => {
        console.error('Error processing element with html2canvas:', error);
      });
    } else {
      callback();
    }
  }
  viewPdf(from: any = "") {
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
    const imgLogo = new Image();
    imgLogo.src = '/assets/images/logo-residential-dark.png';
    imgLogo.onload = () => {
      const desiredWidth = 50;
      const aspectRatio = imgLogo.width / imgLogo.height;
      const calculatedHeight = desiredWidth / aspectRatio;
      pdf.addImage(imgLogo, 'JPEG', 10, 10, desiredWidth, calculatedHeight);
      const newContentStartY = 7 + calculatedHeight + 7;
      const elements = printArea.querySelectorAll('.no-page-break');
      this.processElements(elements, 0, pdf, () => {
        this.finalizePDF(pdf, from);
        this.resetStyles();
        this.progressHide();
        this.hidelement(false);
        this.toggleAccordionElements(true)
        this.showComments = false
      }, newContentStartY);
    };
    imgLogo.onerror = () => {
      console.error("Failed to load logo image");
      this.progressHide();
    };
  }
  resetStyles() {
    const validateFields: any = document.querySelectorAll('.space-normalizer');
    for (let field of validateFields) {
      field.style.letterSpacing = 'normal';
    }
  }
  @ViewChild('template2') template2: TemplateRef<any> | any;
  finalizePDF(pdf: any, from: any) {
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
        this.shareViaEmailModal(orderPDFData[1], this.template2);
      } else {
        window.open(pdf.output('bloburl'), '_blank');
      }
    } catch (error) {
      console.error('Error finalizing PDF:', error);
    } finally {
      this.spinnerLoading = false; // Ensure spinner is always turned off
    }
  }
  toggleAccordionElements(show: boolean): void {
    let accordianElements: any =
      this.document.querySelectorAll(".panel-collapse");
    for (let a = 0; a < accordianElements.length; a++) {
      if (show) {
        accordianElements[a].style.display = "block";
      } else {
        accordianElements[a].style.display = "none";
      }
    }
  }

  dateConvert(d: any) {
    return new Date(d).toISOString().slice(0, 10);
  }

  onDyelot(e: any) {
    return e.target.value;
  }

  changeshipViaOptions(event: any) {
    if (this.csrSuperAdmin.isCustomer || this.csrSuperAdmin.isSalesOps || this.csrSuperAdmin.isSalesPerson) {
      this.spinnerLoading = false;

      this.shippingWareHouseOptions = [];
      this.shippingWareHouseOptions.push({
        value: this.shippingAddress?.defaultShippingWarehouse,
        label: this.shippingAddress?.defaultShippingWarehouseDesc,
      });
      this.orderService
        .getShippingoptionForCustomers(
          this.shippingAddress.postalCode,
          this.shipViaSelectedOption,
          this.shippingWareHouseSelectedOption,
          this.shippingAddress.isOneTimeShipTo == undefined ? false : this.shippingAddress.isOneTimeShipTo,
          ''
        )
        .subscribe({
          next: (res) => {
            this.showValidationError = false;
            console.log("res---->", res);
            if (res?.body?.incoTerms || res?.body?.shipvia) {
              this.spinnerLoading = false;
              this.incoTermsOptions = [];
              this.incoTermsOptions.push({
                value: res.body.incoTerms,
                label: res.body.incoTermsDesc,
              });

              this.incoTermsLoc2Options = [];
              this.incoTermsLoc2Options.push({
                value: res.body.shipvia,
                label: res.body.shipvia,
              });
              this.originalDefaultSM = res.body?.originalDefaultShippingMethod;
              //  this.originalShippingMethod = res?.body?.originalDefaultShippingMethod;
              this.incoTermsSelectedOption = this.incoTermsOptions[0]?.value;
              this.incoTermsLoc2SelectedOption = res.body.shipvia;
            }
            else {
              this.spinnerLoading = false;
              this.showValidationError = true;
              this.validationErrorMessage = "Shipping Options are not available for customer"
              this.shippingInfoMessage = "Shipping Options are not available for customer";
              this.incoTermsLoc2SelectedOption = "";
              this.incoTermsSelectedOption = "";

              setTimeout(() => {
                this.shippingInfoMessage = "";
              }, 8000);
            }
          },
          error: (err) => {
            this.spinnerLoading = false;
          },
        });
    } else {
      this.shipViaSelectedOption = event;
      this.getIncoTerms(event);
      const selectedShippingWHOption = this.shippingWareHouseOptions.find(
        (item: any) => item.value === this.shippingWareHouseSelectedOption
      );
      this.incoTermsLoc2SelectedOption = null;
      this.getIncoTermsLoc2SM(selectedShippingWHOption?.value);
    }

  }

  getIncoTermsLoc2SM(shippingWareHouse: any) {
    this.incoTermsLoc2Options = [];
    let postalCode = this.shippingAddress?.postalCode;
    if (this.shippingAddress?.postalCode.includes("-")) {
      postalCode = this.shippingAddress?.postalCode.split("-")[0];
    }
    this.incoTermsLoc2Options = [];
    const selectedShippingMethod = this.shipViaOptions.find(
      (item: any) => item.value === this.shipViaSelectedOption
    );
    this.incoTermsLoc2Options = [];
    this.orderService
      .getIncoTermsLoc2(
        postalCode,
        shippingWareHouse,
        this.shipViaSelectedOption
      )
      .subscribe({
        next: (res) => {
          const resObject = res?.body;
          const objectKeys = Object.keys(resObject).sort();
          objectKeys.forEach((key) => {
            this.incoTermsLoc2Options.push({
              value: resObject[key].shipvia,
              label: resObject[key].shipvia,
              preferred: resObject[key].preferred
            });
          });
        },
        error: (err) => { },
      });
  }

  changeincoTermsOptions(event: any) {
    this.incoTermsSelectedOption = event;
  }

  changeShippingWareHouseOptions(event: any) {
    this.shippingWareHouseSelectedOption = event;
    this.getIncoTermsLoc2(event);
  }

  recommendedAccessories: any = [];
  getQuoteRecommendedAccessories() {
    this.quotesService
      .getQuoteRecommendedAccessories(this.quoteId)
      .subscribe(
        (res: any) => {
          if (res?.body) {
            this.recommendedAccessories = res?.body?.recommendedAccessoryTypes || [];
          }
        });
  }
  getColumnClass(item: any): string {
    if (item?.product?.productType !== 'ACCESSORIES' || item?.checkUom !== 'RO') {
      return 'col-12 col-lg-4 col-md-4 col-xl-4';
    }
    else {
      return 'col-12 col-lg-6 col-md-6 col-xl-6';
    }
  }

  progressShow(msgType: any) {

    const messageConstants = MESSAGE_CONSTANTS?.quotes?.QuoteDetails?.[msgType]
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

  removeATPCart(){
    this.storageService.getItem("solutionsQuoteData").pipe(take(1)).subscribe((res) => {
      if(res){
        let payload:any = {
          "shipTo": this.csrSuperAdmin?.orgUnit?.uid,
          "soldTo": this.csrSuperAdmin?.orgUnit?.soldTo,
          "oneTimeShippingAddress": this.shippingAddress?.isOneTimeShipTo || false,
          "erpOrderID": res?.solution[0]?.erpOrderID,
          "erpOrderLineNumber": res?.solution[0]?.erpOrderLineNumber,
          "productCode": res?.productCode,
          "hybrisOrderNumber": res?.hybrisOrderNumber,
          "hybrisLineNumber": res?.hybrisLineNumber,
        }
        
        this.spinnerLoading = true;
        this.productService.removeATPCartEntry(payload).subscribe((resp:any)=>{
          if(resp.status == "200"){
            if(resp?.body?.status === "SUCCESS"){
              this.spinnerLoading = false;
              this.storageService.removeItem("solutionsQuoteData");
            }
          }
        });
      }
    });
  }

}
