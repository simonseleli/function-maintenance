import { Component,ViewChild } from '@angular/core';
import {HttpClientService} from "./services/http-client.service";
import {Observable} from 'rxjs/Rx';
import {FunctionService} from "./services/function.service";
import {FunctionParameters} from "./models/function-parameters";
import {FunctionObject} from "./models/function-object";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Directive Maintenance';

  @ViewChild('editor') editor;

  parameters:FunctionParameters = {
    dx: "FwpCBGQvYdL.BktmzfgqCjX",
    ou: "v5UR6nUPljk",
    pe: "2016Q4",
    success: (results)=>{
      this.success(results);
    },
    error: (error)=>{
      this.error(error);
    },
    progress: (progress)=>{
      this.progress(progress);
    }
  }
  constructor(/*private http:HttpClientService,*/private functionService:FunctionService){

  }
  text:string;
  options:any = {fontSize:"20px",maxLines: Infinity};

  items = [];
  loadItems;
  functions={

  };
  user;
  currentLayout
  ngOnInit() {
    this.currentLayout = {
      rows: ['pe'],
      columns: ['dx'],
      filters: ['ou']
    }
    this.functionService.getAll().subscribe((functions:any)=> {
      functions.forEach((sFunction, index)=> {
        this.functions[sFunction.id] = sFunction;
        this.items.push({id: this.functions[sFunction.id].id, text: this.functions[sFunction.id].name});
        if (sFunction.name == "Basic") {
          this.selectedFunction = sFunction;
        }
      })
      this.items = this.items.splice(0, this.items.length);
      this.loadItems = true;
    })
    this.selectedFunction.function = '//Example of function implementation\n' +
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
      '});'
  }
  selectedFunction:FunctionObject={
    function:"",
    rules:[]
  };
  public selected(value:any):void {
    this.selectedFunction = this.functions[value.id];

  }
  newFunction() {
    this.selectedFunction = {
      function:'//Example of function implementation\n' +
      'parameters.progress(50);\n' +
      '$.ajax({\n' +
      '\turl: "../../../api/analytics.json?dimension=dx:" + parameters.dx + "&dimension=pe:" + parameters.pe + "&dimension=ou:" + parameters.ou,\n' +
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
  }

  public removed(value:any):void {
    console.log('Removed value is: ', value);
  }

  public typed(value:any):void {
    console.log('New search input: ', value);
  }

  public refreshValue(value:any):void {

  }

  loading = false;
  loadingError = false;
  results = false;

  successError = false;
  errorError = false;
  progressError = false;
  isError(){
    this.successError = false;
    this.errorError = false;
    this.progressError = false;
    let value = this.editor.oldText.split(" ").join("").split("\n").join("").split("\t").join("");
    if(value.indexOf("parameters.success(") == -1){
      this.successError = true;
    }
    if(value.indexOf("parameters.error(") == -1){
      this.errorError = true;
    }
    if(value.indexOf("parameters.progress(") == -1){
      this.progressError = true;
    }
    return this.successError || this.errorError;
  }
  onRun(event?) {
    if(event){
      this.parameters.ou = event.ou;
      this.parameters.dx = event.dx;
      this.parameters.pe = event.pe;
    }
    if(this.editor.oldText && this.editor.oldText != ""){
      if(!this.isError()){
        this.loading = true;
        this.loadingError = false;
        this.results = false;
        try{
          let execute = Function('parameters', this.editor.oldText);
          execute(this.parameters);
        }catch(e){
          this.loading = false;
          this.loadingError = e.stack;
        }
      }
    }else{
      alert("Please write code")
    }
  }
  save(){
    this.loading = true;
    this.loadingError = false;
    if(this.selectedFunction.name && this.selectedFunction.name != ""){
      this.selectedFunction.function = this.editor.oldText;
      this.functionService.save(this.selectedFunction).subscribe((results)=>{
        this.selectedFunction = results;
        this.loading = false;
      },(error)=>{
        this.loading = false;
        this.loadingError = error;
      })
    }else{
      alert("Please write name for function.");
    }
  }
  success(results) {
    this.results = results;
    this.loading = false;
  }
  errorFunction() {
    return this.error;
  }
  error(error) {
    console.log("Error:",error);
    this.loading = false;
    this.loadingError = error;
  }
  progressPercent;
  progress(progress) {
    this.progressPercent = progress;
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
  onLayoutUpdate(event){
    this.loading = true;
    setTimeout(()=>{
      this.currentLayout = event;
      this.loading = false;
    })
  }
}
