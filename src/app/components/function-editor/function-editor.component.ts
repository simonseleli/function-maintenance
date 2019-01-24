import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
  OnChanges
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
export class FunctionEditorComponent implements OnInit, OnChanges {
  @Input()
  functionObject: FunctionObject;

  @Input()
  currentVisualizationDataSelections: VisualizationDataSelection[];

  showEditor = true;
  showParameters = true;

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
        'function analyticsRequest() {\n    return new Promise(function(resolve, reject) {\n        $.ajax({\n            url: "../../../api/26/analytics.json?dimension=pe:" + parameters.pe + "&dimension=ou:" + parameters.ou + "&hierarchyMeta=true&skipData=true",\n            type: "GET",\n            success: function(analyticsResults) {\n                try {\n                    //Code goes here\n                    analyticsResults.headers = [{"name":"dx","column":"Data","type":"java.lang.String","hidden":false,"meta":true},{"name":"pe","column":"Period","type":"java.lang.String","hidden":false,"meta":true},{"name":"ou","column":"Organisation Unit","type":"java.lang.String","hidden":false,"meta":true},{"name":"value","column":"Value","type":"java.lang.Double","hidden":false,"meta":false}];\n                    analyticsResults.metaData.names[parameters.rule.id] = parameters.rule.name;\n                    analyticsResults.metaData.dx = [parameters.rule.id];\n                    resolve(analyticsResults);\n                } catch (e) {\n                    reject(error);\n                }\n            },\n            error: function(error) {\n                reject(error);\n            }\n        });\n    })\n}'
    },
    {
      name: 'Organisation Unit',
      code:
        'function organisationUnitsRequest() {\n    return new Promise(function(resolve, reject) {\n        $.ajax({\n            url: "../../../api/26/organisationUnits.json",\n            type: "GET",\n            success: function(organisatioUnitsResults) {\n                try {\n                    //Code goes here\n                    resolve(organisatioUnitsResults);\n                } catch (e) {\n                    reject(error);\n                }\n            },\n            error: function(error) {\n                reject(error);\n            }\n        });\n    })\n}'
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
    this._setParameters(this.currentVisualizationDataSelections);
  }

  _setParameters(selections) {
    // Get ou parameters
    const ouDimension = _.find(selections, ['dimension', 'ou']);
    const ouParameters = _.join(
      _.map(ouDimension ? ouDimension.items : [], (item: any) => item.id),
      ';'
    );

    // Get pe parameters
    const peDimension = _.find(selections, ['dimension', 'pe']);
    const peParameters = _.join(
      _.map(peDimension ? peDimension.items : [], (item: any) => item.id),
      ';'
    );

    // Get rule parameters
    const ruleDimension = _.find(selections, ['dimension', 'dx']);
    const ruleDefinition = _.map(
      ruleDimension ? ruleDimension.items : [],
      (item: any) => {
        if (typeof item.ruleDefinition.json === 'string') {
          item.ruleDefinition.json = JSON.parse(item.ruleDefinition.json);
        }
        return item.ruleDefinition;
      }
    )[0];

    if (ouParameters !== '' && peParameters !== '' && ruleDefinition) {
      this.parameters.ou = ouParameters;
      this.parameters.pe = peParameters;
      this.parameters.rule = ruleDefinition;
      this.parameters.success = analyticsObject => {};
      this.parameters.error = error => {};
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
    const functionObjectClone = _.clone(this.functionObject);
    functionObjectClone.function = event;
    this.functionObject = functionObjectClone;
    this.upsertFunction();
  }

  upsertFunction() {
    if (!this.functionObject.unsaved) {
      this.functionObject.unsaved = true;
    }

    // this.store.dispatch(new UpsertFunction({function: this.functionObject}));
  }

  onSave(e) {
    e.stopPropagation();

    this.save.emit(this.functionObject);
  }

  onDelete() {
    this.delete.emit(this.functionObject);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes.functionObject.currentValue &&
      changes.functionObject.previousValue
    ) {
      if (
        changes.functionObject.currentValue.id !==
        changes.functionObject.previousValue.id
      ) {
        this.showEditor = false;
        setTimeout(() => {
          this.showEditor = true;
        });
      }
    }
    if (changes.currentVisualizationDataSelections) {
      if (changes.currentVisualizationDataSelections.currentValue) {
        this.showParameters = false;
        this._setParameters(
          changes.currentVisualizationDataSelections.currentValue
        );
        setTimeout(() => {
          this.showParameters = true;
        });
      }
    }
  }
}
