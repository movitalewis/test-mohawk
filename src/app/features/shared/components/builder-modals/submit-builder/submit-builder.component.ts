import { Component, OnInit } from "@angular/core";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { StorageService } from "src/app/features/http-services/storage.service";
import { take, map, mergeMap } from "rxjs";
import { ProductService } from "src/app/features/residential/products/pages/services/product.service";
import { ConfirmationDialogComponent } from "../../confirmation-dialog/confirmation-dialog.component";
@Component({
    selector: "app-submit-builder",
    templateUrl: "./submit-builder.component.html",
    styleUrls: ["./submit-builder.component.scss"],
    standalone: false
})
export class SubmitBuilderComponent implements OnInit {
  initialState: any;
  modalRef!: BsModalRef;
  submitBuilderPayload: any = {
    blockNum: "",
    lotNum: "",
    modelHome: false,
    showRoom: false,
  };
  tempData: any = {
    blockNum: "",
    lotNum: "",
    modelHome: false,
    showRoom: false,
  };
  builderSubmitted: Function = () => {};
  selectionChanged: boolean = false;
  onClose: Function = () => { };
  customerFlag: boolean = false;

  constructor(
    public bsModalRef: BsModalRef,
    public modalService: BsModalService,
    private getStorageService: StorageService,
    private productService: ProductService
  ) {
    this.getStorageService.getItem("userInfo").subscribe((res) => {
      this.customerFlag = res?.isCustomer ? true : false;
    });
  }

  ngOnInit(): void {
    this.initialState = this.modalService.config.initialState;
    this.submitBuilderPayload = {
      ...this.submitBuilderPayload,
      ...this.initialState?.subDivision,
    };
    this.tempData = { ...{}, ...this.submitBuilderPayload };
    this.selectionChanged = this.initialState.selectionChanged;
  }
  changeEvent(event: any, checkRef: any) {
    if (this.initialState.showroom == true && event?.state == true) {
      this.openConfirmationModal({
        title: "Warning",
        content: `Showroom is already been selected, <br /> Are you sure want to overwrite it with Modal Home?`,
        primaryActionLabel: "YES",
        secondaryActionLabel: "NO",
        onPrimaryAction: () => {
          this.submitBuilderPayload.modelHome = true;
          this.modalService.hide("confirmationModal");
        },
        onSecondaryAction: () => {
          event.state = false;
          checkRef.checked = false;
          this.submitBuilderPayload.modelHome = false;
          this.modalService.hide("confirmationModal");
        },
      });
    } else {
      this.submitBuilderPayload.modelHome = event?.state;
    }
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
        id: "confirmationModal",
        class: "modal-md modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );
  }
  submitBuilder() {
    this.productService.progressShow('submitBuilder', 'submitBuilderId');
    this.getSubmitBuilder$(this.submitBuilderPayload).subscribe((res) => {
      this.productService.progressHide('submitBuilderId');
      this.builderSubmitted(res.body);
      this.modalService.hide();
    }, () => {
      this.productService.progressHide('submitBuilderId');
    });
  }
  doneClick() {
    this.builderSubmitted();
    this.modalService.hide();
  }

  getSubmitBuilder$(payload: any) {
    return this.getStorageService.getItem("miniCartCount").pipe(
      take(1),
      map((miniCartCount: any) => ({
        code: miniCartCount?.code,
      })),
      mergeMap((data: any) =>
        this.productService.submitBuilderInfo(data?.code, payload)
      )
    );
  }

  closePopupUsingService(selectedId: string) {
    this.modalService.hide(selectedId);
  }
}
