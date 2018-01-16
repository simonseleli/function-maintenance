import { Component, OnInit,Input } from '@angular/core';
import {FunctionService} from "../../services/function.service";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  constructor(private functionService:FunctionService) { }

  prepareCardData() {
    return {
      id: 'pivot',
      type: 'TABLE',
      shape: 'FULL_WIDTH'
    }
  }
  @Input() func
  @Input() parameters;
  chartConfiguration = {
    "renderId": "cX2przhv9UC_0",
    "type": "line",
    "title": "Function Results",
    "subtitle": "",
    "hideTitle": false,
    "hideSubtitle": false,
    "showData": false,
    "hideEmptyRows": true,
    "hideLegend": false,
    "cumulativeValues": false,
    "targetLineLabel": "",
    "baseLineLabel": "",
    "legendAlign": "bottom",
    "reverseLegend": false,
    "showLabels": true,
    "axes": [],
    "sortOrder": 0,
    "percentStackedValues": false,
    "multiAxisTypes": [],
    "setting":{},
    "xAxisType": [
      "pe"
    ],
    "yAxisType": "ou"
  }

  tableConfiguration = {
    "title": "Function Results",
    "subtitle": "",
    "showColumnTotal": true,
    "showColumnSubtotal": true,
    "showRowTotal": true,
    "setting":{},
    "showRowSubtotal": true,
    "showDimensionLabels": true,
    "hideEmptyRows": true,
    "showHierarchy": true,
    "displayList": false,
    "rows": [
      "pe"
    ],
    "columns": [
      "ou"
    ],
    "legendSet": null,
    "styles": null
  }

  show
  getCurrentDimension() {
    let currentDimensions = [];
    currentDimensions.push({name: 'dx', value: this.parameters.dx});
    currentDimensions.push({name: 'pe', value: this.parameters.pe});
    currentDimensions.push({name: 'ou', value: this.parameters.ou});
    return currentDimensions;
  }
  currentLayout = {
    rows: ['pe'],
    columns: ['dx'],
    filters: ['ou']
  }
  onLayoutUpdate(event){

  }
  loading;
  results;
  loadingError;
  progress = 0;
  ngOnInit() {
    this.results = false;
    this.loading = false;
    this.parameters.progress = (progress)=>{
      this.progress = progress;
    }
    try{
      this.functionService.run(this.parameters, this.func).subscribe((results:any)=> {
        this.parameters.rules = this.func.rules;
        this.results = results;
        console.warn("Results:",JSON.stringify(results));
        this.loading = true;
      },(error)=>{
        this.loadingError = JSON.parse(error.responseText);
        this.loading = false;
      })
    }catch(e){
      this.loadingError = {message:"Please check your code"};
      this.loading = false;
    }

  }

}
