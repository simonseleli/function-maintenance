import { Component, OnInit, ViewChild } from '@angular/core';
import {FunctionService} from "../../services/function.service";
import { ActivatedRoute,Params,Router,NavigationStart } from '@angular/router';
import {ToasterService} from 'angular2-toaster';
import {HttpClientService} from "../../services/http-client.service";
import { TabsetComponent } from 'ngx-bootstrap';

declare var $:any

@Component({
  selector: 'app-function',
  templateUrl: './function.component.html',
  styleUrls: ['./function.component.css']
})
export class FunctionComponent implements OnInit {

  id;
  operation
  constructor(private functionService:FunctionService,
              private route:ActivatedRoute,
              private router:Router,
              private toasterService: ToasterService,
              private http:HttpClientService) {
    this.route.params.subscribe((params:any)=> {
      this.id = params.id;
      this.operation = params.operation;
      this.init()
    })
  }
  options:any = {maxLines: 1000, printMargin: false,fontFamily: "monospace",fontSize: 13};
  func;
  loading;
  ngOnInit() {
  }
  init() {
    this.loading = true;
    if(this.id == "new"){
      this.functionService.getId().subscribe((results:any)=> {
        this.http.get("dataElements.json?pageSize=1").subscribe((dataElementResults)=>{
          this.func={
            function:'//Example of function implementation\n' +
            'parameters.progress(50);\n' +
            '$.ajax({\n' +
            '\turl: "../../../api/25/analytics.json?dimension=dx:" + parameters.rule.json.data + "&dimension=pe:" + parameters.pe + "&dimension=ou:" + parameters.ou,\n' +
            '\ttype: "GET",\n' +
            '\tsuccess: function(analyticsResults) {\n' +
            '\t\t  parameters.success(analyticsResults);\n' +

            '\t},\n' +
            '\terror:function(error){\n' +
            '\t\t  parameters.error(error);\n' +
            '\t}\n' +
            '});',
            rules:[
              {
                id: results.codes[0],
                name: "Default",
                isDefault:true,
                description: "This is the default rule. Using the data element '" + dataElementResults.dataElements[0].displayName+ "'.",
                json: JSON.stringify({"data": dataElementResults.dataElements[0].id})
              }
            ]
          };
          this.testFunc = this.func;
          this.latestCode = this.func.function;
          this.loading = false;
        },(error)=>{
          this.toasterService.pop('error', 'Error', error.message);
        })
      },(error)=>{
        this.toasterService.pop('error', 'Error', error.message);
      })
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
      console.warn(event.rule);
      if(typeof event.rule.json == "string"){
        this.parameters.rule.json = JSON.parse(event.rule.json);
      }
      if(this.selectedRule){
        this.parameters.rule = this.selectedRule;
      }
      this.testFunc = this.func;
      this.testFunc.function = this.latestCode;
      this.show = true;
    })
  }
  loadingSave;
  loadingSaveError;
  save(goBack){
    this.loadingSave = true;
    this.loadingSaveError = false;
    if(this.func.name && this.func.name != ""){
      this.func.function = this.latestCode;
      this.functionService.save(this.func).subscribe((results)=>{
        this.func = results;
        this.loadingSave = false;
        this.toasterService.pop('success', 'Success', 'Function saved successfully.');
        if(!goBack){
          this.router.navigateByUrl('/functions');
        }
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
    this.parameters.rule = {
      id:event.id,
      name:event.name,
      description:event.description,
      json: JSON.parse(event.json)
    };
  }
  newRule;
  functionLarge;
  createNewRule(){
    let newRule = {
      name:"",
      description:"",
      json:""
    };
    this.editRule(newRule)
  }

  @ViewChild('staticTabs') staticTabs: TabsetComponent;
  ruleDetails = []
  editRule(rule){
    console.log(rule.json);
    console.log(JSON.stringify(rule.json));
    let selectedRule = Object.assign({}, rule);
    if(typeof selectedRule.json != 'string')
      selectedRule.json = JSON.stringify(selectedRule.json);
    let index = -1;
    this.ruleDetails.forEach((ruleDetail,i)=>{
      if(ruleDetail.id == selectedRule.id){
        index = i;
      }
    })
    if(index < 0){
      this.ruleDetails.push(selectedRule);
      index = this.ruleDetails.length;
    }
    setTimeout(()=>{
      this.staticTabs.tabs[index].active = true;
      this.functionLarge = true
    })
    /*this.newRule = Object.assign({}, rule);
    if(typeof rule.json != 'string')
      this.newRule.json = JSON.stringify(this.newRule.json);
    setTimeout(()=>{
      this.functionLarge = true;
    })*/
  }
  savingRule
  ruleErrors
  saveRule(newRule){
    if(!newRule.id){
      this.savingRule = true;
      this.ruleErrors = {}
      let canSave = true;
      if(newRule.name == ""){
        canSave = false;
        this.ruleErrors.name = {
          type:'danger',
          object:{message:"Please enter a valid name."}
        }
      }
      if(canSave){
        this.http.get("system/id").subscribe((results:any)=>{
          console.log("Rule Details:",this.ruleDetails)
          newRule.id = results.codes[0];
          this.func.rules.push(newRule);
          this.savingRule = false;
        })
      }else{
        this.savingRule = false;
      }
    }else{
      this.func.rules.forEach((rule)=>{
        if(rule.id == newRule.id){
          Object.keys(newRule).forEach((key)=>{
            rule[key] = newRule[key];
          })
        }
      })
      this.savingRule = false;
    }
  }

  removeRule(rule){
    let index = this.ruleDetails.indexOf(rule);
    this.ruleDetails.splice(index,1);
    this.staticTabs.tabs[index].active = true;
  }

  @ViewChild('editor') editor;

  undo(){
    this.editor.getEditor().undo()
  }
  redo(){
    this.editor.getEditor().redo()
  }
  sizes = [
    10,11,12,13,14, 16,20,24
  ]
  indent(width){
    this.options.tabSize += width;
    console.log("Tab Indent:",Object.getOwnPropertyNames(this.editor.getEditor()));
    this.editor.getEditor().setTabSize(this.options.tabSize);
  }
  setFontSize(){
    this.editor.getEditor().setFontSize(this.options.fontSize + "px")
  }
  copy(){
    document.execCommand('copy');
  }
  cut(){
    document.execCommand('cut');
  }
  paste(){
    this.editor.getEditor().session._emit('paste');
    window.document["session"] = this.editor.getEditor().session;
  }
}
