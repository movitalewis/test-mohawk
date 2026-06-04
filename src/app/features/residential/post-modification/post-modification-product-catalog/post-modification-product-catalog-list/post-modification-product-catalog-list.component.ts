import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { residentialMenuIsCSR } from "src/app/features/shared/constants/menu/residential.config";
import { BreadcrumbItems } from "src/app/features/shared/interfaces";

@Component({
    selector: "app-post-modification-product-catalog-list",
    templateUrl: "./post-modification-product-catalog-list.component.html",
    styleUrls: ["./post-modification-product-catalog-list.component.scss"],
    standalone: false
})
export class PostModificationProductCatalogListComponent implements OnInit {
  productListing = residentialMenuIsCSR[0].subNav;
  constructor(private activateRoute: ActivatedRoute) {}
  order_number: any;
  ngOnInit(): void {
    

    this.activateRoute.params.subscribe((params: any) => {
      
      this.order_number = params?.order_number;
    });
  }
  breadcrumbItems: BreadcrumbItems = [
    {
      name: "Home",
      path: "/residential",
      active: false,
    },

    {
      name: "Product Catalog",
      path: "/",
      active: true,
    },
  ];
}
