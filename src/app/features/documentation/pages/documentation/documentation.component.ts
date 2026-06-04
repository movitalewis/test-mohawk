import { Component, Inject, OnInit, TemplateRef } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { DocsMenuService } from '../../services/docs-menu.service';
import { DOCUMENT } from '@angular/common';
import { Columns, Config, DefaultConfig } from 'ngx-easy-table';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
@Component({
    selector: 'app-documentation',
    templateUrl: './documentation.component.html',
    styleUrls: ['./documentation.component.scss'],
    standalone: false
})
export class DocumentationComponent implements OnInit {
  //mobile tab code starts here
  isMobile:boolean = false;
  showTab:boolean = true;
  menuState:boolean = false;
  //mobile tab code ends here

  currentMenu: string = '';
  modalRef?: BsModalRef;

  cars = [
    { id: 1, name: 'Volvo' },
    { id: 2, name: 'Saab' },
    { id: 3, name: 'Opel' },
    { id: 4, name: 'Audi' },
  ];

  logoCDark: string = '<xchange-logo type="commercial" theme="dark"></xchange-logo>';
  searchControlDisabled: string = "<app-search-control [disabled]='true'></app-search-control>";
  inputEmpty: string = "<input type='text' placeholder='Empty Field' class='form-control'>";
  inputDisabled: string = "<input type='text' [disabled]='true' placeholder='Empty Field' class='form-control'>";
  inputError: string = "<input type='text' [disabled]='true' placeholder='Empty Field' class='form-control error'>";
  dropdown: string = `<ng-select placeholder="Select One">
  <ng-option *ngFor="let car of cars" [value]="car.id">{{car.name}}</ng-option>
</ng-select>`;
  slider: string = `<owl-carousel-o [options]="sliderOptions">
<ng-template carouselSlide> <img src="/assets/images/png/mohawak.png" width="100%" alt=""></ng-template>
<ng-template carouselSlide> <img src="/assets/images/png/karastan.png" width="100%" alt=""></ng-template>
<ng-template carouselSlide> <img src="/assets/images/png/pergo.png" width="100%" alt=""></ng-template>
<ng-template carouselSlide> <img src="/assets/images/png/pergo.png" width="100%" alt=""></ng-template>
</owl-carousel-o>`

  tabs: string = `<tabset [justified]="true">
  <tab>
      <ng-template tabHeading>FULL SPECIFICATIONS</ng-template>
      Tab 1 content
  </tab>
  <tab>
      <ng-template tabHeading>FULL SPECIFICATIONS</ng-template>
      Tab 2 content
  </tab>
  <tab>
      <ng-template tabHeading>FULL SPECIFICATIONS</ng-template>
      Tab 3 content
  </tab>
</tabset>`;

  datePicker: string = `<input type="text" placeholder="Datepicker" class="form-control" bsDatepicker>`;
  dateRange: string = `<input type="text" placeholder="Daterangepicker" class="form-control" bsDaterangepicker>`;

  modalCode: string = `
  HTML Component
  <button type="button" class="btn btn-primary" (click)="openModal(template)">Create template modal</button>
  <ng-template #template>
  <div class="modal-header">
    <h4 class="modal-title pull-left">Modal</h4>
    <button type="button" class="btn-close close pull-right" aria-label="Close" (click)="modalRef?.hide()">
      <span aria-hidden="true" class="visually-hidden">&times;</span>
    </button>
  </div>
  <div class="modal-body">
    This is a modal.
  </div>
</ng-template>


TS Component
import { Component, TemplateRef } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
 
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'demo-modal-service-static',
  templateUrl: './service-template.html'
})
export class DemoModalServiceStaticComponent {
  modalRef?: BsModalRef;
  constructor(private modalService: BsModalService) {}
 
  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }
}`;

  dataTableCode: string = `
  HTML Component 
  <ngx-table [configuration]="configuration" [data]="data" [columns]="columns">
  </ngx-table>

  Ts Component
  import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Company, data } from '../../../assets/data';
import { Columns, Config, DefaultConfig } from 'ngx-easy-table';

@Component({
  selector: 'app-basic',
  templateUrl: './basic.component.html',
  styleUrls: ['./basic.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BasicComponent implements OnInit {
  public configuration: Config;
  public columns: Columns[];
  public data: Company[] = [];

  ngOnInit(): void {
    this.columns = [
      { key: 'level', title: 'Level' },
      { key: 'age', title: 'Age' },
      { key: 'company', title: 'Company' },
      { key: 'name', title: 'Name' },
      { key: 'isActive', title: 'STATUS' },
    ];
    this.data = data;
    this.configuration = { ...DefaultConfig };
  }
}
`;
  iconBtns: string = `  <xchange-icon-button icon="share" label="Share"></xchange-icon-button>
<xchange-icon-button icon="view-pdf" label="View PDF"></xchange-icon-button>`

isCollapsed = true;

collapseBtn: string = ''

