import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MapFilterSectionComponent } from './map-filter-section.component';

describe('MapFilterSectionComponent', () => {
  let component: MapFilterSectionComponent;
  let fixture: ComponentFixture<MapFilterSectionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MapFilterSectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapFilterSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
