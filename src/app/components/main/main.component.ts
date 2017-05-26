import { Component, OnInit, ViewChild } from '@angular/core';
import {FunctionService} from "../../services/function.service";
import { ActivatedRoute,Params,Router,NavigationStart } from '@angular/router';
import {FunctionParameters} from "../../models/function-parameters";
import {FunctionObject} from "../../models/function-object";

import 'brace/theme/github';
import 'brace/mode/json';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  id;
  @ViewChild('editor') editor;
  parameters:FunctionParameters;

  constructor(private functionService:FunctionService, private route:ActivatedRoute) {
    this.route.params.subscribe((params:any)=> {
      this.id = params.id;
      this.parameters = {
        dx: params.dx,
        pe: params.pe,
        ou: params.ou
      }
      this.init()
    })
  }

  func:FunctionObject;

  ngOnInit() {

  }

  currentLayout = {
    rows: ['pe'],
    columns: ['dx'],
    filters: ['ou']
  }

  loading;
  init() {
    this.loading = true;
    if(this.id == "new"){
      this.func={
        function:'//Example of function implementation\n' +
        'parameters.progress(50);\n' +
        '$.ajax({\n' +
        '\turl: "../../../api/25/analytics.json?dimension=dx:" + parameters.dx + "&dimension=pe:" + parameters.pe + "&dimension=ou:" + parameters.ou,\n' +
        '\ttype: "GET",\n' +
        '\tsuccess: function(analyticsResults) {\n' +
        '\t\t  parameters.success(analyticsResults);\n' +

        '\t},\n' +
        '\terror:function(error){\n' +
        '\t\t  parameters.error(error);\n' +
        '\t}\n' +
        '});',
        rules:[]
      };
      this.loading = false;
      this.run();
    }else{
      this.functionService.get(this.id).subscribe((func:any)=> {
        this.func = func;
        this.loading = false;
        this.run();
      })
    }
  }

  results

  onRun(event?){
    if(event){
      event.stopPropagation();
    }
    this.run();
  }
  run() {
    this.results = false;
    this.functionService.run(this.parameters, this.func).subscribe((results:any)=> {
      this.results = results;
    },(error)=>{
      this.results = error;
    })
  }

  prepareCardData() {
    return {
      id: 'pivot',
      type: 'TABLE',
      shape: 'FULL_WIDTH'
    }
  }

  getCurrentDimension() {
    let currentDimensions = [];
    currentDimensions.push({name: 'dx', value: this.parameters.dx});
    currentDimensions.push({name: 'pe', value: this.parameters.pe});
    currentDimensions.push({name: 'ou', value: this.parameters.ou});
    return currentDimensions;
  }
  loadingSave;
  loadingSaveError;
  save(){
    this.loadingSave = true;
    this.loadingSaveError = false;
    if(this.func.name && this.func.name != ""){
      this.func.function = this.editor.oldText;
      this.functionService.save(this.func).subscribe((results)=>{
        this.func = results;
        this.loadingSave = false;
      },(error)=>{
        this.loadingSave = false;
        this.loadingSaveError = error;
      })
    }else{
      alert("Please write name for function.");
    }
  }
  onLayoutUpdate(event){
    this.loading = true;
    setTimeout(()=>{
      this.currentLayout = event;
      this.loading = false;
    })
  }

  onChange(event){
    this.func.function = event;
  }
}
