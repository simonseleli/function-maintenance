import { Component, ChangeDetectionStrategy, Input, OnInit, SimpleChanges } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, BehaviorSubject } from 'rxjs';
import * as fromStore from '../../store';
import * as _ from 'lodash';
import * as fromUtils from '../../utils';
import { VisualizationObject } from '../../models/visualization-object.model';
import { getSplitedVisualizationLayers } from '../../../../helpers';

@Component({
  selector: 'app-map',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./map.component.css'],
  templateUrl: './map.component.html'
})
export class MapComponent implements OnInit {
  @Input() id;
  @Input() visualizationLayers: any;
  @Input() visualizationConfig: any;
  @Input() visualizationUiConfig: any;
  visualizationObject: VisualizationObject;
  displayConfigurations: any;
  public visualizationObject$: Observable<VisualizationObject>;
  constructor(private store: Store<fromStore.MapState>) {
    this.store.dispatch(new fromStore.LoadAllLegendSet());
    this.store.dispatch(new fromStore.AddContectPath());
  }

  ngOnInit() {
    this.store.dispatch(new fromStore.InitiealizeVisualizationLegend(this.id));

    this.transformVisualizationObject(this.visualizationConfig, this.visualizationLayers, this.id);
    this.visualizationObject$ = this.store.select(fromStore.getCurrentVisualizationObject(this.id));
  }

  getVisualizationObject() {
    this.visualizationObject$ = this.store.select(fromStore.getCurrentVisualizationObject(this.id));
  }

  transformVisualizationObject(visualizationConfig, visualizationLayers, id) {
    // TODO FIND A WAY TO GET GEO FEATURES HERE
    const cleanedOutLayers = visualizationLayers.map(vizLayer => {
      const { analytics } = vizLayer;
      const rows = (analytics ? analytics.rows : []).filter(row => _.uniq(row).length === row.length);
      const newAnalytics = { ...analytics, rows };
      return { ...vizLayer, analytics: newAnalytics };
    });

    this.displayConfigurations = {
      ...this.visualizationUiConfig,
      ...this.visualizationLayers[0].config
    };
    const layers = getSplitedVisualizationLayers(visualizationConfig.type, cleanedOutLayers);
    const { visObject } = fromUtils.transformVisualizationObject(visualizationConfig, layers, id);
    this.visualizationObject = {
      ...this.visualizationObject,
      componentId: this.id,
      ...visObject
    };
    this.store.dispatch(new fromStore.AddVisualizationObjectComplete(this.visualizationObject));
  }

  toggleLegendContainerView() {
    this.store.dispatch(new fromStore.ToggleOpenVisualizationLegend(this.id));
  }
}
