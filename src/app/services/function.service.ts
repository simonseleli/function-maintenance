import { Injectable } from '@angular/core';
import {HttpClientService} from "./http-client.service";
import {Observable} from 'rxjs/Rx';
import {FunctionObject} from "../models/function-object";
import {User} from "../models/user";
import {FunctionParameters} from "../models/function-parameters";
import {UserService} from "./user.service";

@Injectable()
export class FunctionService {

  constructor(private http:HttpClientService,private userService:UserService) { }


  save(sFunction:FunctionObject){
    return new Observable((observable)=>{
      if(sFunction.id){
        sFunction.lastUpdated = new Date();
        sFunction.displayName = sFunction.name;
        this.http.put("dataStore/functions/" + sFunction.id,sFunction).subscribe((results)=>{
          observable.next(sFunction);
          observable.complete();
        },(error)=>{
          observable.error(error.json());
          observable.complete();
        })
      }else{
        this.http.get("system/id").subscribe((results:any)=>{
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
            this.http.get("system/info").subscribe((results:any)=>{
              sFunction.href = results.contextPath +"?api/dataStore/functions/" + sFunction.id;
              this.http.post("dataStore/functions/" + sFunction.id,sFunction).subscribe((results)=>{
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
    return this.http.get(url);
  }
  delete(sFunction:FunctionObject){
    return new Observable((observable)=>{

      this.http.delete("dataStore/functions/" + sFunction.id).subscribe((results)=>{
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
      this.http.get("dataStore/functions").subscribe((results)=>{
        let observable = [];
        if(results.length > 0){
          results.forEach((id)=>{
            observable.push(this.http.get("dataStore/functions/" + id))
          });
          Observable.forkJoin(observable).subscribe((responses:any)=>{
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
          this.http.get("system/info").subscribe((response)=>{
            alert(response.version);
            if(parseFloat(response.version) > 2.24){
              this.apiVersion = "/24"
            }
            observable.push(this.createCompletenessFunctions());
            observable.push(this.createStockOutFunctions());
            Observable.forkJoin(observable).subscribe((responses:any)=>{
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
        let foundError = error.json();
        if(foundError.httpStatusCode == 404){
          let observable = [];
          this.http.get("system/info").subscribe((response)=>{
            alert(response.version);
            if(parseFloat(response.version) > 2.24){
              this.apiVersion = "/24"
            }
            observable.push(this.createCompletenessFunctions());
            observable.push(this.createStockOutFunctions());
            if(parseFloat(response.version) > 2.23){
              observable.push(this.createStockOutFunctions());
            }
            Observable.forkJoin(observable).subscribe((responses:any)=>{
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
        }else{
          observ.error(error.json());
          observ.complete();
        }
      })
    })

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
      this.http.get("dataElements.json?filter=name:ilike:stockout&filter=valueType:eq:BOOLEAN&rootJunction=OR&paging=false").subscribe((dataElementResults)=>{
        if(dataElementResults.dataElements.length == 0){
          //TODO add a provision if the dhis server has no stockout data elements
        }else{
          this.getId(dataElementResults.dataElements.length).subscribe((codeResults)=>{
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
            this.save(stockout).subscribe((res)=>{
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
      this.http.get("dataElements.json?filter=name:ilike:stockout&filter=valueType:eq:BOOLEAN&rootJunction=OR&paging=false").subscribe((dataElementResults)=>{
        if(dataElementResults.dataElements.length == 0){
          //TODO add a provision if the dhis server has no stockout data elements
        }else{
          this.getId(dataElementResults.dataElements.length).subscribe((codeResults)=>{
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
            this.save(stockout).subscribe((res)=>{
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
        "function": "//Example of function implementation\n$.ajax({\n\turl: \"../../../api" +this.apiVersion+ "/analytics.json?dimension=dx:\" + parameters.rule.json.data + \".REPORTING_RATE&dimension=pe:\" + parameters.pe + \"&dimension=ou:\" + parameters.ou,\n\ttype: \"GET\",\n\tsuccess: function(analyticsResults) {\n\t    var rows = [];\n\t    analyticsResults.rows.forEach(function(row){\n\t        if(parseInt(row[3]) > 100){\n\t            row[3] = \"100\";\n\t        }\n\t        rows.push(row);\n\t    })\n\t    analyticsResults.rows = rows;\n\t\tparameters.success(analyticsResults);\n\t},\n\terror:function(error){\n\t\t  parameters.error(error);\n\t}\n});",
        "rules": [
        ],
        "name": "Completeness Over 100",
        "description": "This returns completeness. If the completeness is over a hundred it returns 100."
      };
      this.http.get("dataSets.json?paging=false").subscribe((dataSetResults)=>{
        this.getId(dataSetResults.dataSets.length + 1).subscribe((codeResults)=>{
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
          this.save(completeness).subscribe((res)=>{
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
      this.http.get("dataStore/functions/" + id).subscribe((func)=>{
        observable.next(func);
        observable.complete();
      },(error)=>{
        observable.error(error.json());
        observable.complete();
      })
    })

  }
  run(functionParameters:FunctionParameters,functionObject:FunctionObject){
    return new Observable((observ)=>{
      if(!this.isError(functionObject.function)){
        try{
          functionParameters.error =(error)=>{
            observ.error(error);
            observ.complete();
          }
          functionParameters.success =(results)=>{
            observ.next(results);
            observ.complete();
          }
          functionParameters.progress =(results)=>{

          }
          let execute = Function('parameters', functionObject.function);
          execute(functionParameters);
        }catch(e){
          observ.error(e.stack);
          observ.complete();
        }
      }else{
        observ.error({message:"Errors in the code."});
        observ.complete();
      }
    });
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
