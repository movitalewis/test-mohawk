import { SharedModule } from 'src/app/features/shared/shared.module';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SpecialGoodsRoutingModule } from './special-goods-routing.module';
import { SpecialGoodsListComponent } from './pages/special-goods-list/special-goods-list.component';
import { XchangeSpecialGoodsFiltersComponent } from './components/xchange-special-goods-filters/xchange-special-goods-filters.component';
import { XchangeSgItemImageComponent } from './components/xchange-sg-item-image/xchange-sg-item-image.component';
import { PowerBIEmbedModule } from 'powerbi-client-angular';


@NgModule({
  declarations: [
    SpecialGoodsListComponent,
    XchangeSpecialGoodsFiltersComponent,
    XchangeSgItemImageComponent
  ],
  imports: [
    CommonModule,
    SpecialGoodsRoutingModule,
    PowerBIEmbedModule,
    SharedModule
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class SpecialGoodsModule { }
