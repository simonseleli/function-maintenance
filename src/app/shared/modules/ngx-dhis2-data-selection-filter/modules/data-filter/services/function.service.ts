import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { NgxDhis2HttpClientService } from '@hisptz/ngx-dhis2-http-client';
import { Observable, forkJoin, of, throwError } from 'rxjs';
import { mergeMap, catchError, map, switchMap } from 'rxjs/operators';
import { UserService } from '../../../../../../core/services/user.service';
import { User } from '../../../../../../core/models/user.model';
import { FunctionObject } from '../store/models/function.model';
import { generateUid } from '../helpers/generate-uid.helper';
import * as fromConstants from '../constants/index';

@Injectable({
  providedIn: 'root'
})
export class FunctionService {
  apiVersion = '';
  constructor(
    private http: NgxDhis2HttpClientService,
    private userService: UserService
  ) {}

  loadAll(currentUser: any): Observable<any> {
    return this._loadAll().pipe(
      switchMap((functions: any[]) =>
        functions.length === 0
          ? this.createDefaultFunctions(currentUser)
          : of(functions)
      )
    );
  }

  createDefaultFunctions(currentUser: any) {
    return forkJoin([
      this._createPredictorFunction(currentUser),
      this._createCompletenessFunction(currentUser),
      this._createEarlyCompletenessFunction(currentUser),
      this._createReportingRateByFilledDataFunction(currentUser),
      this._createProportionOfOrgUnitsNotReportFunction(currentUser),
      this._createOrgUnitsReportedOnDataSetFunction(currentUser)
    ]).pipe(map(() => this._loadAll()));
  }

  private _loadAll() {
    return this.http.get('dataStore/functions').pipe(
      mergeMap((functionIds: Array<string>) =>
        forkJoin(
          _.map(functionIds, (functionId: string) => this.load(functionId))
        ).pipe(
          catchError((error: any) =>
            error.status !== 404 ? throwError(error) : of([])
          )
        )
      ),
      catchError((error: any) =>
        error.status !== 404 ? throwError(error) : of([])
      )
    );
  }

