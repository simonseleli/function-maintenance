import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FunctionObject } from '../../shared/modules/ngx-dhis2-data-selection-filter/modules/data-filter/store/models';
import {
  AddFunction,
  DeleteFunction
} from '../../shared/modules/ngx-dhis2-data-selection-filter/modules/data-filter/store/actions/function.actions';
import * as _ from 'lodash';
import { AppState } from '../../store/reducers/index';
import { Store } from '@ngrx/store';
import { ToasterService } from 'angular2-toaster';
import { FunctionService } from '../../shared/modules/ngx-dhis2-data-selection-filter/modules/data-filter/services/function.service';

@Component({
  selector: 'app-function-list',
  templateUrl: './function-list.component.html',
  styleUrls: ['./function-list.component.css']
})
export class FunctionListComponent implements OnInit {
  @Input()
  functionList: FunctionObject[];

  @Output()
  activate: EventEmitter<FunctionObject> = new EventEmitter<FunctionObject>();

  @Output()
  newFunction: EventEmitter<FunctionObject> = new EventEmitter<FunctionObject>();

  @Output()
  save: EventEmitter<FunctionObject> = new EventEmitter<FunctionObject>();

  @Output()
  delete: EventEmitter<FunctionObject> = new EventEmitter<FunctionObject>();

  pager: any = {
    page: 1,
    pageSize: 5
  };
  pageClustering;
  functionFilter: any = { name: '' };
  deleteFunction;
  constructor(private functionService: FunctionService, private store: Store<AppState>, private toasterService: ToasterService) {}

  ngOnInit() {
    this.pager.total = this.functionList.length;
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
  deleteFunctionObject(functionObject){
    this.delete.emit(functionObject);
  }
  onActivate(e, functionObject: FunctionObject) {
    e.stopPropagation();
    if (!functionObject.active) {
      this.activate.emit(functionObject);
    }
  }

  pageChanged(event) {
    this.pager.page = event.page;
  }
  setPageSize(size) {
    this.pager.pageSize = size;
  }
  newLoading;
  create(){
    this.newLoading = true;
    this.functionService.create().subscribe((functionObject:any)=> {
      this.store.dispatch(
        new AddFunction({
          function:{
            ...functionObject,
            rules: _.map(
              functionObject.rules,
              (rule: any) => rule.id
            )
          }
        })
      );
      this.newFunction.emit(functionObject);
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
  onSave(functionObject) {
    this.save.emit(functionObject);
  }
}
