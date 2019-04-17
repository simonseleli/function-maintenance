import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FunctionRule,
  FunctionObject
} from 'src/app/shared/modules/ngx-dhis2-data-selection-filter/modules/data-filter/models';
import { e } from '@angular/core/src/render3';

@Component({
  selector: 'app-function-rule-editor',
  templateUrl: './function-rule-editor.component.html',
  styleUrls: ['./function-rule-editor.component.css']
})
export class FunctionRuleEditorComponent implements OnInit {
  @Input()
  functionRule: FunctionRule;
  @Input()
  functionObject: FunctionObject;

  showEditor = true;

  @Output()
  simulate: EventEmitter<{
    functionRule: FunctionRule;
    functionObject: FunctionObject;
  }> = new EventEmitter<{
    functionRule: FunctionRule;
    functionObject: FunctionObject;
  }>();

  @Output()
  save: EventEmitter<{
    functionRule: FunctionRule;
    functionObject: FunctionObject;
  }> = new EventEmitter<{
    functionRule: FunctionRule;
    functionObject: FunctionObject;
  }>();

  @Output()
  update: EventEmitter<{
    functionRule: FunctionRule;
    functionObject: FunctionObject;
  }> = new EventEmitter<{
    functionRule: FunctionRule;
    functionObject: FunctionObject;
  }>();
  constructor() {}

  ngOnInit() {}

  onSimulate(e) {
    e.stopPropagation();
    this.simulate.emit({
      functionRule: this.functionRule,
      functionObject: this.functionObject
    });
  }

  onSave(e) {
    e.stopPropagation();
    this.save.emit({
      functionRule: this.functionRule,
      functionObject: this.functionObject
    });
  }

  onChange(event, attributeName: string) {
    event.stopPropagation();
    if (event.target) {
      this._onRuleEdited({
        ...this.functionRule,
        [attributeName]: event.target.value
      });
    }
  }

  onRuleCodeEdited(ruleCode) {
    this._onRuleEdited({
      ...this.functionRule,
      json: ruleCode
    });
  }

  private _onRuleEdited(functionRule: FunctionRule) {
    this.update.emit({
      functionRule,
      functionObject: {
        ...this.functionObject,
        unsaved: true
      }
    });
  }
}
