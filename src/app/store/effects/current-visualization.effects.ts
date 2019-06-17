import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { ROUTER_NAVIGATION } from '@ngrx/router-store';
import { Store } from '@ngrx/store';
import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { first, map, take, tap, withLatestFrom } from 'rxjs/operators';
import { generateUid } from 'src/app/core';
import { getSelectedFunctions } from 'src/app/shared/modules/ngx-dhis2-data-selection-filter/modules/data-filter/store/selectors/function.selectors';

import * as fromFunctionRuleActions from '../../shared/modules/ngx-dhis2-data-selection-filter/modules/data-filter/store/actions/function-rule.actions';
import {
  AddFunctions,
  FunctionActionTypes,
  SetActiveFunction,
  UpdateActiveFunction
} from '../../shared/modules/ngx-dhis2-data-selection-filter/modules/data-filter/store/actions/function.actions';
import {
  getStandardizedVisualizationUiConfig,
  getVisualizationLayersFromFavorite
} from '../../shared/modules/ngx-dhis2-visualization/helpers';
import { getDefaultVisualizationLayer } from '../../shared/modules/ngx-dhis2-visualization/helpers/get-default-visualization-layer.helper';
import {
  VisualizationDataSelection,
  VisualizationLayer
} from '../../shared/modules/ngx-dhis2-visualization/models';
import { FavoriteService } from '../../shared/modules/ngx-dhis2-visualization/services';
import {
  LoadVisualizationAnalyticsAction,
  VisualizationLayerActionTypes
} from '../../shared/modules/ngx-dhis2-visualization/store';
import { AddCurrentUser, Go, UserActionTypes } from '../actions';
import {
  AddOrUpdateCurrentVisualizationAction,
  AddVisualizationItemAction,
  CurrentVisualizationActionTypes,
  SimulateVisualizationAction,
  UpdateCurrentVisualizationWithDataSelectionsAction
} from '../actions/current-visualization.actions';
import { AppState } from '../reducers';
import { CurrentVisualizationState } from '../reducers/current-visualization.reducer';
import { getCurrentVisualization, getQueryParams } from '../selectors';

@Injectable()
export class CurrentVisualizationEffects {
  @Effect({ dispatch: false })
  addCurrentUser$: Observable<any> = this.actions$.pipe(
    ofType(UserActionTypes.AddCurrentUser),
    withLatestFrom(this.store.select(getCurrentVisualization)),
    tap(
      ([action, currentVisualization]: [
        AddCurrentUser,
        CurrentVisualizationState
      ]) => {
        this.store
          .select(getSelectedFunctions)
          .pipe(
            first((selectedFunctions: any[]) => selectedFunctions.length > 0)
          )
          .subscribe((selectedFunctions: any[]) => {
            this.store.dispatch(
              new AddOrUpdateCurrentVisualizationAction({
                ...currentVisualization,
                loading: false,
                layers: [
                  {
                    ...getDefaultVisualizationLayer(
                      action.currentUser,
                      action.systemInfo,
                      selectedFunctions
                    ),
                    id: generateUid()
                  }
                ]
              })
            );
          });
      }
    )
  );

  @Effect()
  updateCurrentVisualizationDataSelections$: Observable<
    any
  > = this.actions$.pipe(
    ofType(
      CurrentVisualizationActionTypes.UpdateCurrentVisualizationWithDataSelections
    ),
    withLatestFrom(this.store.select(getCurrentVisualization)),
    map(
      ([action, currentVisualization]: [
        UpdateCurrentVisualizationWithDataSelectionsAction,
        CurrentVisualizationState
      ]) =>
        new LoadVisualizationAnalyticsAction(
          currentVisualization.id,
          [],
          action.dataSelections
        )
    )
  );

  @Effect({ dispatch: false })
  setActiveFunctionOrSimulateFunction$: Observable<any> = this.actions$.pipe(
    ofType(
      fromFunctionRuleActions.FunctionRuleActionTypes.SetActiveFunctionRule,
      CurrentVisualizationActionTypes.SimulateVisualization
    ),
    withLatestFrom(this.store.select(getCurrentVisualization)),
    tap(
      ([action, currentVisualization]: [
        SimulateVisualizationAction,
        CurrentVisualizationState
      ]) => {
        const dataSelections: VisualizationDataSelection[] =
          currentVisualization.layers && currentVisualization.layers[0]
            ? currentVisualization.layers[0].dataSelections
            : [];
        const dxDataSelection: VisualizationDataSelection = _.find(
          dataSelections,
          ['dimension', 'dx']
        );

        const dxDataSelectionIndex = dataSelections.indexOf(dxDataSelection);

        const newItem =
          action.functionObject && action.functionRule
            ? {
                id: action.functionRule.id,
                name: action.functionRule.name,
                ruleDefinition: action.functionRule,
                functionObject: {
                  id: action.functionObject.id,
                  functionString: action.functionObject.function
                },
                type: 'FUNCTION_RULE'
              }
            : null;

        if (newItem && dxDataSelection) {
          const dxItems = dxDataSelection.items || [];
          const availableItem = _.find(dxItems, ['id', newItem.id]);
          const availableItemIndex = dxItems.indexOf(availableItem);

          const newDxItems =
            availableItemIndex !== -1
              ? [
                  ..._.slice(dxItems, 0, availableItemIndex),
                  newItem,
                  ..._.slice(dxItems, availableItemIndex + 1)
                ]
              : [...dxItems, newItem];

          const newDataSelections: VisualizationDataSelection[] = [
            ..._.slice(dataSelections, 0, dxDataSelectionIndex),
            {
              ...dxDataSelection,
              items: newDxItems
            },
            ..._.slice(dataSelections, dxDataSelectionIndex + 1)
          ];

          const newCurrentVisualization: CurrentVisualizationState = {
            ...currentVisualization,
            layers: _.map(
              currentVisualization.layers,
              (layer: VisualizationLayer) => {
                return {
                  ...layer,
                  dataSelections: newDataSelections
                };
              }
            )
          };

          this.store.dispatch(
            new AddOrUpdateCurrentVisualizationAction(newCurrentVisualization)
          );

          if (action.simulate) {
            this.store.dispatch(
              new LoadVisualizationAnalyticsAction(
                newCurrentVisualization.id,
                newCurrentVisualization.layers
              )
            );
          }
        }
      }
    )
  );

