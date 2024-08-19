import { ComponentFixture, TestBed, waitForAsync as  } from '@angular/core/testing';

import { VisualizationLegendComponent } from './visualization-legend.component';

describe('VisualizationLegendComponent', () => {
  let component: VisualizationLegendComponent;
  let fixture: ComponentFixture<VisualizationLegendComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ VisualizationLegendComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VisualizationLegendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
