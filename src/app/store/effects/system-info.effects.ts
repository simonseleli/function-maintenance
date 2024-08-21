import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { catchError } from 'rxjs/operators';

import { NgxDhis2HttpClientService } from '@iapps/ngx-dhis2-http-client';

import {
  AddSystemInfo,
  LoadSystemInfoFail,
  SystemInfoActionTypes,
} from '../actions/system-info.actions';
import { LoadCurrentUser } from '../actions/user.actions';
import { getSanitizedSystemInfo } from '../../core/helpers';

@Injectable()
export class SystemInfoEffects {
  constructor(
    private actions$: Actions,
    private httpClient: NgxDhis2HttpClientService
  ) {}

  
  loadSystemInfo$: Observable<any> = createEffect(() => this.actions$.pipe(
    ofType(SystemInfoActionTypes.LoadSystemInfo),
    switchMap(() =>
      this.httpClient.get(`system/info`).pipe(
        map(
          (systemInfo: any) =>
            new AddSystemInfo(getSanitizedSystemInfo(systemInfo))
        ),
        catchError((error: any) => of(new LoadSystemInfoFail(error)))
      )
    )
  ));

  
  systemInfoLoaded$: Observable<any> = createEffect(() => this.actions$.pipe(
    ofType(SystemInfoActionTypes.AddSystemInfo),
    map((action: AddSystemInfo) => new LoadCurrentUser(action.systemInfo))
  ));
}
