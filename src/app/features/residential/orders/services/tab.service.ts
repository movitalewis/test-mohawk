import { Injectable } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { BehaviorSubject, filter, Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class TabService {
  private _activeTabIndex = new BehaviorSubject<number | null>(null);
  activeTabIndex$: Observable<number | null> =
    this._activeTabIndex.asObservable();
  comingFromOrderpage: any;

  setActiveTabIndex(index: number) {
    this._activeTabIndex.next(index);
  }
  constructor(private router: Router) {
    this.router.events
      .pipe(filter((event: any) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        if (!event.url.includes("/orders")) {
          this.setFlatFromHistory(false);
          this.comingFromOrderpage = false;
        }
      });
  }
  private selectedTabId = new BehaviorSubject<number>(0);
  selectedTabId$ = this.selectedTabId.asObservable();

  setSelectedTabId(tabId: number, flag: boolean) {
    this.selectedTabId.next(tabId);
    this.historyFlag = flag;
    this.comingFromOrderpage = true;
  }
  setFlatFromHistory(flag: boolean) {
    this.historyFlag = flag;
  }
  comingFromOrderpages() {
    return this.comingFromOrderpage;
  }
  historyFlag: boolean = false;
  getSelectedTabId() {
    if (this.historyFlag === true) {
      return this.selectedTabId.getValue();
    } else {
      return 0;
    }
  }
}
