import { ChangeDetectorRef, Component, OnInit, TemplateRef } from "@angular/core";
import { BreadcrumbItems } from "src/app/features/shared/interfaces";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { XchangeAddAccessoriesLightboxComponent } from "src/app/features/shared/components/xchange-add-accessories-lightbox/xchange-add-accessories-lightbox.component";
import { ProductService } from "../../../products/pages/services/product.service";
import { ActivatedRoute, Router } from "@angular/router";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { StorageService } from "src/app/features/http-services/storage.service";
import { debounceTime, map, mergeMap, Subject, take } from "rxjs";
import { UserService } from "src/app/features/shared/user/services/user.service";
import { ConfirmationDialogComponent } from "src/app/features/shared/components/confirmation-dialog/confirmation-dialog.component";
import { QuotesService } from "src/app/features/commercial/quotes/services/quotes.service";

@Component({
    selector: "app-cart-accessories",
    templateUrl: "./cart-accessories.component.html",
    styleUrls: ["./cart-accessories.component.scss"],
    standalone: false
})
export class CartAccessoriesComponent implements OnInit {
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
  modalRef!: BsModalRef;
  productData: any;
  queryParamName: any;
  marketsegmentdata: any;
  uid: any;
  entryData: any;
  quote: any;
  totalitem: any;
  cartDataIsEmpty = false;
  constructor(
    private modalService: BsModalService,
    public bsModalRef: BsModalRef,
    private fb: FormBuilder,
    private service: ProductService,
    private router: ActivatedRoute,
    private route: Router,
    private storageService: StorageService,
    private activate: ActivatedRoute,
    public userService: UserService,
    private quotesService: QuotesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getquotedata();
    this.marketsegment();

    this.initialFrom();
    this.storageService.getItem("userInfo").subscribe((res: any) => {
      const userInfo = res;
      this.myForm.controls["submittedBy"].setValue(userInfo?.name);
      this.myForm.controls["submittedBy"].enable();
      this.cdr.detectChanges();
    });
    this.storageService.getItem("item").subscribe((res: any) => {
      this.itemData = res;
      this.cdr.detectChanges();
    });
    this.storageService.getItem("productValue").subscribe((res: any) => {
      this.productData = res;
      this.cdr.detectChanges();
    });
    this.userService.getCurrentUserDetail().subscribe((res: any) => {
      this.uid = res.body.orgUnit?.uid;
      this.cdr.detectChanges();
    });

    this.queryParamName = this.router.snapshot.params["code"];
    this.myForm.controls["comments"].setAsyncValidators;
    this.subject
      .pipe(debounceTime(500), take(1))
      .subscribe((searchText: any) => {
        if (searchText) this.getEndUserList(searchText);
      });
  }
  subject = new Subject();
  getMinMaxValues(event: any) {
    this.subject.next(event.target.value);
  }
  getquotedata() {
    this.service.getLatestMiniCart(this.uid);
    this.quoteCode = this.activate.snapshot.paramMap.get("code");
    this.service.getQuoteData(this.quoteCode).subscribe(
      (res: any) => {
        this.quote = res.body;
        this.totalitem = res?.body?.totalItems;
        this.cartDataIsEmpty = this.totalitem?.length == 0;

        this.entryData = (this.quote?.entries || []).map((entry: any) => {
          return {
            total: entry?.totalItems,
            name: entry?.product?.name,
            colour: entry?.product?.sellingColorName,
            size: entry?.product?.sellingSizeId,
            Quantity: entry?.quantity,
            productImage: entry?.product?.productImageURL,
            backingname: entry?.product?.sellingBackingName,
            entryNumber: entry?.entryNumber,
          };
        });
        this.cdr.detectChanges();
      },
      (err: any) => {
        this.cartDataIsEmpty = true;
      }
    );
  }
  marketsegment() {
    this.service.getmarketsegment().subscribe((res: any) => {
      this.marketsegmentdata = res?.body?.marketSegments;
      this.cdr.detectChanges();
    });
  }
  getEndUserList(val: any) {
    this.storageService.getItem("uid").subscribe((res: any) => {
      this.uid = res;
      this.service.getEndUserList(this.uid, val).subscribe((res: any) => {});
    });
  }

