import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import * as _ from 'lodash';
import { forkJoin, Observable } from 'rxjs';
import { filter, switchMap, take, tap } from 'rxjs/operators';

import {
  getFunctionLoadedStatus,
  getFunctions
} from '../../../ngx-dhis2-data-selection-filter/modules/data-filter/store/selectors/function.selectors';
import {
  getMergedDataSelections,
  getSanitizedAnalytics,
  getStandardizedAnalyticsObject,
  checkIfVisualizationIsNonVisualizable,
  prepareVisualizationLayersForAnalytics
} from '../../helpers';
import { VisualizationDataSelection, VisualizationLayer } from '../../models';
import { AnalyticsService } from '../../services/analytics.service';
import {
  LoadVisualizationAnalyticsAction,
  LoadVisualizationAnalyticsSuccessAction,
  UpdateVisualizationLayerAction,
  VisualizationLayerActionTypes,
  LoadVisualizationAnalyticsFailAction
} from '../actions/visualization-layer.actions';
import { UpdateVisualizationObjectAction } from '../actions/visualization-object.actions';
import { VisualizationState } from '../reducers';
import { getCombinedVisualizationObjectById } from '../selectors';
import { Action } from 'rxjs/internal/scheduler/Action';

@Injectable()
export class VisualizationLayerEffects {
  @Effect({ dispatch: false })
  loadAnalytics$: Observable<any> = this.actions$.pipe(
    ofType(VisualizationLayerActionTypes.LOAD_VISUALIZATION_ANALYTICS),
    tap((action: LoadVisualizationAnalyticsAction) => {
      this.store
        .select(getCombinedVisualizationObjectById(action.visualizationId))
        .pipe(take(1))
        .subscribe((visualizationObject: any) => {
          if (visualizationObject) {
            // Update visualization object
            this.store.dispatch(
              new UpdateVisualizationObjectAction(action.visualizationId, {
                progress: {
                  statusCode: 200,
                  statusText: 'OK',
                  percent: 0,
                  message: `Loading Data for ${visualizationObject.name}`
                }
              })
            );
            if (
              !checkIfVisualizationIsNonVisualizable(
                visualizationObject.currentType
              )
            ) {
              this.store
                .select(getFunctionLoadedStatus)
                .pipe(
                  filter((loaded: boolean) => loaded),
                  switchMap(() => this.store.select(getFunctions())),
                  take(1)
                )
                .subscribe((functions: any[]) => {
                  const functionRules = _.flatten(
                    _.map(functions, functionObject => functionObject.items)
                  );

                  const visualizationLayers: VisualizationLayer[] = prepareVisualizationLayersForAnalytics(
                    action.globalSelections
                      ? _.map(
                          visualizationObject.layers,
                          (visualizationLayer: VisualizationLayer) => {
                            return {
                              ...visualizationLayer,
                              dataSelections: getMergedDataSelections(
                                visualizationLayer.dataSelections,
                                action.globalSelections,
                                visualizationObject.currentType
                              )
                            };
                          }
                        )
                      : action.visualizationLayers,
                    functionRules
                  );

                  forkJoin(
                    _.map(
                      visualizationLayers,
                      (visualizationLayer: VisualizationLayer) => {
                        return this.analyticsService.getAnalytics(
                          visualizationLayer.dataSelections,
                          visualizationLayer.layerType,
                          {
                            ...visualizationLayer.config,
                            visualizationType: action.type
                          }
                        );
                      }
                    )
                  ).subscribe(
                    analyticsResponse => {
                      // Save visualizations layers
                      _.each(analyticsResponse, (analytics, analyticsIndex) => {
                        this.store.dispatch(
                          new LoadVisualizationAnalyticsSuccessAction(
                            visualizationLayers[analyticsIndex].id,
                            {
                              analytics: getSanitizedAnalytics(
                                getStandardizedAnalyticsObject(analytics, true),
                                visualizationLayers[analyticsIndex]
                                  .dataSelections
                              ),
                              dataSelections:
                                visualizationLayers[analyticsIndex]
                                  .dataSelections
                            }
                          )
                        );
                      });
                      // Update visualization object
                      this.store.dispatch(
                        new UpdateVisualizationObjectAction(
                          action.visualizationId,
                          {
                            progress: {
                              statusCode: 200,
                              statusText: 'OK',
                              percent: 100,
                              message: 'Analytics loaded'
                            }
                          }
                        )
                      );
                    },
                    error => {
                      this.store.dispatch(
                        new LoadVisualizationAnalyticsFailAction(
                          action.visualizationId,
                          error
                        )
                      );
                      this.store.dispatch(
                        new UpdateVisualizationObjectAction(
                          action.visualizationId,
                          {
                            progress: {
                              statusCode: error.status,
                              statusText: 'Error',
                              percent: 100,
                              message: error.message
                            }
                          }
                        )
                      );
                    }
                  );
                });
            } else {
              _.each(
                _.map(
                  action.visualizationLayers,
                  (visualizationLayer: VisualizationLayer) => {
                    return {
                      ...visualizationLayer,
                      dataSelections: getMergedDataSelections(
                        visualizationLayer.dataSelections,
                        action.globalSelections,
                        visualizationObject.type
                      )
                    };
                  }
                ),
                visualizationLayer => {
                  this.store.dispatch(
                    new UpdateVisualizationLayerAction(
                      visualizationLayer.id,
                      visualizationLayer
                    )
                  );
                }
              );
            }
          } else {
            _.each(action.visualizationLayers, visualizationLayer => {
              this.store.dispatch(
                new UpdateVisualizationLayerAction(
                  visualizationLayer.id,
                  visualizationLayer
                )
              );
            });
          }
        });
    })
  );

  constructor(
    private actions$: Actions,
    private store: Store<VisualizationState>,
    private analyticsService: AnalyticsService
  ) {}
}
