import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import {
  FunctionObject,
  FunctionRule
} from '../../shared/modules/ngx-dhis2-data-selection-filter/modules/data-filter/store/models';
import { find } from 'rxjs/operators';

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

  activeEditor: string;

  @Output()
  activateFunction: EventEmitter<FunctionObject> = new EventEmitter<
    FunctionObject
  >();

  @Output()
  activateFunctionRule: EventEmitter<{
    functionRule: FunctionRule;
    functionObject: FunctionObject;
  }> = new EventEmitter<{
    functionRule: FunctionRule;
    functionObject: FunctionObject;
  }>();

  constructor() {
    this.activeEditor = 'FUNCTION';
  }

  get activeFunction(): FunctionObject {
    return _.find(this.functionList, ['active', true]);
  }

  get activeFunctionRule(): FunctionRule {
    return _.find(this.functionRules, ['active', true]);
  }

  ngOnInit() {}

  onActivateFunctionObject(functionObject: FunctionObject) {
    this.activeEditor = 'FUNCTION';
    this.activateFunction.emit(functionObject);
  }

  onActivateFunctionRule(functionRule: FunctionRule) {
    this.activeEditor = 'RULE';
    this.activateFunctionRule.emit({
      functionRule,
      functionObject: this.activeFunction
    });
  }

  onSetActiveEditor(e, editor: string) {
    e.stopPropagation();
    this.activeEditor = editor;
  }
}
