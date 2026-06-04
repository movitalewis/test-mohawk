import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CreditMemosRoutingModule } from './credit-memos-routing.module';
import { CreditMemoListComponent } from './pages/credit-memos-list/credit-memos-list.component';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';


@NgModule({
  declarations: [
    CreditMemoListComponent
  ],
  imports: [
    CommonModule,
    CreditMemosRoutingModule,
    SharedModule,
    FormsModule,
    NgxPaginationModule
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class CreditMemosModule { }
