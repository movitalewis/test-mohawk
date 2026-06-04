import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimComments } from './claim-comments';

describe('ClaimComments', () => {
  let component: ClaimComments;
  let fixture: ComponentFixture<ClaimComments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClaimComments]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClaimComments);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
