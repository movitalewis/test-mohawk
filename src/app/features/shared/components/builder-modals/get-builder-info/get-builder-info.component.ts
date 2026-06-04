import { ChangeDetectorRef, Component, OnInit, OnDestroy } from "@angular/core";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { Columns, Config, DefaultConfig } from "ngx-easy-table";
import { StorageService } from "src/app/features/http-services/storage.service";
import { take, map, mergeMap, Subject, Subscription } from "rxjs";
import { concatMap, debounceTime, distinctUntilChanged } from "rxjs/operators";
import { BuilderDivisionComponent } from "../builder-division/builder-division.component";
import { ProductService } from "src/app/features/residential/products/pages/services/product.service";

@Component({
    selector: "app-get-builder-info",
    templateUrl: "./get-builder-info.component.html",
    styleUrls: ["./get-builder-info.component.scss"],
    standalone: false
})
export class GetBuilderInfoComponent implements OnInit, OnDestroy {
  public configuration: Config = { ...DefaultConfig };
  builderColumns: Columns[] = [];
  builderOrderDetails: any = [];
  showErrorMessage = false;
  builderMigrated: boolean = false;
  errorMessage: any;
  selectedBuilder: any;
  selectionChanged: boolean = false;
  spinnerLoading: boolean = false;
  onClose: Function = () => {};
  builderSubmitted: Function = () => {};
  initialStateData: any;
  totalBuildersLength: number = 0;
  pageIndex: number = 1;
  tableItemsSize: number = 10;
  startValue: number =
    this.pageIndex * this.tableItemsSize - (this.tableItemsSize - 1);
  lastValue: number = this.startValue + this.tableItemsSize - 1;
  isSampleOrder: boolean = false;
  searchText: string = "";
  searchFlag: boolean = false;
  disabledContinueBtn: boolean = false;
  private searchSubject: Subject<{ text: string; page: number }> = new Subject<{
    text: string;
    page: number;
  }>();
  private searchSub?: Subscription;

  constructor(
    public bsModalRef: BsModalRef,
    public modalService: BsModalService,
    private getStorageService: StorageService,
    private productService: ProductService,
    public cd: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.initialStateData = this.modalService.config.initialState;
    this.configuration = { ...DefaultConfig };
    this.configuration.checkboxes = false;
    this.configuration.tableLayout.striped = true;
    this.configuration.tableLayout.hover = false;
    this.configuration.paginationRangeEnabled = false;
    this.configuration.paginationEnabled = false;
    this.configuration.rows = 10;
    this.setLoading(false);
    let initialStateData: any = this.modalService.config.initialState;
    this.isSampleOrder = initialStateData?.isSampleOrder;

    this.builderColumns = [
      { key: "#", title: "", width: "15%" },
      { key: "builder", title: "Builder" },
      { key: "city", title: "City" },
      { key: "state", title: "State" },
    ];
    this.searchSub = this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged((a, b) => a.text === b.text && a.page === b.page),
        concatMap(({ text, page }) => {
          this.showErrorMessage = false;
          this.totalBuildersLength = 0;
          this.builderOrderDetails = [];
          if (this.searchFlag) {
            this.setLoading(true);
          } else {
            this.productService.progressShow("getBuilderInfo", "getBuilderInfoId");
            this.setLoading(false);
          }
          return this.getBuilderInfoDate$(page > 0 ? page - 1 : 0, text);
        }),
      )
      .subscribe({
        next: (res) => {
          this.setLoading(false);
          this.productService.progressHide("getBuilderInfoId");
          this.spinnerLoading = false;
          if (
            res?.body?.builders?.[0]?.errorCode ||
            res?.error?.errors?.length > 0
          ) {
            this.showErrorMessage = true;
            this.errorMessage = res?.body?.builders || res?.error?.errors;
          } else {
            this.builderOrderDetails = res?.body?.builders || [];
            this.selectedBuilder = this.initialStateData?.builderInfo;
            this.totalBuildersLength = res?.body?.totalNumberOfResults;
            if (this.selectedBuilder?.builderNumber) {
              this.disabledContinueBtn = !this.builderOrderDetails?.some(
                (bldr: any) =>
                  this.selectedBuilder?.builderNumber == bldr?.builderNumber,
              );
            }
          }
        },
        error: () => {
          this.setLoading(false);
          this.productService.progressHide("getBuilderInfoId");
        },
      });
    this.searchSubject.next({ text: this.searchText, page: this.pageIndex });
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }

  closeModal() {
    this.bsModalRef.hide();
  }

  closePopupUsingService(selectedId: string) {
    this.onClose();
    this.modalService.hide(selectedId);
  }

  private setLoading(value: boolean) {
    if (!this.configuration) {
      this.configuration = { ...DefaultConfig };
    }
    this.configuration = { ...this.configuration, isLoading: value };
    try {
      this.cd?.detectChanges();
    } catch (e) {
      // ignore
    }
  }

  getBuilderInfoDate$(pageIndex: number, searchText: string) {
    return this.getStorageService.getItem("miniCartCount").pipe(
      take(1),
      map((miniCartCount: any) => ({
        code: miniCartCount?.code,
      })),
      mergeMap((data: any) =>
        this.productService.getBuilderOrder(data?.code, pageIndex, searchText)
      )
    );
  }

  openBuilderDivision() {
    const initialState: ModalOptions = {
      initialState: {
        selectedBuilder: this.selectedBuilder,
        builderInfo: this.initialStateData?.builderInfo,
        showroom: this.initialStateData.showroom,
        selectionChanged: this.selectionChanged,
        builderSubmitted: (res: any) => {
          this.builderSubmitted(res);
        },
        onClose: () => {
          this.onClose();
        },
      },
    };
    this.bsModalRef = this.modalService.show(
      BuilderDivisionComponent,
      Object.assign(initialState, {
        id: "builder-division",
        class: "modal-lg modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );
  }

  getSelctedVal(event: any, row: any) {
    this.disabledContinueBtn = false;
    if (this.isSampleOrder) {
      this.selectionChanged = true;
      this.selectedBuilder = row;
    } else {
      if (row.builderMigrated === true) {
        this.builderMigrated = true;
        this.selectionChanged = false;
        this.selectedBuilder = row;
      } else {
        this.builderMigrated = false;
        this.selectionChanged = true;
        this.selectedBuilder = row;
      }
    }
  }

  onTableDataChange(event: any) {
    this.pageIndex = event;
    if (0 == event) {
      this.pageIndex = 1;
    }
    this.startValue =
      this.pageIndex * this.tableItemsSize - (this.tableItemsSize - 1);
    this.lastValue = this.startValue + this.tableItemsSize - 1;
    this.lastValue =
      this.lastValue > this.totalBuildersLength
        ? this.totalBuildersLength
        : this.lastValue;
    this.searchSubject.next({ text: this.searchText, page: this.pageIndex });
  }
  onSearch(event: any) {
    let value = event?.target?.value;
    this.searchText = value?.length > 0 ? value : "";
    this.pageIndex = 1;
    this.searchFlag = true;
    this.searchSubject.next({ text: this.searchText, page: this.pageIndex });
  }
}
