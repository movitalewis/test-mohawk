import { Injectable } from "@angular/core";
import { of} from "rxjs";
import { ApiService } from "src/app/features/http-services/api.service";
import { UserService } from "src/app/features/shared/user/services/user.service";

@Injectable({
  providedIn: "root",
})
export class CompareProductService {
  data = [
    {
      styleName: "Ideal Grace",
      color: "Color Name",
      codeOfColor: "31",
      subProductType: "Carpet Tile",
      quickshipEligible: "False",
      size: "24X24 in",
      density: "6040",
      fiberType: "Nylon",
      backingMaterial: "EcoFlex Matrix",
      dyeMethod: "Solution Dye",
      warranty: "10 Years",
      mindfulMaterail: "Participates in mindful MATERIALS Library",
      declareLabel: "info",
      lvingProductChallenge: "info",
    },
    {
      styleName: "AFb01",
      color: "Color Name",
      codeOfColor: "8",
      subProductType: "Carpet Tile",
      quickshipEligible: "False",
      size: "24X24 in",
      density: "6040",
      fiberType: "Nylon",
      backingMaterial: "EcoFlex Matrix",
      dyeMethod: "Solution Dye",
      warranty: "10 Years",
      mindfulMaterail: "Participates in mindful MATERIALS Library",
      declareLabel: "info",
      lvingProductChallenge: "info",
    },
    {
      styleName: "X-Factor",
      color: "Color Name",
      codeOfColor: "12",
      subProductType: "Carpet Tile",
      quickshipEligible: "False",
      size: "24X24 in",
      density: "6040",
      fiberType: "Nylon",
      backingMaterial: "EcoFlex Matrix",
      dyeMethod: "Solution Dye",
      warranty: "10 Years",
      mindfulMaterail: "Participates in mindful MATERIALS Library",
      declareLabel: "info",
      lvingProductChallenge: "info",
    },
  ];

  constructor(
    private apiService: ApiService,
    private userService: UserService
  ) {}

  getCompareProducts() {
    // const url = `products/compareProducts?fields=DEFAULT`;
    //return this.apiService.get(url)
    return of(this.data);
  }
}
