import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BreadcrumbItems } from 'src/app/features/shared/interfaces';
import { InvoiceListService } from '../../../finance/invoices/services/invoice-list.service';
import { PowerBIReportEmbedComponent } from 'powerbi-client-angular';
import { IReportEmbedConfiguration, models, service, Embed } from 'powerbi-client';
import { environment } from 'src/environments/environment';
import * as powerbi from 'powerbi-client';
@Component({
  selector: 'app-special-goods-list',
  standalone: false,
  templateUrl: './special-goods-list.component.html',
  styleUrls: ['./special-goods-list.component.scss']
})
export class SpecialGoodsListComponent implements OnInit {

  breadcrumbItems: BreadcrumbItems = [
    {
      name: 'Home',
      path: '/commercial',
      active: false
    },
    {
      name: 'Special Goods',
      path: ' ',
      active: true
    }
  ];

  reportConfig: IReportEmbedConfiguration = {
    type: 'report',
    embedUrl: environment.powerbiEmbedUrl,
    tokenType: models.TokenType.Embed,

    accessToken: '',
    settings: {panes: {
      filters: { visible: false },
      pageNavigation: { visible: true },
    },
    background: powerbi.models.BackgroundType.Transparent,},
  };
  private report!: powerbi.Report;

  @ViewChild(PowerBIReportEmbedComponent)
  
  reportObj!: PowerBIReportEmbedComponent;
  
  @ViewChild('dashboardContainer', { static: true }) dashboardContainer!: ElementRef;
  
  eventHandlersMap = new Map([
    [
      'loaded',
      () => {
        const report = this.reportObj.getReport();
        report.setComponentTitle('Embedded report');
      },
    ],
    ['rendered', () => console.log('Report has rendered')],
    [
      'error',
      (event?: service.ICustomEvent<any>) => {
        if (event) {
          console.error(event.detail);
        }
      },
    ],
    ['visualClicked', () => console.log('visual clicked')],
    ['pageChanged', (event) => ''],
  ]) as Map<
    string,
    (event?: service.ICustomEvent<any>, embeddedEntity?: Embed) => void | null
  >;
  constructor(private invoiceListService: InvoiceListService) { }
   

  ngOnInit(): void {
   

    this.invoiceListService.getMsalToken().subscribe((response)=>{
      if(response?.body){
        let data:any = response?.body;
        let token = data?.token;
        let tokenId = data?.tokenId;
        this.reportConfig = {
          ...this.reportConfig,
           accessToken: token,
           id: environment.powerbiReportId,
           embedUrl: environment.powerbiEmbedUrl
        };
        console.log(this.reportConfig)
        const powerbiService = new powerbi.service.Service(powerbi.factories.hpmFactory, powerbi.factories.wpmpFactory, powerbi.factories.routerFactory);

    const container = this.dashboardContainer.nativeElement;
    const embedInstance = powerbiService.embed(container, this.reportConfig);

    if (embedInstance instanceof powerbi.Report) {
      this.report = embedInstance;
    } else {
      console.error('Embedding failed: Returned object is not a Report');
    }
      }
    })
  }
  reloadReport(): void {
    if (this.report) {
      this.report.reload().catch((error) => {
        console.error('Error reloading report:', error);
      });
    } else {
      console.error('No report found to reload');
    }
  }

}