  load(id: string) {
    return this.http.get('dataStore/functions/' + id);
  }
  private _save(sFunction: FunctionObject, method: string) {
    const functionUrl = 'dataStore/functions/' + sFunction.id;
    return method === 'POST'
      ? this.http.post(functionUrl, sFunction)
      : this.http.put(functionUrl, sFunction);
  }
  save(sFunction: FunctionObject, currentUser: any) {
    return this.http.get('system/info').pipe(
      mergeMap((systemInfo: any) => {
        const newFunctionObject = {
          ...sFunction,
          lastUpdated: new Date(),
          displayName: sFunction.name,
          href:
            systemInfo.contextPath + '?api/dataStore/functions/' + sFunction.id
        };

        return this._save(
          sFunction.isNew
            ? _.omit(
                {
                  ...newFunctionObject,
                  created: newFunctionObject.lastUpdated,
                  user: {
                    id: currentUser.id
                  }
                },
                'isNew'
              )
            : _.omit(newFunctionObject, 'isNew'),
          sFunction.isNew ? 'POST' : 'PUT'
        );
      })
    );
  }
  getId(number?) {
    let url = 'system/id';
    if (number) {
      url += '.json?limit=' + number;
    }
    return this.http.get(url);
  }
  create() {
    return new Observable(observable => {
      this.userService.getCurrentUser().subscribe(
        (user: User) => {
          this.getId(2).subscribe(
            (results: any) => {
              this.http.get('dataElements.json?pageSize=1').subscribe(
                (dataElementResults: any) => {
                  const functionObject = {
                    id: results.codes[0],
                    name: 'New Function',
                    created: new Date(),
                    lastUpdated: new Date(),
                    externalAccess: false,
                    userGroupAccesses: [],
                    isNew: true,
                    unSaved: true,
                    user: {
                      id: user.id
                    },
                    attributeValues: [],
                    translations: [],
                    userAccesses: [],
                    publicAccess: 'rw------',
                    function:
                      '//Example of function implementation\n' +
                      'parameters.progress(50);\n' +
                      '$.ajax({\n' +
                      '\turl: "../../../api/analytics.json?dimension=dx:" + ' +
                      'parameters.rule.json.data + "&dimension=pe:" + parameters.pe + "&dimension=ou:" + parameters.ou,\n' +
                      '\ttype: "GET",\n' +
                      '\tsuccess: function(analyticsResults) {\n' +
                      '\t\t  parameters.success(analyticsResults);\n' +
                      '\t},\n' +
                      '\terror:function(error){\n' +
                      '\t\t  parameters.error(error);\n' +
                      '\t}\n' +
                      '});',
                    rules: [
                      {
                        id: results.codes[1],
                        name: 'Default',
                        isDefault: true,
                        isNew: true,
                        unSaved: true,
                        description:
                          'This is the default rule. Using the data element "' +
                          dataElementResults.dataElements[0].displayName +
                          '".',
                        json: JSON.stringify({
                          data: dataElementResults.dataElements[0].id
                        })
                      }
                    ]
                  };
                  observable.next(functionObject);
                  observable.complete();
                },
                error => {
                  observable.error(error);
                  observable.complete();
                }
              );
            },
            error => {
              observable.error(error);
              observable.complete();
            }
          );
        },
        error => {
          observable.error(error);
          observable.complete();
        }
      );
    });
  }
  createRule() {
    return new Observable(observable => {
      this.getId().subscribe(
        (results: any) => {
          this.http.get('dataElements.json?pageSize=1').subscribe(
            (dataElementResults: any) => {
              const functionRule = {
                id: results.codes[0],
                name: 'New Rule',
                isDefault: true,
                description:
                  'This is the default rule. Using the data element "' +
                  dataElementResults.dataElements[0].displayName +
                  '".',
                json: JSON.stringify({
                  data: dataElementResults.dataElements[0].id
                })
              };
              observable.next(functionRule);
              observable.complete();
            },
            error => {
              observable.error(error);
              observable.complete();
            }
          );
        },
        error => {
          observable.error(error);
          observable.complete();
        }
      );
    });
  }
  delete(sFunction: FunctionObject) {
    return new Observable(observable => {
      this.http.delete('dataStore/functions/' + sFunction.id).subscribe(
        results => {
          observable.next(results);
          observable.complete();
        },
        error => {
          observable.error(error);
          observable.complete();
        }
      );
    });
  }

