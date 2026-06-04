import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SharedModule } from 'src/app/features/shared/shared.module';
import { AccommodationReturnComponent } from './accommodation-return.component';



describe('FreightClaimComponent', () => {
  let component: AccommodationReturnComponent;
  let fixture: ComponentFixture<AccommodationReturnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [AccommodationReturnComponent],
    imports: [SharedModule, ReactiveFormsModule, FormsModule, RouterTestingModule],
    providers: [provideHttpClient(withInterceptorsFromDi())]
})
    .compileComponents();

    fixture = TestBed.createComponent(AccommodationReturnComponent);
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
