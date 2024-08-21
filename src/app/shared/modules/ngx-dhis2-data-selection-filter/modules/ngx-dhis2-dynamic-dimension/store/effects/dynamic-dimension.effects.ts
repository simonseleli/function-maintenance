import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Observable } from 'rxjs';

import * as fromDynamicDimensionActions from '../actions/dynamic-dimension.actions';
import * as fromDynamicDimensionReducer from '../reducers/dynamic-dimension.reducer';
import { tap, withLatestFrom } from 'rxjs/operators';
import { getDynamicDimensionInitiatedStatus } from '../selectors/dynamic-dimension.selectors';
import { Store } from '@ngrx/store';
import { DynamicDimensionService } from '../../services/dynamic-dimension.service';
import { getSanitizedDynamicDimensions } from '../../helpers';

@Injectable()
export class DynamicDimensionEffects {
  
  loadDynamicDimension$: Observable<any> = createEffect(() => this.actions$.pipe(
    ofType(
      fromDynamicDimensionActions.DynamicDimensionActionTypes
        .LoadDynamicDimensions
    ),
    withLatestFrom(
      this.dynamicDimensionStore.select(getDynamicDimensionInitiatedStatus)
    ),
    tap(
      ([action, initiatedStatus]: [
        fromDynamicDimensionActions.LoadDynamicDimensionsAction,
        boolean
      ]) => {
        if (!initiatedStatus) {
          // Set to declare that load has been initiated so as to avoid any further loading
          this.dynamicDimensionStore.dispatch(
            new fromDynamicDimensionActions.InitiateDynamicDimensionsAction()
          );

          // Load dynamic dimension from the system
          this.dynamicDimensionService.loadAll().subscribe(
            (dimensions: any[]) => {
              this.dynamicDimensionStore.dispatch(
                new fromDynamicDimensionActions.AddDynamicDimensionsAction(
                  getSanitizedDynamicDimensions(dimensions)
                )
              );
            },
            (error: any) => {
              this.dynamicDimensionStore.dispatch(
                new fromDynamicDimensionActions.LoadDynamicDimensionsFailAction(
                  error
                )
              );
            }
          );
        }
      }
    )
  ), { dispatch: false });

  constructor(
    private actions$: Actions,
    private dynamicDimensionStore: Store<fromDynamicDimensionReducer.State>,
    private dynamicDimensionService: DynamicDimensionService
  ) {}
}
