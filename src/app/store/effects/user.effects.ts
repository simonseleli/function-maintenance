import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { Store } from '@ngrx/store';

import { UserService, User } from '../../core';
import {
  AddCurrentUser,
  LoadCurrentUserFail,
  UserActionTypes,
  LoadCurrentUser
} from '../actions';

import * as fromRoot from '../reducers';
import { LoadFunctions } from '../../shared/modules/ngx-dhis2-data-selection-filter/modules/data-filter/store/actions/function.actions';
import { getQueryParams } from '../selectors';

@Injectable()
export class UserEffects {
  constructor(
    private actions$: Actions,
    private userService: UserService,
    private store: Store<fromRoot.AppState>
  ) {}

  @Effect()
  loadCurrentUser$: Observable<any> = this.actions$.pipe(
    ofType(UserActionTypes.LoadCurrentUser),
    switchMap((action: LoadCurrentUser) =>
      this.userService.loadCurrentUser().pipe(
        map((user: User) => new AddCurrentUser(user, action.systemInfo)),
        catchError((error: any) => of(new LoadCurrentUserFail(error)))
      )
    )
  );

  @Effect()
  addCurrentUser$: Observable<any> = this.actions$.pipe(
    ofType(UserActionTypes.AddCurrentUser),
    withLatestFrom(this.store.select(getQueryParams)),
    map(
      ([action, queryParams]: [AddCurrentUser, any]) =>
        new LoadFunctions(action.currentUser, queryParams)
    )
  );
}
