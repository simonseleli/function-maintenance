import { Component, ChangeDetectionStrategy, OnChanges, SimpleChanges, Input } from '@angular/core';
import { VisualizationObject } from '../../models/visualization-object.model';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as fromStore from '../../store';

@Component({
  selector: 'app-container-map',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './container-map.component.html',
  styleUrls: ['./container-map.component.css'],
  styles: [
    `:host {
      display: block;
      width: 100%;
      height: 100%;
    }
  }`
  ]
})
export class ContainerMapComponent implements OnChanges {
  @Input() visualizationObject: VisualizationObject;
  @Input() displayConfigurations: any;
  public _visualizationObject: VisualizationObject;
  public _displayConfigurations: any;

  public visualizationLegendIsOpen$: Observable<boolean>;
  public isDataTableOpen$: Observable<boolean>;
  public baselayerLegend$: Observable<any>;
  public currentLegendSets$: Observable<any>;
  public currentLayersVisibility$: Observable<any>;

  constructor(private store: Store<fromStore.MapState>) {}

  ngOnChanges(changes: SimpleChanges) {
    const { visualizationObject, displayConfigurations } = changes;

    if (visualizationObject) {
      this._visualizationObject = visualizationObject.currentValue;
    }
    if (displayConfigurations) {
      this._displayConfigurations = displayConfigurations.currentValue;
    }
    this.initialize();
  }

  initialize() {
    const { componentId } = this.visualizationObject;

    // Detect if visualizationLegend is Open;
    this.visualizationLegendIsOpen$ = this.store.select(fromStore.isVisualizationLegendOpen(componentId));

    // Detect if DataTable is Open;
    this.isDataTableOpen$ = this.store.select(fromStore.isDataTableOpen(componentId));

    // Get the base layer legend
    this.baselayerLegend$ = this.store.select(fromStore.getCurrentBaseLayer(componentId));

    // Get current base layerSettings;
    this.currentLegendSets$ = this.store.select(fromStore.getCurrentLegendSets(componentId));

    // Get current layers visibility
    this.currentLayersVisibility$ = this.store.select(fromStore.getCurrentLayersVisibility(componentId));
  }
}