  getAll(currentUser: any) {
    return new Observable(observ => {
      this.http.get('dataStore/functions').subscribe(
        (results: any) => {
          const observable = [];
          if (results.length > 0) {
            results.forEach(id => {
              observable.push(this.http.get('dataStore/functions/' + id));
            });
            forkJoin(observable).subscribe(
              (responses: any) => {
                const functions = [];
                responses.forEach((response, index) => {
                  functions.push(response);
                });
                observ.next(functions);
                observ.complete();
              },
              error => {
                observ.error(error);
                observ.complete();
              }
            );
          } else {
            this.http.get('system/info').subscribe((response: any) => {
              if (parseFloat(response.version) > 2.24) {
                this.apiVersion = '/24';
              }
              forkJoin(this.getFunctionCreationPromises(currentUser)).subscribe(
                (responses: any) => {
                  this.getAll(currentUser).subscribe(
                    funcs => {
                      observ.next(funcs);
                      observ.complete();
                    },
                    error => {
                      observ.error(error);
                      observ.complete();
                    }
                  );
                },
                error => {
                  observ.error(error);
                  observ.complete();
                }
              );
            });
          }
        },
        error => {
          if (error.status === 404) {
            const observable = [];
            this.http.get('system/info').subscribe((response: any) => {
              if (parseFloat(response.version) > 2.24) {
                this.apiVersion = '/24';
              }
              forkJoin(this.getFunctionCreationPromises(currentUser)).subscribe(
                (responses: any) => {
                  this.getAll(currentUser).subscribe(
                    (funcs: any) => {
                      observ.next(funcs);
                      observ.complete();
                    },
                    error => {
                      observ.error(error);
                      observ.complete();
                    }
                  );
                },
                error => {
                  observ.error(error);
                  observ.complete();
                }
              );
            });
          } else {
            observ.error(error);
            observ.complete();
          }
        }
      );
    });
  }
  getFunctionCreationPromises(currentUser: any): Array<Observable<any>> {
    return [
      this._createPredictorFunction(currentUser),
      this._createCompletenessFunction(currentUser),
      this._createEarlyCompletenessFunction(currentUser),
      this._createReportingRateByFilledDataFunction(currentUser),
      this._createProportionOfOrgUnitsNotReportFunction(currentUser),
      this._createOrgUnitsReportedOnDataSetFunction(currentUser)
    ];
  }
  createStockOutFunctions(currentUser) {
    return new Observable(observable => {
      const stockout: any = {
        function:
          '//Example of function implementation\nparameters.progress(50);\nfunction calculatePercentageForOU(ou){\n' +
          'return new Promise(function(resolve,reject){\n$.ajax({\n\turl: "../../../api' +
          this.apiVersion +
          '/analytics.json?dimension=dx:" + parameters.rule.json.data + "&dimension=pe:" + parameters.pe + "&dimension=ou:' +
          'LEVEL-4;" + ou + "&hierarchyMeta=true",\n\ttype: "GET",\n\tsuccess: function(analyticsResults) {\n\tvar orgUnits = ' +
          '[];\n\tanalyticsResults.rows.forEach(function(row){\n\tvar orgUnitId = row[1] + "." + row[2]\n\tif(orgUnits.indexOf' +
          '(orgUnitId) == -1){\n\torgUnits.push(orgUnitId);\n\t}\n\t})\n\tanalyticsResults.metaData.dx = [parameters.rule.id];\n\t' +
          'analyticsResults.metaData.names[parameters.rule.id] = parameters.rule.name;\n\tanalyticsResults.rows = [];\n\t' +
          'analyticsResults.metaData.pe.forEach(function(pe){\n\tvar currentPeOrgUnits = [];\n\torgUnits.forEach(function(orgUnit)' +
          '{\n\tif (orgUnit.split(".")[0] === pe) {\n\tcurrentPeOrgUnits.push(orgUnit)\n\t}\n\t});\n\t\n\tif (currentPeOrgUnits.' +
          'length > 0) {\n\tanalyticsResults.rows.push([parameters.rule.id,pe,ou,"" + (currentPeOrgUnits.length * 100 / analyticsResults' +
          '.metaData.ou.length).toFixed(2)])\n\t}\n\t});\n\t\tanalyticsResults.metaData.ou = [ou];\n\t\tresolve(analyticsResults);\n\t},' +
          '\n\terror:function(error){\n\t\treject(error);\n\t}\n});\n})\n}\n$.ajax({\nurl: "../../../api' +
          this.apiVersion +
          '/analytics.json?dimension=pe:" + parameters.pe + "&dimension=ou:" + parameters.ou + "&skipData=true",\ntype:"GET",\nsuccess:' +
          'function(dummyAnalyticsResults) {\nvar promises = [];\nvar analytics;\ndummyAnalyticsResults.metaData.ou.forEach(function(ou)' +
          '{\npromises.push(calculatePercentageForOU(ou).then(function(analyticsResults){\nif(!analytics){\nanalytics = analyticsResults' +
          ';\n}else{\nanalytics.metaData.ou = analytics.metaData.ou.concat(analyticsResults.metaData.ou);\nanalyticsResults.metaData.ou.' +
          'forEach(function(ouid){\nanalytics.metaData.names[ouid] = analyticsResults.metaData.names[ouid];\n})\nanalytics.rows = ' +
          'analytics.rows.concat(analyticsResults.rows);\n}\n}));\n})\n\nPromise.all(promises).then(function(){\nparameters.success' +
          '(analytics);\n},function(error){\nparameters.error(error);\n})\n},error:function(error){\nreject(error);\n}\n});',
        rules: [],
        name: 'Facilities With Stockout',
        description: 'Number of facilities with stockout'
      };
      this.http
        .get(
          'dataElements.json?filter=name:ilike:stockout&filter=valueType:eq:BOOLEAN&rootJunction=OR&paging=false'
        )
        .subscribe(
          (dataElementResults: any) => {
            if (dataElementResults.dataElements.length === 0) {
              // TODO add a provision if the dhis server has no stockout data elements
            } else {
              this.getId(dataElementResults.dataElements.length).subscribe(
                (codeResults: any) => {
                  dataElementResults.dataElements.forEach(dataElement => {
                    if (
                      dataElement.displayName
                        .toLowerCase()
                        .indexOf('stockout') >= -1
                    ) {
                      const rule: any = {
                        id: codeResults.codes[0],
                        name: dataElement.displayName,
                        description:
                          'This is the rule. Using the data set "' +
                          dataElement.displayName +
                          '".',
                        json: { data: dataElement.id }
                      };
                      if (stockout.rules.length === 0) {
                        rule.isDefault = true;
                      }
                      stockout.rules.push(rule);
                    }
                  });
                  if (stockout.rules.length === 0) {
                    stockout.rules.push({
                      id: codeResults.codes[0],
                      name: dataElementResults.dataElements[0].displayName,
                      isDefault: true,
                      description:
                        'This is the rule. Using the data element "' +
                        dataElementResults.dataElements[0].displayName +
                        '".',
                      json: { data: dataElementResults.dataElements[0].id }
                    });
                  }
                  this.save(stockout, currentUser).subscribe(
                    (res: any) => {
                      observable.next(res);
                      observable.complete();
                    },
                    error => {
                      observable.error(error);
                      observable.complete();
                    }
                  );
                },
                error => {
                  observable.error(error);
                  observable.complete();
                }
              );
            }
          },
          error => {
            observable.error(error);
            observable.complete();
          }
        );
    });
  }
  createPredictors(currentUser: any) {
    return new Observable(observable => {
      const stockout: any = {
        function:
          '//Example of function implementation\nparameters.progress(50);\nfunction calculatePercentageForOU(ou){\n    return new Promise(function(resolve,reject){\n      $.ajax({\n                    \turl: "../../../api' +
          this.apiVersion +
          '/analytics.json?dimension=dx:" + parameters.rule.json.data + "&dimension=pe:" + parameters.pe + "&dimension=ou:LEVEL-4;" + ou + "&hierarchyMeta=true",\n                    \ttype: "GET",\n                    \tsuccess: function(analyticsResults) {\n                    \t    var orgUnits = [];\n                    \t    analyticsResults.rows.forEach(function(row){\n                    \t        var orgUnitId = row[1] + \'.\' + row[2]\n                    \t        if(orgUnits.indexOf(orgUnitId) == -1){\n                    \t            orgUnits.push(orgUnitId);\n                    \t        }\n                    \t    })\n                    \t    analyticsResults.metaData.dx = [parameters.rule.id];\n                    \t    analyticsResults.metaData.names[parameters.rule.id] = parameters.rule.name;\n                    \t    analyticsResults.rows = [];\n                    \t    analyticsResults.metaData.pe.forEach(function(pe){\n                    \t        var currentPeOrgUnits = [];\n                    \t        orgUnits.forEach(function(orgUnit) {\n                    \t            if (orgUnit.split(\'.\')[0] === pe) {\n                    \t               currentPeOrgUnits.push(orgUnit)\n                    \t            }\n                    \t        });\n                    \t        \n                    \t        if (currentPeOrgUnits.length > 0) {\n                    \t            analyticsResults.rows.push([parameters.rule.id,pe,ou,"" + (currentPeOrgUnits.length * 100 / analyticsResults.metaData.ou.length).toFixed(2)])\n                    \t        }\n                    \t    });\n                    \t\tanalyticsResults.metaData.ou = [ou];\n                    \t\tresolve(analyticsResults);\n                    \t},\n                    \terror:function(error){\n                    \t\t  reject(error);\n                    \t}\n                    });  \n    })\n}\n$.ajax({\n    url: "../../../api' +
          this.apiVersion +
          '/analytics.json?dimension=pe:" + parameters.pe + "&dimension=ou:" + parameters.ou + "&skipData=true",\n    type: "GET",\n    success: function(dummyAnalyticsResults) {\n        var promises = [];\n        var analytics;\n        dummyAnalyticsResults.metaData.ou.forEach(function(ou){\n            promises.push(calculatePercentageForOU(ou).then(function(analyticsResults){\n                if(!analytics){\n                    analytics = analyticsResults;\n                }else{\n                   analytics.metaData.ou = analytics.metaData.ou.concat(analyticsResults.metaData.ou);\n                   analyticsResults.metaData.ou.forEach(function(ouid){\n                       analytics.metaData.names[ouid] = analyticsResults.metaData.names[ouid];\n                   })\n                    analytics.rows = analytics.rows.concat(analyticsResults.rows);\n                }\n            }));\n        })\n        \n        Promise.all(promises).then(function(){\n            parameters.success(analytics);\n        },function(error){\n            parameters.error(error);\n        })\n},error:function(error){\n    reject(error);\n}\n});',
        rules: [],
        name: 'Facilities With Stockout',
        description: 'Number of facilities with stockout'
      };
      this.http
        .get(
          'dataElements.json?filter=name:ilike:stockout&filter=valueType:eq:BOOLEAN&rootJunction=OR&paging=false'
        )
        .subscribe(
          (dataElementResults: any) => {
            if (dataElementResults.dataElements.length === 0) {
              // TODO add a provision if the dhis server has no stockout data elements
            } else {
              this.getId(dataElementResults.dataElements.length).subscribe(
                (codeResults: any) => {
                  dataElementResults.dataElements.forEach(dataElement => {
                    if (
                      dataElement.displayName
                        .toLowerCase()
                        .indexOf('stockout') >= -1
                    ) {
                      const rule: any = {
                        id: codeResults.codes[0],
                        name: dataElement.displayName,
                        description:
                          "This is the rule. Using the data set '" +
                          dataElement.displayName +
                          "'.",
                        json: { data: dataElement.id }
                      };
                      if (stockout.rules.length === 0) {
                        rule.isDefault = true;
                      }
                      stockout.rules.push(rule);
                    }
                  });
                  if (stockout.rules.length === 0) {
                    stockout.rules.push({
                      id: codeResults.codes[0],
                      name: dataElementResults.dataElements[0].displayName,
                      isDefault: true,
                      description:
                        "This is the rule. Using the data element '" +
                        dataElementResults.dataElements[0].displayName +
                        "'.",
                      json: { data: dataElementResults.dataElements[0].id }
                    });
                  }
                  this.save(stockout, currentUser).subscribe(
                    (res: any) => {
                      observable.next(res);
                      observable.complete();
                    },
                    error => {
                      observable.error(error);
                      observable.complete();
                    }
                  );
                },
                error => {
                  observable.error(error);
                  observable.complete();
                }
              );
            }
          },
          error => {
            observable.error(error);
            observable.complete();
          }
        );
    });
  }
  private _createCompletenessFunction(currentUser: any) {
    return this.http.get('dataSets.json?paging=false').pipe(
      mergeMap((dataSetsResponse: any) =>
        this.save(
          {
            id: generateUid(),
            isNew: true,
            name: 'Limit Reporting Rate to Maximum of 100%',
            description:
              'This returns completeness. If the completeness is over a hundred it returns 100.',
            function: fromConstants.COMPLETENESS_FUNCTION,
            rules: this._generateCompletenessFunctionRules(
              dataSetsResponse ? dataSetsResponse.dataSets : []
            )
          },
          currentUser
        )
      )
    );
  }
  private _generateCompletenessFunctionRules(dataSets: any[]) {
    return _.map(dataSets, (dataSet: any, dataSetIndex: number) => {
      return {
        id: generateUid(),
        name: dataSet.displayName + ' Prediction',
        description:
          'This is the rule. Using the dataElement ' +
          dataSet.displayName +
          '.',
        json: { data: dataSet.id },
        isDefault: dataSetIndex === 0
      };
    });
  }
  private _createEarlyCompletenessFunction(currentUser: any) {
    return this.http.get('dataSets.json?paging=false').pipe(
      mergeMap((dataSetsResponse: any) =>
        this.save(
          {
            id: generateUid(),
            isNew: true,
            name: 'Proportion of Early Completeness',
            description:
              'Calculates how early the report was submitted\n\nNumerator: Is the difference from the submission date and deadline date\n\nDenominator: Number of submission date',
            function: fromConstants.EARLY_COMPLETENESS_FUNCTION,
            rules: this._generateEarlyCompletenessFunctionRules(
              dataSetsResponse ? dataSetsResponse.dataSets : []
            )
          },
          currentUser
        )
      )
    );
  }

