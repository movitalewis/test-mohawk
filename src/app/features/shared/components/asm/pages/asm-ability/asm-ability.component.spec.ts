import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsmAbilityComponent } from './asm-ability.component';

describe('AsmAbilityComponent', () => {
  let component: AsmAbilityComponent;
  let fixture: ComponentFixture<AsmAbilityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AsmAbilityComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsmAbilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
