import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { modules } from './modules';

@NgModule({
  imports: [CommonModule, ...modules],
  declarations: [],
  exports: [...modules]
})
export class SharedModule {}
