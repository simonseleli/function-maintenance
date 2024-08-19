import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnInit,
  Output,
  EventEmitter,
  ViewChild
} from '@angular/core';
import { VisualizationLayer } from '../../models/visualization-layer.model';
import { VisualizationInputs } from '../../models/visualization-inputs.model';
import { Observable, Subject } from 'rxjs';
import { Visualization } from '../../models/visualization.model';
import { VisualizationUiConfig } from '../../models/visualization-ui-config.model';
import { VisualizationProgress } from '../../models/visualization-progress.model';
import { VisualizationConfig } from '../../models/visualization-config.model';
import { LegendSet } from '../../models/legend-set.model';
import { VisualizationState } from '../../store/reducers';
import { Store } from '@ngrx/store';
import {
  InitializeVisualizationObjectAction,
  UpdateVisualizationObjectAction,
  SaveVisualizationFavoriteAction,
  ToggleVisualizationFullScreenAction
} from '../../store/actions/visualization-object.actions';
import {
  getCurrentVisualizationProgress,
  getVisualizationObjectById
} from '../../store/selectors/visualization-object.selectors';
import { getCurrentVisualizationObjectLayers } from '../../store/selectors/visualization-layer.selectors';
import {
  getCurrentVisualizationUiConfig,
  getFocusedVisualization
} from '../../store/selectors/visualization-ui-configuration.selectors';
import { getCurrentVisualizationConfig } from '../../store/selectors/visualization-configuration.selectors';
import {
  ShowOrHideVisualizationBodyAction,
  ToggleFullScreenAction,
  ToggleVisualizationFocusAction
} from '../../store/actions/visualization-ui-configuration.actions';
import { UpdateVisualizationConfigurationAction } from '../../store/actions/visualization-configuration.actions';
import {
  LoadVisualizationAnalyticsAction,
  UpdateVisualizationLayerAction
} from '../../store/actions/visualization-layer.actions';
import { take, map, switchMap } from 'rxjs/operators';
import { VisualizationBodySectionComponent } from '../../components/visualization-body-section/visualization-body-section';
import { openAnimation } from '../../../favorite-filter/animations';
import { UpdateVisualizationObject } from '../../modules/map/store';

