import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DocumentationRoutingModule } from './documentation-routing.module';
import { DocumentationComponent } from './pages/documentation/documentation.component';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  declarations: [
    DocumentationComponent
  ],
  imports: [
    CommonModule,
    DocumentationRoutingModule,
    SharedModule
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class DocumentationModule { }
