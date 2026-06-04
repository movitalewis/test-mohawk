import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Router } from "@angular/router";
import { BreadcrumbItems } from "../../interfaces";

@Component({
    selector: "xchange-breadcrumb",
    templateUrl: "./xchange-breadcrumb.component.html",
    styleUrls: ["./xchange-breadcrumb.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class XchangeBreadcrumbComponent implements OnInit {
  @Input("breadcrumbItems") breadcrumbItems: BreadcrumbItems = [];
  @Output() breadcrumbClick = new EventEmitter();

  constructor(private router: Router) {
  }

  ngOnInit(): void {}
  navigateRoute(item: any) {
    if (item?.path) {
      this.router.navigateByUrl(item.path);
    } else {
      this.breadcrumbClick.emit(item);
    }
  }
}
