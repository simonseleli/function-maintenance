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
    renderId:"id1",
    type:"table",
    axes: [
      {
        name: "",
        orientation: "left"
      },
      {
        name: "",
        orientation: "right"
      }
    ],
    xAxisType: ["ou","pe"],
    yAxisType: "dx"
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
    console.log("Parameters:",this.parameters);
    this.results = false;
    this.loading = false;
    this.parameters.progress = (progress)=>{
      alert(progress);
      this.progress = progress;
    }
    try{
      this.functionService.run(this.parameters, this.func).subscribe((results:any)=> {
        this.parameters.rules = this.func.rules;
        this.results = results;
        this.loading = true;
      },(error)=>{
        console.log(error);
        this.loadingError = JSON.parse(error.responseText);
        this.loading = false;
      })
    }catch(e){
      this.loadingError = {message:"Please check your code"};
      this.loading = false;
    }

  }

}
