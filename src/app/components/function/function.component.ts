import { Component, OnInit } from '@angular/core';
import {FunctionService} from "../../services/function.service";
import { ActivatedRoute,Params,Router,NavigationStart } from '@angular/router';
import {ToasterService} from 'angular2-toaster';

@Component({
  selector: 'app-function',
  templateUrl: './function.component.html',
  styleUrls: ['./function.component.css']
})
export class FunctionComponent implements OnInit {

  id
  constructor(private functionService:FunctionService, private route:ActivatedRoute,private toasterService: ToasterService) {
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
      this.testFunc = this.func;
      this.latestCode = this.func.function;
      this.loading = false;
    }else{
      this.functionService.get(this.id).subscribe((func:any)=> {
        this.func = func;
        this.testFunc = func;
        this.latestCode = func.function;
        this.loading = false;
      },(error)=>{
        this.toasterService.pop('error', 'Error', error.message);
      })
    }
  }

  testFunc
  latestCode
  onChange(event){
    this.latestCode = event;
  }
  parameters:any = {};
  show;
  onRun(event){
    this.show = false;
    setTimeout(()=>{
      this.parameters = event;
      if(this.selectedRule){
        this.parameters.rule = this.selectedRule;
      }
      this.testFunc = {
        "function":this.latestCode
      };
      this.show = true;
    })
  }
  loadingSave;
  loadingSaveError;
  save(){
    this.loadingSave = true;
    this.loadingSaveError = false;
    if(this.func.name && this.func.name != ""){
      this.func.function = this.latestCode;
      this.functionService.save(this.func).subscribe((results)=>{
        this.func = results;
        this.loadingSave = false;
        this.toasterService.pop('success', 'Success', 'Function saved successfully.');
      },(error)=>{
        this.loadingSave = false;
        this.loadingSaveError = error;
        this.toasterService.pop('error', 'Saving Error', error.message);
      })
    }else{
      this.toasterService.pop('error', 'Saving Error', "Please write name of function");
    }
  }
  selectedRule
  onSelectRule(event){
    console.log(event);
    console.log("JSON:",JSON.parse(event.json));
    this.parameters.rule = {
      id:event.id,
      name:event.name,
      description:event.description,
      json: JSON.parse(event.json)
    };
  }
}
