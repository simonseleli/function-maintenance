import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxDhis2SelectionFiltersComponent } from './containers/ngx-dhis2-selection-filters/ngx-dhis2-selection-filters.component';
import { TranslateModule } from '@ngx-translate/core';
import { filterModules } from './modules';
import { directives } from './directives';
import { NgxDhis2HttpClientModule } from '@iapps/ngx-dhis2-http-client';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule.forChild(),
    ...filterModules,
    NgxDhis2HttpClientModule.forRoot({
      version: 1,
      namespace: 'iapps',
      models: {},
    }),
  ],
  declarations: [NgxDhis2SelectionFiltersComponent, ...directives],
  exports: [NgxDhis2SelectionFiltersComponent],
})
export class NgxDhis2SelectionFiltersModule {}
