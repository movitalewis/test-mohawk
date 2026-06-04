import { Component, ElementRef, OnInit, Renderer2, HostListener, ViewChild, OnDestroy } from "@angular/core";
import { AsmService } from "../../services/asm.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { UserService } from "src/app/features/shared/user/services/user.service";
import { StorageService } from "src/app/features/http-services/storage.service";
import { Subject, switchMap } from "rxjs";
import { ProgressModalComponent } from "../../../progress-modal/progress-modal.component";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { MESSAGE_CONSTANTS } from "src/app/features/shared/constants/MESSAGE-CONSTANTS";

@Component({
    selector: "xchange-asm-ability",
    templateUrl: "./asm-ability.component.html",
    styleUrls: ["./asm-ability.component.scss"],
    standalone: false
})
export class AsmAbilityComponent implements OnInit, OnDestroy {
  myForm!: FormGroup;
  suggestions: any[] = [];
  showSuggestions: boolean = false;
  isFocused = false;
  isSuggestionSelected: boolean = false;
  hasCarts: boolean = false;
  startSession: boolean = false;
  showCart: boolean = false;
  cartData: any = [];
  userStartedTyping: boolean = false;
  showErrorMessage = false;
  spinnerLoading = false;
  errorMessage = "";
  @ViewChild("cartInput") cartInput!: ElementRef;
  preserveCardData: any;
  userDetail: any;
  isASMUser: any = false;
  touchStartX: any;
  touchStartY: any;
  accountListSearch = new Subject();
  modalRef?: BsModalRef;
  
  constructor(
    private asmService: AsmService,
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService,
    private renderer: Renderer2,
    private storageService:StorageService,
    private eRef: ElementRef,
    private modalService: BsModalService,
  ) {}
  isFormVisible = true;
  submitButtonEnable = false;
  apiLoading: boolean = false;
  ngOnInit(): void {
    if (window.innerWidth < 768){
      const mainPage = document.getElementById('mainPage') as Element;
      this.renderer.listen(mainPage, 'scroll', (event) => {
        if (mainPage.scrollTop > 200) {
          this.isFormVisible = false;
          this.showCart = false;
        } else {
          this.isFormVisible = true
        }
      });
    }
   
    this.getUserDetail();
    this.createForm();
    this.isASMUser = Boolean(localStorage.getItem("isASMUser"));
    const storedSessionState = sessionStorage.getItem("startSession");
    if (storedSessionState === "true") {
      this.startSession = true;
      this.submitButtonEnable = true;
      const storedEmail = sessionStorage.getItem("storedEmail");
      const storedCart = sessionStorage.getItem("storedCart");
      if (storedEmail) {
        this.myForm.get("email")?.setValue(storedEmail);
        this.myForm.get("email")?.disable();
      }

      // if (storedCart) {
      //   this.myForm.get("cart")?.setValue(storedCart);
      //   this.myForm.get("cart")?.disable();
      // }
      // this.updateProfile(this.myForm.value.email);
    }
    this.accountSearch();
  }
  accountSearch(){
    this.accountListSearch.pipe(
      switchMap((res:any)=> {
        this.apiLoading = true;
        this.suggestions = [];
        return this.asmService.getAutoComplete(res)
      }
    )).subscribe({
      next: (res: any) => {
        this.apiLoading = false;
        this.suggestions = res?.body;
        if(res?.error){
          this.submitButtonEnable=false;
        }else{
          this.submitButtonEnable=true;
        }
        this.showSuggestions = true;
      },
      error: (err) => {
        this.apiLoading = false;
        this.submitButtonEnable=false;
      },
    });
  }

  @HostListener("document:click")
  clicked() {
    this.showSuggestions = false;
  }

  createForm() {
    this.myForm = this.fb.group({
      email: [
        { value: "", disabled: false },
        [
          Validators.required,
          Validators.email,
          Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$"),
        ],
      ],
      cart: [{ value: "", disabled: false }],
    });
  }

