import { Component,ViewChild } from '@angular/core';
import {HttpClientService} from "./services/http-client.service";
import {Observable} from 'rxjs/Rx';

interface FunctionObject{
  id?:string;
  name?:string;
  code?:string;
  description?:string;
  lastUpdated?:Date;
  created?:Date
}
interface FunctionParameters{
  dx:string;
  ou:string;
  pe:string;
  DHIS2URL:string;
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
    DHIS2URL: "/api",
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

  items;
  loadItems;
  functions={

  };
  user;
  ngOnInit() {
    console.log(this.editor);
    this.http.get("me").subscribe((userResult)=>{
      this.user = userResult;
      this.http.get("dataStore/functions").subscribe((results)=>{
        console.log(results.json())
        let observable = [];
        results.json().forEach((id)=>{
          observable.push(this.http.get("dataStore/functions/" + id))
        });
        Observable.forkJoin(observable).subscribe((responses:any)=>{
          responses.forEach((response)=>{
            this.functions[response.json().id] = response.json();
            this.items = [{id:this.functions[response.json().id].id,text:this.functions[response.json().id].name}]
          })
          this.loadItems = true;
          this.selectedFunction.code = '//Example of function implementation\n' +
            'parameters.progress(50);\n' +
            '$.ajax({\n' +
            '\turl: parameters.DHIS2URL + "/analytics.json?dimension=dx:" + parameters.dx + "&dimension=pe:" + parameters.pe + "&filter=ou:" + parameters.ou,\n' +
            '\ttype: "GET",\n' +
            '\tsuccess: function(analyticsResults) {\n' +
            '\t\t  parameters.success(analyticsResults);\n' +

            '\t},\n' +
            '\terror:function(error){\n' +
            '\t\t  parameters.error(error);\n' +
            '\t}\n' +
            '});'
          //this.editor.oldText = this.selectedFunction.code;
        })
      })
    })
  }
  selectedFunction:FunctionObject={
    code:""
  };
  public selected(value:any):void {
    this.selectedFunction = this.functions[value.id];
    //console.log("Now:",this.text);

  }
  newFunction() {
    this.selectedFunction = {

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
    console.log(value);
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
  onRun() {
    console.log("Code:",this.editor);
    if(this.editor.oldText && this.editor.oldText != ""){
      if(!this.isError()){
        this.loading = true;
        this.loadingError = false;
        this.results = false;
        try{
          let execute = Function('parameters', this.editor.oldText);
          execute(this.parameters);
        }catch(e){
          console.log("Error:",JSON.stringify(e.stack));
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
    console.log("Progress:", progress);
  }
}
