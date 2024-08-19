import { ComponentFixture, TestBed, waitForAsync as  } from '@angular/core/testing';

import { MapVisualizerComponent } from './map-visualizer.component';

describe('MapVisualizerComponent', () => {
  let component: MapVisualizerComponent;
  let fixture: ComponentFixture<MapVisualizerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MapVisualizerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapVisualizerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
