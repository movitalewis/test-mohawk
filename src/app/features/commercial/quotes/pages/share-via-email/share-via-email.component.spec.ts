import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareViaEmailComponent } from './share-via-email.component';

describe('ShareViaEmailComponent', () => {
  let component: ShareViaEmailComponent;
  let fixture: ComponentFixture<ShareViaEmailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShareViaEmailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShareViaEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
