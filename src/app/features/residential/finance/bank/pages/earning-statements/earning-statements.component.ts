import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BreadcrumbItems } from 'src/app/features/shared/interfaces';
import { EarningBankStatementService } from '../../services/earning-bank-statement.service';
import { StorageService } from 'src/app/features/http-services/storage.service';

@Component({
    selector: 'app-earning-statements',
    templateUrl: './earning-statements.component.html',
    styleUrls: ['./earning-statements.component.scss'],
    standalone: false
})
export class EarningStatementsComponent implements OnInit {
  breadcrumbItems: BreadcrumbItems = [
    {
      name: 'Home',
      path: '/residential',
      active: false,
    },
    {
      name: 'Finance',
      path: ' ',
      active: false,
    },
    {
      name: 'Earning Statements',
      path: '/',
      active: true,
    },
  ];

  selectedYear: number;
  years: number[] = [];
  quarters: number[] = [];
  financialYear: number = 2014;
  financialQuarter: number = 0;
  accountNumber: any;
  earningStatementForm!: FormGroup;
  submitted = false;
  defaultConfirmationMsg: string = `You must have the Adobe Acrobat Reader plug-in installed to view statements which you can get <a
  href="https://acrobat.adobe.com/us/en/acrobat/pdf-reader.html" alt="Adobe acrobat"
  title="Adobe acrobat">here</a>.<br>
Click on View Statement to display. May take a minute to retrieve statements from archives.`;
  noDataMsg: string = this.defaultConfirmationMsg;
  showErrorMessage: boolean = false;
  errorMessage: string = '';

  constructor(
    private apiService: EarningBankStatementService,
    private formBuilder: FormBuilder,
    private storageService: StorageService
  ) {
    this.selectedYear = new Date().getFullYear() - 5;
    for (let year = this.selectedYear; year <= 2022; year++) {
      this.years.push(year);
    }
  }

  ngOnInit(): void {
    this.storageService.getItem('uid').subscribe((accountNumber: any) => {
      this.accountNumber = accountNumber;
    });
    this.earningForm();
  }

  get f() {
    return this.earningStatementForm.controls;
  }

  earningForm() {
    this.earningStatementForm = this.formBuilder.group({
      year: [undefined, Validators.required],
      quarter: [undefined, Validators.required],
    });
  }

  selectYear($event: any) {
    this.financialYear = $event;
    if (new Date().getFullYear() == this.financialYear) {
      this.quarters = [];
      let curentQuarter = this.getQuarter(new Date());
      for (let index = 1; index <= curentQuarter; index++) {
        this.quarters.push(index);
      }
    } else {
      this.quarters = [1, 2, 3, 4];
    }
  }

  getQuarter(d: any) {
    d = d || new Date();
    var month = d.getMonth() + 1;
    return Math.ceil(month / 3);
  }

  selectQuarter(event: any) {
    this.financialQuarter = event;
  }

  viewStatement() {
    this.submitted = true;
    if (this.earningStatementForm.invalid) {
      return;
    }
    this.apiService
      .getEarningStatement(
        this.accountNumber,
        this.financialQuarter,
        this.financialYear
      )
      .subscribe({
        next: (res) => {
          if (res.body.errorCode == '0000') {
            this.showErrorMessage = false;
            this.noDataMsg = this.defaultConfirmationMsg;
            this.downloadPdf(res);
          } else {
            this.errorMessage = res.body.message;
            this.showErrorMessage = false;
            this.showErrorMessage = true;
          }
        },
        error: (error) => {},
      });
  }

  base64data = '';
  reportName = 'earning_statement.pdf';
  downloadPdf(data: any) {
    this.reportName = data.reportName;
    this.base64data = data?.reportData?._buffer;
    this.getPdf();
  }
  public b64toBlob(b64Data: any, contentType: string) {
    contentType = contentType || '';
    let sliceSize = 512;
    var byteCharacters = atob(b64Data);
    var byteArrays = [];
    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      var slice = byteCharacters.slice(offset, offset + sliceSize);
      var byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      var byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    var blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }

  getPdf() {
    var blob = this.b64toBlob(this.base64data, 'application/pdf');
    let a = document.createElement('a');
    document.body.appendChild(a);
    var url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = String(this.reportName);
    a.click();
    a.remove();
  }
}
