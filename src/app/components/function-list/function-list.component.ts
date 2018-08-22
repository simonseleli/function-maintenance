import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FunctionObject } from '../../shared/modules/ngx-dhis2-data-selection-filter/modules/data-filter/store/models';

@Component({
  selector: 'app-function-list',
  templateUrl: './function-list.component.html',
  styleUrls: ['./function-list.component.css']
})
export class FunctionListComponent implements OnInit {
  @Input()
  functionList: FunctionObject[];

  @Output()
  activate: EventEmitter<FunctionObject> = new EventEmitter<FunctionObject>();
  constructor() {}

  ngOnInit() {}

  onActivate(e, functionObject: FunctionObject) {
    e.stopPropagation();
    if (!functionObject.active) {
      this.activate.emit(functionObject);
    }
  }
}
