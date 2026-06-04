import { SharedModule } from 'src/app/features/shared/shared.module';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SampleBudgetComponent } from './pages/sample-budget/sample-budget.component';
import { BudgetRoutingModule } from './budget-routing.module';
import { TransferPopupComponent } from './pages/transfer-popup/transfer-popup.component';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';

@NgModule({
  declarations: [
    SampleBudgetComponent,
    TransferPopupComponent
  ],
  imports: [
    CommonModule,
    BudgetRoutingModule,
    SharedModule,
    FormsModule,
    NgxPaginationModule,
    TypeaheadModule.forRoot(), 
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class BudgetModule { }
