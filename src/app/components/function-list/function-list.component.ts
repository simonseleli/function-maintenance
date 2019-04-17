import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { ToasterService } from 'angular2-toaster';
import * as _ from 'lodash';
import { FunctionObject } from 'src/app/shared/modules/ngx-dhis2-data-selection-filter/modules/data-filter/models';

import { FunctionService } from '../../shared/modules/ngx-dhis2-data-selection-filter/modules/data-filter/services/function.service';
import { AddFunction } from '../../shared/modules/ngx-dhis2-data-selection-filter/modules/data-filter/store/actions/function.actions';
import { AppState } from '../../store/reducers';
import { User } from 'src/app/core';

@Component({
  selector: 'app-function-list',
  templateUrl: './function-list.component.html',
  styleUrls: ['./function-list.component.css']
})
export class FunctionListComponent implements OnInit {
  @Input()
  functionList: FunctionObject[];

  @Input()
  activeFunction: FunctionObject;

  @Input()
  currentUser: User;

  newLoading: boolean;

  @Output()
  activate: EventEmitter<FunctionObject> = new EventEmitter<FunctionObject>();

  @Output()
  newFunction: EventEmitter<FunctionObject> = new EventEmitter<
    FunctionObject
  >();

  @Output()
  save: EventEmitter<FunctionObject> = new EventEmitter<FunctionObject>();

  @Output()
  delete: EventEmitter<FunctionObject> = new EventEmitter<FunctionObject>();

  lodash = _;
  pager: any = {
    page: 1,
    pageSize: 5
  };
  pageClustering;
  functionFilter: any = { name: '' };
  deleteFunction;
  constructor(
    private functionService: FunctionService,
    private store: Store<AppState>,
    private toasterService: ToasterService
  ) {}

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
  deleteFunctionObject(functionObject) {
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

  create() {
    this.newLoading = true;
    this.functionService.create(this.currentUser).subscribe(
      (functionObject: any) => {
        this.newFunction.emit(functionObject);
        this.newLoading = false;
      },
      error => {
        this.toasterService.pop('error', 'Error', error.message);
        this.newLoading = false;
      }
    );
  }
  order(functionOne, functionTwo) {
    if (typeof true === 'boolean') {
      if (functionOne) {
        return 1;
      } else {
        return -1;
      }
    }
    return functionOne > functionTwo ? 1 : -1;
  }
  onSave(functionObject) {
    this.save.emit(functionObject);
  }
  filter(field) {
    return o => {
      return o[field];
    };
  }
}
