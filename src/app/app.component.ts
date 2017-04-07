import { Component,ViewChild } from '@angular/core';
import {HttpClientService} from "./services/http-client.service";

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
  title = 'Function Manager!';

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
  options:any = {fontSize:"20px"};

  items;
  loadItems;
  functions = {

  }
  ngOnInit() {
    console.log(this.editor);
    this.http.get("dataStore/functions").subscribe((results)=>{
      console.log(results.json())
      results.json().forEach((id)=>{
        this.http.get("dataStore/functions/" + id).subscribe((result)=>{
          this.functions[result.json().id] = result.json();
          this.items = [{id:this.functions[result.json().id].id,text:this.functions[result.json().id].name}]
          this.loadItems = true;
        })
      })
    })
  }
  currentId;
  public selected(value:any):void {
    console.log('Selected value is: ', value);
    console.log("Previous:",this.text);
    this.text = this.functions[value.id].code;
    this.name = this.functions[value.id].name;
    this.currentId = this.functions[value.id].id;
    //console.log("Now:",this.text);

  }
  newFunction() {
    this.text = null;
    this.name = null;
    this.currentId = null;
    this.items = [];
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
  onRun() {
    console.log("Code:",this.editor.oldText);
    if(this.text && this.text != ""){
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
    }else{
      alert("Please write code")
    }
  }
  name;
  save(){
    if(this.name && this.name != ""){
      if(this.currentId){
        this.http.put("dataStore/functions/" + this.currentId,{id:this.currentId,name:this.name,code:this.editor.oldText}).subscribe((results)=>{
          console.log(results)
        })
      }else{
        let id = (new Date()).getTime();
        this.http.post("dataStore/functions/" + id,{id:id,name:this.name,code:this.editor.oldText}).subscribe((results)=>{
          console.log(results)
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
  progress(progress) {
    console.log("Progress:", progress);
  }
}
