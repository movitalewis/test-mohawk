import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceDownloadComponent } from './price-download.component';

describe('PriceDownloadComponent', () => {
  let component: PriceDownloadComponent;
  let fixture: ComponentFixture<PriceDownloadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PriceDownloadComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PriceDownloadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
