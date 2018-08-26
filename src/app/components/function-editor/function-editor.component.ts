import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  SimpleChanges
} from '@angular/core';
import { FunctionObject } from '../../shared/modules/ngx-dhis2-data-selection-filter/modules/data-filter/store/models';
import { VisualizationDataSelection } from '../../shared/modules/ngx-dhis2-visualization/models';
import * as _ from 'lodash';
import { UpsertFunction } from '../../shared/modules/ngx-dhis2-data-selection-filter/modules/data-filter/store/actions/function.actions';
import { AppState } from '../../store/reducers/index';
import { Store } from '@ngrx/store';
@Component({
  selector: 'app-function-editor',
  templateUrl: './function-editor.component.html',
  styleUrls: ['./function-editor.component.css']
})
export class FunctionEditorComponent implements OnInit {
  @Input()
  functionObject: FunctionObject;

  @Input()
  currentVisualizationDataSelections: VisualizationDataSelection[];

  showEditor = true;

  @Output()
  simulate: EventEmitter<FunctionObject> = new EventEmitter<FunctionObject>();

  @Output()
  save: EventEmitter<FunctionObject> = new EventEmitter<FunctionObject>();

  @Output()
  delete: EventEmitter<FunctionObject> = new EventEmitter<FunctionObject>();

  snippets = [
    {
      name: 'Aggregate Analytics',
      code:
        'function analyticsRequest() {\nreturn new Promise(function(resolve, reject) {\n$.ajax({\n' +
        'url: "../../../api/26/analytics.json?dimension=pe:" + parameters.pe + "&dimension=ou:" + ' +
        'parameters.ou + "&hierarchyMeta=true&skipData=true",\ntype: "GET",\nsuccess: function(analyticsResults)' +
        '{\ntry {\n//Code goes here\nanalyticsResults.headers = [{"name":"dx","column":"Data","type":"java.lang.' +
        'String","hidden":false,"meta":true},{"name":"pe","column":"Period","type":"java.lang.String","hidden":' +
        'false,"meta":true},{"name":"ou","column":"Organisation Unit","type":"java.lang.String","hidden":false,' +
        '"meta":true},{"name":"value","column":"Value","type":"java.lang.Double","hidden":false,"meta":false}];\n' +
        'analyticsResults.metaData.names[parameters.rule.id] = parameters.rule.name;\nanalyticsResults.metaData.dx' +
        ' = [parameters.rule.id];\nresolve(analyticsResults);\n} catch (e) {\nreject(error);\n}\n},\nerror: ' +
        'function(error) {\nreject(error);\n}\n});\n})\n}'
    },
    {
      name: 'Organisation Unit',
      code:
        'function organisationUnitsRequest() {\nreturn new Promise(function(resolve, reject) {\n$.ajax({\n' +
        'url: "../../../api/26/organisationUnits.json",\ntype: "GET",\nsuccess: function(organisatioUnitsResults)' +
        '{\ntry {\n//Code goes here\nresolve(organisatioUnitsResults);\n} catch (e) {\nreject(error);\n}\n},\nerror:' +
        'function(error) {\nreject(error);\n}\n});\n})\n}'
    },
    {
      name: 'Data Value Sets',
      code:
        'function dataValueSetsRequest() {\n    return new Promise(function(resolve, reject) {\n        $.ajax({\n            url: "../../../api/26/dataValueSets.json?dataSet=dataSetID&orgUnit=orgUnitId&period=period",\n            type: "GET",\n            success: function(dataValueSetsResults) {\n                try {\n                    //Code goes here\n                    resolve(dataValueSetsResults);\n                } catch (e) {\n                    reject(error);\n                }\n            },\n            error: function(error) {\n                reject(error);\n            }\n        });\n    })\n}'
    },
    {
      name: 'Analytics Format',
      code:
        '{\n    "headers": [{\n        "name": "dx",\n        "column": "Data",\n        "valueType": "TEXT",\n        "type": "java.lang.String",\n        "hidden": false,\n        "meta": true\n    }, {\n        "name": "pe",\n        "column": "Period",\n        "valueType": "TEXT",\n        "type": "java.lang.String",\n        "hidden": false,\n        "meta": true\n    }, {\n        "name": "ou",\n        "column": "Organisation unit",\n        "valueType": "TEXT",\n        "type": "java.lang.String",\n        "hidden": false,\n        "meta": true\n    }, {\n        "name": "value",\n        "column": "Value",\n        "valueType": "NUMBER",\n        "type": "java.lang.Double",\n        "hidden": false,\n        "meta": false\n    }],\n    "metaData": {\n        "names": {\n            "dx": "Data",\n            "pe": "Period",\n            "ou": "Organisation unit",\n            "m0frOspS7JY": "MOH - Tanzania",\n            "QHq2gYjwLPc": "3.2.2-1 Progress Facility profile shared locally",\n            "201812": "December 2018",\n            "uGIJ6IdkP7Q": "default"\n        },\n        "dx": ["QHq2gYjwLPc"],\n        "pe": ["201812"],\n        "ou": ["m0frOspS7JY"],\n        "co": ["uGIJ6IdkP7Q"]\n    },\n    "rows": [],\n    "width": 0,\n    "height": 0\n}'
    },
    {
      name: 'Multiple Promise',
      code:
        'function promisoryRequest() {\n    return new Promise(function(resolve, reject) {\n        $.ajax({\n            url: "../../../api/26/analytics.json?dimension=pe:" + parameters.pe + "&dimension=ou:" + parameters.ou + "&hierarchyMeta=true",\n            type: "GET",\n            success: function(analyticsResults) {\n                try {\n                    //Code goes here\n                    resolve(analyticsResults);\n                } catch (e) {\n                    reject(error);\n                }\n            },\n            error: function(error) {\n                reject(error);\n            }\n        });\n    })\n}\nfunction analyticsRequest() {\n    return new Promise(function(resolve, reject) {\n        var promises = [];\n        // List of promises to handle\n        var array = ["element1","element2","element3"];\n        array.forEach(function(){\n            // Add the promises \n            promises.push(promisoryRequest());\n        })\n        // Wait for the promises\n        Promise.all(promises).then(function(results){\n            resolve(results);\n        },function(error){\n            reject(error);\n        })\n    })\n}'
    }
  ];
  deleteFuntion = false;
  constructor(private store: Store<AppState>) {}

