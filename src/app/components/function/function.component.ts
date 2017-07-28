import { Component, OnInit } from '@angular/core';
import {FunctionService} from "../../services/function.service";
import { ActivatedRoute,Params,Router,NavigationStart } from '@angular/router';

@Component({
  selector: 'app-function',
  templateUrl: './function.component.html',
  styleUrls: ['./function.component.css']
})
export class FunctionComponent implements OnInit {

  id
  constructor(private functionService:FunctionService, private route:ActivatedRoute) {
    this.route.params.subscribe((params:any)=> {
      this.id = params.id;
      this.init()
    })
  }

  func;
  loading;
  ngOnInit() {
  }
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
    }else{
      this.functionService.get(this.id).subscribe((func:any)=> {
        this.func = func;
        this.testFunc = func;
        this.latestCode = func.function;
        this.loading = false;
      })
    }
  }

  testFunc
  latestCode
  onChange(event){
    this.latestCode = event;
    console.log("Event Change:",event);
  }
  parameters;
  show;
  onRun(event){
    this.show = false;
    setTimeout(()=>{
      this.parameters = event;
      this.testFunc = {
        "function":this.latestCode,
        rules:this.func.rules
      };
      this.show = true;
      console.log("onLayoutUpdate Event:",event);
    })
  }
  loadingSave
  loadingSaveError
  save(){
    this.loadingSave = true;
    this.loadingSaveError = false;
    if(this.func.name && this.func.name != ""){
      this.func.function = this.latestCode;
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
}
