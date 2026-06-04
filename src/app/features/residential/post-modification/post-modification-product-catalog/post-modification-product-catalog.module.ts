import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PostModificationProductCatalogRoutingModule } from './post-modification-product-catalog-routing.module';
import { PostModificationProductCatalogListComponent } from './post-modification-product-catalog-list/post-modification-product-catalog-list.component';
import { SharedModule } from 'src/app/features/shared/shared.module';


@NgModule({
  declarations: [
    PostModificationProductCatalogListComponent
  ],
  imports: [
    CommonModule,
    PostModificationProductCatalogRoutingModule,
    SharedModule
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class PostModificationProductCatalogModule { }
