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

  pager: any = {
    page: 1,
    pageSize: 5
  };
  pageClustering;
  ruleFilter: any = { name: '' };
  constructor() {}

  ngOnInit() {
    this.pager.total = this.functionRules.length;
    const possibleValues = [10, 25, 50, 100];
    this.pageClustering = [];
    for (let i = 0; i < possibleValues.length; i++) {
      /*if (this.organisationUnit.children.length > possibleValues[i]) {
      this.pageClustering.push({name: possibleValues[i], value: possibleValues[i]})
    }*/
      this.pageClustering.push({
        name: possibleValues[i],
        value: possibleValues[i]
      });
    }
    this.pageClustering.push({ name: 'All', value: this.pager.total });
  }

  onActivate(e, functionRule: FunctionRule) {
    e.stopPropagation();
    if (!functionRule.active) {
      this.activate.emit(functionRule);
    }
  }

  pageChanged(event) {
    this.pager.page = event.page;
  }
  setPageSize(size) {
    this.pager.pageSize = size;
  }
}
