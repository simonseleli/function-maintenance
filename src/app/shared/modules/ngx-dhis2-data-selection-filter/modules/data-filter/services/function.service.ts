import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { NgxDhis2HttpClientService } from '@hisptz/ngx-dhis2-http-client';
import { Observable, forkJoin, of } from 'rxjs';
import { mergeMap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FunctionService {
  constructor(private http: NgxDhis2HttpClientService) {}

  loadAll(currentUser: any): Observable<any> {
    return this.http.get('dataStore/functions').pipe(
      mergeMap((functionIds: Array<string>) =>
        forkJoin(
          _.map(functionIds, (functionId: string) => this.load(functionId))
        ).pipe(catchError(() => of([])))
      ),
      catchError(() => of([]))
    );
  }

  load(id: string) {
    return this.http.get('dataStore/functions/' + id);
  }
}
