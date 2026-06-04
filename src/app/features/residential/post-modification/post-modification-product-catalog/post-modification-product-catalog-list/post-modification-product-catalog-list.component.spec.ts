import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostModificationProductCatalogListComponent } from './post-modification-product-catalog-list.component';

describe('PostModificationProductCatalogListComponent', () => {
  let component: PostModificationProductCatalogListComponent;
  let fixture: ComponentFixture<PostModificationProductCatalogListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PostModificationProductCatalogListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostModificationProductCatalogListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
