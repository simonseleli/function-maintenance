import { Injectable } from '@angular/core';
import { NgxDhis2HttpClientService } from '@iapps/ngx-dhis2-http-client';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class DynamicDimensionService {
  constructor(private httpClient: NgxDhis2HttpClientService) {}

  loadAll() {
    return this.httpClient
      .get(
        'dimensions.json?fields=id,displayShortName~rename(name),dimensionType,items[id,name,dimensionType]&paging=false',
        {
          useIndexDb: false,
        }
      )
      .pipe(map((res: any) => res.dimensions || []));
  }
}
