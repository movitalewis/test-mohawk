import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import {
  Config,
  Columns,
  DefaultConfig,
  API,
  APIDefinition,
} from "ngx-easy-table";
import { BreadcrumbItems } from "src/app/features/shared/interfaces";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";

import { ManagementService } from "../../services/management.service";
import { ActivatedRoute, Router } from "@angular/router";
import { StorageService } from "src/app/features/http-services/storage.service";
import { TabHeadingDirective } from "ngx-bootstrap/tabs";
import { FormBuilder, FormGroup } from "@angular/forms";
@Component({
    selector: "app-manage-users",
    templateUrl: "./manage-users.component.html",
    styleUrls: ["./manage-users.component.scss"],
    standalone: false
})
export class ManageUsersComponent implements OnInit {
  modalRef!: BsModalRef;
  infoMessage: boolean = false;
  public userEmail: any;
  public checkStatus: any;
  public userStatus: any;
  public alertBox: any;
  visible: boolean = false;
  @ViewChild("table", { static: true }) table!: APIDefinition;
  userPermissionFilter: any;
  permissionOptions: any;
  originalData: any;
  isSalesPerson: boolean = false;
  searchText: any = "";
  invoiceDollar = {
    src: "/assets/icons/dollar-invoice-icon.svg",
    alt: "Image with a dollar sign inside of a document",
  };
  sortCode: any = "desc";
  sortyBy: any = "name";
  userPermission: any = null;
  defaultEvent: any = {
    event: "onOrder",
    value: {
      key: "name",
      order: "asc"
    }
  };
  totalResults: any = 0;
  status: string = 'active';

  constructor(
    private modalService: BsModalService,
    private managementService: ManagementService,
    private route: ActivatedRoute,
    private storageService: StorageService,
    private router: Router,
    private fb: FormBuilder
  ) {}

  removeDoumentModal(template3: TemplateRef<any>) {
    // this.modalRef = this.modalService.show(template);
    this.modalRef = this.modalService.show(template3, {
      id: 1,
      class: "modal-lg modal-dialog-centered",
      backdrop: "static",
      keyboard: false,
    });
  }

  breadcrumbItems: BreadcrumbItems = [
    {
      name: "Home",
      path: "/commercial",
      active: false,
    },

    {
      name: "Your Company",
      path: "/",
      active: true,
    },
  ];

  public configuration1!: Config;
  public spinnerLoading = false;
  public columns1!: Columns[];
  public data: any = [];
  public page: any = [];

