import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DimensionFiltersComponent } from './dimension-filters.component';

describe('DimensionFiltersComponent', () => {
  let component: DimensionFiltersComponent;
  let fixture: ComponentFixture<DimensionFiltersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DimensionFiltersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DimensionFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
