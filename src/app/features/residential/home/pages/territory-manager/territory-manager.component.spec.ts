import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TerritoryManagerComponent } from './territory-manager.component';

describe('TerritoryManagerComponent', () => {
  let component: TerritoryManagerComponent;
  let fixture: ComponentFixture<TerritoryManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TerritoryManagerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TerritoryManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
