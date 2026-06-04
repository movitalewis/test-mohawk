import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { ComponentFixture, fakeAsync, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";
import { ApiService } from "src/app/features/http-services/api.service";
import { BankAccountService } from "../../services/bank-account.service";

import { AccountsListComponent } from "./accounts-list.component";

describe("AccountsListComponent", () => {
  let component: AccountsListComponent;
  let fixture: ComponentFixture<AccountsListComponent>;
  let router: Router;

  const fakeActivatedRoute = {
    snapshot: { data: {} },
  } as ActivatedRoute;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [AccountsListComponent],
    imports: [RouterModule, RouterTestingModule],
    providers: [
        BankAccountService,
        ApiService,
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

    fixture = TestBed.createComponent(AccountsListComponent);
    component = fixture.componentInstance;
    router = TestBed.get(Router);

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
  it("should render BANK ACCOUNTS title", () => {
    // const content = fixture.debugElement.query(By.css('class="name"')).nativeElement;
    // expect(content.textContent).toContain('BANK ACCOUNTS');
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector("h2").textContent).toContain("BANK ACCOUNTS");
  });
  it("should render Add Account button", () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector("button").textContent).toContain(
      "Add Account"
    );
  });
  it("should render Table", () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector("ngx-table").nativeElement).toBeTrue;
  });
  // it('navigate to "Add account" takes you to /add-account', fakeAsync(() => {
  //   router.navigate(["commercial/finance/bank/add-account"]).then(() => {
  //     expect(true).toBeUndefined();
  //   })
  // }));
});
