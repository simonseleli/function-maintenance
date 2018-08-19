import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataFilterComponent } from './data-filter.component';
import { ClickOutsideDirective } from './click-outside.directive';
import { FormsModule } from '@angular/forms';
import { FilterByNamePipe } from './pipes/filter-by-name.pipe';
import { OrderPipe } from './pipes/order-by.pipe';
import { NgxPaginationModule } from 'ngx-pagination';
import { AddUnderscorePipe } from './pipes/add-underscore.pipe';
import { DragulaModule } from 'ng2-dragula';
import { DndModule } from 'ng2-dnd';
import { HttpModule } from '@angular/http';
import { components } from './components';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import * as fromFunction from './store/reducers/function.reducer';
import * as fromFunctionRule from './store/reducers/function-rule.reducer';
import { effects } from './store/effects';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    HttpModule,
    DragulaModule,
    NgxPaginationModule,
    DndModule.forRoot(),
    StoreModule.forFeature('function', fromFunction.reducer),
    StoreModule.forFeature('functionRule', fromFunctionRule.reducer),
    EffectsModule.forFeature(effects)
  ],
  declarations: [
    DataFilterComponent,
    ClickOutsideDirective,
    FilterByNamePipe,
    OrderPipe,
    AddUnderscorePipe,
    ...components
  ],
  exports: [DataFilterComponent],
  providers: []
})
export class DataFilterModule {}
