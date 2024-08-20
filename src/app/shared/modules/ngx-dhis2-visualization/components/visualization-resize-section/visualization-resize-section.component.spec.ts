import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { VisualizationResizeSectionComponent } from './visualization-resize-section.component';

describe('VisualizationResizeSectionComponent', () => {
  let component: VisualizationResizeSectionComponent;
  let fixture: ComponentFixture<VisualizationResizeSectionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ VisualizationResizeSectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VisualizationResizeSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
