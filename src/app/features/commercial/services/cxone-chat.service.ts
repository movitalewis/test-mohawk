import { Injectable } from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";
import { take, filter } from "rxjs";
import { combineLatest } from "rxjs";
import { StorageService } from "../../http-services/storage.service";

declare const cxone: any;

@Injectable()
export class CxoneChatService {
  private initialized = false;
  private scriptElement: HTMLScriptElement | null = null;
  private chatLoaded = false;

  constructor(private storageService: StorageService, private router: Router) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        if (!event.urlAfterRedirects.startsWith("/commercial")) {
          this.destroy();
        }
      });
  }

  init(): void {
    if (this.initialized) {
      return;
    }
    this.initialized = true;
    this.storageService.getItem("userInfo").pipe(take(1)).subscribe((userInfo: any) => {
      if (!userInfo?.isCSR) {
        this.loadScript();
      }
    });
  }

  private loadScript(): void {
    (window as any).CXoneDfo = "cxone";
    (window as any)["cxone"] =
      (window as any)["cxone"] ||
      function () {
        ((window as any)["cxone"].q =
          (window as any)["cxone"].q || []).push(arguments);
      };
    (window as any)["cxone"].u =
      "https://web-modules-de-na1.niceincontact.com/loader/1/loader.js";

    this.scriptElement = document.createElement("script");
    this.scriptElement.type = "module";
    this.scriptElement.src =
      "https://web-modules-de-na1.niceincontact.com/loader/1/loader.js?" +
      Math.round(Date.now() / 1e3 / 3600);
    document.head.appendChild(this.scriptElement);

    this.chatLoaded = true;
    cxone("init", "5751");
    cxone("guide", "init");

    this.setCustomerFields();

    cxone("guide", "hidePreSurvey");
  }

  private setCustomerFields(): void {
    combineLatest([
      this.storageService.getItem("userInfo"),
      this.storageService.getItem("accountData"),
    ])
      .pipe(take(1))
      .subscribe(([userInfo, accountData]: [any, any]) => {
        const customerName = userInfo?.name || "";
        const username = userInfo?.uid || "";
        const accountNumber =
          userInfo?.orgUnit?.uid || accountData?.customerNumber || "";
        const accountName =
          userInfo?.orgUnit?.name || accountData?.accountName ||  "";
        console.log("Setting CXone chat customer fields:", 
          customerName,"-",
          username,"-",
          accountNumber,"-",
          accountName,
        );
        cxone("chat", "setCustomerName", customerName);
        cxone("chat", "setCaseCustomField", "username", username);
        cxone("chat", "setCaseCustomField", "account_number", accountNumber);
        cxone("chat", "setCaseCustomField", "account_name", accountName);
      });
  }

  destroy(): void {
    if (!this.chatLoaded) {
      return;
    }
    if (this.scriptElement) {
      this.scriptElement.remove();
      this.scriptElement = null;
    }
    // Remove CXOne injected widget elements from the DOM
    document.querySelectorAll('[id^="cxone"], [class^="cxone"]').forEach((el) => el.remove());
    delete (window as any).CXoneDfo;
    delete (window as any)["cxone"];
    this.initialized = false;
    this.chatLoaded = false;
  }
}
