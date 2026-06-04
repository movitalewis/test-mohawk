import {
  Component,
  ElementRef,
  OnInit,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { BreadcrumbItems } from "src/app/features/shared/interfaces";
import { Columns, Config, DefaultConfig } from "ngx-easy-table";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { AddCartPopupComponent } from "../components/add-cart-popup/add-cart-popup.component";
import { ExtendItemsPupupComponent } from "../components/extend-items-pupup/extend-items-pupup.component";
import { ExtendPopupComponent } from "../components/extend-popup/extend-popup.component";
import { CancelReservePopupComponent } from "../components/cancel-reserve-popup/cancel-reserve-popup.component";
import { OrderService } from "../../../services/order.service";
import { ActivatedRoute, Router } from "@angular/router";
import { DatePipe, formatDate } from "@angular/common";
import { ProductService } from "src/app/features/commercial/products/pages/services/product.service";
import { StorageService } from "src/app/features/http-services/storage.service";
import { ConfirmationDialogComponent } from "src/app/features/shared/components/confirmation-dialog/confirmation-dialog.component";
import { UserService } from "src/app/features/shared/user/services/user.service";

@Component({
    selector: "app-reserve-details",
    templateUrl: "./reserve-details.component.html",
    styleUrls: ["./reserve-details.component.scss"],
    standalone: false
})
export class ReserveDetailsComponent implements OnInit {
  alertType = "success";
  alertData: any = {};
  isCollapsed = true;
  reserveNumber: any;
  // selectAllChecked = false;
  showAllButtons = true;
  reserveExtend = true;
  public cancelReserve = false;
  cancelAllFlag = false;
  spinnerLoading = false;
  uid: any;
priceLabel:any="USD"
  showAssignedSpec = false;
  isSolutionDetailsClicked: boolean = false;
  breadcrumbItems: BreadcrumbItems = [
    {
      name: "Home",
      path: "/commercial",
      active: false,
    },
    {
      name: "",
      path: "/Residential",
      active: true,
    },
  ];
  @ViewChild("scrollToTop", { read: ElementRef }) scrollToTop: any;
  scrollPageToTop() {
    window.scrollTo(0, 0);
    // this.scrollToTop.nativeElement.scrollIntoView({
    //   behavior: "smooth",
    //   block: "start",
    //   inline: "nearest",
    // });
    // Hack: Scrolls to top of Page after page view initialized
    let top = document.getElementById("top");
    if (top !== null) {
      top.scrollIntoView();
      top = null;
    }
  }

  modalRef?: BsModalRef;
  public reservesData: any = [];
  public listEntries: any = [];
  userInfo: any;
  openToggles = true;
  hasServiceMaterial:boolean = false;

  constructor(
    private modalService: BsModalService,
    public bsModalRef: BsModalRef,
    private orderService: OrderService,
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private getStorageService: StorageService,
    public storageService: StorageService,
    public userService: UserService,
  ) {}

  addItemToCartModal() {
    //this.uid = localStorage.getItem("accountNumber");
    var listData: any[] = [];
    this.listEntries = [];
    this.reservesData.forEach((element: any) => {
      element.selected = true;
      this.listEntries.push(element.entryNumber);
    });
    for (let i in this.listEntries) {
      listData.push({
        entryNumber: this.listEntries[i],
      });
    }
    this.productService.getMiniCartData(this.uid).subscribe((res: any) => {
      if (
        res.body?.errorMessage?.includes("No Cart existed") ||
        res.body.totalItems == 0 
      ) {
        this.getStorageService.setItem("miniCartCount", res.body);

        this.addReserveToCart(listData);
      } else {
        const initialState: ModalOptions = {
          initialState: {
            id: this.reserveNumber,
            entries: listData,
            onYesAction: () => this.processReserveTocart(listData),
          },
        };
        this.bsModalRef = this.modalService.show(
          AddCartPopupComponent,
          Object.assign(initialState, {
            class: "modal-lg modal-dialog-centered",
            backdrop: "static",
            keyboard: false,
          })
        );
      }
    });
  }

  processReserveTocart(listData: any) {
    // this.spinnerLoading = true;
    this.productService.progressShow('cancelCart');
    this.productService
      .cancelCart(this.storageService.cartData?.code || "123456")
      .subscribe({
        next: (res) => {
          this.productService.progressHide();
          this.productService
            .getMiniCartData(this.uid)
            .subscribe((res: any) => {
              this.addReserveToCart(listData);
            });
        },
        error: (error: any) => {
          this.productService.progressHide();
          this.spinnerLoading = false;
          this.alertData.alertType = "danger";
          this.alertData.message =
            "There was a problem encountered while attempting to transfer the reserve to the cart.";
          this.scrollPageToTop();
        },
      });
  }

  addReserveToCart(entries: any[]) {
    // this.spinnerLoading = true;
    this.productService.progressShow('addToCart')
    this.orderService
      .reserveToCart(this.reserveNumber, entries)
      .subscribe((res: any) => {
        this.productService.progressHide();
        const messages = res?.body?.messages;
        if (messages && messages.length > 0 && messages[0].status === "Error") {
          this.alertData.alertType = "danger";
          this.alertData.message =
            "There was a problem encountered while attempting to transfer the reserve to the cart.";
          this.scrollPageToTop();
        } else if (res.status != 200) {
          this.alertData.alertType = "danger";
          this.alertData.message =
            "There was a problem encountered while attempting to transfer the reserve to the cart.";
          this.scrollPageToTop();
        } else {
          this.productService
            .getMiniCartData(this.uid)
            .subscribe((res: any) => {
              this.getStorageService.setItem("miniCartCount", res.body);
              if (this.reservesData.length == this.listEntries.length) {
                this.orderService.showRsrvDtlSuccessMsg = true;
                this.router.url.split("?")[0].includes("commercial")
                  ? this.router.navigateByUrl("/commercial/cart")
                  : this.router.navigateByUrl("/residential/cart");
              } else {
                this.alertData.alertType = "success";
                this.alertData.message =
                  "Product(s) are added successfully to the cart.";
                this.ReserveNumberdetail();
                this.scrollPageToTop();
              }
            });
        }
        this.spinnerLoading = false;
        // this.cancelCheck = res.body;

        this.bsModalRef.hide();
      },
      (err: any) => {
        this.productService.progressHide();
        this.spinnerLoading = false;
        this.alertData.alertType = "danger";
        this.alertData.message =
          "There was a problem encountered while attempting to transfer the reserve to the cart.";
        this.scrollPageToTop();
      });
  }

  extendItemModal() {
    var listData = [];
    for (let i in this.listEntries) {
      listData.push({
        entryNumber: this.listEntries[i],
      });
    }
    let responseStatus = "";
    let reponseMessage = "";
    let refreshPage = true;
    // this.spinnerLoading = true;
    this.productService.progressShow('extendReserve')
    this.orderService
      .reserveExtend(this.reserveNumber, listData)
      .subscribe((res: any) => {
        this.productService.progressHide();
        this.spinnerLoading = false;
        responseStatus = res.body.status;
        if (res.body.message != undefined || null || "") {
          (reponseMessage = res.body.message), (refreshPage = false);
        } else
          reponseMessage =
            "The reserve has been extended for an additional 24 hours";
        const initialState: ModalOptions = {
          initialState: {
            reponseStatus: responseStatus,
            reponseMessage: reponseMessage,
            refreshPage: refreshPage,
          },
        };
        this.bsModalRef = this.modalService.show(
          ExtendPopupComponent,
          Object.assign(initialState, {
            class: "modal-lg modal-dialog-centered",
            backdrop: "static",
            keyboard: false,
          })
        );
      },
      (err: any) => {
        this.productService.progressHide();
        this.spinnerLoading = false;
      });
  }
  cancelReserveModal(entryNumber: any, reserveNumber: any) {
    let entryData = [];
    entryData.push({
      entryNumber: entryNumber,
    });
    const initialState: ModalOptions = {
      initialState: {
        id: reserveNumber,
        // entryNumber:"["+test+"]"
        entries: entryData,
        cancelReserve: this.cancelReserve,
        title: "Remove product?",
        message: "Are you sure you want to remove this product from reserve?",
        onCancelReserve: (res: any) => {
          this.alertData = {
            message: res?.body?.message,
          };
          this.alertData.alertType = "success";
          this.modalService.hide("cancelReserveModal");
          this.ReserveNumberdetail();
          this.scrollPageToTop();
        },
      },
    };
    this.bsModalRef = this.modalService.show(
      CancelReservePopupComponent,
      Object.assign(initialState, {
        id: "cancelReserveModal",
        class: "modal-lg modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );
  }
  removeReserveModal() {
    var listData = [];
    this.cancelReserve = true;
    if (this.listEntries.length == 0) {
      this.reservesData.forEach((element: any) => {
        this.listEntries.push(element.entryNumber);
      });
    }
    for (let i in this.listEntries) {
      listData.push({
        entryNumber: this.listEntries[i],
      });
    }
    const initialState: ModalOptions = {
      initialState: {
        id: this.reserveNumber,
        // entryNumber:"["+test+"]"
        entries: listData,
        cancelReserve: this.cancelReserve,
        onCancelReserve: (r: any) => {
          this.alertData = {
            message: r?.body?.message,
          };
          this.alertData.alertType = "success";
          this.modalService.hide("cancelReserveModal");
          this.productService
            .getMiniCartData(this.uid)
            .subscribe((res: any) => {
              this.getStorageService.setItem("miniCartCount", res.body);
              if (this.reservesData.length == this.listEntries.length) {
                this.orderService.showRsrvDtlSuccessMsg = true;
                if (this.router.url.split("?")[0].includes("commercial")) {
                  this.router.navigate(["//commercial/orders/reserves"], {
                    queryParams: { message: r?.body?.message },
                  });
                  //  this.router.navigateByUrl("/commercial/orders/reserves")
                } else {
                  this.router.navigate(["//residential/orders/reserves"], {
                    queryParams: { message: r?.body?.message },
                  });
                }
              } else {
                this.alertData.alertType = "success";
                this.alertData.message = "Product(s) are deleted successfully.";
                this.ReserveNumberdetail();
                this.scrollPageToTop();
              }
            });
        },
      },
    };

    this.bsModalRef = this.modalService.show(
      CancelReservePopupComponent,
      Object.assign(initialState, {
        id: "cancelReserveModal",
        class: "modal-lg modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );
  }

  // constructor(private modalService: BsModalService) { }

  openModal(template1: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template1, {
      id: 1,
      class: "modal-lg modal-dialog-centered",
      backdrop: "static",
      keyboard: false,
    });
  }
  public configuration!: Config;
  public columns!: Columns[];
  public data = [];
  ngOnInit(): void {
    this.cancelReserve = false;
    this.reserveNumber = this.route.snapshot.paramMap.get("id");
    this.ReserveNumberdetail();
    this.configuration = { ...DefaultConfig };
    this.configuration.tableLayout.striped = true;
    this.configuration.tableLayout.hover = false;
    this.configuration.paginationRangeEnabled = false;
    this.configuration.paginationEnabled = false;
    // this.columns = [
    //   { key: 'code', title: 'Reserve #' },
    //   { key: 'projectName', title: 'Reserve Name' },
    //   { key: 'submittedBy', title: 'Reserved By' },
    // ];
    this.columns = [
      // { key: "action", title: "" },
      { key: "rollAssignment", title: "Types" },
      { key: "rollAssigned", title: "Length(LF)" },
      { key: "dyeLot", title: "Dye Lot" },
      { key: "rollNumber", title: "Roll # " },
      { key: "plant", title: "Plant" },
      { key: "namedDeliveryDate", title: "Estimated Delivery Date" },
    ];

    this.getStorageService.getItem("uid").subscribe((uid: any) => {
      this.uid = uid;
    });
    this.storageService.getItem("userInfo").subscribe((response: any) => {
      this.userInfo = response;
      this.priceLabel = response.priceLabel || 'USD';
    });
  }
  selectAllCheck() {
    if (this.reservesData.length == this.listEntries.length) {
      // debugger
      return true;
    } else return false;
  }

  selectEachLineCheck(test: any) {
    const index = this.listEntries.indexOf(test);
    this.showAllButtons = this.listEntries.length == 0;
    if (index !== -1) {
      // debugger
      return true;
    } else return false;
  }
  reserveNumberDetailing: any = [];
  orderPlacedSite:any='';
  ReserveNumberdetail() {
    // this.spinnerLoading = true;
    this.productService.progressShow('reserveDetails');
    this.listEntries = [];
    this.orderService
      .getReserveNumberDetails(this.reserveNumber)
      .subscribe((res: any) => {
        this.productService.progressHide();
        this.spinnerLoading = false;
        if (res.status == 500) {
          // let err=res.body
          // this.router.url.split("?")[0].includes("commercial")
          // ? this.router.navigate(["/commercial/orders/reserves"])
          // : this.router.navigate(["/residential/orders/reserves"])

          if (this.router.url.split("?")[0].includes("commercial")) {
            this.router.navigate(["//commercial/orders/reserves"], {
              queryParams: { error: res.error },
            });
            //  this.router.navigateByUrl("/commercial/orders/reserves")
          } else {
            this.router.navigate(["//residential/orders/reserves"], {
              queryParams: { error: res.error },
            });
          }
        } else {
          this.reserveNumberDetailing = res.body;
          this.orderPlacedSite = res.body?.orderPlacedSite;
          this.reservesData = this.reserveNumberDetailing.reserveEntries;
          /* if (this.reservesData.length == 1) {
            // this.selectAllChecked=true
            this.reservesData.forEach((element: any) => {
              this.listEntries.push(element.entryNumber);
              this.reserveExtend = element.isAllowToExtend;
              this.showAllButtons = false;
            });
          }*/

          //   res.body.map((item: any) => {
          //    item.reserveEntries.map((resEntry: any) => {
          //      this.reservesData = [...this.reservesData, resEntry];
          //    });
          //  });
          this.data = this.reserveNumberDetailing;
          this.hasServiceMaterial = (this.reservesData || []).some((entry: any) => entry?.serviceMaterialLine == true);
          this.breadcrumbItems[this.breadcrumbItems.length - 1].name =
            "Reserve #" + this.reserveNumber;
        }
        this.scrollPageToTop();
      },
      (err: any) => {
        this.productService.progressHide();
        this.spinnerLoading = false;
      });
  }

  formatDateMessage(msg: string) {
    const msgDate = Date.parse(msg);
    let returnVal = msg;

    if (isNaN(msgDate) == false) {
      var d = new Date(msgDate);
      returnVal = formatDate(d, "MM/dd/yyyy", "en-US");
    }

    return returnVal;
  }

  isAllowToExtend: boolean = true;
  useEntryNumber(event: any, test: any, item: any) {
    item.selected = event.state;
    if (event.state) {
      this.listEntries.push(test);
      // this.showAllButtons = false;
    }
    if (!event.state) {
      const index = this.listEntries.indexOf(test);
      if (index !== -1) {
        this.listEntries.splice(index, 1);
        // if (this.listEntries.length < 1) {
        //   this.showAllButtons = true;
        // }
      }
    }
    this.cancelAllFlag = this.reservesData.length == this.listEntries.length;
    let selectedItems = this.reservesData.filter(
      (item: any) => item.selected === true
    );
    if (selectedItems.length > 0) {
      this.isAllowToExtend = selectedItems.every(
        (item: any) => item.isAllowToExtend == false
      );
    } else {
      this.isAllowToExtend = true;
    }
  }
  selectAll(event: any) {
    if (event.state) {
      this.listEntries = [];
      this.reservesData.forEach((element: any) => {
        element.selected = true;
        this.listEntries.push(element.entryNumber);
        this.showAllButtons = false;
      });
    }
    if (!event.state) {
      this.listEntries = [];
      this.showAllButtons = true;
      this.reservesData.forEach((element: any) => {
        element.selected = false;
      });
      // this.selectAllChecked = false;
      // this.showAllButtons = false;
      // this.reservesData.forEach((element: any) => {
      //   const index = this.listEntries.indexOf(element.entryNumber);
      //   if (index !== -1) {
      //     this.listEntries.splice(index, 1);
      //   }
      // });
    }
    this.cancelAllFlag = this.reservesData.length == this.listEntries.length;
    let selectedItems = this.reservesData.filter(
      (item: any) => item.selected === true
    );
    // if(selectedItems.length>0){
    // this.isAllowToExtend = !selectedItems.some(
    //   (item: any) => item.isAllowToExtend == true
    // );}
    if (selectedItems.length > 0) {
      this.isAllowToExtend = selectedItems.every(
        (item: any) => item.isAllowToExtend == false
      );
    } else {
      this.isAllowToExtend = true;
    }
  }

  showAssignedSqFtYrd(e: any) {
    if (e.checked) {
      this.showAssignedSpec = true;
    } else {
      this.showAssignedSpec = false;
    }
  }

  solutionDetailsClicked() {
    this.isSolutionDetailsClicked = !this.isSolutionDetailsClicked;
  }
  navigateToProductPage(e: any, id: any) {
    if (e) {
      this.router.navigate(["commercial/products/details/" + id]);
    }
  }

  /*  checkExtendable() {
    let reponseMessage: any = '';
    let extendableItems:any = [];
    let nonExtendableItems:any = [];
    let selectedItems: any = [];
    if (this.listEntries.length == 1) {
      this.reservesData.filter((p: any) => {
        if (p?.entryNumber == this.listEntries[0]) {
          if (p?.isAllowToExtend == true) {
            //logic for extend products
            this.extendItemModal();
          } else {
            reponseMessage =
              p?.product?.name +' - '+p?.product.styleNumber+" is not Extendable";
            const initialState: ModalOptions = {
              initialState: {
                reponseMessage: reponseMessage,
              },
            };
            this.bsModalRef = this.modalService.show(
              ExtendPopupComponent,
              Object.assign(initialState, {
                class: "modal-md modal-dialog-centered",
              })
            );
          }
        }
      });
    } else if (this.listEntries.length > 1) {
      this.reservesData.filter((p: any) => {
        this.listEntries.filter((l: any) => {
          if (p?.entryNumber == l) {
            selectedItems.push(p)
            if (p?.isAllowToExtend == true) {
              //logic for extend products
              extendableItems.push(p?.entryNumber)
            } else {
              nonExtendableItems.push(p);
            }
          }
          
        })
      });
      
      if (selectedItems.every((item: any) => item.isAllowToExtend)) {
        this.extendItemModal();
      } else if (!selectedItems.every((item: any) => item.isAllowToExtend)) { 
        reponseMessage =" Selected items are not Extendable";
      const initialState: ModalOptions = {
        initialState: {
          reponseMessage: reponseMessage,
        },
      };
      this.bsModalRef = this.modalService.show(
        ExtendPopupComponent,
        Object.assign(initialState, {
          class: "modal-md modal-dialog-centered",
        })
      );
      } else{
        this.listEntries = extendableItems;
        // let msg = new Set(nonExtendableItems);
        nonExtendableItems.forEach((ei: any) => {
          reponseMessage= reponseMessage ? (reponseMessage + ", ") : ''; 
          reponseMessage = reponseMessage +ei?.product?.name +' - '+ei?.product.styleNumber;
        })
        const initialState: ModalOptions = {
          initialState: {
            reponseMessage: reponseMessage,
            onExtendItems: () => {
              this.spinnerLoading = true;
              this.extendItemModal();
            }
          },
        }; 
        this.bsModalRef = this.modalService.show(
          ExtendItemsPupupComponent,
          Object.assign(initialState, {
            class: "modal-md modal-dialog-centered",
          })
        );
      }
    }
  } */
  
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
  
  hideModal(){
    this.modalService.hide("viewReplacementOrderModal");
  }
}
