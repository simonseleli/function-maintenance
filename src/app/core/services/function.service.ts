import { Injectable } from '@angular/core';
import { NgxDhis2HttpClientService } from '@hisptz/ngx-dhis2-http-client';
import * as fromModels from '../../shared/modules/ngx-dhis2-data-selection-filter/modules/data-filter/store/models';
import { User } from '../models/user.model';
import { UserService } from './user.service';
import { Observable } from 'rxjs';
import { forkJoin } from 'rxjs';  // change to new RxJS 6 import syntax

@Injectable({
  providedIn: 'root'
})
export class FunctionService {

  constructor(private httpClient: NgxDhis2HttpClientService,private userService:UserService) { }

  save(sFunction:fromModels.FunctionObject){
    return new Observable((observable)=>{
      if(sFunction.id){
        sFunction.lastUpdated = new Date();
        sFunction.displayName = sFunction.name;
        this.httpClient.put("dataStore/functions/" + sFunction.id,sFunction).subscribe((results)=>{
          observable.next(sFunction);
          observable.complete();
        },(error)=>{
          observable.error(error.json());
          observable.complete();
        })
      }else{
        this.httpClient.get("system/id").subscribe((results:any)=>{
          sFunction.id = results.codes[0];
          sFunction.created = new Date();
          sFunction.lastUpdated = new Date();
          sFunction.externalAccess = false;
          sFunction.userGroupAccesses = [];
          sFunction.attributeValues = [];
          sFunction.translations = [];
          sFunction.userAccesses = [];
          sFunction.publicAccess = "rw------";

          this.userService.getCurrentUser().subscribe((user:User)=>{
            sFunction.user = {
              id:user.id
            };
            this.httpClient.get("system/info").subscribe((results:any)=>{
              sFunction.href = results.contextPath +"?api/dataStore/functions/" + sFunction.id;
              this.httpClient.post("dataStore/functions/" + sFunction.id,sFunction).subscribe((results)=>{
                observable.next(sFunction);
                observable.complete();
              },(error)=>{
                observable.error(error.json());
                observable.complete();
              })
            },(error)=>{
              observable.error(error.json());
              observable.complete();
            })
          })
        })
      }
    })

  }
  getId(number?){
    let url = "system/id";
    if(number){
      url += ".json?limit=" + number;
    }
    return this.httpClient.get(url);
  }
  delete(sFunction:fromModels.FunctionObject){
    return new Observable((observable)=>{

      this.httpClient.delete("dataStore/functions/" + sFunction.id).subscribe((results)=>{
        observable.next(results);
        observable.complete();
      },(error)=>{
        observable.error(error.json());
        observable.complete();
      })
    })

  }
  apiVersion = ""
  getAll(){
    return new Observable((observ)=>{
      this.httpClient.get("dataStore/functions").subscribe((results:any)=>{
        let observable = [];
        if(results.length > 0){
          results.forEach((id)=>{
            observable.push(this.httpClient.get("dataStore/functions/" + id))
          });
          forkJoin(observable).subscribe((responses:any)=>{
            let functions = [];
            responses.forEach((response,index)=>{
              functions.push(response);
            })
            observ.next(functions);
            observ.complete();
          },(error)=>{
            observ.error(error.json());
            observ.complete();
          })
        }else{
          this.httpClient.get("system/info").subscribe((response:any)=>{
            if(parseFloat(response.version) > 2.24){
              this.apiVersion = "/24"
            }
            forkJoin(this.creationOfNewFunctionObseravble()).subscribe((responses:any)=>{
              this.getAll().subscribe((funcs)=>{
                observ.next(funcs);
                observ.complete();
              },(error)=>{
                observ.error(error);
                observ.complete();
              })
            },(error)=>{
              observ.error(error.json());
              observ.complete();
            })
          })
        }
      },(error)=>{
        if(error.status == 404){
          let observable = [];
          this.httpClient.get("system/info").subscribe((response:any)=>{
            if(parseFloat(response.version) > 2.24){
              this.apiVersion = "/24"
            }
            forkJoin(this.creationOfNewFunctionObseravble()).subscribe((responses:any)=>{
              this.getAll().subscribe((funcs:any)=>{
                observ.next(funcs);
                observ.complete();
              },(error)=>{
                observ.error(error);
                observ.complete();
              })
            },(error)=>{
              observ.error(error);
              observ.complete();
            })
          })
        }else{
          observ.error(error);
          observ.complete();
        }
      })
    })

  }
  creationOfNewFunctionObseravble(){
    let observable = [];
    observable.push(this.predictor());
    observable.push(this.createCompletenessFunctions());
    observable.push(this.createEarlyCompletenessFunctions());
    observable.push(this.createReportingRateByFilledData());
    observable.push(this.proportionOfOrgUnitsNotReport());
    observable.push(this.orgUnitsReportedOnDataSet());
    return observable;
  }
  createStockOutFunctions(){
    return new Observable((observable)=>{
      let stockout:any = {
        "function": "//Example of function implementation\nparameters.progress(50);\nfunction calculatePercentageForOU(ou){\n    return new Promise(function(resolve,reject){\n      $.ajax({\n                    \turl: \"../../../api" +this.apiVersion+ "/analytics.json?dimension=dx:\" + parameters.rule.json.data + \"&dimension=pe:\" + parameters.pe + \"&dimension=ou:LEVEL-4;\" + ou + \"&hierarchyMeta=true\",\n                    \ttype: \"GET\",\n                    \tsuccess: function(analyticsResults) {\n                    \t    var orgUnits = [];\n                    \t    analyticsResults.rows.forEach(function(row){\n                    \t        var orgUnitId = row[1] + '.' + row[2]\n                    \t        if(orgUnits.indexOf(orgUnitId) == -1){\n                    \t            orgUnits.push(orgUnitId);\n                    \t        }\n                    \t    })\n                    \t    analyticsResults.metaData.dx = [parameters.rule.id];\n                    \t    analyticsResults.metaData.names[parameters.rule.id] = parameters.rule.name;\n                    \t    analyticsResults.rows = [];\n                    \t    analyticsResults.metaData.pe.forEach(function(pe){\n                    \t        var currentPeOrgUnits = [];\n                    \t        orgUnits.forEach(function(orgUnit) {\n                    \t            if (orgUnit.split('.')[0] === pe) {\n                    \t               currentPeOrgUnits.push(orgUnit)\n                    \t            }\n                    \t        });\n                    \t        \n                    \t        if (currentPeOrgUnits.length > 0) {\n                    \t            analyticsResults.rows.push([parameters.rule.id,pe,ou,\"\" + (currentPeOrgUnits.length * 100 / analyticsResults.metaData.ou.length).toFixed(2)])\n                    \t        }\n                    \t    });\n                    \t\tanalyticsResults.metaData.ou = [ou];\n                    \t\tresolve(analyticsResults);\n                    \t},\n                    \terror:function(error){\n                    \t\t  reject(error);\n                    \t}\n                    });  \n    })\n}\n$.ajax({\n    url: \"../../../api" +this.apiVersion+ "/analytics.json?dimension=pe:\" + parameters.pe + \"&dimension=ou:\" + parameters.ou + \"&skipData=true\",\n    type: \"GET\",\n    success: function(dummyAnalyticsResults) {\n        var promises = [];\n        var analytics;\n        dummyAnalyticsResults.metaData.ou.forEach(function(ou){\n            promises.push(calculatePercentageForOU(ou).then(function(analyticsResults){\n                if(!analytics){\n                    analytics = analyticsResults;\n                }else{\n                   analytics.metaData.ou = analytics.metaData.ou.concat(analyticsResults.metaData.ou);\n                   analyticsResults.metaData.ou.forEach(function(ouid){\n                       analytics.metaData.names[ouid] = analyticsResults.metaData.names[ouid];\n                   })\n                    analytics.rows = analytics.rows.concat(analyticsResults.rows);\n                }\n            }));\n        })\n        \n        Promise.all(promises).then(function(){\n            parameters.success(analytics);\n        },function(error){\n            parameters.error(error);\n        })\n},error:function(error){\n    reject(error);\n}\n});",
        "rules": [
        ],
        "name": "Facilities With Stockout",
        "description": "Number of facilities with stockout"
      };
      this.httpClient.get("dataElements.json?filter=name:ilike:stockout&filter=valueType:eq:BOOLEAN&rootJunction=OR&paging=false").subscribe((dataElementResults:any)=>{
        if(dataElementResults.dataElements.length == 0){
          //TODO add a provision if the dhis server has no stockout data elements
        }else{
          this.getId(dataElementResults.dataElements.length).subscribe((codeResults:any)=>{
            dataElementResults.dataElements.forEach((dataElement)=>{
              if(dataElement.displayName.toLowerCase().indexOf("stockout") >= -1){
                let rule:any = {
                  id: codeResults.codes[0],
                  name: dataElement.displayName,
                  description: "This is the rule. Using the data set '" + dataElement.displayName+ "'.",
                  json: {"data": dataElement.id}
                }
                if(stockout.rules.length == 0){
                  rule.isDefault = true;
                }
                stockout.rules.push(rule);
              }
            })
            if(stockout.rules.length == 0){
              stockout.rules.push({
                id: codeResults.codes[0],
                name: dataElementResults.dataElements[0].displayName,
                isDefault:true,
                description: "This is the rule. Using the data element '" + dataElementResults.dataElements[0].displayName+ "'.",
                json: {"data": dataElementResults.dataElements[0].id}
              });
            }
            this.save(stockout).subscribe((res:any)=>{
              observable.next(res);
              observable.complete();
            },(error)=>{
              observable.error(error.json());
              observable.complete();
            })
          },(error)=>{
            observable.error(error.json());
            observable.complete();
          })
        }

      },(error)=>{
        observable.error(error.json());
        observable.complete();
      })
    })
  }
  createPredictors(){
    return new Observable((observable)=>{
      let stockout:any = {
        "function": "//Example of function implementation\nparameters.progress(50);\nfunction calculatePercentageForOU(ou){\n    return new Promise(function(resolve,reject){\n      $.ajax({\n                    \turl: \"../../../api" +this.apiVersion+ "/analytics.json?dimension=dx:\" + parameters.rule.json.data + \"&dimension=pe:\" + parameters.pe + \"&dimension=ou:LEVEL-4;\" + ou + \"&hierarchyMeta=true\",\n                    \ttype: \"GET\",\n                    \tsuccess: function(analyticsResults) {\n                    \t    var orgUnits = [];\n                    \t    analyticsResults.rows.forEach(function(row){\n                    \t        var orgUnitId = row[1] + '.' + row[2]\n                    \t        if(orgUnits.indexOf(orgUnitId) == -1){\n                    \t            orgUnits.push(orgUnitId);\n                    \t        }\n                    \t    })\n                    \t    analyticsResults.metaData.dx = [parameters.rule.id];\n                    \t    analyticsResults.metaData.names[parameters.rule.id] = parameters.rule.name;\n                    \t    analyticsResults.rows = [];\n                    \t    analyticsResults.metaData.pe.forEach(function(pe){\n                    \t        var currentPeOrgUnits = [];\n                    \t        orgUnits.forEach(function(orgUnit) {\n                    \t            if (orgUnit.split('.')[0] === pe) {\n                    \t               currentPeOrgUnits.push(orgUnit)\n                    \t            }\n                    \t        });\n                    \t        \n                    \t        if (currentPeOrgUnits.length > 0) {\n                    \t            analyticsResults.rows.push([parameters.rule.id,pe,ou,\"\" + (currentPeOrgUnits.length * 100 / analyticsResults.metaData.ou.length).toFixed(2)])\n                    \t        }\n                    \t    });\n                    \t\tanalyticsResults.metaData.ou = [ou];\n                    \t\tresolve(analyticsResults);\n                    \t},\n                    \terror:function(error){\n                    \t\t  reject(error);\n                    \t}\n                    });  \n    })\n}\n$.ajax({\n    url: \"../../../api" +this.apiVersion+ "/analytics.json?dimension=pe:\" + parameters.pe + \"&dimension=ou:\" + parameters.ou + \"&skipData=true\",\n    type: \"GET\",\n    success: function(dummyAnalyticsResults) {\n        var promises = [];\n        var analytics;\n        dummyAnalyticsResults.metaData.ou.forEach(function(ou){\n            promises.push(calculatePercentageForOU(ou).then(function(analyticsResults){\n                if(!analytics){\n                    analytics = analyticsResults;\n                }else{\n                   analytics.metaData.ou = analytics.metaData.ou.concat(analyticsResults.metaData.ou);\n                   analyticsResults.metaData.ou.forEach(function(ouid){\n                       analytics.metaData.names[ouid] = analyticsResults.metaData.names[ouid];\n                   })\n                    analytics.rows = analytics.rows.concat(analyticsResults.rows);\n                }\n            }));\n        })\n        \n        Promise.all(promises).then(function(){\n            parameters.success(analytics);\n        },function(error){\n            parameters.error(error);\n        })\n},error:function(error){\n    reject(error);\n}\n});",
        "rules": [
        ],
        "name": "Facilities With Stockout",
        "description": "Number of facilities with stockout"
      };
      this.httpClient.get("dataElements.json?filter=name:ilike:stockout&filter=valueType:eq:BOOLEAN&rootJunction=OR&paging=false").subscribe((dataElementResults:any)=>{
        if(dataElementResults.dataElements.length == 0){
          //TODO add a provision if the dhis server has no stockout data elements
        }else{
          this.getId(dataElementResults.dataElements.length).subscribe((codeResults:any)=>{
            dataElementResults.dataElements.forEach((dataElement)=>{
              if(dataElement.displayName.toLowerCase().indexOf("stockout") >= -1){
                let rule:any = {
                  id: codeResults.codes[0],
                  name: dataElement.displayName,
                  description: "This is the rule. Using the data set '" + dataElement.displayName+ "'.",
                  json: {"data": dataElement.id}
                }
                if(stockout.rules.length == 0){
                  rule.isDefault = true;
                }
                stockout.rules.push(rule);
              }
            })
            if(stockout.rules.length == 0){
              stockout.rules.push({
                id: codeResults.codes[0],
                name: dataElementResults.dataElements[0].displayName,
                isDefault:true,
                description: "This is the rule. Using the data element '" + dataElementResults.dataElements[0].displayName+ "'.",
                json: {"data": dataElementResults.dataElements[0].id}
              });
            }
            this.save(stockout).subscribe((res:any)=>{
              observable.next(res);
              observable.complete();
            },(error)=>{
              observable.error(error.json());
              observable.complete();
            })
          },(error)=>{
            observable.error(error.json());
            observable.complete();
          })
        }

      },(error)=>{
        observable.error(error.json());
        observable.complete();
      })
    })
  }
  createCompletenessFunctions(){
    return new Observable((observable)=>{
      let completeness:any = {
        "function": "//Example of function implementation\n$.ajax({\n\turl: \"../../../api" +this.apiVersion+ "/analytics.json?dimension=dx:\" + parameters.rule.json.data + \".REPORTING_RATE&dimension=pe:\" + parameters.pe + \"&dimension=ou:\" + parameters.ou,\n\ttype: \"GET\",\n\tsuccess: function(analyticsResults) {\n\t    var rows = [];\n\t    analyticsResults.rows.forEach(function(row){\n\t        if(parseFloat(row[3]) > 100){\n\t            row[3] = \"100\";\n\t        }\n\t        rows.push(row);\n\t    })\n\t    analyticsResults.rows = rows;\n\t\tparameters.success(analyticsResults);\n\t},\n\terror:function(error){\n\t\t  parameters.error(error);\n\t}\n});",
        "rules": [
        ],
        "name": "Limit Reporting Rate to Maximum of 100%",
        "description": "This returns completeness. If the completeness is over a hundred it returns 100."
      };
      this.httpClient.get("dataSets.json?paging=false").subscribe((dataSetResults:any)=>{
        this.getId(dataSetResults.dataSets.length + 1).subscribe((codeResults:any)=>{
          dataSetResults.dataSets.forEach((dataSet,index)=>{
            let rule:any = {
              id: codeResults.codes[index],
              name: dataSet.displayName + " Completeness",
              description: "This is the rule. Using the data set '" + dataSet.displayName+ "'.",
              json: {"data": dataSet.id}
            }
            if(index == 0){
              rule.isDefault = true;
            }
            completeness.rules.push(rule);
          })
          this.save(completeness).subscribe((res:any)=>{
            observable.next(res);
            observable.complete();
          },(error)=>{
            observable.error(error.json());
            observable.complete();
          })
        },(error)=>{
          observable.error(error.json());
          observable.complete();
        })
      },(error)=>{
        observable.error(error.json());
        observable.complete();
      })
    })
  }
  createEarlyCompletenessFunctions(){
    return new Observable((observable)=>{
      let completeness:any = {
        "function": "//Example of function implementation\nparameters.progress(50);\nfunction getOrgUnitDataSetCompleteness(ds,ou,pe){\n\treturn new Promise(function(resolve, reject) {\n\t\t$.ajax({\n\t\t\turl: \"../../../api/26/completeDataSetRegistrations.json?dataSet=\" + ds.join(\"&dataSet=\") + \"&orgUnit=\" + ou + \"&period=\" + pe.join(\"&period=\")+\"&children=true\",\n\t\t\ttype: \"GET\",\n\t\t\tsuccess: function(completeness) {\n\t\t\t\t  resolve(completeness.completeDataSetRegistrations);\n\t\t\t},\n\t\t\terror:function(error){\n\t\t\t\t  parameters.error(error);\n\t\t\t}\n\t\t});\n\t} );\n}\nfunction getDataSetCompleteness(ds,ou,pe){\n\treturn new Promise(function(resolve, reject) {\n\t\tvar promises = [];\n\t\t\n\t    ou.forEach(function(o){\n\t        promises.push(getOrgUnitDataSetCompleteness(ds,o,pe));\n\t    })\n\t    Promise.all(promises).then(function(results){\n\t\t\tconsole.log(\"Results:\",results);\n\t\t\tvar completeness = [];\n\t\t\tresults.forEach(function(result){\n\t\t\t    if(result)\n\t\t\t\tresult.forEach(function(completeDataSetRegistration){\n\t\t\t\t\tvar isFound = false;\n\t\t\t\t\tcompleteness.forEach(function(addedCompleteness){\n\t\t\t\t\t\tif(addedCompleteness.period == completeDataSetRegistration.period && \n\t\t\t\t\t\taddedCompleteness.dataSet == completeDataSetRegistration.dataSet &&\n\t\t\t\t\t\taddedCompleteness.organisationUnit == completeDataSetRegistration.organisationUnit){\n\t\t\t\t\t\t\tisFound = true;\n\t\t\t\t\t\t}\n\t\t\t\t\t})\n\t\t\t\t\tif(!isFound){\n\t\t\t\t\t\tcompleteness.push(completeDataSetRegistration);\n\t\t\t\t\t}\n\t\t\t\t})\n\t\t\t})\n\t\t\tresolve(completeness);\n\t\t})\n\t} );\n}\n\nfunction getDataSets(dataSetIds){\n\treturn new Promise(function(resolve, reject) {\n\t\t$.ajax({\n\t\t\turl: \"../../../api/26/dataSets.json?fields=organisationUnits[id,path]&filter=id:in:[\" + dataSetIds.join(\",\") +\"]\",\n\t\t\ttype: \"GET\",\n\t\t\tsuccess: function(dataSetResults) {\n\t\t\t\t  resolve(dataSetResults.dataSets);\n\t\t\t},\n\t\t\terror:function(error){\n\t\t\t\t  parameters.error(error);\n\t\t\t}\n\t\t});\n\t} );\n}\nfunction getAnalyticsObject(){\n\treturn new Promise(function(resolve, reject) {\n\t\t$.ajax({\n\t\t\turl: \"../../../api/25/analytics.json?dimension=pe:\" + parameters.pe + \"&dimension=ou:\" + parameters.ou + \"&displayProperty=NAME&skipData=true\",\n\t\t\ttype: \"GET\",\n\t\t\tsuccess: function(results) {\n\t\t\t\tresults.headers = [\n\t\t\t\t\t\t\t\t{\n\t\t\t\t\t\t\t\t  \"name\": \"dx\",\n\t\t\t\t\t\t\t\t  \"column\": \"Data\",\n\t\t\t\t\t\t\t\t  \"valueType\": \"TEXT\",\n\t\t\t\t\t\t\t\t  \"type\": \"java.lang.String\",\n\t\t\t\t\t\t\t\t  \"hidden\": false,\n\t\t\t\t\t\t\t\t  \"meta\": true\n\t\t\t\t\t\t\t\t},\n\t\t\t\t\t\t\t\t{\n\t\t\t\t\t\t\t\t  \"name\": \"pe\",\n\t\t\t\t\t\t\t\t  \"column\": \"Period\",\n\t\t\t\t\t\t\t\t  \"valueType\": \"TEXT\",\n\t\t\t\t\t\t\t\t  \"type\": \"java.lang.String\",\n\t\t\t\t\t\t\t\t  \"hidden\": false,\n\t\t\t\t\t\t\t\t  \"meta\": true\n\t\t\t\t\t\t\t\t},\n\t\t\t\t\t\t\t\t{\n\t\t\t\t\t\t\t\t  \"name\": \"ou\",\n\t\t\t\t\t\t\t\t  \"column\": \"Organisation unit\",\n\t\t\t\t\t\t\t\t  \"valueType\": \"TEXT\",\n\t\t\t\t\t\t\t\t  \"type\": \"java.lang.String\",\n\t\t\t\t\t\t\t\t  \"hidden\": false,\n\t\t\t\t\t\t\t\t  \"meta\": true\n\t\t\t\t\t\t\t\t},\n\t\t\t\t\t\t\t\t{\n\t\t\t\t\t\t\t\t  \"name\": \"value\",\n\t\t\t\t\t\t\t\t  \"column\": \"Value\",\n\t\t\t\t\t\t\t\t  \"valueType\": \"NUMBER\",\n\t\t\t\t\t\t\t\t  \"type\": \"java.lang.Double\",\n\t\t\t\t\t\t\t\t  \"hidden\": false,\n\t\t\t\t\t\t\t\t  \"meta\": false\n\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t  ]\n\t\t\t\tresults.metaData.names[parameters.rule.id] = parameters.rule.name;\n\t\t\t\tresults.metaData.dx = [parameters.rule.id];\n\t\t\t\tresolve(results);\n\t\t\t},\n\t\t\terror:function(error){\n\t\t\t\treject(error);\n\t\t\t}\n\t\t});\n\t} );\n}\nfunction getOrgUnitHierarchy(){\n\treturn new Promise(function(resolve, reject) {\n\t\t$.ajax({\n\t\t\turl: \"../../../api/25/analytics.json?dimension=pe:\" + parameters.pe + \"&dimension=ou:\" + parameters.ou + \";LEVEL-6&displayProperty=NAME&skipData=true\",\n\t\t\ttype: \"GET\",\n\t\t\tsuccess: function(results) {\n\t\t\t\tresolve(results.metaData);\n\t\t\t},\n\t\t\terror:function(error){\n\t\t\t\treject(error);\n\t\t\t}\n\t\t});\n\t} );\n}\n\nvar dataSetIds = [\"s4029egvhCv\",\"z2slLbjn7PM\"];\ngetAnalyticsObject().then(function(results){\n\tgetDataSets(dataSetIds).then(function(dataSets){\n\t\tgetDataSetCompleteness(dataSetIds,results.metaData.ou,results.metaData.pe).then(function(completeness){\n\t\t\tif(completeness)\n\t\t\tresults.metaData.ou.forEach(function(ou){\n\t\t\t\tresults.metaData.pe.forEach(function(pe){\n\t\t\t\t\tvar denominator = 0;\n\t\t\t\t\tvar numerator = 0;\n\t\t\t\t\tvar dataSetMapper = {};\n\t\t\t\t\tdataSets.forEach(function(dataSet){\n\t\t\t\t\t\tdataSet.organisationUnits.forEach(function(orgUnit){\n\t\t\t\t\t\t\tcompleteness.forEach(function(completenessData){\n\t\t\t\t\t\t\t\tif(completenessData.period == pe && completenessData.organisationUnit == orgUnit.id && orgUnit.path.indexOf(ou) > -1){\n\t\t\t\t\t\t\t\t\tif(!dataSetMapper[orgUnit.id]){\n\t\t\t\t\t\t\t\t\t\tdataSetMapper[orgUnit.id] = {};\n\t\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\t\tdataSetMapper[orgUnit.id][completenessData.dataSet] = completenessData.date;\n\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t})\n\t\t\t\t\t\t})\n\t\t\t\t\t})\n\t\t\t\t\tObject.keys(dataSetMapper).forEach(function(key){\n\t\t\t\t\t\tif(dataSetMapper[key][dataSetIds[0]] && dataSetMapper[key][dataSetIds[1]]){\n\t\t\t\t\t\t\tnumerator +=Math.abs(daysBetween(new Date(dataSetMapper[key][dataSetIds[0]]),new Date(dataSetMapper[key][dataSetIds[1]])));\n\t\t\t\t\t\t\tdenominator++;\n\t\t\t\t\t\t}\n\t\t\t\t\t})\n\t\t\t\t\tif(denominator != 0){\n\t\t\t\t\t\tresults.rows.push([parameters.rule.id,pe,ou,(numerator/denominator).toFixed(2)]);\n\t\t\t\t\t}\n\t\t\t\t})\n\t\t\t})\n\t\t\tresults.height = results.rows.length;\n\t\t\tresults.width = results.headers.length;\n\t\t\tconsole.log(\"Analytics Results:\",results);\n\t\t\tparameters.success(results);\n\t\t})\n\t})\n})\nfunction daysBetween( date1, date2 ) {   //Get 1 day in milliseconds   \n\tvar one_day=1000*60*60*24;    // Convert both dates to milliseconds\n\tvar date1_ms = date1.getTime();   \n\tvar date2_ms = date2.getTime();    // Calculate the difference in milliseconds  \n\tvar difference_ms = date2_ms - date1_ms;        // Convert back to days and return   \n\treturn Math.round(difference_ms/one_day); \n } \n",
        "rules": [
        ],
        "name": "Proportion of Early Completeness",
        "description": "Calculates how early the report was submitted\n\nNumerator: Is the difference from the submission date and deadline date\n\nDenominator: Number of submission date"
      };
      this.httpClient.get("dataSets.json?paging=false").subscribe((dataSetResults:any)=>{
        this.getId(dataSetResults.dataSets.length + 1).subscribe((codeResults:any)=>{
          dataSetResults.dataSets.forEach((dataSet,index)=>{
            let rule:any = {
              id: codeResults.codes[index],
              name: dataSet.displayName + " Early Completeness",
              description: "This is the rule. Using the data set '" + dataSet.displayName+ "'.",
              json: {"data": dataSet.id}
            }
            if(index == 0){
              rule.isDefault = true;
            }
            completeness.rules.push(rule);
          })
          this.save(completeness).subscribe((res:any)=>{
            observable.next(res);
            observable.complete();
          },(error)=>{
            observable.error(error.json());
            observable.complete();
          })
        },(error)=>{
          observable.error(error.json());
          observable.complete();
        })
      },(error)=>{
        observable.error(error.json());
        observable.complete();
      })
    })
  }
  createReportingRateByFilledData(){
    return new Observable((observable)=>{
      let completeness:any = {
        "function": "//Example of function implementation\nparameters.progress(50);\n\nfunction analyticsRequest() {\n    return new Promise(function(resolve, reject) {\n        $.ajax({\n            url: \"../../../api/26/analytics.json?dimension=pe:\" + parameters.pe + \"&dimension=ou:\" + parameters.ou + \"&hierarchyMeta=true&skipData=true\",\n            type: \"GET\",\n            success: function(analyticsResults) {\n                try {\n                    analyticsResults.headers = [{\"name\":\"dx\",\"column\":\"Data\",\"valueType\":\"TEXT\",\"type\":\"java.lang.String\",\"hidden\":false,\"meta\":true},{\"name\":\"pe\",\"column\":\"Period\",\"valueType\":\"TEXT\",\"type\":\"java.lang.String\",\"hidden\":false,\"meta\":true},{\"name\":\"ou\",\"column\":\"Organisation unit\",\"valueType\":\"TEXT\",\"type\":\"java.lang.String\",\"hidden\":false,\"meta\":true},{\"name\":\"value\",\"column\":\"Value\",\"valueType\":\"NUMBER\",\"type\":\"java.lang.Double\",\"hidden\":false,\"meta\":false}];\n                    analyticsResults.metaData.names[parameters.rule.id] = parameters.rule.name;\n                    analyticsResults.metaData.dx = [parameters.rule.id];\n                    resolve(analyticsResults);\n                } catch (error) {\n                    reject(error);\n                }\n            },\n            error: function(error) {\n                reject(error);\n            }\n        });\n    })\n}\n\nfunction analyticsLevelRequest(level) {\n    return new Promise(function(resolve, reject) {\n        $.ajax({\n            url: \"../../../api/25/analytics.json?dimension=pe:\" + parameters.pe + \"&dimension=ou:\" + parameters.ou + \";LEVEL-\" + level + \"&hierarchyMeta=true\",\n            type: \"GET\",\n            success: function(analyticsResults) {\n                try {\n                    resolve(analyticsResults.metaData.ouHierarchy);\n                } catch (error) {\n                    reject(error);\n                }\n            },\n            error: function(error) {\n                reject(error);\n            }\n        });\n    })\n}\n\nfunction dataValueSetsRequest() {\n    return new Promise(function(resolve, reject) {\n        $.ajax({\n            url: \"../../../api/25/dataSets/\" + parameters.rule.json.data + \".json?fields=id,timelyDays,periodType,organisationUnits[level]\",\n            type: \"GET\",\n            success: function(dataValueSetsResults) {\n                try {\n                    //Code goes here\n                    resolve(dataValueSetsResults);\n                } catch (e) {\n                    reject(error);\n                }\n            },\n            error: function(error) {\n                reject(error);\n            }\n        });\n    })\n}\nanalyticsRequest().then(function(results) {\n    dataValueSetsRequest().then(function(dataSet) {\n        analyticsLevelRequest(dataSet.organisationUnits[0].level).then(function(hierarchy) {\n            $.ajax({\n                url: \"../../../api/26/completeDataSetRegistrations.json?dataSet=\" + parameters.rule.json.data + \"&orgUnit=\" + results.metaData.ou.join(\"&orgUnit=\") + \"&children=true&period=\" + results.metaData.pe.join(\"&period=\"),\n                type: \"GET\",\n                success: function(completenessResults) {\n                    if (completenessResults.completeDataSetRegistrations)\n                        results.metaData.ou.forEach(function(ou) {\n                            results.metaData.pe.forEach(function(pe) {\n                                var startDate = getDateAfterEndOfPeriod(dataSet.periodType, pe)\n                                startDate.setDate(startDate.getDate() + dataSet.timelyDays)\n                                var secondDate;\n                                var facilities = 0;\n                                var totalDifference = 0;\n                                completenessResults.completeDataSetRegistrations.forEach(function(completeDataSetRegistration) {\n                                    if(hierarchy[completeDataSetRegistration.organisationUnit])\n                                    if (completeDataSetRegistration.period == pe && hierarchy[completeDataSetRegistration.organisationUnit].indexOf(ou) > -1) {\n                                        var difference = daysBetween(new Date(completeDataSetRegistration.date),startDate);\n                                        console.log(\"Difference:\",startDate,completeDataSetRegistration.date,difference)\n                                        if(difference > 0){\n                                            totalDifference += difference;\n                                        }\n                                        facilities++;\n                                    }\n                                })\n                                if (facilities != 0) {\n                                    console.log(totalDifference,dataSet.timelyDays,facilities)\n                                    results.rows.push([parameters.rule.id, pe, ou, (totalDifference / (dataSet.timelyDays * facilities)).toFixed(2)])\n                                }\n                            })\n                        })\n                    results.height = results.rows.length\n                    console.log(results);\n                    parameters.success(results);\n                },\n                error: function(error) {\n                    parameters.error(error);\n                }\n            });\n        })\n    })\n})\n\nfunction daysBetween(date1, date2) { //Get 1 day in milliseconds   \n    var one_day = 1000 * 60 * 60 * 24; // Convert both dates to milliseconds\n    var date1_ms = date1.getTime();\n    var date2_ms = date2.getTime(); // Calculate the difference in milliseconds  \n    var difference_ms = date2_ms - date1_ms; // Convert back to days and return   \n    return Math.round(difference_ms / one_day);\n}\n\nfunction getDateAfterEndOfPeriod(periodType, pe) {\n    var date = new Date();\n    if (periodType == \"Yearly\") {\n        date = new Date(parseInt(pe.substr(0, 4)) + 1, 0, 1)\n    }else if (periodType == \"Monthly\") {\n        date = new Date(parseInt(pe.substr(0, 4)) + 1, parseInt(pe.substr(4)), 1)\n    }else if(periodType == \"Quarterly\"){\n        var firstDate = new Date(now.getFullYear(), parseInt(pe.substr(5)) * 3, 1);\n        date = new Date(firstDate.getFullYear(), firstDate.getMonth() + 3, 1);\n    }\n    return date;\n}",
        "rules": [
        ],
        "name": "Reporting Rates By Filled data",
        "description": "Calculates the reporting rate by the amount of fields filled in the report",
      };
      this.httpClient.get("dataSets.json?paging=false").subscribe((dataSetResults:any)=>{
        this.getId(dataSetResults.dataSets.length + 1).subscribe((codeResults:any)=>{
          dataSetResults.dataSets.forEach((dataSet,index)=>{
            let rule:any = {
              id: codeResults.codes[index],
              name: dataSet.displayName + " Reporting Rate by filled data",
              description: "This is the rule. Using the data set '" + dataSet.displayName+ "'.",
              json: {"data": dataSet.id}
            }
            if(index == 0){
              rule.isDefault = true;
            }
            completeness.rules.push(rule);
          })
          this.save(completeness).subscribe((res:any)=>{
            observable.next(res);
            observable.complete();
          },(error)=>{
            observable.error(error.json());
            observable.complete();
          })
        },(error)=>{
          observable.error(error.json());
          observable.complete();
        })
      },(error)=>{
        observable.error(error.json());
        observable.complete();
      })
    })
  }
  orgUnitsReportedOnDataSet(){
    return new Observable((observable)=>{
      let completeness:any = {
        "function": "//Example of function implementation\nparameters.progress(50);\n\nfunction calculatePercentageForOU(ou) {\n    return new Promise(function(resolve, reject) {\n        $.ajax({\n            url: \"../../../api/24/analytics.json?dimension=dx:\" + parameters.rule.json.data + \".REPORTING_RATE&dimension=pe:\" + parameters.pe + \"&dimension=ou:LEVEL-4;\" + ou + \"&hierarchyMeta=true\",\n            type: \"GET\",\n            success: function(analyticsResults) {\n                /**\n                 * Conditioning starts here\n                 * \n                 * */\n                var orgUnits = [];\n                analyticsResults.rows.forEach(function(row) {\n                    var orgUnitId = row[1] + '.' + row[2]\n                    if (orgUnits.indexOf(orgUnitId) == -1) {\n                        orgUnits.push(orgUnitId);\n                    }\n                })\n                analyticsResults.metaData.dx = [parameters.rule.id];\n                analyticsResults.metaData.names[parameters.rule.id] = parameters.rule.name;\n                analyticsResults.rows = [];\n                analyticsResults.metaData.pe.forEach(function(pe) {\n                    var currentPeOrgUnits = [];\n                    orgUnits.forEach(function(orgUnit) {\n                        if (orgUnit.split('.')[0] === pe) {\n                            currentPeOrgUnits.push(orgUnit)\n                        }\n                    });\n\n                    if (currentPeOrgUnits.length > 0) {\n                        analyticsResults.rows.push([parameters.rule.id, pe, ou, \"\" + (currentPeOrgUnits.length * 100 / analyticsResults.metaData.ou.length).toFixed(2)])\n                    }\n                });\n                analyticsResults.metaData.ou = [ou];\n                resolve(analyticsResults);\n            },\n            error: function(error) {\n                reject(error);\n            }\n        });\n    })\n}\n$.ajax({\n    url: \"../../../api/24/analytics.json?dimension=pe:\" + parameters.pe + \"&dimension=ou:\" + parameters.ou + \"&skipData=true\",\n    type: \"GET\",\n    success: function(dummyAnalyticsResults) {\n        var promises = [];\n        var analytics;\n        dummyAnalyticsResults.metaData.ou.forEach(function(ou) {\n            promises.push(calculatePercentageForOU(ou).then(function(analyticsResults) {\n                if (!analytics) {\n                    analytics = analyticsResults;\n                } else {\n                    analytics.metaData.ou = analytics.metaData.ou.concat(analyticsResults.metaData.ou);\n                    analyticsResults.metaData.ou.forEach(function(ouid) {\n                        analytics.metaData.names[ouid] = analyticsResults.metaData.names[ouid];\n                    })\n                    analytics.rows = analytics.rows.concat(analyticsResults.rows);\n                }\n            }));\n        })\n\n        Promise.all(promises).then(function() {\n            parameters.success(analytics);\n        }, function(error) {\n            parameters.error(error);\n        })\n    },\n    error: function(error) {\n        reject(error);\n    }\n});",
        "rules": [
        ],
        "name": "Sample Proportion of Facilities Given a condition",
        "description": "This calculates the percentage of facilities given a condition which can be modified to provide the required condition. Currently it calculates the proportion of organisation units reported on a given data set reporting rate"
      };
      this.httpClient.get("dataSets.json?paging=false").subscribe((dataSetResults:any)=>{
        this.getId(dataSetResults.dataSets.length + 1).subscribe((codeResults:any)=>{
          dataSetResults.dataSets.forEach((dataSet,index)=>{
            let rule:any = {
              id: codeResults.codes[index],
              name: dataSet.displayName + " Reporting Rate by filled data",
              description: "This is the rule. Using the data set '" + dataSet.displayName+ "'.",
              json: {"data": dataSet.id}
            }
            if(index == 0){
              rule.isDefault = true;
            }
            completeness.rules.push(rule);
          })
          this.save(completeness).subscribe((res:any)=>{
            observable.next(res);
            observable.complete();
          },(error)=>{
            observable.error(error.json());
            observable.complete();
          })
        },(error)=>{
          observable.error(error.json());
          observable.complete();
        })
      },(error)=>{
        observable.error(error.json());
        observable.complete();
      })
    })
  }
  predictor(){
    return new Observable((observable)=>{
      let completeness:any = {
        "function": "//Example of function implementation\nfunction analyticsRequest() {\n    return new Promise(function(resolve, reject) {\n        $.ajax({\n            url: \"../../../api/26/analytics.json?dimension=pe:\" + parameters.pe + \"&dimension=ou:\" + parameters.ou + \"&hierarchyMeta=true&skipData=true\",\n            type: \"GET\",\n            success: function(analyticsResults) {\n                try {\n                    //Code goes here\n                    analyticsResults.headers = [{\n                        \"name\": \"dx\",\n                        \"column\": \"Data\",\n                        \"type\": \"java.lang.String\",\n                        \"hidden\": false,\n                        \"meta\": true\n                    }, {\n                        \"name\": \"pe\",\n                        \"column\": \"Period\",\n                        \"type\": \"java.lang.String\",\n                        \"hidden\": false,\n                        \"meta\": true\n                    }, {\n                        \"name\": \"ou\",\n                        \"column\": \"Organisation Unit\",\n                        \"type\": \"java.lang.String\",\n                        \"hidden\": false,\n                        \"meta\": true\n                    }, {\n                        \"name\": \"value\",\n                        \"column\": \"Value\",\n                        \"type\": \"java.lang.Double\",\n                        \"hidden\": false,\n                        \"meta\": false\n                    }];\n                    analyticsResults.metaData.names[parameters.rule.id] = parameters.rule.name;\n                    analyticsResults.metaData.dx = [parameters.rule.id];\n                    resolve(analyticsResults);\n                } catch (e) {\n                    reject(error);\n                }\n            },\n            error: function(error) {\n                reject(error);\n            }\n        });\n    })\n}\n\nfunction getAnalyticsDataRequest(dx,pe,ou) {\n    return new Promise(function(resolve, reject) {\n        $.ajax({\n            url: \"../../../api/25/analytics.json?dimension=dx:\" + dx.join(\";\") + \"&dimension=pe:\" + getPeriods(pe).join(\";\") + \"&dimension=ou:\" + ou.join(\";\") + \"\",\n            type: \"GET\",\n            success: function(analyticsResults) {\n                try {\n                    resolve(analyticsResults);\n                } catch (e) {\n                    reject(error);\n                }\n            },\n            error: function(error) {\n                reject(error);\n            }\n        });\n    })\n}\nanalyticsRequest().then(function(result) {\n    getAnalyticsDataRequest(extractDX(parameters.rule.json.generator.expression),result.metaData.pe,result.metaData.ou).then(function(analyticsResults){\n        console.log(analyticsResults);\n        result.metaData.ou.forEach(function(ou){\n            result.metaData.pe.forEach(function(pe){\n                var periods = getPeriods([pe]);\n                var values = {};\n                analyticsResults.rows.forEach(function(row){\n                    if(periods.indexOf(row[1]) > -1 && row[2] == ou){\n                        if(!values[row[0]]){\n                            values[row[0]] = []\n                        }\n                        values[row[0]].push(parseInt(row[3]))\n                    }\n                })\n                var expression = parameters.rule.json.generator.expression;\n                console.log(values);\n                Object.keys(values).forEach(function(key){\n                    expression = expression.split(\"#{\" + key + \"}\").join(JSON.stringify(values[key]));\n                })\n                expression = expression.split(\"AVG\").join(\"Mean\").split(\"STDDEV\").join(\"StandardDeviation\");\n                console.log(eval(\"(\" + expression + \")\"));\n                try{\n                    var val = eval(\"(\" + expression + \")\").toFixed(2);\n                    console.log(\"OU:\",ou);\n                    result.rows.push([parameters.rule.id,pe,ou,val])\n                }catch(e){\n                    console.error(e);\n                }\n            })  \n        })\n        console.log(result);\n        parameters.success(result);\n    },function(error) {\n        parameters.error(error);\n    })\n},function(error) {\n        parameters.error(error);\n})\ncst = {\n    formulaPattern: /#\\{.+?\\}/g,\n    constantPattern: /C\\{.+?\\}/g,\n    separator: \".\"\n}\nfunction getPeriods(inputPeriods){\n    var periods = []\n    inputPeriods.forEach(function(period){\n        for(j = 0;j< parameters.rule.json.annualSampleCount;j++){\n            var currentYear = parseInt(period.substr(0,4)) - j;\n            for(i = 1; i <= parameters.rule.json.sequentialSampleCount;i++){\n                var month = parseInt(period.substr(4)) - i;\n                var year = currentYear\n                if(month < 1){\n                    month = 12 + month\n                    year--;\n                }\n                var newPeriod = \"\";\n                if(month < 10){\n                    newPeriod = year + \"0\" + month;\n                }else{\n                    newPeriod = year + \"\" + month\n                }\n                if(periods.indexOf(newPeriod) == -1){\n                    periods.push(newPeriod)\n                }\n            }   \n        }\n    })\n    return periods;\n}\nfunction extractDX(expression) {\n    var idExpressions = expression.match(/#\\{.+?\\}/g);\n    var dx = []\n    for (k in idExpressions) {\n        var d = idExpressions[k].replace(/[#\\{\\}]/g, '');\n        if(dx.indexOf(d) == -1)\n            dx.push(d);\n    }\n    return dx;\n}\n\nfunction StandardDeviation(numbersArr) {\n    var meanVal = Mean(numbersArr);\n    var SDprep = 0;\n    for (var key in numbersArr)\n        SDprep += Math.pow((parseFloat(numbersArr[key]) - meanVal), 2);\n    return Math.sqrt(SDprep / numbersArr.length);\n}\n\nfunction Mean(numbersArr) {\n    var total = 0;\n    for (var key in numbersArr)\n        total += numbersArr[key];\n    return (total / numbersArr.length);\n\n}",
        "rules": [
        ],
        "description": "Calculates the prediction given past data",
        "name": "Predictor"
      };
      this.httpClient.get("dataElements.json?pageSize=10").subscribe((dataElementResults:any)=>{
        this.getId(dataElementResults.dataElements.length + 1).subscribe((codeResults:any)=>{
          dataElementResults.dataElements.forEach((dataElement,index)=>{
            let rule:any = {
              id: codeResults.codes[index],
              name: dataElement.displayName + " Prediction",
              description: "This is the rule. Using the dataElement '" + dataElement.displayName+ "'.",
              json: {
                "sequentialSampleCount": 6,
                "annualSampleCount": 3,
                "periodType": "Monthly",
                "generator": {
                  "expression": "AVG(#{" + dataElement.id+ "})+1.5*STDDEV(#{" + dataElement.id + "})",
                  "missingValueStrategy": "SKIP_IF_ALL_VALUES_MISSING",
                  "dataElements": [],
                  "sampleElements": []
                }
              }
            }
            if(index == 0){
              rule.isDefault = true;
            }
            completeness.rules.push(rule);
          })
          this.save(completeness).subscribe((res:any)=>{
            observable.next(res);
            observable.complete();
          },(error)=>{
            observable.error(error.json());
            observable.complete();
          })
        },(error)=>{
          observable.error(error.json());
          observable.complete();
        })
      },(error)=>{
        observable.error(error.json());
        observable.complete();
      })
    })
  }

