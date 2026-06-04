import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';

@Component({
    selector: 'xchange-claim-line-type',
    templateUrl: './claim-line-type.component.html',
    styleUrl: './claim-line-type.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ClaimLineTypeComponent implements OnInit {
  addInvoiceLine: boolean = false;
  initialData: any;
  constructor(private modalService: BsModalService) {}
  claimLineTypes = [
    { name: "Add Invoice Line", id: "1", disabled : false },
    { name: "Add Labor Line", id: "2", disabled : false },
  ];

  selectedSite: string = "";
  onPrimaryAction: Function = (selectedId: any) => {

  };
  ngOnInit(): void {
    this.initialData = this.modalService.config.initialState;
    this.addInvoiceLine = this.initialData?.isAllSelected || false;
    this.claimLineTypes[0].disabled =  (this.initialData?.claimsService.selectedInvoiceLines?.claimData?.claimStatus.toUpperCase() == 'IN PROCESS' || this.addInvoiceLine);
    this.claimLineTypes[1].disabled =  (this.initialData?.claimsService.selectedInvoiceLines?.claimData?.laborLineExists && this.initialData?.claimsService.selectedInvoiceLines?.claimData?.claimStatus.toUpperCase() != 'DRAFT');
    // this.claimLineTypes[1].disabled = this.initialData?.isAllSelected || false;
  }
  onHideModal() {
    this.modalService.hide("claimLineTypeComponent");
  }
handleAction() {
    this.onPrimaryAction(this.selectedSite);
    this.onHideModal();
  }
  changeSite(event: any, siteId: string) {
    this.selectedSite = siteId;
  }

}
