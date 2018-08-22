import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FunctionRule } from '../../shared/modules/ngx-dhis2-data-selection-filter/modules/data-filter/store/models';

@Component({
  selector: 'app-function-rule-list',
  templateUrl: './function-rule-list.component.html',
  styleUrls: ['./function-rule-list.component.css']
})
export class FunctionRuleListComponent implements OnInit {
  @Input()
  functionRules: FunctionRule[];

  @Output()
  activate: EventEmitter<FunctionRule> = new EventEmitter<FunctionRule>();
  constructor() {}

  ngOnInit() {}

  onActivate(e, functionRule: FunctionRule) {
    e.stopPropagation();
    if (!functionRule.active) {
      this.activate.emit(functionRule);
    }
  }
}
