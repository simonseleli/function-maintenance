import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FunctionObject } from '../../shared/modules/ngx-dhis2-data-selection-filter/modules/data-filter/store/models';

@Component({
  selector: 'app-function-editor',
  templateUrl: './function-editor.component.html',
  styleUrls: ['./function-editor.component.css']
})
export class FunctionEditorComponent implements OnInit {
  @Input()
  functionObject: FunctionObject;

  @Output()
  simulate: EventEmitter<FunctionObject> = new EventEmitter<FunctionObject>();
  constructor() {}

  ngOnInit() {}

  onSimulate(e) {
    e.stopPropagation();
    this.simulate.emit(this.functionObject);
  }
}
