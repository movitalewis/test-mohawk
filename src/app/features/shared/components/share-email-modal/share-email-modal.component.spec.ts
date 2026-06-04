import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareEmailModalComponent } from './share-email-modal.component';

describe('ShareEmailModalComponent', () => {
  let component: ShareEmailModalComponent;
  let fixture: ComponentFixture<ShareEmailModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShareEmailModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShareEmailModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
