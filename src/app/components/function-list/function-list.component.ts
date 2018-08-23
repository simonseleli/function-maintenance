import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FunctionObject } from '../../shared/modules/ngx-dhis2-data-selection-filter/modules/data-filter/store/models';

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

  pager: any = {
    page: 1,
    pageSize: 5
  };
  pageClustering;
  functionFilter: any = { name: '' };
  constructor() {}

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

  create(){
    /*this.activate.emit({
      id:"new",
      name:"New Function",
      function:"",
      rules:[],
      description:"",
      lastUpdated:new Date(),
      created:new Date(),
    })*/
  }
}
