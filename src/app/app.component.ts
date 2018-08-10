import { Component,ViewChild } from '@angular/core';
import {FunctionService} from "./services/function.service";
import {FunctionParameters} from "./models/function-parameters";
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Function Maintenance';

  parameters:FunctionParameters = {
    dx: "FwpCBGQvYdL.BktmzfgqCjX",
    ou: "v5UR6nUPljk",
    pe: "2016Q4"
  }
  constructor(private functionService: FunctionService, public router: Router){

  }
  startTour(){

  }
  text:string;
  options:any = {fontSize:"20px",maxLines: Infinity};

  items = [];
  loadItems;
  functions={

  };
  user;
  ngOnInit() {

  }
  selectedFunction:any={
    function:"",
    rules:[]
  };
  functionId;
  public selected(value:any):void {
    this.selectedFunction = this.functions[value.id];
    this.functionId = value.id;
    this.load();
  }
  newFunction() {
    this.functionId = "new";
    this.load();
  }

  public removed(value:any):void {
    console.log('Removed value is: ', value);
  }

  public typed(value:any):void {
    console.log('New search input: ', value);
  }

  public refreshValue(value:any):void {

  }
  onRun(event?) {
    console.log("Called",event);
    if(event){
      this.parameters.ou = event.ou;
      this.parameters.dx = event.dx;
      this.parameters.pe = event.pe;
    }
    this.load();
  }
  load(){
    if(this.functionId && this.parameters.dx && this.parameters.pe && this.parameters.ou){
      //this.router.navigate(['function',this.functionId,"dx",this.parameters.dx,"pe",this.parameters.pe,"ou",this.parameters.ou]);
    }
  }
}
