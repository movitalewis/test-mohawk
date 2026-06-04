import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormBuilder, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { ActivatedRoute, RouterModule } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";
import { NgSelectModule } from "@ng-select/ng-select";
import { ApiService } from "src/app/features/http-services/api.service";
import { BankAccountService } from "../../services/bank-account.service";

import { AddAccountComponent } from "./add-account.component";

describe("AddAccountComponent", () => {
  let component: AddAccountComponent;
  let fixture: ComponentFixture<AddAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [AddAccountComponent],
    imports: [RouterModule,
        RouterTestingModule,
        FormsModule,
        ReactiveFormsModule,
        NgSelectModule],
    providers: [
        BankAccountService,
        ApiService,
        FormBuilder,
        {
            provide: ActivatedRoute,
            useValue: {
                snapshot: {
                    paramMap: {
                        get(): string {
                            return "123";
                        },
                    },
                },
            },
        },
        provideHttpClient(withInterceptorsFromDi()),
    ]
}).compileComponents();

    fixture = TestBed.createComponent(AddAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
  it("should render Add Bank Account title", () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector("h2").textContent).toContain(
      "Add Bank Account"
    );
  });
  it("should validate form", () => {
    component.addAccountForm.setValue({
      accountName: "",
      accountType: "invalidemail",
      bankInstitutionNumber: "",
      currency: "USD",
      bankRoutingNumber: "455",
      cnfrmBankRoutingNumber: "",
      accountNumber: "",
      cnfrmaccountNumber: "",
    });

    expect(component.addAccountForm.valid).toEqual(false);
  });
  it("should render Add Account button", () => {
    const compiled = fixture.debugElement.queryAll(By.css(".btn-primary"))[0]
      .nativeElement;
    expect(compiled.textContent).toContain("Add Account");
  });
  it("should render Cancel button", () => {
    // const compiled = fixture.debugElement.query(By.css('class="btn-primary"')).nativeElement;
    const compiled = fixture.debugElement.queryAll(
      By.css(".btn-outline-secondary")
    )[0].nativeElement;
    expect(compiled.textContent).toContain("Cancel");
  });
});