  /**
   * Proportion of organisation units not reporting on a data set
   * @returns {Observable<any>}
   */
  proportionOfOrgUnitsNotReport(){
    return new Observable((observable)=>{
      let completeness:any = {
        "function": "//Example of function implementation\nparameters.progress(20);\n$.ajax({\n\turl: \"../../../api/26/analytics.json?skipData=true&dimension=pe:\" + parameters.pe + \"&dimension=ou:\" + parameters.ou,\n\ttype: \"GET\",\n\tsuccess: function(analyticsResults) {\n\t\tanalyticsResults.headers = [\n    {\n      \"name\": \"dx\",\n      \"column\": \"Data\",\n      \"valueType\": \"TEXT\",\n      \"type\": \"java.lang.String\",\n      \"hidden\": false,\n      \"meta\": true\n    },\n    {\n      \"name\": \"pe\",\n      \"column\": \"Period\",\n      \"valueType\": \"TEXT\",\n      \"type\": \"java.lang.String\",\n      \"hidden\": false,\n      \"meta\": true\n    },\n    {\n      \"name\": \"ou\",\n      \"column\": \"Organisation unit\",\n      \"valueType\": \"TEXT\",\n      \"type\": \"java.lang.String\",\n      \"hidden\": false,\n      \"meta\": true\n    },\n    {\n      \"name\": \"value\",\n      \"column\": \"Value\",\n      \"valueType\": \"NUMBER\",\n      \"type\": \"java.lang.Double\",\n      \"hidden\": false,\n      \"meta\": false\n    }\n  ]\n\t\tanalyticsResults.metaData.dx = [parameters.rule.id];\n\t\tanalyticsResults.metaData.names[parameters.rule.id] = parameters.rule.name;\n\t\tparameters.progress(50);\n\t\t$.ajax({\n\t\t\turl: \"../../../api/25/organisationUnits.json?paging=false&filter=level:eq:\" + parameters.rule.json.level + \"&filter=path:like:\" + parameters.ou + \"&fields=dataSets[id]\",\n\t\t\ttype: \"GET\",\n\t\t\tsuccess: function(orgUnitResults) {\n\t\t\t\tvar count = 0;\n\t\t\t\torgUnitResults.organisationUnits.forEach(function(orgUnit){\n\t\t\t\t\torgUnit.dataSets.forEach(function(dataSet){\n\t\t\t\t\t\tif(dataSet.id == parameters.rule.json.dataSet){\n\t\t\t\t\t\t\tcount++;\n\t\t\t\t\t\t}\n\t\t\t\t\t})\n\t\t\t\t})\n\t\t\t\tanalyticsResults.metaData.ou.forEach(function(ou){\n\t\t\t\t\tanalyticsResults.metaData.pe.forEach(function(pe){\n\t\t\t\t\t\tanalyticsResults.rows.push([parameters.rule.id,parameters.pe,parameters.ou,\"\"+ (orgUnitResults.organisationUnits.length - count)]);\n\t\t\t\t\t})\n\t\t\t\t})\n\t\t\t\tparameters.progress(100);\n\t\t\t\tparameters.success(analyticsResults);\n\t\t\t},\n\t\t\terror:function(error){\n\t\t\t\t  parameters.error(error);\n\t\t\t}\n\t\t});\n\t},\n\terror:function(error){\n\t\t  parameters.error(error);\n\t}\n});",
        "rules": [
        ],
        "name": "Percentage of Org Units Not Reporting a dataset",
        "description": "Calculates the percentage of organisation units not reporting a dataset",
      };
      this.httpClient.get("dataSets.json?paging=false&fields=id,displayName,organisationUnits[level]").subscribe((dataSetResults:any)=>{
        this.getId(dataSetResults.dataSets.length + 1).subscribe((codeResults:any)=>{
          dataSetResults.dataSets.forEach((dataSet,index)=>{
            let level = 1;
            if(dataSet.organisationUnits.length > 0){
              level = dataSet.organisationUnits[0].level
            }
            let rule:any = {
              id: codeResults.codes[index],
              name: dataSet.displayName + " Reporting Rate by filled data",
              description: "This is the rule. Using the data set '" + dataSet.displayName+ "'.",
              json: {"data": dataSet.id,"level":level}
            }
            if(index == 0){
              rule.isDefault = true;
            }
            completeness.rules.push(rule);
          })
          this.save(completeness).subscribe((res:any)=>{
            observable.next(res);
            observable.complete();
          },(error)=>{
            observable.error(error.json());
            observable.complete();
          })
        },(error)=>{
          observable.error(error.json());
          observable.complete();
        })
      },(error)=>{
        observable.error(error.json());
        observable.complete();
      })
    })
  }
  get(id){
    return new Observable((observable)=>{
      this.httpClient.get("dataStore/functions/" + id).subscribe((func)=>{
        observable.next(func);
        observable.complete();
      },(error)=>{
        observable.error(error.json());
        observable.complete();
      })
    })

  }
  isError(code){
    var successError = false;
    var errorError = false;
    var progressError = false;
    let value = code.split(" ").join("").split("\n").join("").split("\t").join("");
    if(value.indexOf("parameters.success(") == -1){
      successError = true;
    }
    if(value.indexOf("parameters.error(") == -1){
      errorError = true;
    }
    if(value.indexOf("parameters.progress(") == -1){
      progressError = true;
    }
    return successError || errorError;
  }
}
