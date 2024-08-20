import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { tap } from 'rxjs/operators';

import * as systemInfoActions from '../actions/system-info.action';
import { NgxDhis2HttpClientService } from '@iapps/ngx-dhis2-http-client';

@Injectable()
export class SystemInfoEffects {
  constructor(
    private actions$: Actions,
    private httpClient: NgxDhis2HttpClientService
  ) {}

  
  addContextPath$ = createEffect(() => this.actions$.pipe(
    ofType(systemInfoActions.ADD_CONTEXT_PATH),
    tap((action: systemInfoActions.AddContectPath) => {
      this.httpClient.get('system/info').subscribe((info) => {
        localStorage.setItem('contextPath', info['contextPath']);
        localStorage.setItem('version', info['version']);
        localStorage.setItem(
          'spatialSupport',
          info['databaseInfo']['spatialSupport']
        );
      });
    })
  ), { dispatch: false });
}