  @Effect({ dispatch: false })
  addVisualizationItem$: Observable<any> = this.actions$.pipe(
    ofType(CurrentVisualizationActionTypes.AddVisualizationItem),
    tap((action: AddVisualizationItemAction) => {
      if (
        action.favorite &&
        action.favorite.dashboardTypeDetails &&
        action.favorite.dashboardTypeDetails.type &&
        action.favorite.id
      ) {
        const visualizationType = action.favorite.dashboardTypeDetails.type;
        const visualizationObject = {
          id: generateUid(),
          type: visualizationType,
          name: action.favorite.name,
          uiConfig: getStandardizedVisualizationUiConfig({
            type: visualizationType
          }),
          loading: true,
          layers: []
        };
        this.store.dispatch(
          new AddOrUpdateCurrentVisualizationAction(visualizationObject)
        );

        this.favoriteService
          .getFavorite({
            type: _.camelCase(visualizationType),
            id: action.favorite.id,
            useTypeAsBase: true
          })
          .subscribe(
            (favoriteObject: any) => {
              this.store.dispatch(
                new AddOrUpdateCurrentVisualizationAction({
                  ...visualizationObject,
                  loading: false,
                  layers: getVisualizationLayersFromFavorite(
                    favoriteObject,
                    visualizationType
                  )
                })
              );
            },
            error => {
              this.store.dispatch(
                new AddOrUpdateCurrentVisualizationAction({
                  ...visualizationObject,
                  loading: false,
                  error,
                  layers: []
                })
              );
            }
          );
      }
    })
  );

  @Effect({ dispatch: false })
  routerNavigation$: Observable<any> = this.actions$.pipe(
    ofType(ROUTER_NAVIGATION),
    take(1),
    tap((action: any) => {
      const queryParams: any =
        action.payload.routerState && action.payload.routerState.queryParams
          ? action.payload.routerState.queryParams
          : null;
      if (queryParams) {
        if (queryParams.function) {
          this.store.dispatch(
            new SetActiveFunction({ id: queryParams.function })
          );
        }

        if (queryParams.rule) {
          this.store.dispatch(
            new fromFunctionRuleActions.SetActiveFunctionRule(
              queryParams.rule,
              {
                id: queryParams.function
              }
            )
          );
        }
      }
    })
  );

  @Effect({ dispatch: false })
  addFunctions$: Observable<any> = this.actions$.pipe(
    ofType(FunctionActionTypes.AddFunctions),
    withLatestFrom(this.store.select(getQueryParams)),
    map(([action, routeQueryParams]: [AddFunctions, any]) => {
      const selectedFunction = _.find(action.functions, ['selected', true]);
      const selectedFunctionRule = _.find(action.functionRules, [
        'selected',
        true
      ]);

      if (selectedFunction && selectedFunctionRule) {
        if (
          (!routeQueryParams.function && !routeQueryParams.rule) ||
          (selectedFunction.id !== routeQueryParams.function &&
            selectedFunctionRule.id !== routeQueryParams.rule)
        ) {
          const queryParams = {
            function: selectedFunction.id,
            rule: selectedFunctionRule.id
          };
          this.store.dispatch(new Go({ path: ['/'], query: queryParams }));
        }
      }
    })
  );

  @Effect()
  visualizationAnalyticsLoaded$: Observable<any> = this.actions$.pipe(
    ofType(
      VisualizationLayerActionTypes.LOAD_VISUALIZATION_ANALYTICS_SUCCESS,
      VisualizationLayerActionTypes.LOAD_VISUALIZATION_ANALYTICS_FAIL
    ),
    map(() => new UpdateActiveFunction())
  );
  constructor(
    private actions$: Actions,
    private store: Store<AppState>,
    private favoriteService: FavoriteService
  ) {}
}
