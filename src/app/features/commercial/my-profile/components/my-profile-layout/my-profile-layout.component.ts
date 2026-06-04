import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { BreadcrumbItems } from "src/app/features/shared/interfaces";

@Component({
    selector: "app-my-profile-layout",
    templateUrl: "./my-profile-layout.component.html",
    styleUrls: ["./my-profile-layout.component.scss"],
    standalone: false
})
export class MyProfileLayoutComponent implements OnInit, OnDestroy {
  breadcrumbItems: BreadcrumbItems = [
    {
      name: "Home",
      path: "/residential",
      active: false,
    },
    {
      name: "My Profile",
      path: " ",
      active: true,
    },
  ];

  navigation: Array<any> = [
    {
      name: "Profile",
      path: "profile",
    },
    {
      name: "Shipping Preferences",
      path: "shipping-preferences",
    },
    {
      name: "Billing Address",
      path: "billing-address",
    },
    {
      name: "Notification",
      path: "notification-preferences",
    },
    // {
    //   name: "Email Subscriptions",
    //   path: "email-subscriptions",
    // },
    {
      name: "Default Storefront",
      path: "default-front-store",
    },
  ];
  selectedmenuItem: any = "Profile";

  ngOnChanges() {}

  constructor(private ar: ActivatedRoute, private r: Router) {
    this.r.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const data: any = this.ar.snapshot.firstChild?.data;
        if (data && data.component) {
          this.breadcrumbItems[this.breadcrumbItems.length - 1]["name"] =
            data.name;
          this.selectedmenuItem = data.name;
        }
      }
    });
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }
  ngOnInit(): void {
    this.isMobile = window.innerWidth <= 991;
    window.addEventListener("resize", this.onResize);
  }
  ngOnDestroy(): void {
    window.removeEventListener("resize", this.onResize);
  }
  private onResize = (): void => {
    this.isMobile = window.innerWidth <= 991;
  };
  isMobile: boolean | any;
  isDropdownOpen: boolean | any;
  closeDropdown() {
    this.isDropdownOpen = false;
  }
}
