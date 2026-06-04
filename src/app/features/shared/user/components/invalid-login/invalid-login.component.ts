import { Component, OnInit } from "@angular/core";
import { BsModalRef } from "ngx-bootstrap/modal";
import { SessionService } from "src/app/features/http-services/session.service";

@Component({
    selector: "app-invalid-login",
    templateUrl: "./invalid-login.component.html",
    styleUrls: ["./invalid-login.component.scss"],
    standalone: false
})
export class InvalidLoginComponent implements OnInit {
  

  constructor(
    private bsModalRef: BsModalRef,
    private sessionService: SessionService
  ) {}

  ngOnInit(): void {
 
  }

  onConfirm() {
    this.bsModalRef.hide();
    this.sessionService.logout();
  }

  
}
