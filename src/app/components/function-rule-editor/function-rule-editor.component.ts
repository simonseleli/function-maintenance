import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FunctionRule } from '../../shared/modules/ngx-dhis2-data-selection-filter/modules/data-filter/store/models';

@Component({
  selector: 'app-function-rule-editor',
  templateUrl: './function-rule-editor.component.html',
  styleUrls: ['./function-rule-editor.component.css']
})
export class FunctionRuleEditorComponent implements OnInit {
  @Input()
  functionRule: FunctionRule;

  @Output()
  simulate: EventEmitter<FunctionRule> = new EventEmitter<FunctionRule>();
  constructor() {}

  ngOnInit() {}

  onSimulate(e) {
    e.stopPropagation();
    this.simulate.emit(this.functionRule);
  }
}
