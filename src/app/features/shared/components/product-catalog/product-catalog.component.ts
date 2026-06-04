import { Component, OnInit, Input } from "@angular/core";
import { Router } from "@angular/router";

@Component({
    selector: "app-product-catalog",
    templateUrl: "./product-catalog.component.html",
    styleUrls: ["./product-catalog.component.scss"],
    standalone: false
})
export class ProductCatalogComponent implements OnInit {
  @Input("list") list: any = [];
  @Input() type: any;
  @Input() isPostOrder:any=false;
  @Input() orderNumber:any='';

  constructor(private router: Router) {}
  public softSurfaceItems: any = [];
  ngOnInit(): void {}

  routeToPage(url?: any) {
    if(this.isPostOrder){
        
        let postUrl=url.replace('{order_number}',this.orderNumber);
        
        this.router.navigateByUrl(postUrl);
        
    }
    else {
      this.router.navigateByUrl(url);
    }
   
  }

  navigateToProductPage(url: any) {
    this.router.navigate(url);
  }
}