  onFormSubmit() {
    this.myForm.get("email")?.enable();
    this.myForm.get("cart")?.enable();
   
    if(!this.submitButtonEnable){
      return
    }
    
    if (this.myForm.valid) {
      // this.spinnerLoading = true;
      if (!this.startSession) {
        let asmMessages = MESSAGE_CONSTANTS.asmAbility['startSession'];
        this.openProgressModal({
          modalHeaderText: asmMessages.headerText,
          progressText: asmMessages.bodyText,
          progressBarText: asmMessages.barText
        });
        this.asmService.startSession(this.myForm.value).subscribe({
          next: (res) => {
            this.modalService.hide("progressModal");
            this.spinnerLoading = false;
            if (res?.body?.status == "success") {
        this.storageService.updateUidForDuplicate('');
              this.startSession = true;
              this.showCart = false;
              sessionStorage.setItem("storedEmail", this.myForm.value.email);
              sessionStorage.setItem("storedCart", this.myForm.value.cart);
              sessionStorage.setItem("startSession", "true");
              this.updateProfile(this.myForm.value.email);
              this.myForm.get("email")?.disable();
              this.myForm.get("cart")?.disable();
            } else {
              this.showErrorMessage = true;
              this.errorMessage = res?.body?.message;
            }
          },
          error: () => {
            this.modalService.hide("progressModal");
          }
        });

      } else {
        let asmMessages = MESSAGE_CONSTANTS.asmAbility['endSession'];
        this.openProgressModal({
          modalHeaderText: asmMessages.headerText,
          progressText: asmMessages.bodyText,
          progressBarText: asmMessages.barText
        });
        this.asmService.stopSession().subscribe({
          next: (res) => {
            this.modalService.hide("progressModal");
            this.spinnerLoading = false;
            if (res?.body?.status == "success") {
              this.storageService.updateUidForDuplicate('');
              this.startSession = false;
              sessionStorage.removeItem("startSession");
              sessionStorage.removeItem("storedEmail");
              sessionStorage.removeItem("storedCart");
              this.myForm.reset();
              localStorage.setItem("customerAddress",'');
              localStorage.setItem("accountNumber",'');
              this.updateProfile("");
            } else {
              this.showErrorMessage = true;
              this.errorMessage = res?.body?.message;
            }
          },
          error: () => {
            this.modalService.hide("progressModal");
          }
        });
      }
    }
  }
  updateProfile(email: any) {
    this.asmService.updateProfile(email).subscribe({
      next: (res) => {
        // sessionStorage.setItem("isUidSet", "true");
        this.asmService.getMiniCart(res?.body?.orgUnit?.uid);
        //To set default Unit
        if(res?.body?.isProductManager === true){
          this.storageService.setItem("userInfo", null);
          this.userService.setUnit("?unitUid=" + res?.body?.orgUnit?.uid).subscribe();
          this.asmService.navigateUsers(res?.body);
        }else{
        let custUid = res?.body?.accounts?.uid;
        if (res?.body?.isCustomer === true && custUid === undefined) {
          custUid = res?.body?.accounts?.[0]?.uid;
        }
        if (res?.body?.isSalesPerson === true) {
         // custUid = res?.body?.orgUnit?.uid;
          custUid = "";
        }
        if (
          (!(res?.body?.accounts?.length > 1) &&
          res?.body?.accounts?.length !== undefined &&
          res?.body?.accounts?.length !== 0) ||
          res?.body?.orgUnit?.uid == "EMPTY_B2BUNIT"
        ) {
          this.storageService.setItem("userInfo", null);
          this.userService.setUnit("?unitUid=" + custUid).subscribe();
          this.asmService.navigateUsers(res?.body);
        } else {
          this.asmService.navigateUsers(res?.body);
        }
      }
      },
    });
  }
  onChangeValue(customerQueries: any) {
    this.showCart = false;
    this.isSuggestionSelected = false;
    let query = customerQueries.value;
    if (typeof query === "string") {
      query = query.trim();
      this.showSuggestions = query.length >= 3;
      if (query.length >= 3) {
        this.accountListSearch.next(query);
      } else {
        this.suggestions = [];
      }
    } else {
      this.suggestions = [];
      this.showSuggestions = false;
    }
  }
  selectSuggestion(suggestion: any,event: Event) {
    event.stopPropagation();
    this.myForm.patchValue({
      email: suggestion.email,
    });
    this.isSuggestionSelected = true;
    this.suggestions = [];
    this.showSuggestions = false;
    this.cartData = suggestion?.carts;
    this.preserveCardData = [...this.cartData]; //To preserve the cartData
    if (this.cartData) {
      this.showCart = true;
      this.cartInput.nativeElement.focus();
    }
  }
  selectCart(carts: any) {
    this.myForm.patchValue({
      cart: carts,
    });
    this.showCart = false;
  }
  onChangeCartValue(cartValue: any) {
    if (this.cartData.length == 0 && !this.userStartedTyping) {
      this.showCart = false;
    } else if (this.cartData.length && this.userStartedTyping) {
      this.showCart = true;
    }
  }

  onCartInput(inputValue: any) {
    this.cartData = [...this.preserveCardData];
    this.userStartedTyping = inputValue.value.length > 0;
    if (this.userStartedTyping) {
      // Filter cartData based on the query
      const filteredCarts = this.cartData.filter((cart: any) =>
        cart.toLowerCase().includes(inputValue.value)
      );
      this.cartData = filteredCarts;
      // Show the suggestions
      this.showCart = filteredCarts.length > 0;
    } else {
      this.cartData = [...this.preserveCardData];
      this.showCart = true; // Show all suggestions
    }
  }

  clearCartinput() {
    this.cartData = [...this.preserveCardData];
    this.myForm.patchValue({
      cart: "",
    });
    this.userStartedTyping = false; // Reset userStartedTyping flag
    this.showCart = true; // Show all carts
  }
  getUserDetail() {
    this.spinnerLoading = true;
    this.userService.getCurrentUserDetail().subscribe((res: any) => {
      this.userDetail = res.body;
      this.spinnerLoading = false;
    }),
      (err: any) => {
        this.spinnerLoading = false;
      };
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    if (
      this.showCart &&
      !this.eRef.nativeElement.contains(event.target) &&
      !(event.target as HTMLElement).classList.contains('suggestion-item')
    ) {
      this.showCart = false;
    }
  }
  @HostListener('document:touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.touches[0].clientX;
    this.touchStartY = event.touches[0].clientY;
  }

  SWIPE_THRESHOLD = 50
  touchEndY: number = 0;
    @HostListener('document:touchend', ['$event'])
    onTouchEnd(event: TouchEvent) {
      this.touchEndY = event.changedTouches[0].clientY;
      
      if (this.touchStartY - this.touchEndY > this.SWIPE_THRESHOLD) {
        this.showCart = false;
        this.showSuggestions = false;
      }
    }

    toggleFocus(focus:boolean){
      this.isFocused = focus;
    }

    inputBlur(){
      if(!this.isFocused){
        this.showSuggestions = false;
      }
    }

    ngOnDestroy(): void {
      this.spinnerLoading = false;
      this.accountListSearch.unsubscribe();
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
