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
  results
  ngOnInit() {
    console.log("Loading:",this.parameters, this.func);
    this.results = false;
    this.functionService.run(this.parameters, this.func).subscribe((results:any)=> {
      this.parameters.rules = this.func.rules;
      this.results = results;
    },(error)=>{
      this.results = error;
    })
  }

}
