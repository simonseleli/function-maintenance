import { ComponentFixture, TestBed, waitForAsync as  } from '@angular/core/testing';

import { FavoriteFilterComponent } from './favorite-filter.component';

describe('FavoriteFilterComponent', () => {
  let component: FavoriteFilterComponent;
  let fixture: ComponentFixture<FavoriteFilterComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FavoriteFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FavoriteFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