@Component({
  selector: 'ngx-dhis2-visualization',
  templateUrl: './visualization.component.html',
  styleUrls: ['./visualization.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [openAnimation]
})
export class VisualizationComponent implements OnInit {
  @Input()
  visualizationObject: any;
  @Input()
  id: string;
  @Input()
  visualizationConfig: VisualizationConfig;
  @Input()
  type: string;
  @Input()
  visualizationLayers: VisualizationLayer[];
  @Input()
  name: string;
  @Input()
  isNewFavorite: boolean;
  @Input()
  dashboardId: string;
  @Input()
  currentUser: any;

  @Input()
  legendSets: LegendSet[];
  @Input()
  systemInfo: any;
  cardFocused: boolean;

  @Output()
  toggleFullScreen: EventEmitter<any> = new EventEmitter<any>();

  @Output()
  deleteVisualization: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild(VisualizationBodySectionComponent, { static: false })
  visualizationBody: VisualizationBodySectionComponent;

  private _visualizationInputs$: Subject<VisualizationInputs> = new Subject();
  visualizationObject$: Observable<Visualization>;
  visualizationLayers$: Observable<VisualizationLayer[]>;
  visualizationUiConfig$: Observable<VisualizationUiConfig>;
  visualizationProgress$: Observable<VisualizationProgress>;
  visualizationConfig$: Observable<VisualizationConfig>;
  focusedVisualization$: Observable<string>;

  constructor(private store: Store<VisualizationState>) {}

  ngOnInit() {
    if (this.visualizationObject) {
      // initialize visualization object
      this.store.dispatch(
        new InitializeVisualizationObjectAction(
          this.visualizationObject.id,
          this.visualizationObject.name,
          this.visualizationObject.type,
          this.visualizationObject.layers,
          this.visualizationObject,
          this.currentUser,
          this.systemInfo
        )
      );

      // Set visualization selectors
      this.setOrUpdateSelectors(this.visualizationObject);
    }
  }

  setOrUpdateSelectors(visualizationObject) {
    this.visualizationObject$ = this.store.select(
      getVisualizationObjectById(visualizationObject.id)
    );

    this.visualizationLayers$ = this.visualizationObject$.pipe(
      switchMap((visualization: Visualization) =>
        this.store.select(
          getCurrentVisualizationObjectLayers(
            visualization ? visualization.layers : []
          )
        )
      )
    );

    this.visualizationProgress$ = this.visualizationObject$.pipe(
      map((visualization: Visualization) =>
        visualization ? visualization.progress : null
      )
    );

    this.visualizationUiConfig$ = this.visualizationObject$.pipe(
      map((visualization: Visualization) =>
        visualization ? visualization.uiConfig : null
      )
    );

    this.visualizationConfig$ = this.store.select(
      getCurrentVisualizationConfig(visualizationObject.id)
    );

    this.focusedVisualization$ = this.store.select(getFocusedVisualization);
  }

  onToggleVisualizationBody(uiConfig) {
    this.store.dispatch(
      new ShowOrHideVisualizationBodyAction(uiConfig.id, {
        showBody: uiConfig.showBody
      })
    );
  }

  onVisualizationTypeChange(visualizationType: string) {
    this.store.dispatch(
      new UpdateVisualizationObjectAction(this.visualizationObject.id, {
        currentType: visualizationType
      })
    );

    if (
      visualizationType === 'MAP' ||
      this.visualizationObject.type === 'MAP'
    ) {
      this.visualizationLayers$
        .pipe(take(1))
        .subscribe((visualizationLayers: VisualizationLayer[]) => {
          this.store.dispatch(
            new LoadVisualizationAnalyticsAction(
              this.visualizationObject.id,
              visualizationLayers
            )
          );
        });
    }
  }

  onToggleFullScreenAction(fullScreenStatus: boolean) {
    this.toggleFullScreen.emit({
      id: this.visualizationObject.id,
      dashboardId: this.dashboardId,
      fullScreen: fullScreenStatus
    });
    this.store.dispatch(
      new ToggleVisualizationFullScreenAction(this.visualizationObject.id)
    );
  }

  onLoadVisualizationAnalytics(visualizationLayer: VisualizationLayer) {
    this.store.dispatch(
      new LoadVisualizationAnalyticsAction(this.id, [visualizationLayer])
    );
  }

  onVisualizationLayerConfigUpdate(visualizationLayer: VisualizationLayer) {
    this.store.dispatch(
      new UpdateVisualizationLayerAction(visualizationLayer.id, {
        config: visualizationLayer.config
      })
    );
  }

  onSaveFavorite(favoriteDetails) {
    this.store.dispatch(
      new SaveVisualizationFavoriteAction(
        this.id,
        favoriteDetails,
        this.dashboardId
      )
    );
  }

  onToggleVisualizationCardFocus(e, focused: boolean) {
    e.stopPropagation();
    if (this.cardFocused !== focused) {
      this.visualizationUiConfig$
        .pipe(take(1))
        .subscribe((visualizationUiConfig: VisualizationUiConfig) => {
          this.store.dispatch(
            new UpdateVisualizationObjectAction(this.visualizationObject.id, {
              uiConfig: {
                ...visualizationUiConfig,
                hideFooter: !focused,
                hideResizeButtons: !focused
              }
            })
          );
          this.cardFocused = focused;
        });
    }
  }

  onDeleteVisualizationAction(options: any) {
    this.visualizationObject$
      .pipe(take(1))
      .subscribe((visualization: Visualization) => {
        this.deleteVisualization.emit({
          visualization,
          deleteFavorite: options.deleteFavorite
        });

        this.store.dispatch(
          new UpdateVisualizationObjectAction(this.id, {
            notification: {
              message: 'Removing dasboard item...',
              type: 'progress'
            }
          })
        );
      });
  }

  onVisualizationDownload(downloadDetails: any) {
    if (this.visualizationBody) {
      this.visualizationBody.onDownloadVisualization(
        downloadDetails.type,
        downloadDetails.downloadFormat
      );
    }
  }
}
