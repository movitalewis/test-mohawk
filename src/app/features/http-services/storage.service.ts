import { isPlatformBrowser } from "@angular/common";
import { EventEmitter, Inject, Injectable, OnInit, PLATFORM_ID } from "@angular/core";
import { BehaviorSubject, from, Observable, of, switchMap } from "rxjs";
import { get, set, del, clear } from "idb-keyval";

@Injectable({
  providedIn: "root",
})
export class StorageService {
  private behaviorSubjects: Map<string, BehaviorSubject<any>>;
  selectedAccount = new BehaviorSubject<any>(null);
  cartData: any = {};
  userInfo: any = {};
  passKey: any = {};
  userPriceLabel = "";
  passwordKey = "";
  uid: any = "";
  selectedCloneOrders: any;
  inHouseAccountInfo: any;
  inspector = new BehaviorSubject(false);

  constructor(@Inject(PLATFORM_ID) protected platformID: Object) {
    this.behaviorSubjects = new Map<string, BehaviorSubject<any>>();
    this.getItem("miniCartCount").subscribe((res) => {
      this.cartData = res;
    });
    this.getItem("userInfo").subscribe((res) => {
      this.userInfo = res;
      this.userPriceLabel = res?.priceLabel;
    });
    this.getItem("passKey").subscribe((res) => {
      this.passKey = res;
      this.passwordKey = res?.passwordKey;
    });
    this.getItem("uid").subscribe((res) => {
      this.uid = res;
    });
    this.getItem("selectedCloneOrders").subscribe((res) => {
      this.selectedCloneOrders = res;
    });
    this.getItem("inHouseAccount").subscribe((res) => {
      this.inHouseAccountInfo = res;
    });
  }

  setselectedAccount(data: any) {
    this.selectedAccount.next(data);
  }
  getselectedAccount() {
    return this.selectedAccount.asObservable();
  }

  /**
   * Returns the behaviorSubject by identifier. If it's not handled a new one is created but not pre-filled with any value.
   * @param identifier The indexdb identifier
   */
  private getBehaviorSubject(identifier: string): BehaviorSubject<any> {
    let behaviorSubject = this.behaviorSubjects.get(identifier);
    if (!behaviorSubject) {
      behaviorSubject = new BehaviorSubject<any>(null);
      this.behaviorSubjects.set(identifier, behaviorSubject);
    }
    return behaviorSubject;
  }

  /**
   * Fetches an item from indexdb
   * @param identifier Identifier of the storage object. Can be anything but for common used objects have a look at TYPE-Identifiers
   */
  private fetchItem(identifier: string): Observable<any> {
    const behaviorSubject = this.getBehaviorSubject(identifier);
    return from(
      new Promise((resolve, reject) => {
        if (isPlatformBrowser(this.platformID)) {
          get(identifier).then((value: any) => {
            behaviorSubject.next(value);
            resolve(behaviorSubject);
          });
        } else {
          behaviorSubject.next(null);
          resolve(behaviorSubject);
        }
      })
    ).pipe(
      switchMap((result: any) => {
        return of(result);
      })
    );
  }

  /**
   * Gets an item from indexdb
   * @param identifier Identifier of the storage object. Can be anything but for common used objects have a look at TYPE-Identifiers
   */
  public getItem(identifier: string): Observable<any> {
    return this.fetchItem(identifier).pipe(
      switchMap((payload: any) => {
        return payload;
      })
    );
  }

  /**
   * Stores an item and emits the new value to all its subscribers
   * @param identifier indexdb identifier
   * @param object the object that should be stored.
   */
  public setItem(identifier: string, object: any): void {
    if (isPlatformBrowser(this.platformID)) {
      set(identifier, object).then(() => {
        this.getBehaviorSubject(identifier).next(object);
      });
    }
  }

  public removeItem(identifier: string): any {
    if (isPlatformBrowser(this.platformID)) {
      return new Promise((resolve) => {
        del(identifier).then(() => {
          this.getBehaviorSubject(identifier).next(null);
        });
        resolve(true);
      });
    }
  }

  /**
   * Clears the indexdb and tells all subscribers of all items that the value is now null.
   */
  public clear() {
    if (isPlatformBrowser(this.platformID)) {
      clear().then(() => {
        this.behaviorSubjects.forEach(
          (behaviorSubject: BehaviorSubject<any>) => {
            behaviorSubject.next(null);
          }
        );
      });
    }
  }

  uidForDuplicate = "";
  skipMultilogin:boolean = false;
  triggerClearUnit = new EventEmitter();
  handleTriggerClearUnit(){
    this.triggerClearUnit.emit();
  }
  
  updateUidForDuplicate(uid:any){
    this.uidForDuplicate = uid;
  }
}
