import { Component,ViewChild } from '@angular/core';
import {HttpClientService} from "./services/http-client.service";
import {Observable} from 'rxjs/Rx';
import {FunctionService} from "./services/function.service";
import {FunctionParameters} from "./models/function-parameters";
import {FunctionObject} from "./models/function-object";
import { ActivatedRoute,Params,Router,NavigationStart } from '@angular/router';
import {TourService,IStepOption} from "ngx-tour-ng-bootstrap";

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
  constructor(private functionService: FunctionService, public router: Router,private tourService:TourService){

    this.tourService.initialize([
      /*{
      anchorId: 'createid',
      content: 'Create a new function by click this button.',
      title: 'Create A function',
      route:'/functions'
    },*/ {
      anchorId: 'functionname',
      content: 'Write the name which will identify your function',
      title: 'Funciton Name',
      route:'/functions/new'
    },
      {
        anchorId: 'rules',
        content: 'Rules Are definitions of what data to act upon. A group of data that is required as input. <br /> This is',
        title: 'Funciton Rules'
      },
      {
        anchorId: 'addrule',
        //clickid:true,
        content: 'Add a new rule. Pay attention to the json since this will be used as data passed as input to your function definition.',
        title: 'Funciton Rules'
      }
    ]);
    this.tourService.stepShow$.subscribe((step: IStepOption) => {
      if(step.anchorId == "addrule"){
        console.log(step);
      }
    });
  }
  startTour(){
    this.tourService.start()
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
