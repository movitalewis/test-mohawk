import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { Columns, Config, DefaultConfig } from "ngx-easy-table";
import { StorageService } from "src/app/features/http-services/storage.service";
import {
  take,
  map,
  mergeMap,
  Subject,
  Subscription,
  debounceTime,
  distinctUntilChanged,
  concatMap,
} from "rxjs";
import { SubmitBuilderComponent } from "../submit-builder/submit-builder.component";
import { ProductService } from "src/app/features/residential/products/pages/services/product.service";

@Component({
    selector: "app-builder-subdivision",
    templateUrl: "./builder-subdivision.component.html",
    styleUrls: ["./builder-subdivision.component.scss"],
    standalone: false
})
export class BuilderSubdivisionComponent implements OnInit {
  public configuration: Config = { ...DefaultConfig };
  builderColumns: Columns[] = [];
  builderOrderDetails = [];
  showErrorMessage = false;
  errorMessage: any;
  initialState: any;
  builderDivData: any = [];
  selectedSubDivision: any;
  builderSubmitted: Function = () => {};
  initialStateData: any;
  selectionChanged: boolean = false;
  onClose: Function = () => {};
  totalDivisonLength: number = 0;
  pageIndex: number = 1;
  tableItemsSize: number = 10;
  startValue: number =
    this.pageIndex * this.tableItemsSize - (this.tableItemsSize - 1);
  lastValue: number = this.startValue + this.tableItemsSize - 1;
  subDivisionFreeTextValue: string = "";
  searchText: string = "";
  searchFlag: boolean = false;
  disabledContinueBtn: boolean = false;
  private searchSubject: Subject<{ text: string; page: number }> = new Subject<{
    text: string;
    page: number;
  }>();
  private sub?: Subscription;

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
    this.setLoading(false);

    this.builderColumns = [
      { key: "#", title: "", width: "15%" },
      { key: "builder", title: "Builder" },
      { key: "city", title: "City" },
      { key: "state", title: "State" },
    ];

    this.initialState = this.modalService.config.initialState;
    this.selectionChanged = this.initialState.selectionChanged;
    this.subDivisionFreeTextValue =
      this.selectedSubDivision?.subDivisionFreeText || "";
    this.sub = this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged((a, b) => a.text === b.text && a.page === b.page),
        concatMap(({ text, page }) => {
          this.showErrorMessage = false;
          let payload = {
            divCity: this.initialState?.selectedDivision?.divCity,
            divName: this.initialState?.selectedDivision?.divName,
            divNumber: this.initialState?.selectedDivision?.divNumber,
            divState: this.initialState?.selectedDivision?.divState,
          };
          if (this.searchFlag) {
            this.setLoading(true);
          } else {
            this.productService.progressShow("getBuilderSubdivision", "getBuilderSubdivisionId");
          }
          this.builderDivData = [];
          this.totalDivisonLength = 0;
          return this.getBuilderSubDivisionData$(
            payload,
            page > 0 ? page - 1 : 0,
            text,
          );
        }),
      )
      .subscribe({
        next: (res) => {
          this.productService.progressHide("getBuilderSubdivisionId");
          this.setLoading(false);
          if (res?.body?.subDivisions[0]?.errorCode) {
            this.showErrorMessage = true;
            this.errorMessage = res?.body?.subDivisions;
          } else {
            this.builderDivData = res?.body?.subDivisions || [];
            this.selectedSubDivision = this.initialStateData.builderInfo;
            this.totalDivisonLength = res?.body?.totalNumberOfResults;
            if (this.selectedSubDivision?.subDivNumber) {
              this.disabledContinueBtn = this.builderDivData.find(
                (sd: any) =>
                  this.selectedSubDivision?.subDivNumber == sd?.subDivNumber,
              )
                ? false
                : true;
            }
          }
        },
        error: () => {
          this.setLoading(false);
          this.productService.progressHide("getBuilderSubdivisionId");
        },
      });
    this.searchSubject.next({ text: this.searchText, page: this.pageIndex });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  closeModal() {
    this.bsModalRef.hide();
  }

  closePopupUsingService(selectedId: string) {
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

  getBuilderSubDivisionData$(
    payload: any,
    pageIndex: number,
    searchText: string,
  ) {
    return this.getStorageService.getItem("miniCartCount").pipe(
      take(1),
      map((miniCartCount: any) => ({
        code: miniCartCount?.code,
      })),
      mergeMap((data: any) =>
        this.productService.getSubDivision(
          data?.code,
          payload,
          pageIndex,
          searchText,
        ),
      )
    );
  }

  openBuilderSubDivision() {
    const initialState: ModalOptions = {
      initialState: {
        selectedDivision: this.initialState?.selectedDivision,
        selectedBuilder: this.initialState?.selectedBuilder,
        subDivision: this.selectedSubDivision,
        showroom: this.initialStateData.showroom,
        builderInfo: this.initialStateData.builderInfo,
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
      SubmitBuilderComponent,
      Object.assign(initialState, {
        id: "submit-builder",
        class: "modal-lg modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );
  }
  getSelctedVal(event: any, row: any) {
    this.selectedSubDivision = row;
    this.selectionChanged = true;
    this.disabledContinueBtn = false;
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
      this.lastValue > this.totalDivisonLength
        ? this.totalDivisonLength
        : this.lastValue;
    this.searchSubject.next({ text: this.searchText, page: this.pageIndex });
  }
  onInput(event: any) {
    this.selectedSubDivision.subDivisionFreeText = event?.target?.value;
    if (!this.selectionChanged) {
      this.selectionChanged =
        this.selectedSubDivision.subDivisionFreeText !=
        this.subDivisionFreeTextValue;
    }
  }
  onSearch(event: any) {
    this.searchFlag = true;
    let value = event?.target?.value;
    this.searchText = value?.length > 0 ? value : "";
    this.pageIndex = 1;
    this.searchSubject.next({ text: this.searchText, page: this.pageIndex });
  }
}
