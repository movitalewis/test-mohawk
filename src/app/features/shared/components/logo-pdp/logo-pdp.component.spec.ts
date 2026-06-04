import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogoPdpComponent } from './logo-pdp.component';

describe('LogoComponent', () => {
  let component: LogoPdpComponent;
  let fixture: ComponentFixture<LogoPdpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LogoPdpComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogoPdpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
