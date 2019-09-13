import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState, LoadSystemInfo } from './store';
import { Fn } from '@iapps/function-analytics';
import { NgxDhis2HttpClientService } from '@iapps/ngx-dhis2-http-client';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor(
    private store: Store<AppState>,
    private httpClient: NgxDhis2HttpClientService
  ) {}

  ngOnInit() {
    this.httpClient.rootUrl().subscribe(rootUrl => {
      console.log(rootUrl);
      if (Fn) {
        Fn.init({
          baseUrl: `${rootUrl}api/`
        });
      }
    });

    // Load system information
    this.store.dispatch(new LoadSystemInfo());
  }
}
