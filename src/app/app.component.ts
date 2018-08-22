import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState, LoadSystemInfo } from './store';
import { LoadFunctions } from './shared/modules/ngx-dhis2-data-selection-filter/modules/data-filter/store/actions/function.actions';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(private store: Store<AppState>) {
    // Load system information
    store.dispatch(new LoadSystemInfo());
    store.dispatch(new LoadFunctions());
  }
}
