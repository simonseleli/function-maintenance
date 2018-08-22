import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import {
  FunctionObject,
  FunctionRule
} from '../../shared/modules/ngx-dhis2-data-selection-filter/modules/data-filter/store/models';

@Component({
  selector: 'app-function-management',
  templateUrl: './function-management.component.html',
  styleUrls: ['./function-management.component.css']
})
export class FunctionManagementComponent implements OnInit {
  @Input()
  functionList: FunctionObject[];

  @Input()
  functionRules: FunctionRule[];

  @Output()
  activeFunction: EventEmitter<FunctionObject> = new EventEmitter<
    FunctionObject
  >();

  @Output()
  activeFunctionRule: EventEmitter<FunctionRule> = new EventEmitter<
    FunctionRule
  >();

  constructor() {}

  ngOnInit() {}

  onActivateFunctionObject(functionObject: FunctionObject) {
    this.activeFunction.emit(functionObject);
  }

  onActivateFunctionRule(functionRule: FunctionRule) {
    this.activeFunctionRule.emit(functionRule);
  }
}
