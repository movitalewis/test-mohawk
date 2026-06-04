import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { WrongQuantityShortageComponent } from './wrong-quantity-shortage.component';



describe('FreightClaimComponent', () => {
  let component: WrongQuantityShortageComponent;
  let fixture: ComponentFixture<WrongQuantityShortageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [WrongQuantityShortageComponent],
    imports: [SharedModule, ReactiveFormsModule, FormsModule, RouterTestingModule],
    providers: [provideHttpClient(withInterceptorsFromDi())]
})
    .compileComponents();

    fixture = TestBed.createComponent(WrongQuantityShortageComponent);
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
