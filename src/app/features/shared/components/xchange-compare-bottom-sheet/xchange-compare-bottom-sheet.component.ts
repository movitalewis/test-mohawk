import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";
import { Router } from "@angular/router";
import { SharedService } from "src/app/features/http-services/shared.service";
import { StorageService } from "src/app/features/http-services/storage.service";

@Component({
    selector: "xchange-compare-bottom-sheet",
    templateUrl: "./xchange-compare-bottom-sheet.component.html",
    styleUrls: ["./xchange-compare-bottom-sheet.component.scss"],
    standalone: false
})
export class XchangeCompareBottomSheetComponent implements OnInit {
  constructor(
    private sharedService: SharedService,
    private storageService: StorageService,
    private route: Router
  ) {}

  @Input() compareData: any = [];
  @Output() removeItem: EventEmitter<any> = new EventEmitter<any>();
  ngOnInit(): void {}
  removeCompareItem(data: any) {
    this.removeItem.emit(data);
    this.sharedService.setuntickUnselectedProducts(data);
  }
  removeaAllData(data: any) {
    data.forEach((element: any) => {
      this.removeItem.emit(element);
      this.sharedService.setuntickUnselectedProducts(element);
    });
  }

  compareAll(data: any) {
    let queryDetails: any = [];
    data.forEach((element: any) => {
      queryDetails.push(element?.code);
    });
    this.route.navigate(
      [
        `/${
          this.route.url.split("?")[0].includes("commercial")
            ? "commercial"
            : "residential"
        }/products/products-compare`,
      ],
      { queryParams: { selectedProducts: JSON.stringify(queryDetails) } }
    );
    this.storageService.setItem("selectedProducts", data);
  }
  getImage(imageurl: any) {
    let swatchImage = imageurl.includes("https");
    return swatchImage? imageurl + "?$xchangeThumb$":"https://s7d4.scene7.com/is/image/MohawkResidential/missing?$xchangeThumb$";
   // return image + "?$xchangeThumb$ ";
  }
}
