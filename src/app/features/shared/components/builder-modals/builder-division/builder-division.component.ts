import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { Columns, Config, DefaultConfig } from "ngx-easy-table";
import { StorageService } from "src/app/features/http-services/storage.service";
import {
  take,
  map,
  mergeMap,
  Subscription,
  Subject,
  debounceTime,
  distinctUntilChanged,
  concatMap,
} from "rxjs";
import { BuilderSubdivisionComponent } from "../builder-subdivision/builder-subdivision.component";
import { ProductService } from "src/app/features/residential/products/pages/services/product.service";

@Component({
    selector: "app-builder-division",
    templateUrl: "./builder-division.component.html",
    styleUrls: ["./builder-division.component.scss"],
    standalone: false
})
export class BuilderDivisionComponent implements OnInit {
  public configuration: Config = { ...DefaultConfig };
  builderColumns: Columns[] = [];
  builderDivisionData = [];
  showErrorMessage = false;
  errorMessage: any;
  initialState: any;
  selectedDivision: any;
  builderDivData: any = [];
  builderSubmitted: Function = () => {};
  initialStateData: any;
  selectionChanged: boolean = false;
  totalDivisonLength: number = 0;
  pageIndex: number = 1;
  tableItemsSize: number = 10;
  startValue: number =
    this.pageIndex * this.tableItemsSize - (this.tableItemsSize - 1);
  lastValue: number = this.startValue + this.tableItemsSize - 1;
  onClose: Function = () => {};
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

    this.builderColumns = [
      { key: "#", title: "", width: "15%" },
      { key: "builder", title: "Builder" },
      { key: "city", title: "City" },
      { key: "state", title: "State" },
    ];
    this.initialState = this.modalService.config.initialState;
    this.selectionChanged = this.initialState.selectionChanged;
    this.searchSub = this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged((a, b) => a.text === b.text && a.page === b.page),
        concatMap(({ text, page }) => {
          this.showErrorMessage = false;

          let payload = {
            builderCity: this.initialState?.selectedBuilder?.builderCity,
            builderName: this.initialState?.selectedBuilder?.builderName,
            builderNumber: this.initialState?.selectedBuilder?.builderNumber,
            builderState: this.initialState?.selectedBuilder?.builderState,
          };
          if (this.searchFlag) {
            this.setLoading(true);
          } else {
            this.productService.progressShow("getBuilderDivision", "getBuilderDivisionId");
          }
          this.builderDivData = [];
          this.totalDivisonLength = 0;
          return this.getBuilderDivisionData$(
            payload,
            page > 0 ? page - 1 : 0,
            text,
          );
        }),
      )
      .subscribe({
        next: (res) => {
          this.productService.progressHide("getBuilderDivisionId");
          this.setLoading(false);
          if (res?.body?.divisions[0]?.errorCode) {
            this.showErrorMessage = true;
            this.errorMessage = res?.body?.divisions;
          } else {
            this.builderDivData = res?.body?.divisions || [];
            this.selectedDivision = this.initialStateData.builderInfo;
            this.totalDivisonLength = res?.body?.totalNumberOfResults;
            if (this.selectedDivision?.divNumber) {
              this.disabledContinueBtn = this.builderDivData?.find(
                (d: any) => this.selectedDivision?.divNumber == d?.divNumber,
              )
                ? false
                : true;
            }
          }
        },
        error: () => {
          this.setLoading(false);
          this.productService.progressHide("getBuilderDivisionId");
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

  getBuilderDivisionData$(payload: any, pageIndex: number, searchText: string) {
    return this.getStorageService.getItem("miniCartCount").pipe(
      take(1),
      map((miniCartCount: any) => ({
        code: miniCartCount?.code,
      })),
      mergeMap((data: any) =>
        this.productService.getDivision(
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
        selectedDivision: this.selectedDivision,
        selectedBuilder: this.initialState?.selectedBuilder,
        showroom: this.initialStateData.showroom,
        builderInfo: this.initialStateData.builderInfo,
        selectionChanged: this.selectionChanged,
        builderSubmitted: (res: any) => {
          this.builderSubmitted(res);
        },
        onClose: () => {
          this.onClose();
        }
      },
    };

    this.bsModalRef = this.modalService.show(
      BuilderSubdivisionComponent,
      Object.assign(initialState, {
        id: "builder-subdivision",
        class: "modal-lg modal-dialog-centered",
        backdrop: "static",
        keyboard: false,
      })
    );
  }
  getSelctedVal(event: any, row: any) {
    this.selectedDivision = row;
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
  onSearch(event: any) {
    this.searchFlag = true;
    let value = event?.target?.value;
    this.searchText = value?.length > 0 ? value : "";
    this.pageIndex = 1;
    this.searchSubject.next({ text: this.searchText, page: this.pageIndex });
  }
}
