import { Component,ViewChild } from '@angular/core';
import {HttpClientService} from "./services/http-client.service";
import {Observable} from 'rxjs/Rx';

interface FunctionObject{
  id?:string;
  name?:string;
  displayName?:string;
  function?:string;
  rules?:Array<any>;
  user?:Object;
  description?:string;
  lastUpdated?:Date;
  created?:Date
}
interface FunctionParameters{
  dx:string;
  ou:string;
  pe:string;
  success: Function,
  error: Function,
  progress: Function
}
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
  constructor(private http:HttpClientService){

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
    this.http.get("me").subscribe((userResult)=>{
      this.user = userResult;
      this.http.get("dataStore/functions").subscribe((results)=>{
        let observable = [];
        results.json().forEach((id)=>{
          observable.push(this.http.get("dataStore/functions/" + id))
        });
        Observable.forkJoin(observable).subscribe((responses:any)=>{
          responses.forEach((response,index)=>{
            let json = response.json();
            this.functions[json.id] = json;
            this.items.push({id:this.functions[json.id].id,text:this.functions[json.id].name});
            if(json.name == "Basic"){
              this.selectedFunction = json;
            }
          })
          this.items = this.items.splice(0,this.items.length);
          this.loadItems = true;

          //this.editor.oldText = this.selectedFunction.code;
        },(error)=>{

        })
      },(error)=>{

      })
      this.selectedFunction.function = '//Example of function implementation\n' +
        'parameters.progress(50);\n' +
        '$.ajax({\n' +
        '\turl: "../../../api/analytics.json?dimension=dx:" + parameters.dx + "&dimension=pe:" + parameters.pe + "&filter=ou:" + parameters.ou,\n' +
        '\ttype: "GET",\n' +
        '\tsuccess: function(analyticsResults) {\n' +
        '\t\t  parameters.success(analyticsResults);\n' +

        '\t},\n' +
        '\terror:function(error){\n' +
        '\t\t  parameters.error(error);\n' +
        '\t}\n' +
        '});'
    })
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
      function:"",
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
  onRun(event) {
    this.parameters.ou = event.ou;
    this.parameters.dx = event.dx;
    this.parameters.pe = event.pe;
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
    if(this.selectedFunction.name && this.selectedFunction.name != ""){
      this.selectedFunction.displayName = this.selectedFunction.name
      if(this.selectedFunction.id){
        this.selectedFunction.lastUpdated = new Date();
        this.http.put("dataStore/functions/" + this.selectedFunction.id,this.selectedFunction).subscribe((results)=>{
          console.log(results)
        })
      }else{
        this.http.get("system/id").subscribe((results)=>{
          this.selectedFunction.id = results.json().codes[0];
          this.selectedFunction.created = new Date();
          this.selectedFunction.lastUpdated = new Date();
          this.http.post("dataStore/functions/" + this.selectedFunction.id,this.selectedFunction).subscribe((results)=>{
            console.log(results)
          })
        })
      }
    }else{
      alert("Please write name for function.");
    }
  }
  success(results) {
    this.results = results;
    this.loading = false;
    console.log("Results:", results,this.results);
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
