import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as _ from 'lodash';
import {
  FunctionObject,
  FunctionRule
} from 'src/app/shared/modules/ngx-dhis2-data-selection-filter/modules/data-filter/models';

import { VisualizationDataSelection } from '../../shared/modules/ngx-dhis2-visualization/models';
import { State, Store } from '@ngrx/store';
import { AppState } from 'src/app/store';
import { Observable } from 'rxjs';
import { getActiveFunction } from 'src/app/shared/modules/ngx-dhis2-data-selection-filter/modules/data-filter/store/selectors/function.selectors';
import { getActiveFunctionRule } from 'src/app/shared/modules/ngx-dhis2-data-selection-filter/modules/data-filter/store/selectors/function-rule.selectors';
import { take } from 'rxjs/operators';

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
  activateFunction: EventEmitter<FunctionObject> = new EventEmitter<
    FunctionObject
  >();

  @Output()
  newFunction: EventEmitter<FunctionObject> = new EventEmitter<
    FunctionObject
  >();

  @Output()
  newFunctionRule: EventEmitter<FunctionRule> = new EventEmitter<
    FunctionRule
  >();

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

  activeFunction$: Observable<FunctionObject>;
  activeFunctionRule$: Observable<FunctionRule>;

  constructor(private readonly store: Store<AppState>) {
    this.activeEditor = 'FUNCTION';
  }

  ngOnInit() {
    this.activeFunction$ = this.store.select(getActiveFunction);
    this.activeFunctionRule$ = this.store.select(getActiveFunctionRule);
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
    this.activeFunction$
      .pipe(take(1))
      .subscribe((activeFunction: FunctionObject) => {
        this.activateFunctionRule.emit({
          functionRule,
          functionObject: activeFunction
        });
      });
  }

  onSetActiveEditor(e, editor: string) {
    e.stopPropagation();
    this.activeEditor = editor;
  }

  onSimulateFunction(functionObject: FunctionObject) {
    this.activeFunctionRule$
      .pipe(take(1))
      .subscribe((activeFunctionRule: FunctionRule) => {
        this.simulate.emit({
          functionObject,
          functionRule: activeFunctionRule,
          item: 'FUNCTION'
        });
      });
  }

  onSimulateFunctionRule(functionRule: FunctionRule) {
    this.activeFunction$
      .pipe(take(1))
      .subscribe((activeFunction: FunctionObject) => {
        this.simulate.emit({
          functionObject: activeFunction,
          functionRule,
          item: 'FUNCTION_RULE'
        });
      });
  }

  onSaveFunction(functionObject: FunctionObject) {
    this.activeFunctionRule$
      .pipe(take(1))
      .subscribe((activeFunctionRule: FunctionRule) => {
        this.save.emit({
          functionObject,
          functionRule: activeFunctionRule,
          item: 'FUNCTION'
        });
      });
  }

  onSaveFunctionRule(functionRule: FunctionRule) {
    this.activeFunction$
      .pipe(take(1))
      .subscribe((activeFunction: FunctionObject) => {
        this.save.emit({
          functionObject: activeFunction,
          functionRule,
          item: 'FUNCTION_RULE'
        });
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
