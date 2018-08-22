import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { TabsetComponent } from 'ngx-bootstrap';
import { UpdateFunctionRule } from '../../shared/modules/ngx-dhis2-data-selection-filter/modules/data-filter/store/actions/function-rule.actions';
import { UpdateFunction } from '../../shared/modules/ngx-dhis2-data-selection-filter/modules/data-filter/store/actions/function.actions';
import {
  getFunctions,
  getSelectedFunctions
} from '../../shared/modules/ngx-dhis2-data-selection-filter/modules/data-filter/store/selectors';
import { Store } from '@ngrx/store';
import { AppState } from '../../store';
import { take } from 'rxjs/operators';
import * as _ from 'lodash';
import { Observable } from 'rxjs/index';
import * as fromModels from '../../shared/modules/ngx-dhis2-data-selection-filter/modules/data-filter/store/models';

@Component({
  selector: 'app-function-editor',
  templateUrl: './function-editor.component.html',
  styleUrls: ['./function-editor.component.css']
})
export class FunctionEditorComponent implements OnInit {

  @Input() func;
  functionLarge = false
  snippets = [
    {name:"Aggregate Analytics",code:"function analyticsRequest() {\n    return new Promise(function(resolve, reject) {\n        $.ajax({\n            url: \"../../../api/26/analytics.json?dimension=pe:\" + parameters.pe + \"&dimension=ou:\" + parameters.ou + \"&hierarchyMeta=true&skipData=true\",\n            type: \"GET\",\n            success: function(analyticsResults) {\n                try {\n                    //Code goes here\n                    analyticsResults.headers = [{\"name\":\"dx\",\"column\":\"Data\",\"type\":\"java.lang.String\",\"hidden\":false,\"meta\":true},{\"name\":\"pe\",\"column\":\"Period\",\"type\":\"java.lang.String\",\"hidden\":false,\"meta\":true},{\"name\":\"ou\",\"column\":\"Organisation Unit\",\"type\":\"java.lang.String\",\"hidden\":false,\"meta\":true},{\"name\":\"value\",\"column\":\"Value\",\"type\":\"java.lang.Double\",\"hidden\":false,\"meta\":false}];\n                    analyticsResults.metaData.names[parameters.rule.id] = parameters.rule.name;\n                    analyticsResults.metaData.dx = [parameters.rule.id];\n                    resolve(analyticsResults);\n                } catch (e) {\n                    reject(error);\n                }\n            },\n            error: function(error) {\n                reject(error);\n            }\n        });\n    })\n}"},
    {name:"Organisation Unit",code:"function organisationUnitsRequest() {\n    return new Promise(function(resolve, reject) {\n        $.ajax({\n            url: \"../../../api/26/organisationUnits.json\",\n            type: \"GET\",\n            success: function(organisatioUnitsResults) {\n                try {\n                    //Code goes here\n                    resolve(organisatioUnitsResults);\n                } catch (e) {\n                    reject(error);\n                }\n            },\n            error: function(error) {\n                reject(error);\n            }\n        });\n    })\n}"},
    {name:"Data Value Sets",code:"function dataValueSetsRequest() {\n    return new Promise(function(resolve, reject) {\n        $.ajax({\n            url: \"../../../api/26/dataValueSets.json?dataSet=dataSetID&orgUnit=orgUnitId&period=period\",\n            type: \"GET\",\n            success: function(dataValueSetsResults) {\n                try {\n                    //Code goes here\n                    resolve(dataValueSetsResults);\n                } catch (e) {\n                    reject(error);\n                }\n            },\n            error: function(error) {\n                reject(error);\n            }\n        });\n    })\n}"},
    {name:"Analytics Format",code:"{\n    \"headers\": [{\n        \"name\": \"dx\",\n        \"column\": \"Data\",\n        \"valueType\": \"TEXT\",\n        \"type\": \"java.lang.String\",\n        \"hidden\": false,\n        \"meta\": true\n    }, {\n        \"name\": \"pe\",\n        \"column\": \"Period\",\n        \"valueType\": \"TEXT\",\n        \"type\": \"java.lang.String\",\n        \"hidden\": false,\n        \"meta\": true\n    }, {\n        \"name\": \"ou\",\n        \"column\": \"Organisation unit\",\n        \"valueType\": \"TEXT\",\n        \"type\": \"java.lang.String\",\n        \"hidden\": false,\n        \"meta\": true\n    }, {\n        \"name\": \"value\",\n        \"column\": \"Value\",\n        \"valueType\": \"NUMBER\",\n        \"type\": \"java.lang.Double\",\n        \"hidden\": false,\n        \"meta\": false\n    }],\n    \"metaData\": {\n        \"names\": {\n            \"dx\": \"Data\",\n            \"pe\": \"Period\",\n            \"ou\": \"Organisation unit\",\n            \"m0frOspS7JY\": \"MOH - Tanzania\",\n            \"QHq2gYjwLPc\": \"3.2.2-1 Progress Facility profile shared locally\",\n            \"201812\": \"December 2018\",\n            \"uGIJ6IdkP7Q\": \"default\"\n        },\n        \"dx\": [\"QHq2gYjwLPc\"],\n        \"pe\": [\"201812\"],\n        \"ou\": [\"m0frOspS7JY\"],\n        \"co\": [\"uGIJ6IdkP7Q\"]\n    },\n    \"rows\": [],\n    \"width\": 0,\n    \"height\": 0\n}"},
    {name:"Multiple Promise", code:"function promisoryRequest() {\n    return new Promise(function(resolve, reject) {\n        $.ajax({\n            url: \"../../../api/26/analytics.json?dimension=pe:\" + parameters.pe + \"&dimension=ou:\" + parameters.ou + \"&hierarchyMeta=true\",\n            type: \"GET\",\n            success: function(analyticsResults) {\n                try {\n                    //Code goes here\n                    resolve(analyticsResults);\n                } catch (e) {\n                    reject(error);\n                }\n            },\n            error: function(error) {\n                reject(error);\n            }\n        });\n    })\n}\nfunction analyticsRequest() {\n    return new Promise(function(resolve, reject) {\n        var promises = [];\n        // List of promises to handle\n        var array = [\"element1\",\"element2\",\"element3\"];\n        array.forEach(function(){\n            // Add the promises \n            promises.push(promisoryRequest());\n        })\n        // Wait for the promises\n        Promise.all(promises).then(function(results){\n            resolve(results);\n        },function(error){\n            reject(error);\n        })\n    })\n}"}
  ];
  @ViewChild('staticTabs') staticTabs: TabsetComponent;
  functionList$: Observable<fromModels.FunctionObject[]>;
  constructor(private store: Store<AppState>) {
    this.functionList$ = store.select(getFunctions);
  }

  ngOnInit() {
  }
  ruleDetails = [];
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
  removeRule(rule){
    let index = this.ruleDetails.indexOf(rule);
    this.ruleDetails.splice(index,1);
    this.staticTabs.tabs[index].active = true;
  }
  onChange(event){
    console.log("Here");
    this.func.function = event;
    this.store
    .select(getSelectedFunctions)
    .pipe(take(1))
    .subscribe((selectedFunctions: any[]) => {
      _.each(selectedFunctions, (selectedFunction: any) => {
        if(selectedFunction.id === this.func.id){
          if(!selectedFunction.selected){
            selectedFunction.selected = false;
          }
          this.store.dispatch(
            new UpdateFunction(selectedFunction.id, this.func)
          );
          _.each(this.func.rules, (selectedRule: any) => {
            if(!selectedRule.selected){
              selectedRule.selected = false;
            }
            this.store.dispatch(
            new UpdateFunctionRule(selectedRule.id, selectedRule)
          );
          });
        }
      });
    });
  }
  showFunctions = true;
  onFunctionSelected(func){
    this.func = func;
    this.showFunctions = false;
  }
}