  private _generateEarlyCompletenessFunctionRules(dataSets: any[]) {
    return _.map(dataSets, (dataSet: any, dataSetIndex: number) => {
      return {
        id: generateUid(),
        name: dataSet.displayName + ' Early Completeness',
        description:
          'This is the rule. Using the data set ' + dataSet.displayName + '.',
        json: { data: dataSet.id },
        isDefault: dataSetIndex === 0
      };
    });
  }
  private _createReportingRateByFilledDataFunction(currentUser) {
    return this.http.get('dataSets.json?paging=false').pipe(
      mergeMap((dataSetsResponse: any) =>
        this.save(
          {
            id: generateUid(),
            isNew: true,
            name: 'Reporting Rates By Filled data',
            description:
              'Calculates the reporting rate by the amount of fields filled in the report',
            function: fromConstants.REPORTING_RATE_BY_FILLED_DATA,
            rules: this._generateReportingRateByFilledDataFunctionRules(
              dataSetsResponse ? dataSetsResponse.dataSets : []
            )
          },
          currentUser
        )
      )
    );
  }

  private _generateReportingRateByFilledDataFunctionRules(dataSets: any[]) {
    return _.map(dataSets, (dataSet: any, dataSetIndex: number) => {
      return {
        id: generateUid(),
        name: dataSet.displayName + ' Reporting Rate by filled data',
        description:
          'This is the rule. Using the data set ' + dataSet.displayName + '.',
        json: { data: dataSet.id },
        isDefault: dataSetIndex === 0
      };
    });
  }
  private _createOrgUnitsReportedOnDataSetFunction(currentUser: any) {
    return this.http.get('dataSets.json?paging=false').pipe(
      mergeMap((dataSetsResponse: any) =>
        this.save(
          {
            id: generateUid(),
            isNew: true,
            name: 'Sample Proportion of Facilities Given a condition',
            description:
              'This calculates the percentage of facilities given a condition which can be modified to provide the required condition. Currently it calculates the proportion of organisation units reported on a given data set reporting rate',
            function: fromConstants.REPORTING_RATE_BY_FILLED_DATA,
            rules: this._generateOrgUnitsReportedOnDataSetFunctionRules(
              dataSetsResponse ? dataSetsResponse.dataSets : []
            )
          },
          currentUser
        )
      )
    );
  }

