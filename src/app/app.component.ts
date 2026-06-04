import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  NgZone,
  OnInit,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { SessionService } from "./features/http-services/session.service";
import { SharedService } from "./features/http-services/shared.service";
import { ActiveTabService } from "./features/shared/user/services/active-tab.service";
import { ActivityService } from "./features/shared/user/services/activity.service";
import { StorageService } from "./features/http-services/storage.service";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.scss"],
    standalone: false
})
export class AppComponent{
  title = "mohawk-xchange";

  @ViewChild("beforeExpired")
  beforeExpired!: TemplateRef<any>;

  @ViewChild("expired")
  expired!: TemplateRef<any>;
  @ViewChild("tokenExpired")
  tokenExpired!: TemplateRef<any>;
  seconds: number | undefined;
  @ViewChild('myBtn') myBtn!: ElementRef<HTMLButtonElement>;

  constructor(
    private activityService: ActivityService,
    private sessionService: SessionService,
  ) {
   
     console.log('Is in Angular zone?', NgZone.isInAngularZone());
  setTimeout(() => {
    console.log('After timeout — still in zone?', NgZone.isInAngularZone());
  });
    // debugger;
    activityService.secondsLeft.subscribe(
      (seconds) => (this.seconds = seconds)
    );
  }

   simulateMouseClick(element: HTMLElement) {
    // Create a real MouseEvent
    const event = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    });

    element.dispatchEvent(event); // 👈 dispatch the real click
  }
 
  ngAfterViewInit(): void {
    this.activityService.passTemplate(this.beforeExpired, this.expired);
    this.sessionService.passTemplate(this.tokenExpired);
  }
  continueSession() {
    this.activityService.continueSession();
  }
  endSession() {
    this.activityService.endSession();
  }
  signIn() {
    this.activityService.releaseSessionLock();
    this.sessionService.logout();
  }
  tokenSignIn(){
    this.sessionService.redirectLoginPage();
  }
}
