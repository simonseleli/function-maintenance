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
  UpdateCurrentVisualizationWithDataSelectionsAction
} from '../actions/current-visualization.actions';
import { generateUid } from '../../shared/modules/ngx-dhis2-visualization/helpers';
import { LoadVisualizationAnalyticsAction } from '../../shared/modules/ngx-dhis2-visualization/store';

import * as fromFunctionSelectors from '../../shared/modules/ngx-dhis2-data-selection-filter/modules/data-filter/store/selectors';

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

  constructor(private actions$: Actions, private store: Store<AppState>) {}
}
