import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import {} from '@angular/common/http/testing';
import { async, ComponentFixture, inject, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SharedModule } from 'src/app/features/shared/shared.module';

import { PlpSavedAddressComponent } from './plp-saved-address.component';

describe('PlpSavedAddressComponent', () => {
  let component: PlpSavedAddressComponent;
  let fixture: ComponentFixture<PlpSavedAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [PlpSavedAddressComponent],
    imports: [SharedModule, FormsModule, RouterTestingModule],
    providers: [BsModalService, BsModalRef, provideHttpClient(withInterceptorsFromDi())]
})
    .compileComponents();

    fixture = TestBed.createComponent(PlpSavedAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });



  // it('should call openSavedAddressModal() method for the forgot event', async(inject([BsModalService], (modalService: BsModalService) => {
  //   spyOn(component, 'openSavedAddressModal');
  //   component.openSavedAddressModal();
  //   component.bsModalRef.content.event.next({type: 'modal'});
  //   })));


    it('should render title in a h4 tag', async(() => {
    const fixture = TestBed.createComponent(PlpSavedAddressComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('h4').textContent).toContain('Saved Addresses');
    }));

    it('should', async(() => {
      spyOn(component, 'onHideModal');
    
      let button = fixture.debugElement.nativeElement.querySelector('button');
      button.click();
    
      fixture.whenStable().then(() => {
        expect(component.onHideModal).toHaveBeenCalled();
      });
    }));


    // it('should', fakeAsync(() => {
    //   spyOn(component, 'openOrderSamplesModal');
    
    //   let button = fixture.debugElement.nativeElement.querySelector('button');
    //   button.click();
    //   tick();
    //   expect(component.openOrderSamplesModal).toHaveBeenCalled();
    
    // }));


  it("should render the modal-body ", waitForAsync(() => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector(".modal-body")).toBeTruthy();
  }));

  it("should render the Row ", waitForAsync(() => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector(".row")).toBeTruthy();
  }));

  // it("should render the ModelTitle ", waitForAsync(() => {
  //   const compiled = fixture.nativeElement;
  //   expect(compiled.querySelector(".modal-title")).toBe('plpSavedAddress');
  // }));

  // it('check component name', () => {
  //   expect(component.componetName).toBe("plpSavedAddress");
  // });


  function fakeAsync(arg0: () => void): jasmine.ImplementationCallback | undefined {
    throw new Error("Function not implemented.");
  }
  
  function tick() {
    throw new Error("Function not implemented.");
  }



});
