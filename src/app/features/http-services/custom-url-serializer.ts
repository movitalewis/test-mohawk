import { Injectable } from '@angular/core';
import { DefaultUrlSerializer, UrlTree } from '@angular/router';

@Injectable({
  providedIn: "root",
})
export class CustomURLSerializer extends DefaultUrlSerializer {
  constructor() {
    super();
  }
  
  override parse(url: string): UrlTree {
    return super.parse(url.toLowerCase());
  }
}
