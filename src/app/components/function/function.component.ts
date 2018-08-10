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
            '\turl: "../../../api/26/analytics.json?dimension=dx:" + parameters.rule.json.data + "&dimension=pe:" + parameters.pe + "&dimension=ou:" + parameters.ou,\n' +
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

  snippets = [
    {name:"Aggregate Analytics",code:"function analyticsRequest() {\n    return new Promise(function(resolve, reject) {\n        $.ajax({\n            url: \"../../../api/26/analytics.json?dimension=pe:\" + parameters.pe + \"&dimension=ou:\" + parameters.ou + \"&hierarchyMeta=true&skipData=true\",\n            type: \"GET\",\n            success: function(analyticsResults) {\n                try {\n                    //Code goes here\n                    analyticsResults.headers = [{\"name\":\"dx\",\"column\":\"Data\",\"type\":\"java.lang.String\",\"hidden\":false,\"meta\":true},{\"name\":\"pe\",\"column\":\"Period\",\"type\":\"java.lang.String\",\"hidden\":false,\"meta\":true},{\"name\":\"ou\",\"column\":\"Organisation Unit\",\"type\":\"java.lang.String\",\"hidden\":false,\"meta\":true},{\"name\":\"value\",\"column\":\"Value\",\"type\":\"java.lang.Double\",\"hidden\":false,\"meta\":false}];\n                    analyticsResults.metaData.names[parameters.rule.id] = parameters.rule.name;\n                    analyticsResults.metaData.dx = [parameters.rule.id];\n                    resolve(analyticsResults);\n                } catch (e) {\n                    reject(error);\n                }\n            },\n            error: function(error) {\n                reject(error);\n            }\n        });\n    })\n}"},
    {name:"Organisation Unit",code:"function organisationUnitsRequest() {\n    return new Promise(function(resolve, reject) {\n        $.ajax({\n            url: \"../../../api/26/organisationUnits.json\",\n            type: \"GET\",\n            success: function(organisatioUnitsResults) {\n                try {\n                    //Code goes here\n                    resolve(organisatioUnitsResults);\n                } catch (e) {\n                    reject(error);\n                }\n            },\n            error: function(error) {\n                reject(error);\n            }\n        });\n    })\n}"},
    {name:"Data Value Sets",code:"function dataValueSetsRequest() {\n    return new Promise(function(resolve, reject) {\n        $.ajax({\n            url: \"../../../api/26/dataValueSets.json?dataSet=dataSetID&orgUnit=orgUnitId&period=period\",\n            type: \"GET\",\n            success: function(dataValueSetsResults) {\n                try {\n                    //Code goes here\n                    resolve(dataValueSetsResults);\n                } catch (e) {\n                    reject(error);\n                }\n            },\n            error: function(error) {\n                reject(error);\n            }\n        });\n    })\n}"},
    {name:"Analytics Format",code:"{\n    \"headers\": [{\n        \"name\": \"dx\",\n        \"column\": \"Data\",\n        \"valueType\": \"TEXT\",\n        \"type\": \"java.lang.String\",\n        \"hidden\": false,\n        \"meta\": true\n    }, {\n        \"name\": \"pe\",\n        \"column\": \"Period\",\n        \"valueType\": \"TEXT\",\n        \"type\": \"java.lang.String\",\n        \"hidden\": false,\n        \"meta\": true\n    }, {\n        \"name\": \"ou\",\n        \"column\": \"Organisation unit\",\n        \"valueType\": \"TEXT\",\n        \"type\": \"java.lang.String\",\n        \"hidden\": false,\n        \"meta\": true\n    }, {\n        \"name\": \"value\",\n        \"column\": \"Value\",\n        \"valueType\": \"NUMBER\",\n        \"type\": \"java.lang.Double\",\n        \"hidden\": false,\n        \"meta\": false\n    }],\n    \"metaData\": {\n        \"names\": {\n            \"dx\": \"Data\",\n            \"pe\": \"Period\",\n            \"ou\": \"Organisation unit\",\n            \"m0frOspS7JY\": \"MOH - Tanzania\",\n            \"QHq2gYjwLPc\": \"3.2.2-1 Progress Facility profile shared locally\",\n            \"201812\": \"December 2018\",\n            \"uGIJ6IdkP7Q\": \"default\"\n        },\n        \"dx\": [\"QHq2gYjwLPc\"],\n        \"pe\": [\"201812\"],\n        \"ou\": [\"m0frOspS7JY\"],\n        \"co\": [\"uGIJ6IdkP7Q\"]\n    },\n    \"rows\": [],\n    \"width\": 0,\n    \"height\": 0\n}"},
    {name:"Multiple Promise", code:"function promisoryRequest() {\n    return new Promise(function(resolve, reject) {\n        $.ajax({\n            url: \"../../../api/26/analytics.json?dimension=pe:\" + parameters.pe + \"&dimension=ou:\" + parameters.ou + \"&hierarchyMeta=true\",\n            type: \"GET\",\n            success: function(analyticsResults) {\n                try {\n                    //Code goes here\n                    resolve(analyticsResults);\n                } catch (e) {\n                    reject(error);\n                }\n            },\n            error: function(error) {\n                reject(error);\n            }\n        });\n    })\n}\nfunction analyticsRequest() {\n    return new Promise(function(resolve, reject) {\n        var promises = [];\n        // List of promises to handle\n        var array = [\"element1\",\"element2\",\"element3\"];\n        array.forEach(function(){\n            // Add the promises \n            promises.push(promisoryRequest());\n        })\n        // Wait for the promises\n        Promise.all(promises).then(function(results){\n            resolve(results);\n        },function(error){\n            reject(error);\n        })\n    })\n}"}
  ]
  @ViewChild('staticTabs') staticTabs: TabsetComponent;
  ruleDetails = []
  editRule(rule){
    let selectedRule = Object.assign({}, rule);
    if(typeof selectedRule.json != 'string')
      selectedRule.json = JSON.stringify(selectedRule.json);
    let index = -1;
    this.ruleDetails.forEach((ruleDetail,i)=>{
      if(ruleDetail.id == selectedRule.id){
        index = i + 1;
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
  onRuleJSONChange(event,rule){
    rule.json = event;
  }
  removeRule(rule){
    let index = this.ruleDetails.indexOf(rule);
    this.ruleDetails.splice(index,1);
    this.staticTabs.tabs[index].active = true;
  }

  copy(){
    document.execCommand('copy');
  }
  cut(){
    document.execCommand('cut');
  }
}
