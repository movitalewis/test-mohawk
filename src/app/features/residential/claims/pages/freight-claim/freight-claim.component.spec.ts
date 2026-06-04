import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SharedModule } from 'src/app/features/shared/shared.module';

import { FreightClaimComponent } from './freight-claim.component';

describe('FreightClaimComponent', () => {
  let component: FreightClaimComponent;
  let fixture: ComponentFixture<FreightClaimComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [FreightClaimComponent],
    imports: [SharedModule, ReactiveFormsModule, FormsModule, RouterTestingModule],
    providers: [BsModalService, BsModalRef, provideHttpClient(withInterceptorsFromDi())]
})
    .compileComponents();

    fixture = TestBed.createComponent(FreightClaimComponent);
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
