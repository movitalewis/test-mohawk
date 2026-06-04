import { isPlatformBrowser } from "@angular/common";
import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
import { BsModalRef, BsModalService, ModalOptions } from "ngx-bootstrap/modal";
import { interval, Subscription } from "rxjs";
import { ConfirmationDialogComponent } from "../../components/confirmation-dialog/confirmation-dialog.component";
import { SwitchTabModalComponent } from "../../components/switch-tab-modal/switch-tab-modal.component";
import { ActivityService } from "./activity.service";
import { TokenService } from "src/app/features/http-services/token.service";

@Injectable({
  providedIn: "root",
})
export class ActiveTabService {
  isBrowser: boolean;
  sessionID: string | null = null;
  activeID: string | null = null;
  listenerActive = false;
  activeInterval: Subscription | undefined;
  modalRef?: BsModalRef;
  sessionCreated: number;

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private modalService: BsModalService,
    private tokenService: TokenService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.sessionCreated = Date.now();

    if (this.isBrowser) {
      this.activeID = localStorage.getItem("activeID");
      this.sessionID = sessionStorage.getItem("sessionID");
      localStorage.setItem("sessionCreated", this.sessionCreated.toString());
      this.validateSession();
    }
  }

  validateSession() {
    if (this.activeID === null) {
      this.createNewSession();
    }
    if (this.isValidTab()) {
      this.setListeners();
    } else {
      if (this.thereIsAnActiveTab()) {
        this.openSwitchTabModal();
      } else {
        this.createNewSession();
      }
    }
  }
  createNewSession() {
    this.storeID(this.generateID());
    this.setListeners();
  }
  thereIsAnActiveTab(): boolean {
    let lastActiveTime = Number(localStorage.getItem("lastActiveTime"));
    if (lastActiveTime === null) return false;
    let currentTime = Date.now() / 1000;
    return currentTime - lastActiveTime < 5;
  }

  openSwitchTabModal() {
    if (!this.tokenService.hasToken()) {
      this.tokenService.tokenGenerated.subscribe(() =>
        this.openSwitchTabModal()
      );
      return;
    }
    const initialState: ModalOptions = {
      id: "switchtab",
      backdrop: true,
      ignoreBackdropClick: true,
      class: "modal-md modal-dialog-centered",
      initialState: {
        onAction: () => {
          this.createNewSession();
        },
      },
    };

    this.modalRef = this.modalService.show(
      SwitchTabModalComponent,
      initialState
    );
  }

  setListeners() {
    if (!this.listenerActive) {
      this.activeInterval = interval(1001).subscribe(() => {
        localStorage.setItem("lastActiveTime", (Date.now() / 1000).toString());
      });
      window.addEventListener("storage", this.storageEventHandler);
      this.listenerActive = true;
    }
  }
  storageEventHandler = (event: StorageEvent) => {
    if (event.key === "activeID") {
      this.activeID = event.newValue;
      if (!this.isValidTab()) {
        this.removeListeners();
        this.openSwitchTabModal();
      }
    }
    if (event.key === "sessionCreated") {
      this.createNewSession();
    }
  };
  removeListeners() {
    this.activeInterval?.unsubscribe();
    window.removeEventListener("storage", this.storageEventHandler);
    this.listenerActive = false;
  }

  storeID(id: string) {
    this.activeID = id;
    this.sessionID = id;
    localStorage.setItem("activeID", id);
    sessionStorage.setItem("sessionID", id);
  }
  generateID(): string {
    return Date.now().toString(36);
  }
  isValidTab(): boolean {
    return this.activeID === this.sessionID;
  }
}
