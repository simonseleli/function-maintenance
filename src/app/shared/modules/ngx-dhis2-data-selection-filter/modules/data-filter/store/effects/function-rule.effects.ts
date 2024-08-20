import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import * as fromFunctionRuleActions from '../actions/function-rule.actions';
import * as fromFunctionActions from '../actions/function.actions';

@Injectable()
export class FunctionRuleEffects {
  
  addFunctions$: Observable<any> = createEffect(() => this.actions$.pipe(
    ofType(fromFunctionActions.FunctionActionTypes.AddFunctions),
    map(
      (action: fromFunctionActions.AddFunctions) =>
        new fromFunctionRuleActions.AddFunctionRules(action.functionRules)
    )
  ));
  constructor(private actions$: Actions) {}
}
