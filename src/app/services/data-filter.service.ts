import { Injectable } from '@angular/core';
import {Http, Response} from "@angular/http";
import {Observable} from "rxjs";
import {Constants} from "../dashboard-card/providers/constants";
import {Store} from "../dashboard-card/providers/store";

export const DATA_GROUPS = {
  de: 'dataElementGroups',
  in: 'indicatorGroups',
}
@Injectable()
export class DataFilterService {

  dataGroups: any = DATA_GROUPS;
  constructor(
    private store: Store,
    private constants: Constants,
    private http: Http
  ) { }

  getDataGroups(groups): Observable<any> {
    console.log(groups)
    let groupCalls: any[] = [];
    groups.forEach(group => {
      if(group == 'de') {
        groupCalls.push(
          this.http.get(this.constants.api + this.dataGroups[group] + '.json?fields=id,name,dataElements[id,name,dataSetElements[dataSet[periodType]]&paging=false').map((res: Response) => res.json()).catch(error => Observable.throw(new Error(error)))
        )
      }

      if(group == 'in') {
        groupCalls.push(
          this.http.get(this.constants.api + this.dataGroups[group] + '.json?fields=id,name,indicators[id,name,dataSets[periodType]]&paging=false').map((res: Response) => res.json()).catch(error => Observable.throw(new Error(error)))
        )
      }
    });

    return Observable.forkJoin(groupCalls);
  }

}