  permissionsFilterForm!: FormGroup;
  userAuthorizationGroups = [
    {
      id: 1,
      name: "Product Order Manager",
      options: [
        { name: "Existing Order Inquiry", value: "existingOrderInquiryGroup" },
        {
          name: "Check Product Availability",
          value: "checkProductAvailabilityGroup",
        },
        {
          name: "View, Create, Extend & Delete Reserves",
          value: "changeReservesGroup",
        },
        {
          name: "Product Order Entry (Create, Edit & Cancel)",
          value: "changeProductOrderEntryGroup",
        },
        { name: "Special Goods", value: "specialGoodsGroup" },
      ],
    },
    {
      id: 2,
      name: "Sample Order Manager",
      options: [
        {
          name: "Existing Sample Order Inquiry",
          value: "existingSampleOrderInquiryGroup",
        },
        { name: "Sample Order Entry", value: "sampleOrderEntryGroup" },
      ],
    },
    {
      id: 3,
      name: "Custom Rug Program",
      options: [
        { name: "Custom Rug Quote", value: "customRugQuoteGroup" },
        { name: "Custom Rug Order Entry", value: "customRugOrderEntryGroup" },
      ],
    },
    {
      id: 4,
      name: "Claims Management",
      options: [
        { name: "Claims Entry", value: "claimsEntryGroup" },
        {
          name: "Existing Claims Inquiry",
          value: "existingClaimsInquiryGroup",
        },
      ],
    },
    {
      id: 5,
      name: "Financials",
      options: [
        { name: "Invoice Inquiry", value: "invoiceInquiryGroup" },
        { name: "Receivables Inquiry", value: "receivablesInquiryGroup" },
        { name: "Pay Bills", value: "payBillsGroup" },
        { name: "Bank Account Setup", value: "bankAccountSetupGroup" },
        { name: "Earning Statements", value: "earningStatementsGroup" },
        { name: "Account Statements", value: "accountStatementsGroup" },
        { name: "Recent Payments", value: "viewPaymentsGroup" },
      ],
    },
    {
      id: 6,
      name: "Pricing",
      options: [
        {
          name: "Pricing Visibility & Inquiry",
          value: "pricingVisibilityAndInquiryGroup",
        },
        { name: "Pricing Download", value: "pricingDownloadGroup" },
        // { name: "Pricing Download Setup", value: "pricingDownloadSetupGroup" },
      ],
    },
    {
      id: 7,
      name: "Mohawk Today",
      options: [
        { name: "Co-op", value: "coopGroup" },
        {
          name: "Manage Leads & Lead Center",
          value: "manageLeadsAndLeadCenterGroup",
        },
        {
          name: "Retail Storefront Locator",
          value: "retailStorefrontLocatorGroup",
        },
        {
          name: "Mohawk Infinite Rewards",
          value: "mohawkInfiniteRewardsGroup",
        },
        { name: "Promotions", value: "promotionsGroup" },
      ],
    },
  ];
  ngOnInit(): void {
    this.configuration1 = { ...DefaultConfig };
    this.configuration1.checkboxes = false;
    this.configuration1.tableLayout.striped = true;
    this.configuration1.tableLayout.hover = false;
    this.configuration1.paginationRangeEnabled = false;
    this.configuration1.paginationEnabled = false;
    this.configuration1.threeWaySort = true;
    this.columns1 = [
      {
        key: "name",
        title: "Name",
        width: '20%',
        cssClass: { includeHeader: true, name: "sorting-arrow" },
      },
      {
        key: "uid",
        title: "Email",
        width: '25%',
        cssClass: { includeHeader: true, name: "sorting-arrow" },
      },
      {
        key: "primaryRole",
        title: "Primary Role",
        width: '20%',
        orderEnabled: false,
      },
      {
        key: "active",
        title: "Status",
        width: '20%',
        orderEnabled: false,
        // cssClass: { includeHeader: true, name: "sorting-arrow" },
      },
      // { key: "delete", title: "Change Status" },
    ];
    this.onsort(this.defaultEvent);
    this.storageService.getItem("userInfo").subscribe((response: any) => {
      this.isSalesPerson = response?.isSalesPerson || response?.isSalesOps;
    });

    this.permissionsFilterForm = this.fb.group({
      permission: null,
      children: null,
    });

    this.permissionsFilterForm
      .get("permission")
      ?.valueChanges.subscribe((id: number) => {
        if (id) {
          this.permissionOptions = this.userAuthorizationGroups.filter(
            (group: any) => group.id === id
          )[0].options;
          this.userPermission = null;
          this.permissionsFilterForm.get("children")?.setValue(null);
        } else {
          this.userPermission = null;
          this.permissionsFilterForm.get("children")?.setValue(null);
        }
      });
  }

  getUsers() {
    this.managementService.progressShow('manageUser')
    let params = {
      searchCustomerId: this.searchText,
      sortBy: this.sortyBy,
      sortCode: this.sortCode,
      pageIndex: this.pageIndex - 1,
      pageItemSize: this.tableItemsSize,
      userPermissionId: this.userPermission == null ? "" : this.userPermission,
      paramFlag:true,
      status: this.status
    }
    this.data = [];
    this.totalResults = 0;
    this.spinnerLoading = true;
    this.managementService.getCustomerList(params).subscribe(
      (res) => {
        this.managementService.progressHide();
        this.data = res.body?.users || [];
        this.originalData = this.data;
        this.page = res.body?.pagination;
        this.totalResults = res.body?.pagination?.totalResults || 0;
        this.startValue =
          this.pageIndex * this.tableItemsSize - (this.tableItemsSize - 1);
        this.lastValue = this.startValue + this.tableItemsSize - 1;
        this.lastValue =
          this.lastValue > this.totalResults ? this.totalResults : this.lastValue;
      },
      (err: any) => {
        this.managementService.progressHide()
      }
    );
  }
  onChangeUserPermission(event: any) {
    if (!event || event == undefined) {
      this.data = this.originalData;
      this.userPermission = null;
    } else {
      this.userPermission = event;
      this.pageIndex = 1;
      this.getUsers();
      // this.spinnerLoading = true;
      // this.managementService.filterUsersByPermission(event).subscribe((res) => {
      //   this.data = res?.body?.users;
      //   this.spinnerLoading = false;
      // });
    }
  }

