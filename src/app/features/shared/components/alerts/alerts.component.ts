import { Component, Input, OnInit } from "@angular/core";

@Component({
    selector: "app-alerts",
    templateUrl: "./alerts.component.html",
    styleUrls: ["./alerts.component.scss"],
    standalone: false
})
export class AlertsComponent implements OnInit {
  @Input() alertData: any = {};
  @Input() alertType: any = {};
  data: any;
  alertVisible = true;

  constructor() {
    setTimeout(() => {
      // console.log("Triggered After 15000 Sec====>");
      this.alertVisible = false;
    }, 10000);
  }

  ngOnInit(): void {
    this.data = this.alertData;
    
  }
}
