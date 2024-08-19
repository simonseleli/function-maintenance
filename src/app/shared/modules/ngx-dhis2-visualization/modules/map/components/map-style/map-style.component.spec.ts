import { ComponentFixture, TestBed, waitForAsync as  } from '@angular/core/testing';

import { MapStyleComponent } from './map-style.component';

describe('MapStyleComponent', () => {
  let component: MapStyleComponent;
  let fixture: ComponentFixture<MapStyleComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MapStyleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapStyleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
