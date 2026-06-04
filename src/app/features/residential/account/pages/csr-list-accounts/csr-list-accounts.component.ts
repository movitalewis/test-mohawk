import {
  Component,
  ElementRef,
  OnInit,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import {
  API,
  BaseComponent,
  Columns,
  Config,
  DefaultConfig,
  TableModule,
} from "ngx-easy-table";
import { ManagementService } from "../../../company/services/management.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Account } from "src/app/features/shared/interfaces/company-user.interface";
import { AccountService } from "../../services/account.service";

@Component({
    selector: "app-csr-list-accounts",
    templateUrl: "./csr-list-accounts.component.html",
    styleUrls: ["./csr-list-accounts.component.scss"],
    standalone: false
})
export class CsrListAccountsComponent implements OnInit {
  public configuration!: Config;
  public configuration1!: Config;
  public configuration2!: Config;
  public columns!: Columns[];
  public columns1!: Columns[];
  public columns2!: Columns[];
  public data: any = [];
  public data1: Account[] = [];
  public data2: any[] = [];
  public selected = new Set<any>();
  public selected1 = new Set<any>();
  public deactivateAlertInfo = "You have unsaved changes. Do you want to leave without saving?";
  disableAddBtn = false;
  accountsModified = false;
  searchUserForm!: FormGroup;
  loading: boolean = false;
  alertData: any = {
    message: "success",
  };
  alertType: any = "success";
  alertTrigger: any = false;
  alertTriggers: any = false;
  @ViewChild("searchTable") searchTable!: BaseComponent;
  @ViewChild("scrollToTop", { read: ElementRef }) scrollToTop: any;  
  isMtAdvertising: boolean = false;
  isMtDistributor: boolean = false;

  modalRef?: BsModalRef;
  showNoResultsMsg: boolean = false;
  constructor(
    private modalService: BsModalService,
    public bsModalRef: BsModalRef,
    private mgmtService: ManagementService,
    private fb: FormBuilder,
    private accountService: AccountService
  ) {}

  ngOnInit(): void {
    this.setSearchForm();
    this.configuration = { ...DefaultConfig };
    this.configuration.checkboxes = false;
    this.configuration.tableLayout.hover = false;
    this.configuration.paginationRangeEnabled = false;
    this.configuration.paginationEnabled = false;
    this.columns = [
      { key: "email", title: "Email" },
      { key: "firstName", title: "First Name" },
      { key: "lastName", title: "Last Name" },
      // { key: "active", title: "Active" },
    ];

    this.configuration1 = { ...DefaultConfig };
    this.configuration1.checkboxes = true;
    this.configuration1.tableLayout.hover = false;
    this.configuration1.paginationRangeEnabled = false;
    this.configuration1.paginationEnabled =
      this.data1.length > 10 ? true : false;
    this.columns1 = [
      { key: "account", title: "Account", width: "20%" },
      { key: "address", title: "Address", width: "65%" },
      { key: "active", title: "Active", width: "15%" },
      // { key: "allowSales", title: "Allow Sales", width: "10%" },
    ];
    this.configuration2 = { ...DefaultConfig };
    this.configuration2.checkboxes = true;
    this.configuration2.tableLayout.hover = false;
    this.configuration2.paginationRangeEnabled = false;
    this.configuration2.paginationEnabled =
      this.data2.length > 10 ? true : false;
    this.columns2 = [
      { key: "account", title: "Account", width: "20%" },
      { key: "address", title: "Address", width: "65%" },
      { key: "active", title: "Active", width: "15%" },
      // { key: "allowSales", title: "Allow Sales", width: "10%" },
    ];
  }

  setSearchForm() {
    this.searchUserForm = this.fb.group({
      userEmail: [
        "",
        [
          Validators.required,
          Validators.email,
          Validators.pattern(
            /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          ),
        ],
      ],
    });
  }
  
  onSearchUser(data: any) {
    this.accountService.progressShow('accountSearch');
    this.mgmtService
      .getUserById(data.userEmail.toLowerCase())
      .subscribe((res: any) => {
        if (res.body) {
          this.data = [res?.body];
          this.showNoResultsMsg = false;
          this.isMtAdvertising = res?.body?.isMtAdvertising || false;
          this.isMtDistributor = res?.body?.isMtDistributor || false;
          this.setColumns(this.isMtAdvertising || this.isMtDistributor);
          console.log('user data', this.data);
        } else {
          this.data = [];
          this.showNoResultsMsg = true;
        }
      },(err)=>{
        this.accountService.progressHide();
      });
    this.mgmtService
      .getCompanyUserAccountList(data.userEmail.toLowerCase())
      .subscribe((res) => {
        this.accountService.progressHide();
        this.data1 = [];
        this.selected.clear();
        if (res.body) {
          this.data1 = res?.body?.map((account: any) => {
            return {
              account: account?.uid,
              address: account?.addresses[0].formattedAddress,
              active: account?.active,
              allowSales: account?.builderOrderAllowed,
            };
          });
        } else {
          this.data1 = [];
        }
      }, () => {
        this.accountService.progressHide();
      });
  }

  onSearchAccount(value: any) {
    if (value) {
      this.accountService.progressShow('accountSearch');
      this.data2 = [];
      this.configuration2.isLoading = true;
      this.mgmtService.getSearchAccount(value).subscribe(
        (res: any) => {
          this.accountService.progressHide();
          this.data2 = [];
          this.selected1.clear();
          this.data2 = res?.body?.map((account: any) => {
            const isExistItem: boolean =
              this.data1.filter((d) => d.account === account?.uid).length > 0;
            return {
              account: account?.uid,
              address: account?.addresses[0].formattedAddress,
              active: account?.active,
              allowSales: account?.builderOrderAllowed,
              selected: isExistItem,
              disabled: isExistItem,
            };
          });
          this.setSelected1();
          this.configuration2.isLoading = false;
        },
        (err) => {
          this.accountService.progressHide();
          this.configuration2.isLoading = false;
        }
      );
    }
  }

  onChange(event: any, dataSet: Account[]): void {
    switch (event.event) {
      case "onCheckboxSelect":
        if (this.selected.has(event?.value?.row?.account)) {
          this.selected.delete(event?.value?.row?.account);
        } else {
          this.selected.add(event?.value?.row?.account);
        }
        break;
      case "onSelectAll":
        if (!event.value) this.selected.clear();
        else {
          dataSet.forEach((item: any) => {
            this.selected.add(item?.account);
          });
        }
        break;
    }
  }
  onChange1(event: any, clickType: string, row: any = null): void {
    switch (clickType) {
      case "onCheckboxSelect":
        if (this.selected1.has(event?.value?.row?.account)) {
          this.selected1.delete(event?.value?.row?.account);
        } else {
          this.selected1.add(event?.value?.row?.account);
        }
        break;
      case "onSelectAll":
        // if (!event.value) this.selected1.clear();
        // else{
        //   dataSet.forEach((item:any) => {
        //     this.selected1.add(item?.account);
        //   });
        // }
        this.data2.map((item: any) => {
          if (item.disabled === false) {
            item.selected = event.target.checked;
          }
        });
        break;
      case "onClick":
        row.selected = event.target.checked;
        break;
    }
    this.setSelected1();
  }

  setSelected1() {
    this.selected1.clear();
    this.data2.forEach((item: any) => {
      if (item.selected === true) {
        this.selected1.add(item?.account);
      }
    });
    this.disableAddBtn = this.selected1.size === this.data2.filter(item=> item.disabled == true).length;
  }

  onRemoveAccount() {
    this.data1 = this.data1.filter((d1: any) => !this.selected.has(d1.account));
    this.selected.clear();
    this.accountsModified = true;
    // let accountIDs: any[] = [];
    // this.selected.forEach((val) => {
    //   accountIDs.push(this.data1[val].account);
    // });
    // this.data1 = this.data1.filter(
    //   (item) => !accountIDs.includes(item.account)
    // );
  }
  onAddAccount() {
    let accountIDs: any[] = [];
    // if (!this.data1.some((d1: any) => this.selected1.has(d1.account))) {
    accountIDs = this.data2.filter(
      (item: any) => item.selected === true && item.disabled === false
    );
    this.data1 = [...this.data1, ...accountIDs];
    this.bsModalRef.hide();
    this.selected1.clear();
    this.accountsModified = true;
    // }
    // else {
    //   this.alertData = {
    //     message: "Selected Account is already added.",
    //   };
    //   this.alertType = "warning";
    //   this.alertTriggers = true;
    //   this.hideAlert();
    //   }
  }

  onShowModal(template: TemplateRef<any>) {
    this.bsModalRef = this.modalService.show(template, {
      id: "accountSearch",
      class: "modal-lg modal-dialog-centered",
      backdrop: "static",
      keyboard: false,
    });
    // clears checkboxes when selectAll is checked
    // this.searchTable.isSelected = false;

    // for (let row of this.selected) {
    //   // it doesn't work unless you do it twice :(
    //   this.searchTable.toggleCheckbox(row);
    //   setTimeout(() => {
    //     this.searchTable.toggleCheckbox(row);
    //   }, 100);
    // }
    this.data2 = [];
    this.selected1.clear();
  }

  onModalClose() {
    this.bsModalRef.hide();
    this.selected1.clear();
    // this.searchTable.isSelected = false;
  }

  onSubmit() {
    // this.loading = true;
    let payload: any;
    let accountsArr: any[] = [];
    let accountsStr: string = "";
    this.data1.map((item: any) => {
      accountsArr.push(item.account);
    });

    // accountsArr =this.data1.filter((d1: any)=> this.selected.has(d1.account)).flatMap((item: any)=>[item.account]);
    accountsStr = accountsArr.join(",");
    payload = {
      user: this.data[0].email,
      selectedAccounts: accountsStr !== "" ? accountsStr : "EMPTY_B2BUNIT",
    };
    this.accountService.progressShow('savingAccounts');
    this.mgmtService.editAccountsByCsr(payload).subscribe({
      next: (res) => {
        this.accountService.progressHide();
        this.loading = false;
        this.scrollToTop.nativeElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        });
        this.alertData = {
          message: res?.body.message,
        };
        this.alertType = "success";
        this.alertTrigger = true;
        this.hideAlert();
        const email = this.searchUserForm.get("userEmail")?.value;
        if (email) {
          this.onSearchUser({ userEmail: email });
        }
        this.data = [];
        this.data1 = [];
        this.data2 = [];
        this.selected.clear();
        this.selected1.clear();
        this.searchTable.isSelected = false;
        this.accountsModified = false;
      },
      error: (err) => {
        this.accountService.progressHide();
        this.loading = false;
        this.scrollToTop.nativeElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        });
        // this.alertData = {
        //   message: "There was an issue updating the user.",
        // };
        // this.alertType = "danger";
        // this.alertTrigger = true;
        ////////////Temporary until api is fixed///////////////
        this.alertData = {
          message: "Something went wrong!",
        };
        this.alertType = "danger";
        this.alertTrigger = true;
        this.hideAlert();
        // this.searchUserForm.get("userEmail")?.reset();
        // this.data = [];
        // this.data1 = [];
        // this.data2 = [];
      },
    });
  }

  hideAlert() {
    setTimeout(() => {
      this.alertTrigger = false;
      this.alertTriggers = false;
    }, 4000);
  }

  onDeactivate(){
    return this.accountsModified;
  }
  setColumns(flag: boolean) {
    this.columns = this.columns.filter(col => col.title !== 'Active' && col.title !== 'Account Status');
    if (flag) {
      this.columns = [...this.columns,
      { key: "active", title: "Account Status" },
      ];
    } else {
      this.columns = [...this.columns,
      { key: "active", title: "Active" },
      ];
    }
  }
  onStatusChange(event: any, row: any) {
    const isChecked = event.target.checked;
    row.active = isChecked;
    let payload: any = {
      user: this.data[0].email,
      active: row.active,
    };
    this.accountService.progressShow('updateAccount');
    this.mgmtService.editAccountsByCsr(payload).subscribe({
      next: (res) => {
        this.accountService.progressHide();
        this.loading = false;
        this.scrollToTop.nativeElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        });
        this.alertData = {
          message: res?.body.message,
        };
        this.alertType = "success";
        this.alertTrigger = true;
        // this.hideAlert();
        const email = this.searchUserForm.get("userEmail")?.value;
        if (email) {
          this.onSearchUser({ userEmail: email });
        }
      },
      error: (err) => {
        this.accountService.progressHide();
        this.loading = false;
        this.scrollToTop.nativeElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        });
        this.alertData = {
          message: "Something went wrong!",
        };
        this.alertType = "danger";
        this.alertTrigger = true;
        // this.hideAlert();
      },
    });
  }
}