  initialFrom() {
    this.myForm = this.fb.group({
      submittedFor: ["", Validators.required],
      endUser: ["", Validators.required],
      jobLocation: ["", Validators.required],
      marketSegment: ["", Validators.required],
      submittedBy: [this.myForm?.value?.submittedBy],
      comments: [""],
    });
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
    this.spinnerLoading = true;
    this.quotesService
      .removeEntry(this.quote.code, entryNumber)
      .subscribe((res: any) => {
        if (res) {
          this.service.getLatestMiniCart(this.uid);

          this.alertData = {
            message: "Product cart has been deleted successfully!",
          };
          this.alertType = "success";
          this.alertTrigger = true;
          this.stopAlert();
          this.getquotedata();
          this.spinnerLoading = false;
        }
      }),
      (err: any) => {
        this.alertData = {
          message: err?.error,
        };
        this.alertTrigger = true;
      };
  }

  get f() {
    return this.myForm?.controls;
  }
  stopAlert() {
    setTimeout(() => {
      this.alertTrigger = false;
    }, 3000);
  }

  openCartAccessoriesModal() {
    const initialState: ModalOptions = {
      initialState: this.myForm.value,
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
      submittedFor: this.myForm?.value?.submittedFor.$ngOptionLabel,
      endUserCode: this.queryParamName,
      endUserDescription: this.myForm?.value?.endUser,
      projectLocation: this.myForm?.value?.jobLocation,
      marketSegment: this.myForm?.value?.marketSegment,
      submittedBy: this.myForm?.value?.submittedBy,
      comment: this.myForm?.value?.comments,
      quoteActionWsDTO: [
        {
          action: "SUBMIT",
        },
      ],
    };
    this.service
      .ActionQuotes(data, this.itemData?.quoteCode)
      .subscribe((res) => {
        if (res.status === 200) {
          this.pdbData = res.body;
          this.quoteCode = res.body.code;
          this.route.navigateByUrl("commercial/quotes/quote");
        }
      });
  }

  cancelActionQuotes() {
    this.spinnerLoading = true;
    let data = {
      editMode: true,
      name: "",
      submittedFor: this.myForm?.value?.submittedFor.$ngOptionLabel,
      endUserCode: this.queryParamName,
      endUserDescription: this.myForm?.value?.endUser,
      projectLocation: this.myForm?.value?.jobLocation,
      marketSegment: this.myForm?.value?.marketSegment,
      submittedBy: this.myForm?.value?.submittedBy,
      comment: this.comments,
      quoteActionWsDTO: [
        {
          action: "CANCEL",
        },
      ],
    };
    this.service.ActionQuotes(data, this.itemData?.quoteCode).subscribe(
      (res) => {
        this.pdbData = res?.body;
        this.quoteCode = res?.body?.code;
        this.service.getLatestMiniCart(this.uid);
        this.modalRef!.hide();
        this.redirect();
      },
      (err: any) => {
        this.alertData = {
          message: err?.error,
        };
        this.alertTrigger = true;
      }
    );
  }

  redirect() {
    setTimeout(() => {
      this.spinnerLoading = false;
      this.storageService.setItem("showSuccessForCartHistory", true);
      this.route.navigateByUrl("commercial/quotes/quote");
    }, 2000);
  }

  continueShopping() {
    this.route.navigateByUrl(
      "/residential/products?name=Hard Surface&page=View All&type=hardproduct"
    );
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
    this.entryNumber = itemData.entryNumber;
    this.modalRef = this.modalService.show(template4, {
      id: 1,
      class: "modal-md modal-dialog-centered",
      backdrop: "static",
      keyboard: false,
    });
    // this.storageService.clear();
  }
}