  deleteUser() {
    var email = this.userEmail;
    if (this.checkStatus == true) {
      this.managementService.disableUser(email).subscribe((res: any) => {
        this.getUsers();
        this.visible = true;
        this.alertBox = email + " " + "has been Disabled";
        this.modalRef!.hide();
      }),
        (err: any) => { this.managementService.progressHide();};
    } else {
      this.managementService.enableUser(email).subscribe((res: any) => {
        this.getUsers();
        this.visible = true;
        this.alertBox = email + " " + "has been Enabled";
        this.modalRef!.hide();
        this.managementService.progressHide();
      }),
        (err: any) => {  this.managementService.progressHide();};
    }
  }
  onSelect(uid: any, status: any) {
    this.userEmail = uid;
    this.checkStatus = status;
    if (this.checkStatus == true) {
      this.userStatus = "Disable";
    } else {
      this.userStatus = "Enable";
    }
  }
  onChange(event: any): void {
    // let searchValue = event.target?.value;
    this.searchText = event.toLowerCase();
    this.pageIndex = 1;
    this.getUsers();
    // if (searchValue && searchValue.length > 2) {
    // this.spinnerLoading = true;
    // this.managementService.searchUsers(this.searchText).subscribe({
    //   next: (res) => {
    //     this.data = res.body?.users || [];
    //     this.spinnerLoading = false;
    //   },
    //   error: (any) => {
    //     this.spinnerLoading = false;
    //   },
    // });
    // } else {
    //   this.data = this.originalData;
    // }
  }

  onRestoreList() {
    this.searchText = "";
    this.data = this.originalData;
    this.permissionsFilterForm.get("permission")?.setValue(null);
    this.permissionsFilterForm.get("children")?.setValue(null);
    this.pageIndex = 1;
    this.status = 'active';
    this.onsort(this.defaultEvent);
  }
  //Table Pagination Logic
  pageIndex: number = 1;
  tableItemsSize: number = 10;
  startValue: number =
    this.pageIndex * this.tableItemsSize - (this.tableItemsSize - 1);
  lastValue: number = this.startValue + this.tableItemsSize - 1;
  onTableDataChange(event: any) {
    this.pageIndex = event;
    if (0 == event) {
      this.pageIndex = 1;
    }
    this.startValue =
      this.pageIndex * this.tableItemsSize - (this.tableItemsSize - 1);
    this.lastValue = this.startValue + this.tableItemsSize - 1;
    this.lastValue =
      this.lastValue > this.totalResults ? this.totalResults : this.lastValue;
    this.getUsers();
  }
  currentSortOrder: "asc" | "desc" = "asc";
  currentSortColumn: string = "name";
  sorting(column: string) {
    if (this.currentSortColumn === column) {
      this.currentSortOrder = this.currentSortOrder === "asc" ? "desc" : "asc";
    } else {
      this.currentSortColumn = column;
      this.currentSortOrder = "asc";
    }
    this.data.sort((a: any, b: any) => {
      const aValue = a[column];
      const bValue = b[column];

      if (this.currentSortOrder === "asc") {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  }
  onsort(e: any) {
    if (e?.event == "onOrder") {
      this.sortyBy = e?.value?.key;
      e.value.order = this.sortCode == "asc" ? "desc" : "asc";
      this.sortCode = e?.value?.order;
      this.pageIndex = 1;
      this.getUsers();
      this.columns1.map((item: any) => {
        if (item.key === e?.value?.key && item.hasOwnProperty("cssClass")) {
          if (e?.value?.order == "asc") {
            item.cssClass = {
              ...{},
              ...{ includeHeader: true, name: "sorting-arrow-active" },
            };
          } else if (e?.value?.order == "desc") {
            item.cssClass = {
              ...{},
              ...{ includeHeader: true, name: "sorting-arrow-down-icon" },
            };
          }
        } else if (item.hasOwnProperty("cssClass")) {
          item.cssClass = {
            ...{},
            ...{ includeHeader: true, name: "sorting-arrow" },
          };
        }
      });
    }
  }  
  onChangeStatus(e: any) {
    this.sortCode = "";
    this.onsort(this.defaultEvent)
  }
}
