import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataFilterPipe } from './pipes/data-filter.pipe';
import { HasFunctionAccessPipe } from './pipes/has-function-access.pipe';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [DataFilterPipe, HasFunctionAccessPipe]
})
export class CoreModule { }
