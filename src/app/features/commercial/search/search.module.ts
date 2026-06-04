import { SharedModule } from 'src/app/features/shared/shared.module';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SearchRoutingModule } from './search-routing.module';
import { AdvancedSearchComponent } from './pages/advanced-search/advanced-search.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [AdvancedSearchComponent],
  imports: [
    CommonModule,
    SearchRoutingModule,
    SharedModule,ReactiveFormsModule
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class SearchModule { }