  parameters: any = {};
  ngOnInit() {
    console.log(this.currentVisualizationDataSelections);
    console.log(
      'Current Visualization:',
      _.find(this.currentVisualizationDataSelections, function(obj) {
        return obj.dimension === 'dx';
      })
    );
    this.parameters.ou = _.find(
      this.currentVisualizationDataSelections,
      function(obj) {
        return obj.dimension === 'ou';
      }
    );
    this.parameters.ou = _.map(this.parameters.ou.items, 'id').join(';');
    this.parameters.pe = _.find(
      this.currentVisualizationDataSelections,
      function(obj) {
        return obj.dimension === 'pe';
      }
    );
    this.parameters.pe = _.map(this.parameters.pe.items, 'id').join(';');
    this.parameters.rule = _.find(
      this.currentVisualizationDataSelections,
      function(obj) {
        return obj.dimension === 'dx';
      }
    );
    this.parameters.rule = _.map(this.parameters.rule.items, 'ruleDefinition');
    console.log(this.parameters.rule);
    this.parameters.rule = this.parameters.rule[0];
    if (typeof this.parameters.rule.json === 'string') {
      this.parameters.rule.json = JSON.parse(this.parameters.rule.json);
    }
  }

  onSimulate(e) {
    e.stopPropagation();
    this.simulate.emit(this.functionObject);
  }
  onChange(event) {
    this.upsertFunction();
  }
  onFunctionEdited(event) {
    this.functionObject.function = event;
    this.upsertFunction();
  }
  upsertFunction() {
    if (!this.functionObject.unsaved) {
      this.functionObject.unsaved = true;
    }
    console.log('this.functionObject:', this.functionObject);
    this.store.dispatch(new UpsertFunction({ function: this.functionObject }));
  }
  onSave(e) {
    e.stopPropagation();
    this.save.emit(this.functionObject);
  }
  onDelete() {
    this.delete.emit(this.functionObject);
  }
}
