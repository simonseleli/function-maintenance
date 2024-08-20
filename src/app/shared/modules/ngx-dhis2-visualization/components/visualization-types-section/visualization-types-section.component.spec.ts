import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { VisualizationTypesSectionComponent } from './visualization-types-section.component';

describe('VisualizationTypesSectionComponent', () => {
  let component: VisualizationTypesSectionComponent;
  let fixture: ComponentFixture<VisualizationTypesSectionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ VisualizationTypesSectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VisualizationTypesSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