  sliderOptions: OwlOptions = {
    loop: true,
    navText: ['', ''],
    responsive: {
      0: {
        items: 1
      },
      400: {
        items: 1
      },
      740: {
        items: 2
      },
      940: { items: 3 }
    },
    nav: true,
    margin: 15
  }


  constructor(
    private docMenu: DocsMenuService,
    @Inject(DOCUMENT) private document: Document,
    private modalService: BsModalService
  ) { }

  public configuration!: Config;
  public columns!: Columns[];

  public data = [{
    phone: '+1 (934) 551-2224',
    age: 20,
    address: { street: 'North street', number: 12 },
    company: 'ZILLANET',
    name: 'Valentine Webb',
    isActive: false,
  }, {
    phone: '+1 (948) 460-3627',
    age: 31,
    address: { street: 'South street', number: 12 },
    company: 'KNOWLYSIS',
    name: 'Heidi Duncan',
    isActive: true,
  },
  {
    phone: '+1 (948) 460-3627',
    age: 31,
    address: { street: 'South street', number: 12 },
    company: 'KNOWLYSIS',
    name: 'Heidi Duncan',
    isActive: true,
  },
  {
    phone: '+1 (948) 460-3627',
    age: 31,
    address: { street: 'South street', number: 12 },
    company: 'KNOWLYSIS',
    name: 'Heidi Duncan',
    isActive: true,
  }, {
    phone: '+1 (948) 460-3627',
    age: 31,
    address: { street: 'South street', number: 12 },
    company: 'KNOWLYSIS',
    name: 'Heidi Duncan',
    isActive: true,
  }, {
    phone: '+1 (948) 460-3627',
    age: 31,
    address: { street: 'South street', number: 12 },
    company: 'KNOWLYSIS',
    name: 'Heidi Duncan',
    isActive: true,
  }, {
    phone: '+1 (948) 460-3627',
    age: 31,
    address: { street: 'South street', number: 12 },
    company: 'KNOWLYSIS',
    name: 'Heidi Duncan',
    isActive: true,
  }, {
    phone: '+1 (948) 460-3627',
    age: 31,
    address: { street: 'South street', number: 12 },
    company: 'KNOWLYSIS',
    name: 'Heidi Duncan',
    isActive: true,
  }, {
    phone: '+1 (948) 460-3627',
    age: 31,
    address: { street: 'South street', number: 12 },
    company: 'KNOWLYSIS',
    name: 'Heidi Duncan',
    isActive: true,
  }, {
    phone: '+1 (948) 460-3627',
    age: 31,
    address: { street: 'South street', number: 12 },
    company: 'KNOWLYSIS',
    name: 'Heidi Duncan',
    isActive: true,
  }, {
    phone: '+1 (948) 460-3627',
    age: 31,
    address: { street: 'South street', number: 12 },
    company: 'KNOWLYSIS',
    name: 'Heidi Duncan',
    isActive: true,
  }
  ];

  ngOnInit(): void {
    this.configuration = { ...DefaultConfig };
    this.configuration.checkboxes = true;
    this.configuration.tableLayout.striped = true;
    this.configuration.tableLayout.hover = false;
    this.configuration.paginationRangeEnabled = false;
    this.columns = [
      { key: 'phone', title: 'Phone' },
      { key: 'age', title: 'Age' },
      { key: 'company', title: 'Company' },
      { key: 'name', title: 'Name' },
      { key: 'isActive', title: 'Status' },
    ];
    //mobile tab code starts here
    this.isMobile = window.innerWidth < 600 ? true : false;
    if(!this.isMobile){
      this.showTab = true;
    }
    //mobile tab code ends here

    this.docMenu.menuName.subscribe(menu => {
      this.currentMenu = menu;
      if (this.currentMenu) this.document.getElementById(this.currentMenu)?.scrollIntoView({ behavior: 'smooth' });
    });
  }


  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }

}
