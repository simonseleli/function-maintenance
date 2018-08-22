import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable } from 'rxjs';
import { UserActionTypes, AddCurrentUser } from '../actions';
import { map, withLatestFrom, first, take, tap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { AppState } from '../reducers';
import { getCurrentVisualization } from '../selectors';
import { CurrentVisualizationState } from '../reducers/current-visualization.reducer';
import { getDefaultVisualizationLayer } from '../../shared/modules/ngx-dhis2-visualization/helpers/get-default-visualization-layer.helper';
import {
  AddOrUpdateCurrentVisualizationAction,
  CurrentVisualizationActionTypes,
  UpdateCurrentVisualizationWithDataSelectionsAction,
  SimulateVisualizationAction
} from '../actions/current-visualization.actions';
import { generateUid } from '../../shared/modules/ngx-dhis2-visualization/helpers';
import { LoadVisualizationAnalyticsAction } from '../../shared/modules/ngx-dhis2-visualization/store';

import * as fromFunctionSelectors from '../../shared/modules/ngx-dhis2-data-selection-filter/modules/data-filter/store/selectors';
import * as fromFunctionRuleActions from '../../shared/modules/ngx-dhis2-data-selection-filter/modules/data-filter/store/actions/function-rule.actions';
import {
  VisualizationDataSelection,
  VisualizationLayer
} from '../../shared/modules/ngx-dhis2-visualization/models';

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
          .select(fromFunctionSelectors.getSelectedFunctions)
          .pipe(
            first((selectedFunctions: any[]) => selectedFunctions.length > 0)
          )
          .subscribe((selectedFunctions: any[]) => {
            this.store.dispatch(
              new AddOrUpdateCurrentVisualizationAction({
                ...currentVisualization,
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
          _.map(currentVisualization.layers, layer => {
            return {
              ...layer,
              dataSelections: action.dataSelections
            };
          })
        )
    )
  );

  @Effect({ dispatch: false })
  setActiveFunctionOrSimulateVisualization$: Observable<
    any
  > = this.actions$.pipe(
    ofType(
      fromFunctionRuleActions.FunctionRuleActionTypes.SetActiveFunctionRule,
      CurrentVisualizationActionTypes.SimulateVisualization
    ),
    withLatestFrom(this.store.select(getCurrentVisualization)),
    tap(([action, currentVisualization]: [any, CurrentVisualizationState]) => {
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
    })
  );

  constructor(private actions$: Actions, private store: Store<AppState>) {}
}
