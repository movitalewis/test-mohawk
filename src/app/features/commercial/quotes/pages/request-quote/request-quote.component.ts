import {
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { BreadcrumbItems } from "src/app/features/shared/interfaces";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { ProductService } from "../../../products/pages/services/product.service";
import { ActivatedRoute, Router } from "@angular/router";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { StorageService } from "src/app/features/http-services/storage.service";
import {
  map,
  noop,
  Observable,
  Observer,
  of,
  Subject,
  Subscription,
  switchMap,
  takeUntil,
  tap,
} from "rxjs";
import { UserService } from "src/app/features/shared/user/services/user.service";
import { ConfirmationDialogComponent } from "src/app/features/shared/components/confirmation-dialog/confirmation-dialog.component";
import { QuotesService } from "../../services/quotes.service";
import { ApiService } from "src/app/features/http-services/api.service";
import { XchangeImageViewLightBoxComponent } from "src/app/features/shared/components/xchange-image-view-light-box/xchange-image-view-light-box.component";
import { TabsetComponent } from "ngx-bootstrap/tabs";
import { XchangeAddQuoteAccessoriesLightboxComponent } from "../xchange-add-quote-accessories-lightbox/xchange-add-quote-accessories-lightbox.component";

@Component({
    selector: "app-request-quote",
    templateUrl: "./request-quote.component.html",
    styleUrls: ["./request-quote.component.scss"],
    standalone: false
})
export class RequestQuoteComponent implements OnInit, OnDestroy {
  productCode: string = "C.BC453.383.1200.A";
  itemData: any;
  pdbData: any;
  myForm!: FormGroup;
  alertData: any = {
    message: "success",
  };
  alertType: any = "success";
  alertTrigger: any = false;
  spinnerLoading: boolean = false;

  breadcrumbItems: BreadcrumbItems = [
    {
      name: "Home",
      path: "/commercial",
      active: false,
    },

    {
      name: "Quote Request",
      path: "/",
      active: true,
    },
  ];
  isSolutionDetailsClicked: boolean = false;
  modalRef!: BsModalRef;
  productData: any;
  queryParamName: any;
  marketsegmentdata: any;
  marketSegInput: boolean = false;
  defaultAddress: any;
  formattedAddress: any;
  shippingAddress: any = {};
  estimatedDate: any = "";
  uid: any;
  entryData: any;
  userList: any = [];
  quote: any;
  totalitem: number = 0;
  submittedForList: any[] = [];
  cartCode = "";
  formSubscription!: Subscription;
  selectedEndUser: any;
  userEmail: any;
  userRole: boolean = false;
  userAccount: any;
  firstLoad = true;
  errorAlerts: any = [];
  cartIsEmpty = true;
  showAssignedSpec = false;
  sidebarPath: any;
  cartNumberData: any = {};
  minicartSubscription: any;
  destroySubject: Subject<void> = new Subject();
  cartEntries: any = [];
  marketSegment: any;
  marketSegmentCode: any;
  submitFor: any = "";
  suggestionsCre$?: Observable<any>;
  suggestionsGpo$?: Observable<any>;
  suggestionsAd$?: Observable<any>;
  skipGetQuoteLoadingModal: boolean = false;

  constructor(
    private modalService: BsModalService,
    public bsModalRef: BsModalRef,
    private fb: FormBuilder,
    private service: ProductService,
    private route: ActivatedRoute,
    private router: Router,
    private storageService: StorageService,
    private activate: ActivatedRoute,
    public userService: UserService,
    private quotesService: QuotesService,
    private apiSerice: ApiService,
    private getStorageService: StorageService,
    private productService: ProductService
  ) {
  //   this.spinnerLoading = true;
  //   this.minicartSubscription = this.getStorageService
  //     .getItem("miniCartCount")
  //     .pipe(takeUntil(this.destroySubject))
  //     .subscribe(
  //       (res) => {
  //         if (res?.code) {
  //           this.cartNumberData = res;
  //           this.getSubmittedFor();
  //           this.getquotedata();
  //           this.minicartSubscription.unsubscribe();
  //           // this.spinnerLoading = false;
  //         } else {
  //           this.spinnerLoading = false;
  //           this.cartIsEmpty = true;
  //         }
  //       },
  //       () => {
  //         this.spinnerLoading = false;
  //         this.cartIsEmpty = true;
  //       }
  //     );
  }

  @ViewChild("tabs", { static: false }) tabs!: TabsetComponent;
  suggestions$?: Observable<any>;
  endUsers: any = [];
  notFoundendUser: boolean = false;
  accountName: string = "";
  mtClass: any;
  pro: any;
  air: any;
  mini: any;
  deviceType: any;
  @HostListener("window:resize", ["$event"])
  onResize(event: any) {
    const { mtClass, deviceType, pro, air, mini } =
      this.userService.getDeviceType();
    this.mtClass = mtClass;
    this.deviceType = deviceType;
    this.pro = pro;
    this.air = air;
    this.mini = mini;
  }
  ngOnInit(): void {
    const { mtClass, deviceType, pro, air, mini } =
      this.userService.getDeviceType();
    this.mtClass = mtClass;
    this.deviceType = deviceType;
    this.pro = pro;
    this.air = air;
    this.mini = mini;
    this.suggestions$ = new Observable(
      (observer: Observer<string | undefined>) => {
        observer.next(this.myForm.value.endUser);
      }
    ).pipe(
      switchMap((query: string | undefined) => {
        if (query) {
          return this.quotesService.getEndUserList(this.uid, query).pipe(
            map((res: any) => {
              {
                if (res?.body?.endUsers?.length == 1) {
                  let notFoundUser = res?.body?.endUsers?.filter(
                    (res: any) => res?.value?.unitName == this.accountName
                  );
                  if (notFoundUser) {
                    this.notFoundendUser = true;
                    this.myForm.patchValue({
                      endUser: this.accountName,
                    });
                    this.myForm.controls["marketSegment"].enable();
                    return [];
                  }
                } else {
                  return res?.body?.endUsers || [];
                }
              }
            }),
            tap(
              () => noop,
              (res) => {
                this.spinnerLoading = false;
                res = {
                  body: {
                    endUsers: {
                      entry: [
                        {
                          key: "10100310_8135_80_81",
                          value: "API is erroring",
                        },
                        {
                          key: "10100310_8135_80_81",
                          value: "Here are some",
                        },
                        {
                          key: "10100310_8135_80_81",
                          value: "Hardcode values",
                        },
                      ],
                    },
                  },
                };
                this.endUsers = res.body.endUsers.entry;
              }
            )
          );
        }

        return of([]);
      })
    );
    this.sidebarPath = localStorage.getItem("path");
    this.initialFrom();

    if (sessionStorage.getItem("requestQuoteFormData") !== null) {
      this.restoreForm(
        JSON.parse(sessionStorage.getItem("requestQuoteFormData")!)
      );
    }
    this.userService.getCurrentUserDetail().subscribe((res: any) => {
      this.userRole = res.body.isCustomer ? res.body.isCustomer : false;
      this.uid = res.body.orgUnit?.uid;
      this.userAccount = res.body.email;
      if (res?.body?.isCustomer) {
        this.myForm.controls["submittedFor"].setValue(res.body.name);
        this.myForm.controls["submittedFor"].disable();
      }
      this.myForm.controls["submittedBy"].setValue(res.body.name);
      this.myForm.controls["submittedBy"].disable();
      this.accountName = res?.body?.orgUnit?.name;
    });

    this.marketsegment();
    this.getEndUserList("");

    this.storageService.getItem("item").subscribe((res: any) => {
      this.itemData = res;
    });
    this.storageService.getItem("productValue").subscribe((res: any) => {
      this.productData = res;
    });

    this.queryParamName = this.route.snapshot.params["code"];
    this.myForm.controls["comments"].setAsyncValidators;
    this.formSubscription = this.myForm.valueChanges.subscribe((form) =>
      sessionStorage.setItem(
        "requestQuoteFormData",
        JSON.stringify(this.myForm.value)
      )
    );    
    this.getquotedata();
    this.creSuggestions();
    this.gpoSuggestions();
    this.adSuggestions();
  }
  creSuggestions() {
    this.suggestionsCre$ = new Observable(
      (observer: Observer<string | undefined>) => {
        observer.next(this.myForm.value.cre);
      }
    ).pipe(
      switchMap((query: string | undefined) => {
        if (query) {
          return this.service.getCreList(this.uid, query).pipe(
            map((res: any) => {
              return res?.body?.endUsers || [];
            }),
            tap(
              () => noop,
              (res) => {
                this.spinnerLoading = false;
                res = {
                  body: {
                    endUsers: {},
                  },
                };
                this.endUsers = res.body.endUsers.entry;
              }
            )
          );
        }
        return of([]);
      })
    );
  }
  gpoSuggestions() {
    this.suggestionsGpo$ = new Observable(
      (observer: Observer<string | undefined>) => {
        observer.next(this.myForm.value.gpo);
      }
    ).pipe(
      switchMap((query: string | undefined) => {
        if (query) {
          return this.service.getGpoList(this.uid, query).pipe(
            map((res: any) => {
              return res?.body?.endUsers || [];
            }),
            tap(
              () => noop,
              (res) => {
                this.spinnerLoading = false;
                res = {
                  body: {
                    endUsers: {},
                  },
                };
                this.endUsers = res.body.endUsers.entry;
              }
            )
          );
        }
        return of([]);
      })
    );
  }
  adSuggestions() {
    this.suggestionsAd$ = new Observable(
      (observer: Observer<string | undefined>) => {
        observer.next(this.myForm.value.ad);
      }
    ).pipe(
      switchMap((query: string | undefined) => {
        if (query) {
          return this.service.getAdList(this.uid, query).pipe(
            map((res: any) => {
              return res?.body?.endUsers || [];
            }),
            tap(
              () => noop,
              (res) => {
                this.spinnerLoading = false;
                res = {
                  body: {
                    endUsers: {},
                  },
                };
                this.endUsers = res.body.endUsers.entry;
              }
            )
          );
        }
        return of([]);
      })
    );
  }

  restoreForm(formData: any) {
    this.myForm.controls["comments"].setValue(formData.comments);
    this.myForm.controls["endUser"].setValue(formData.endUser);
    this.myForm.controls["jobLocation"].setValue(formData.jobLocation);
    this.myForm.controls["marketSegment"].setValue(formData.marketSegment);
    this.myForm.controls["submittedFor"].setValue(formData.submittedFor);
    this.myForm.controls["ad"].setValue(formData.ad);
    this.myForm.controls["cre"].setValue(formData.cre);
    this.myForm.controls["gpo"].setValue(formData.gpo);
    this.myForm.controls["comments"].setValue(formData.comments);
    if (formData?.endUser || formData.submittedFor) {
      this.myForm.controls["marketSegment"].enable();
    }
  }

  showQuoteConfirmation() {
    this.tabs.tabs[1].disabled = false;
    this.tabs.tabs[1].active = true;
    this.tabs.tabs[1].disabled = true;
  }

  ngOnDestroy(): void {
    this.formSubscription.unsubscribe();
  }

  getSubmittedFor(): any {
    this.submittedForList = [];
    let tempUserList: any[] = [];
    this.quotesService.getSubmittedFor().subscribe(
      (res: any) => {
        let users = res?.body?.users ? res?.body?.users : [];
        if (users.length > 0) {
          users.map((e: any) =>
            tempUserList.push({
              ...e,
              name: `${e?.firstName.trim()} ${e?.lastName.trim()}`,
            })
          );
          // tempUserList.push({ name: "Create New Contact", value: "new" });
        //  tempUserList.push({ name: "Create New Contact", value: "new" });
          this.submittedForList = tempUserList;
        } else if (users.length === 0) {
          this.getStorageService.getItem("userInfo").subscribe((res) => {
            this.submittedForList = [];
            this.submittedForList.push(res);
            // this.submittedForList.push({
            //   name: "Create New Contact",
            //   value: "new",
            // });
          });
        }
      },
      (err) => {}
    );
  }
  getquotedata() {
    // this.spinnerLoading = true;
    this.cartEntries = [];
    this.cartIsEmpty = true;
    // this.service.getLatestMiniCart(this.uid);
    // this.quoteCode = this.activate.snapshot.paramMap.get("code");
    this.productService.getMiniCartData(this.uid).subscribe((result: any) => {
      if (result?.body?.code) {
        this.storageService.setItem("miniCartCount", result?.body);
        this.quoteCode = result?.body?.quoteNumber;
        if (!this.skipGetQuoteLoadingModal) {
          this.productService.progressShow('getQuote');
        }
        this.service.getQuoteData(this.quoteCode).subscribe(
          (res: any) => {
            this.productService.progressHide();
            if (
              res.body?.messages &&
              (res.body?.messages[0]?.status == "Error" ||
                res.body?.messages[0]?.status == "Failed")
            ) {
              const ind = this.errorAlerts.findIndex(
                (item: any) => item.type == "quoteData"
              );
              if (ind > 0) {
                this.errorAlerts.splice(ind, 1);
              }
              this.errorAlerts.push({
                type: "quoteData",
                message: res.body?.messages[0]?.message,
              });
            }
            this.submitFor = res?.body?.submittedFor;
            this.spinnerLoading = false;
            this.quote = res?.body;
            this.totalitem = res?.body?.totalItems;
            this.cartIsEmpty = !(this.totalitem > 0);
            this.cartCode = res?.body?.cartId;
            this.marketSegment = res?.body?.marketSegment;
            this.defaultAddress = res?.body?.deliveryAddress;
            this.cartEntries = res?.body?.entries ? res?.body?.entries : [];

            if (this.totalitem != 0) {
              if (!!res.body?.eddDate) {
                this.estimatedDate = res.body?.eddDate;
              } else {
                this.estimatedDate = "See line details.";
              }
            } else {
              this.estimatedDate = "NA";
            }
            // this.getStorageService.setItem("miniCartCount", res.body);
            this.totalitem = res?.body?.totalItems;

            this.quote = res.body;
          },
          (err: any) => {
            this.productService.progressHide();
            this.spinnerLoading = false;

            this.totalitem = 0;
            const ind = this.errorAlerts.findIndex(
              (item: any) => item.type == "quoteData"
            );
            if (ind > 0) {
              this.errorAlerts.splice(ind, 1);
            }
            this.errorAlerts.push({
              type: "quoteData",
              message: err?.error?.errors[0].message,
            });
          }
        );
        this.getSubmittedFor();
      } 
      else {
        if (result?.body?.errorMessage && result.body.errorMessage.includes("No Cart existed with user")) {
          console.log("Error: No Cart existed with the specified user.");
          this.storageService.setItem("miniCartCount", {});
        }
        this.spinnerLoading = false;
        this.cartIsEmpty = true;
      }
    }, () => {
      this.spinnerLoading = false;
    });
    // this.service.getQuoteData(this.quoteCode).subscribe(
    //   {
    //     next: (res: any) => {

    //       this.spinnerLoading = false;
    //       this.firstLoad = false;
    //       this.quote = res.body;

    //       this.cartEntries = res?.body?.entries ? res?.body?.entries : [];

    //       this.totalitem = res?.body?.totalItems;
    //       this.cartIsEmpty = !(this.totalitem > 0);
    //       this.cartCode = res?.body.cartId;

    //       this.entryData = (this.quote?.entries || []).map((entry: any) => {

    //         return {
    //           total: entry?.totalItems,
    //           name: entry?.product?.name,
    //           colour: entry?.product?.sellingColorName,
    //           size: entry?.product?.sellingSizeDescription,
    //           Quantity: entry?.userRequestedQuantity,
    //           productImage: entry?.product?.productImageURL || 'https://s7d4.scene7.com/is/image/MohawkResidential/Image_coming_soon',
    //           backingname: entry?.product?.sellingBackingName,
    //           entryNumber: entry?.entryNumber,
    //           uom: entry?.userRequestedUOM?.code,
    //           productCode: entry?.product?.code,
    //           subProductType:entry?.product?.subProductType,
    //         };
    //       });
    //     },
    //     error: (res:any)=>{
    //       this.spinnerLoading = false;
    //       this.cartIsEmpty = true;
    //     }
    // }
    // );
  }
  marketsegment() {
    this.service.getmarketsegment().subscribe((res: any) => {
      if (res?.body?.marketSegments) {
        this.marketsegmentdata = res?.body?.marketSegments.sort(
          (a: any, b: any) => (a.code < b.code ? -1 : 1)
        );
      } else {
        this.marketsegmentdata = [];
      }
    });
  }
  getEndUserList(val: any) {
    this.service.getEndUserList(this.uid, val).subscribe({
      next: (res: any) => {
        this.endUsers = res.body.endUsers;
      },
      error: (res) => {
        res = {
          body: {
            endUsers: {
              entry: [
                {
                  key: "10100310_8135_80_81",
                  value: "API is erroring",
                },
                {
                  key: "10100310_8135_80_81",
                  value: "Here are some",
                },
                {
                  key: "10100310_8135_80_81",
                  value: "Hardcode values",
                },
              ],
            },
          },
        };
        this.endUsers = res.body.endUsers.entry;
      },
    });
  }
  showAssignedSqFtYrd(e: any) {
    if (e.checked) {
      this.showAssignedSpec = true;
    } else {
      this.showAssignedSpec = false;
    }
  }

  initialFrom() {
    this.myForm = this.fb.group({
      submittedFor: [null, Validators.required],
      endUser: [null, Validators.required],
      cre: [null],
      gpo: [null],
      ad: [null],
      jobLocation: [null, Validators.required],
      marketSegment: [null, Validators.required],
      submittedBy: [null],
      comments: [null],
    });
    this.myForm.controls["marketSegment"].disable();
    this.myForm.markAsUntouched();
  }

  quoteCode: any = "";
  entryNumber: any = "1";
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
  removeEntry(entryNumber: any) {
    this.openConfirmationModal({
      title: "Remove entry",
      content: "Do you really want to Remove?",
      primaryActionLabel: "YES",
      secondaryActionLabel: "NO",
      onPrimaryAction: () => this.remove(entryNumber),
    });
  }
  remove(entryNumber: any) {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    this.modalService.hide();
    // this.spinnerLoading = true;
    this.productService.progressShow('removeItemFromQuote')
    this.quotesService
      .removeEntry(this.cartCode, entryNumber)
      .subscribe((res: any) => {
        if (res) {
          this.productService.progressHide();
          // this.service.getLatestMiniCart(this.uid);
          this.service.getLatestMiniCart(this.uid);
          this.getquotedata();
          // this.spinnerLoading = false;
          this.alertData = {
            message: "Product quote has been deleted successfully!",
          };
          this.alertType = "success";
          this.alertTrigger = true;
          this.stopAlert();
        }
      },
      (err: any) => {
        this.productService.progressHide();
        this.alertData = {
          message: err?.error,
        };
        this.alertTrigger = true;
        this.spinnerLoading = false;
      });
  }
  get f() {
    return this.myForm?.controls;
  }
  stopAlert() {
    setTimeout(() => {
      this.alertTrigger = false;
    }, 4000);
  }

  openCartAccessoriesModal(item: any) {
    this.skipGetQuoteLoadingModal = true;
    const initialState: ModalOptions = {
      initialState: {
        ...this.myForm.value,
        ...{
          type: 2,
          cartDataProductId: item?.product.code,
          showSuccessAlert: false,
          showContinueShopping: true,
          cartCode: this.cartCode,
        },
        getQuoteAction: () => {
          this.getquotedata();
        },
        onClose: () => {
          this.skipGetQuoteLoadingModal = false;
        }
      },
    };
    this.bsModalRef = this.modalService.show(
      XchangeAddQuoteAccessoriesLightboxComponent,
      Object.assign(initialState, {
        class: "modal-xl modal-dialog-centered XchangeAddQuoteAccessoriesLightbox",
        backdrop: "static",
        keyboard: false,
      })
    );
  }

  submitted: any = false;
  submit(myForm: any) {
    this.submitted = true;

    if (this.myForm.valid) {
      this.getActionQuotes();
    }
  }

  getActionQuotes() {
    let data = {
      editMode: true,
      creUserCode: this.selectedCre || "",
      creUserDescription: this.myForm?.value?.cre,
      gpoUserCode: this.selectedGpo || "",
      gpoUserDescription: this.myForm?.value?.gpo,
      adUserCode: this.selectedAd || "",
      adUserDescription: this.myForm?.value?.ad,
      submittedFor: this.submittedForList.find(
        (value) => value.name === this.myForm.controls["submittedFor"].value
      ).uid,
      endUserCode: this.endUsers.find(
        (user: any) => user.value?.unitName === this.myForm?.value?.endUser
      )?.key,
      endUserDescription: this.myForm?.value?.endUser,
      projectLocation: this.myForm?.value?.jobLocation,
      marketSegment: this.myForm.controls["marketSegment"].value,
      submittedBy: this.myForm.controls["submittedBy"].value,
      comment: this.myForm?.value?.comments,
      quoteActionWsDTO: [
        {
          action: "SUBMIT",
        },
      ],
      entries: {}
    };
    type Entry = {
      userRequestedPrice: string;
      entryNumber: number;
    };
    let entryArray: Entry[] = [];
    this.cartEntries.forEach((item: any) => {
        if (item.userRequestedPrice) {
            entryArray.push({
                userRequestedPrice: item.userRequestedPrice,
                entryNumber: item.entryNumber
            });
        }
    });
    if (entryArray.length > 0) {
        data.entries = entryArray;
    }
    // this.spinnerLoading = true;
    this.productService.progressShow('submitQuote');
    this.service.ActionQuotes(data, this.quoteCode).subscribe(
      (res) => {
        this.productService.progressHide();
        this.spinnerLoading = false;
        if (res.status === 200) {
          this.pdbData = res.body;
          this.quoteCode = res.body.id;
          this.apiSerice.getMiniCart(this.uid, this.userAccount);
          // this.quotesService.quoteCreated(res.body.id);
          sessionStorage.removeItem("requestQuoteFormData");
          this.showQuoteConfirmation();
        }
      },
      (err: any) => {
        this.productService.progressHide();
        this.spinnerLoading = false;
      }
    );
  }

  navigateToQuoteDetails() {
    this.router.navigateByUrl(
      "commercial/quotes/quote-detail/" + this.quoteCode
    );
  }

  cancelActionQuotes() {
    this.modalRef.hide();
    // this.spinnerLoading = true;
    this.productService.progressShow('cancelQuote');
    this.quotesService.cancelCart(this.cartCode).subscribe({
      next: (res) => {
        this.productService.progressHide();
        if (res.status == 200) {
          this.spinnerLoading = false;
          sessionStorage.removeItem("requestQuoteFormData");
          this.modalRef!.hide();
          this.service.getLatestMiniCart(this.uid);
          this.redirect();
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        }
      },
      error: (error: any) => {
        this.productService.progressHide();
        this.spinnerLoading = false;
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });

        this.alertData = {
          message: error?.error,
        };
        this.alertTrigger = true;
      },
    });
  }
  redirect() {
    setTimeout(() => {
      this.spinnerLoading = false;
      this.storageService.setItem("showSuccessForCartHistory", true);
      this.router.navigateByUrl("commercial/quotes/quote");
    }, 2000);
  }

  continueShopping() {
    console.log("this.sidebarPath--->",this.sidebarPath)
   // this.router.navigateByUrl("/commercial/product-owner");
   this.router.navigate(["/commercial/product-owner"]);
  }

  removeItemFromCart() {
    this.service.removeItemsFromCart(this.quoteCode, "1").subscribe((res) => {
      this.getquotedata();
    });
  }
  comments: any;
  isDisabled: boolean = true;
  // onComment(event: any) {
  //   this.comments = event.target.value;
  //   if (event.target.value.length > 0) {
  //     this.isDisabled = false;
  //   } else {
  //     this.isDisabled = true;
  //   }
  // }
  removecart(template4: TemplateRef<any>, itemData: any) {
    this.quoteCode = this.itemData?.quoteCode;
    this.entryNumber = itemData?.entryNumber;
    this.modalRef = this.modalService.show(template4, {
      id: 1,
      class: "modal-md modal-dialog-centered",
      backdrop: "static",
      keyboard: false,
    });
  }

  navigateToPDP(productCode: string) {
    this.router.navigate(["commercial/products/details/" + productCode]);
  }

  openLightBoxModal(path: string) {
    const initialState: ModalOptions = {
      initialState: {
        path: path,
      },
    };
    this.bsModalRef = this.modalService.show(
      XchangeImageViewLightBoxComponent,
      Object.assign(initialState, {
        class: "modal-lg modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );
  }

  navigateToProductPage(id: any) {
    this.router.navigate(["commercial/products/details/" + id]);
  }

  solutionDetailsClicked() {
    this.isSolutionDetailsClicked = !this.isSolutionDetailsClicked;
  }

  onSelectEndUser(event: any) {
    this.selectedEndUser = event?.item?.key;
    if (
      event?.item?.value?.marketSegmentCode &&
      event?.item?.value?.marketSegmentCode != "EMPTY" &&
      event?.item?.value?.marketSegmentCode != null
    ) {
      this.marketSegmentCode = event?.item?.value?.marketSegmentCode;
      let marketSegmentFilterData = this.marketsegmentdata.filter(
        (segment: any) => segment.code === this.marketSegmentCode
      );

      if (marketSegmentFilterData.length == 1) {
        this.myForm.patchValue({
          marketSegment: this.marketSegmentCode,
        });
        this.myForm.controls["marketSegment"].enable();
      } else {
        this.myForm.controls["marketSegment"].enable();
      }
    } else {
      this.myForm.controls["marketSegment"].enable();
    }
  }
  typeaheadOnBlur(event: any, clearVal = false) {
    if (clearVal) {
      this.myForm.patchValue({
        endUser: "",
      });
      this.myForm.patchValue({
        marketSegment: undefined,
      });

      this.myForm.controls["marketSegment"].disable();
      this.selectedEndUser = null;
      this.notFoundendUser = false;
    } else if (event?.value || event == undefined) {
      this.notFoundendUser = true;
      this.myForm.patchValue({
        endUser: this.accountName,
      });
      this.myForm.controls["marketSegment"].enable();
    }
  }

  endUserFormattedText(data: any) {
    let town = data.value.town || "";
    let state = data.value.state || "";
    let unitName = data.value.unitName;
    let address = "";
    if (town || state) {
      address = ` ( ${town} - ${state} )`;
    }

    if (!town || !state) {
      address = address.replace("-", "");
    }

    return `${unitName} ${address}`;
  }
  notFoundCre: boolean = false;
  selectedCre: any;
  creTypeAheadOnBlur(event: any, clearVal = false) {
    if (clearVal) {
      this.myForm.patchValue({ cre: "" });
      this.myForm.patchValue({ marketSegment: undefined });
      this.myForm.controls["marketSegment"].disable();
      this.selectedCre = null;
      this.notFoundCre = false;
    } else if (event?.value || event == undefined) {
      this.notFoundCre = true;
      this.myForm.patchValue({ cre: event?.key });
      this.myForm.controls["marketSegment"].enable();
    }
  }

  onSelectCre(event: any) {
    this.selectedCre = event?.item?.key;
    if (
      event?.item?.value?.marketSegmentCode &&
      event?.item?.value?.marketSegmentCode != "EMPTY" &&
      event?.item?.value?.marketSegmentCode != null
    ) {
      this.marketSegmentCode = event?.item?.value?.marketSegmentCode;
      let marketSegmentFilterData = this.marketsegmentdata.filter(
        (segment: any) => segment.code === this.marketSegmentCode
      );

      if (marketSegmentFilterData.length == 1) {
        this.myForm.patchValue({ marketSegment: this.marketSegmentCode });
        this.myForm.controls["marketSegment"].enable();
      } else {
        this.myForm.controls["marketSegment"].enable();
      }
    } else {
      this.myForm.controls["marketSegment"].enable();
    }
  }

  creFormattedText(data: any) {
    let town = data.value.town || "";
    let state = data.value.state || "";
    let unitName = data.value.unitName;
    let address = "";
    if (town || state) {
      address = ` ( ${town} - ${state} )`;
    }
    if (!town || !state) {
      address = address.replace("-", "");
    }
    return `${unitName} ${address}`;
  }

  notFoundGpo: boolean = false;
  selectedGpo: any;
  gpoTypeAheadOnBlur(event: any, clearVal = false) {
    if (clearVal) {
      this.myForm.patchValue({ gpo: "" });
      this.selectedGpo = null;
      this.notFoundGpo = false;
    } else if (event?.value || event == undefined) {
      this.notFoundGpo = true;
      this.myForm.patchValue({ gpo: event?.key });
    }
  }

  onSelectGpo(event: any) {
    this.selectedGpo = event?.item?.key;
  }

  gpoFormattedText(data: any) {
    let town = data.value.town || "";
    let state = data.value.state || "";
    let unitName = data.value.unitName;
    let address = "";
    if (town || state) {
      address = ` ( ${town} - ${state} )`;
    }
    if (!town || !state) {
      address = address.replace("-", "");
    }
    return `${unitName} ${address}`;
  }

  notFoundAd: boolean = false;
  selectedAd: any;
  adTypeAheadOnBlur(event: any, clearVal = false) {
    console.log("event======>", event);
    console.log("event======>", event?.key);
    if (clearVal) {
      this.myForm.patchValue({ ad: "" });
      this.selectedAd = null;
      this.notFoundAd = false;
    } else if (event?.key || event == undefined) {
      this.notFoundAd = true;
      this.myForm.patchValue({ ad: event?.key });
    }
  }

  onSelectAd(event: any) {
    this.selectedAd = event?.item?.key;
  }

  adFormattedText(data: any) {
    let town = data.value.town || "";
    let state = data.value.state || "";
    let unitName = data.value.unitName;
    let address = "";
    if (town || state) {
      address = ` ( ${town} - ${state} )`;
    }
    if (!town || !state) {
      address = address.replace("-", "");
    }
    return `${unitName} ${address}`;
  }

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
          ? `(${cartIndexData?.pricingUOMQuantity} ${cartIndexData?.pricingUomDescription})`
          : "";
      const rollMax =
        cartIndexData?.uom?.code === "RO"
          ? cartIndexData?.product?.subProductType === "PAD_CUSHION"
            ? `(${cartIndexData?.pricingUOMQuantity} ${cartIndexData?.pricingUomDescription})`
            : cartIndexData?.rollOrderMinInFeet != undefined
            ? `(${cartIndexData?.rollOrderMinInFeet} / ${cartIndexData?.rollOrderMaxInFeet})`
            : ""
          : uomInfo;

      return `${userRequestedQuantity} ${
        cartIndexData?.uom?.name || ""
      }(s) ${rollMax}`.trim();
    }
  }
  isDecimalNumberKey(event: any) {
    const value = event?.currentTarget?.value;
    if (value.includes(".") && event.key === ".") {
      return false;
    }
    let charCode = event.which ? event.which : event.keyCode;
    if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57))
      return false;
    if (value.includes(".")) {
      let val = value.split(".");
      val = val[val.length - 1].split("");
      if (
        val.length > 1 &&
        event.currentTarget.selectionEnd === event.currentTarget.selectionStart
      ) {
        return false;
      }
    }
    return true;
  }
  validateUserRequesPrice(item: any) {
    if (
      isNaN(item.userRequestedPrice) ||
      Number(item.userRequestedPrice) === 0
    ) {
      item.userRequestedPrice = "";
    }
  }
  getProductImage(imageurl: any) {
    return imageurl + "?$xchangeThumb$";
  }
}