  private _generateOrgUnitsReportedOnDataSetFunctionRules(dataSets: any[]) {
    return _.map(dataSets, (dataSet: any, dataSetIndex: number) => {
      return {
        id: generateUid(),
        name: dataSet.displayName + ' Reporting Rate by filled data',
        description:
          'This is the rule. Using the data set ' + dataSet.displayName + '.',
        json: { data: dataSet.id },
        isDefault: dataSetIndex === 0
      };
    });
  }

  private _createPredictorFunction(currentUser: any) {
    return this.http.get('dataElements.json?pageSize=10').pipe(
      mergeMap((dataElementsResponse: any) =>
        this.save(
          {
            id: generateUid(),
            isNew: true,
            name: 'Predictor',
            description: 'Calculates the prediction given past data',
            function: fromConstants.PREDICTOR_FUNCTION,
            rules: this._generatePredictorFunctionRules(
              dataElementsResponse ? dataElementsResponse.dataElements : []
            )
          },
          currentUser
        )
      )
    );
  }

  private _generatePredictorFunctionRules(dataElements: any[]) {
    return _.map(dataElements, (dataElement: any, dataElementIndex: number) => {
      return {
        id: generateUid(),
        name: dataElement.displayName + ' Prediction',
        description:
          'This is the rule. Using the dataElement ' +
          dataElement.displayName +
          '.',
        json: {
          sequentialSampleCount: 6,
          annualSampleCount: 3,
          periodType: 'Monthly',
          generator: {
            expression:
              'AVG(#{' +
              dataElement.id +
              '})+1.5*STDDEV(#{' +
              dataElement.id +
              '})',
            missingValueStrategy: 'SKIP_IF_ALL_VALUES_MISSING',
            dataElements: [],
            sampleElements: []
          }
        },
        isDefault: dataElementIndex === 0
      };
    });
  }

