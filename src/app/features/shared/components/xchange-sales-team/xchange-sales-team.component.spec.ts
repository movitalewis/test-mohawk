import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XchangeSalesTeamComponent } from './xchange-sales-team.component';

describe('XchangeSalesTeamComponent', () => {
  let component: XchangeSalesTeamComponent;
  let fixture: ComponentFixture<XchangeSalesTeamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ XchangeSalesTeamComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(XchangeSalesTeamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
