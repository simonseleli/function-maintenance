import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NgxDhis2DynamicDimensionComponent } from './ngx-dhis2-dynamic-dimension.component';

describe('NgxDhis2DynamicDimensionComponent', () => {
  let component: NgxDhis2DynamicDimensionComponent;
  let fixture: ComponentFixture<NgxDhis2DynamicDimensionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NgxDhis2DynamicDimensionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgxDhis2DynamicDimensionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
