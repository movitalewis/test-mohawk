import { Component, OnInit } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';

@Component({
    selector: 'app-progress-modal',
    templateUrl: './progress-modal.component.html',
    styleUrls: ['./progress-modal.component.scss'],
    standalone: false
})
export class ProgressModalComponent implements OnInit {
  modalId: any;
  modalHeaderText: string = "Processing";
  progressText: string = "Please wait...";
  progressBarText: string = "Processing...";
  multipleProgressText: any = [];
  multipleProgressInterval: number = 4;

  constructor(private modalService: BsModalService) {}

  ngOnInit(): void {
    if (this.multipleProgressText?.length) {
      this.progressText = this.multipleProgressText[0];
      setTimeout(() => {
        this.progressText = this.multipleProgressText[1] || this.progressText;
      }, this.multipleProgressInterval * 1000);
    }
    this.modalHeaderText = this.modalHeaderText || "Processing";
    this.progressText = this.progressText || "Please wait...";
    this.progressBarText = this.progressBarText || "Processing...";
  }
}
