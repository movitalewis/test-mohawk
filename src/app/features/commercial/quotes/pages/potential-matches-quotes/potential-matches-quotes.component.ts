import { Component, OnInit } from '@angular/core';
import { QuotesService } from '../../services/quotes.service';
import { BsModalRef, BsModalService ,ModalOptions} from 'ngx-bootstrap/modal';
import { Columns, Config, DefaultConfig } from 'ngx-easy-table';
import { Router } from '@angular/router';
import { ProgressModalComponent } from 'src/app/features/shared/components/progress-modal/progress-modal.component';
import { MESSAGE_CONSTANTS } from 'src/app/features/shared/constants/MESSAGE-CONSTANTS';
@Component({
    selector: 'app-potential-matches-quotes',
    templateUrl: './potential-matches-quotes.component.html',
    styleUrls: ['./potential-matches-quotes.component.scss'],
    standalone: false
})
export class PotentialMatchesQuotesComponent implements OnInit {

  tableLoading = false;
  public configuration!: Config;
  public columns!: Columns[];
  allquoteData: any;
  sortValue: any;
  modalRef?: BsModalRef;
  isModalContentVisible: boolean = false;
  constructor(
    private quotesService: QuotesService,
    private modalService: BsModalService,
    public bsModalRef: BsModalRef,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.columns = [
      {
        key: "state",
        title: "Status",
        orderEnabled: true,
        cssClass: { includeHeader: true, name: 'sorting-arrow' } 
      },
      {
        key: "code",
        title: "Quote #",
        orderEnabled: true,
        cssClass: { includeHeader: true, name: 'sorting-arrow' } 
      },
      {
        key: "name",
        title: "End User",
        width: "18%",
        orderEnabled: true,
        cssClass: { includeHeader: true, name: 'sorting-arrow' } 
      },
      {
        key: "description",
        title: "Quote Description",
        width: "18%",
        orderEnabled: true,
        cssClass: { includeHeader: true, name: 'sorting-arrow' } 
      },
      {
        key: "jobLocation",
        title: "Job Location",
        orderEnabled: true,
        cssClass: { includeHeader: true, name: 'sorting-arrow' } 
      },
      {
        key: "expirationTime",
        title: "Expiration",
        width: "15%",
        orderEnabled: true,
        cssClass: { includeHeader: true, name: 'sorting-arrow' } 
      },
      {
        key: "totalPriceWithTax",
        title: "Total USD",
        orderEnabled: true,
        cssClass: { includeHeader: true, name: 'sorting-arrow' } 
      },
    ];
    let result: any= this.modalService.config.initialState;
    this.configuration = { ...DefaultConfig };
    this.configuration.checkboxes = false;
    this.configuration.tableLayout.striped = true;
    this.configuration.tableLayout.hover = false;
    this.configuration.paginationRangeEnabled = false;
    this.configuration.paginationEnabled = false;
    this.viewAllPotentialMatches(result?.quoteCode)
  }

  viewAllPotentialMatches(quoteCode:any){
   this.progressShow('potentialview')
    this.quotesService.viewAllPotentialMatches(quoteCode).subscribe({
      next: (res) => {
        this.progressHide()
        this.isModalContentVisible = true
        console.log("res.body---->",res.body)
        this.allquoteData = res?.body?.quotes || [];
      },
      error: (err: any) => {
        this.progressHide();
        this.isModalContentVisible = true
      },
    });
  }

  formatMoney(amount: number) {
    return "$" + amount.toFixed(2);
  }

  onHideModal() {
    this.bsModalRef.hide();
  }

  redirectTO(quoteCode:string){
    window.location.replace("/commercial/quotes/quote-detail/"+quoteCode);
  }
  onsort(e: any) {
        const colItem = this.columns.find((col: any) => col.key === e.value.key);
        if (colItem?.orderEventOnly === true || colItem?.orderEnabled === true) {
            this.sortValue = e.value;
            this.setSortIcon();
        }
} 
  setSortIcon() {
    this.columns.map((item: any) => {
        if (item.key === this.sortValue.key && item.hasOwnProperty("cssClass")) {
            if (this.sortValue.order === 'asc') {
                item.cssClass = {
                    ...{},
                    ...{ includeHeader: true, name: "sorting-arrow-active" },
                };
            } else if (this.sortValue.order === 'desc') {
                item.cssClass = {
                    ...{},
                    ...{ includeHeader: true, name: "sorting-arrow-down-icon" },
                };
            }
        } else if (item.hasOwnProperty("cssClass")) {
            item.cssClass = {
                ...{},
                ...{ includeHeader: true, name: "sorting-arrow" },
            };
        }
    });
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


}
