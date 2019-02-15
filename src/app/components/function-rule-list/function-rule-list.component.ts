import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FunctionRule } from '../../shared/modules/ngx-dhis2-data-selection-filter/modules/data-filter/store/models';
import { AddFunctionRule } from '../../shared/modules/ngx-dhis2-data-selection-filter/modules/data-filter/store/actions/function-rule.actions';
import { Store } from '@ngrx/store';
import { AppState } from '../../store/reducers/index';
import { ToasterService } from 'angular2-toaster';
import { FunctionService } from '../../shared/modules/ngx-dhis2-data-selection-filter/modules/data-filter/services/function.service';
import * as _ from 'lodash';

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

  @Output()
  newFunctionRule: EventEmitter<FunctionRule> = new EventEmitter<FunctionRule>();

  lodash = _;

  pager: any = {
    page: 1,
    pageSize: 5
  };
  pageClustering;
  ruleFilter: any = { name: '' };
  constructor(private functionService: FunctionService, private store: Store<AppState>, private toasterService: ToasterService) {}

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
  newLoading
  create(){
    this.newLoading = true;
    this.functionService.createRule().subscribe((functionRule:any)=> {
      this.store.dispatch(
        new AddFunctionRule({
          functionRule:{
            ...functionRule,
            saving: true,
          }
        })
      );
      this.newFunctionRule.emit(functionRule);
      this.newLoading = false;
    },(error)=>{
      this.toasterService.pop('error', 'Error', error.message);
    })
  }
  order(functionOne, functionTwo){
    if(typeof true === 'boolean'){
      if(functionOne){
        return 1;
      }else{
        return -1;
      }
    }
    return functionOne > functionTwo ? 1 : -1;
  }
  filter(field){
    return (o)=>{
      return o[field];
    }
  }
}
