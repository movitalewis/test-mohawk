import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InvoicesRoutingModule } from './invoices-routing.module';
import { InvoicesListComponent } from './pages/invoices-list/invoices-list.component';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';


@NgModule({
  declarations: [
    InvoicesListComponent
  ],
  imports: [
    CommonModule,
    InvoicesRoutingModule,
    SharedModule,
    FormsModule,
    NgxPaginationModule
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class InvoicesModule { }
