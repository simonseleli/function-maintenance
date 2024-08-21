import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Router } from '@angular/router';
import { map, tap } from 'rxjs/operators';
import { Location } from '@angular/common';

import * as fromRouterActions from '../actions/router.actions';

@Injectable()
export class RouterEffects {
  constructor(
    private actions$: Actions,
    private router: Router,
    private location: Location
  ) {}

  
  navigate$ = createEffect(() => this.actions$.pipe(
    ofType(fromRouterActions.GO),
    map((action: fromRouterActions.Go) => action.payload),
    tap(({ path, query: queryParams, extras }) => {
      this.router.navigate(path, { queryParams, ...extras });
    })
  ), { dispatch: false });

  
  navigateBack$ = createEffect(() => this.actions$.pipe(
    ofType(fromRouterActions.BACK),
    tap(() => this.location.back())
  ), { dispatch: false });

  
  navigateForward$ = createEffect(() => this.actions$.pipe(
    ofType(fromRouterActions.FORWARD),
    tap(() => this.location.forward())
  ), { dispatch: false });
}
