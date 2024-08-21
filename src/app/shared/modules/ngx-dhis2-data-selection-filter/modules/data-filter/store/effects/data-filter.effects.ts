import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';

import * as fromDataFilterActions from '../actions/data-filter.actions';
import * as fromFunctionActions from '../actions/function.actions';
import * as fromIndicatorGroupActions from '../actions/indicator-group.actions';
import * as fromIndicatorActions from '../actions/indicator.actions';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable()
export class DataFilterEffects {
  
  loadDataFilters$: Observable<any> = createEffect(() => this.actions$.pipe(
    ofType(fromDataFilterActions.DataFilterActionTypes.LoadDataFilters),
    switchMap((action: fromDataFilterActions.LoadDataFilters) => [
      new fromFunctionActions.LoadFunctions(action.currentUser),
      new fromIndicatorGroupActions.LoadIndicatorGroups(),
      new fromIndicatorActions.LoadIndicators()
    ])
  ));
  constructor(private actions$: Actions) {}
}
