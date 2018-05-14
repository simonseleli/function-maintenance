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
  currentVisualization = 'TABLE'
  showResult = true;
  onLayoutUpdate(event){
    this.tableConfiguration.rows = [];
    this.tableConfiguration.columns = [];
    this.chartConfiguration.xAxisType = [];
    this.chartConfiguration.yAxisType = "";
    event.rows.forEach((row)=>{
      this.tableConfiguration.rows.push(row.value);
      this.chartConfiguration.xAxisType.push(row.value);
    })
    event.columns.forEach((column)=>{
      this.tableConfiguration.columns.push(column.value);
      this.chartConfiguration.yAxisType = column.value;
    })
    this.showVisualization();
  }
  showVisualization(){
    this.showResult = false;
    setTimeout(()=>{
      this.showResult = true;
    })
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
  selectedChartType
  changeVisualization(vType){
    this.currentVisualization = vType;
    if(vType == 'CHART'){
      if(this.selectedChartType){
        this.chartConfiguration.type = this.selectedChartType
      }else {
        this.chartConfiguration.type = "column";
      }
    }
    this.showVisualization();
  }
  chartTypes = [
    {name:"Column Chart",text:"column"},
    {name:"Line Chart",text:"line"},
    {name:"Bar Chart",text:"bar"},
    {name:"Area Chart",text:"area"},
    {name:"Pie Chart",text:"pie"},
    /*{name:"Stacked Column Chart",text:"stacked-column"},
    {name:"Stacked Bar Chart",text:"stacked-bar"},*/
    {name:"Gauge Chart",text:"gauge"},
    {name:"Radar Chart",text:"radar"}
  ]
  showChart(type){
    this.chartConfiguration.type = type;
    this.showVisualization();
  }
}
