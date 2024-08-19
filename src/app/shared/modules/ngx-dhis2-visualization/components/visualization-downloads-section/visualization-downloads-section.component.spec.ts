import { ComponentFixture, TestBed, waitForAsync as  } from '@angular/core/testing';

import { VisualizationDownloadsSectionComponent } from './visualization-downloads-section.component';

describe('VisualizationDownloadsSectionComponent', () => {
  let component: VisualizationDownloadsSectionComponent;
  let fixture: ComponentFixture<VisualizationDownloadsSectionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ VisualizationDownloadsSectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VisualizationDownloadsSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
