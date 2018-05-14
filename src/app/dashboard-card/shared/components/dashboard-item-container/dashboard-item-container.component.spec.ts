import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardItemContainerComponent } from './dashboard-item-container.component';

describe('DashboardItemContainerComponent', () => {
  let component: DashboardItemContainerComponent;
  let fixture: ComponentFixture<DashboardItemContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardItemContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardItemContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