  /**
   * Proportion of organisation units not reporting on a data set
   * @returns {Observable<any>}
   */
  private _createProportionOfOrgUnitsNotReportFunction(currentUser) {
    return this.http
      .get(
        'dataSets.json?paging=false&fields=id,displayName,organisationUnits[level]'
      )
      .pipe(
        mergeMap((dataSetsResponse: any) =>
          this.save(
            {
              id: generateUid(),
              isNew: true,
              name: 'Percentage of Org Units Not Reporting a dataset',
              description:
                'Calculates the percentage of organisation units not reporting a dataset',
              function: fromConstants.PREDICTOR_FUNCTION,
              rules: this._generateProportionOfOrgUnitsNotReportFunctionRules(
                dataSetsResponse ? dataSetsResponse.dataSets : []
              )
            },
            currentUser
          )
        )
      );
  }

  private _generateProportionOfOrgUnitsNotReportFunctionRules(dataSets: any[]) {
    return _.map(dataSets, (dataSet: any, dataSetIndex: number) => {
      let level = 1;
      if (dataSet.organisationUnits.length > 0) {
        level = dataSet.organisationUnits[0].level;
      }
      return {
        id: generateUid(),
        name: dataSet.displayName + ' Reporting Rate by filled data',
        description:
          'This is the rule. Using the data set ' + dataSet.displayName + '.',
        json: { data: dataSet.id, level: level },
        isDefault: dataSetIndex === 0
      };
    });
  }
  get(id) {
    return new Observable(observable => {
      this.http.get('dataStore/functions/' + id).subscribe(
        func => {
          observable.next(func);
          observable.complete();
        },
        error => {
          observable.error(error);
          observable.complete();
        }
      );
    });
  }
  isError(code) {
    let successError = false;
    let errorError = false;
    let progressError = false;
    const value = code
      .split(' ')
      .join('')
      .split('\n')
      .join('')
      .split('\t')
      .join('');
    if (value.indexOf('parameters.success(') === -1) {
      successError = true;
    }
    if (value.indexOf('parameters.error(') === -1) {
      errorError = true;
    }
    if (value.indexOf('parameters.progress(') === -1) {
      progressError = true;
    }
    return successError || errorError;
  }
}
