import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PostModificationProductCatalogListComponent } from './post-modification-product-catalog-list/post-modification-product-catalog-list.component';

const routes: Routes = [
  {
    path:':order_number',
    component:PostModificationProductCatalogListComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PostModificationProductCatalogRoutingModule { }
