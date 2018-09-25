import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import * as _ from 'lodash';
import {
  FunctionObject,
  FunctionRule
} from '../../shared/modules/ngx-dhis2-data-selection-filter/modules/data-filter/store/models';
import {find} from 'rxjs/operators';
import {VisualizationDataSelection} from '../../shared/modules/ngx-dhis2-visualization/models';

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

  @Input()
  currentVisualizationDataSelections: VisualizationDataSelection[];

  activeEditor: string;

  @Output()
  activateFunction: EventEmitter<FunctionObject> = new EventEmitter<FunctionObject>();

  @Output()
  newFunction: EventEmitter<FunctionObject> = new EventEmitter<FunctionObject>();

  @Output()
  newFunctionRule: EventEmitter<FunctionRule> = new EventEmitter<FunctionRule>();

  @Output()
  activateFunctionRule: EventEmitter<{
    functionRule: FunctionRule;
    functionObject: FunctionObject;
  }> = new EventEmitter<{
    functionRule: FunctionRule;
    functionObject: FunctionObject;
  }>();

  @Output()
  simulate: EventEmitter<{
    functionObject: FunctionObject;
    functionRule: FunctionRule;
    item: string;
  }> = new EventEmitter<{
    functionObject: FunctionObject;
    functionRule: FunctionRule;
    item: string;
  }>();

  @Output()
  save: EventEmitter<{
    functionObject: FunctionObject;
    functionRule: FunctionRule;
    item: string;
  }> = new EventEmitter<{
    functionObject: FunctionObject;
    functionRule: FunctionRule;
    item: string;
  }>();

  @Output()
  delete: EventEmitter<{
    functionObject: FunctionObject;
    functionRule: FunctionRule;
    item: string;
  }> = new EventEmitter<{
    functionObject: FunctionObject;
    functionRule: FunctionRule;
    item: string;
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

  ngOnInit() {
  }

  onNewFunctionObject(functionObject: FunctionObject) {
    this.activeEditor = 'FUNCTION';
    this.newFunction.emit(functionObject);
  }

  onNewFunctionRule(functionRule: FunctionRule) {
    this.activeEditor = 'RULE';
    this.newFunctionRule.emit(functionRule);
  }

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

  onSimulateFunction(functionObject: FunctionObject) {
    this.simulate.emit({
      functionObject,
      functionRule: this.activeFunctionRule,
      item: 'FUNCTION'
    });
  }

  onSimulateFunctionRule(functionRule: FunctionRule) {
    this.simulate.emit({
      functionObject: this.activeFunction,
      functionRule,
      item: 'FUNCTION_RULE'
    });
  }

  onSaveFunction(functionObject: FunctionObject) {
    this.save.emit({
      functionObject,
      functionRule: this.activeFunctionRule,
      item: 'FUNCTION'
    });
  }

  onSaveFunctionRule(functionRule: FunctionRule) {
    this.save.emit({
      functionObject: this.activeFunction,
      functionRule,
      item: 'FUNCTION_RULE'
    });
  }

  onDeleteFunction(functionObject) {
    this.delete.emit({
      functionObject: functionObject,
      functionRule: null,
      item: 'FUNCTION'
    });
  }
}
