import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { TaxBillingErrorComponent } from './tax-billing-error.component';



describe('FreightClaimComponent', () => {
  let component: TaxBillingErrorComponent;
  let fixture: ComponentFixture<TaxBillingErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [TaxBillingErrorComponent],
    imports: [SharedModule, ReactiveFormsModule, FormsModule, RouterTestingModule],
    providers: [provideHttpClient(withInterceptorsFromDi())]
})
    .compileComponents();

    fixture = TestBed.createComponent(TaxBillingErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it("should render the Container ", waitForAsync(() => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector(".container")).toBeTruthy();
    }));
    it("should render the ROw ", waitForAsync(() => {
      const compiled = fixture.debugElement.nativeElement;
      expect(compiled.querySelector(".row")).toBeTruthy();
      }));
});
