import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: "product-catalog-list",
    loadChildren: () =>
      import("./post-modification-product-catalog/post-modification-product-catalog.module").then((m) => m.PostModificationProductCatalogModule),
  },
  {
    path: "products",
    loadChildren: () =>
      import("./post-modification-products/post-modification-products.module").then((m) => m.PostModificationProductsModule),
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PostModificationRoutingModule { }
