import { Component,ViewChild } from '@angular/core';
import {HttpClientService} from "./services/http-client.service";
import {Observable} from 'rxjs/Rx';
import {FunctionService} from "./services/function.service";
import {FunctionParameters} from "./models/function-parameters";
import {FunctionObject} from "./models/function-object";
import { ActivatedRoute,Params,Router,NavigationStart } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Directive Maintenance';

  parameters:FunctionParameters = {
    dx: "FwpCBGQvYdL.BktmzfgqCjX",
    ou: "v5UR6nUPljk",
    pe: "2016Q4"
  }
  constructor(private functionService:FunctionService, private router:Router){

  }
  text:string;
  options:any = {fontSize:"20px",maxLines: Infinity};

  items = [];
  loadItems;
  functions={

  };
  user;
  ngOnInit() {
    this.functionService.getAll().subscribe((functions:any)=> {
      functions.forEach((sFunction, index)=> {
        this.functions[sFunction.id] = sFunction;
        this.items.push({id: this.functions[sFunction.id].id, text: this.functions[sFunction.id].name});
        if (sFunction.name == "Basic") {
          this.selectedFunction = sFunction;
        }
      })
      this.items = this.items.splice(0, this.items.length);
      this.loadItems = true;
    })
    this.selectedFunction.function = '//Example of function implementation\n' +
      'parameters.progress(50);\n' +
      '$.ajax({\n' +
      '\turl: "../../../api/25/analytics.json?dimension=dx:" + parameters.dx + "&dimension=pe:" + parameters.pe + "&dimension=ou:" + parameters.ou,\n' +
      '\ttype: "GET",\n' +
      '\tsuccess: function(analyticsResults) {\n' +
      '\t\t  parameters.success(analyticsResults);\n' +

      '\t},\n' +
      '\terror:function(error){\n' +
      '\t\t  parameters.error(error);\n' +
      '\t}\n' +
      '});'
  }
  selectedFunction:FunctionObject={
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
    if(event){
      this.parameters.ou = event.ou;
      this.parameters.dx = event.dx;
      this.parameters.pe = event.pe;
    }
    this.load();
  }
  load(){
    console.log(this.functionId, this.parameters.dx, this.parameters.pe, this.parameters.ou,this.functionId && this.parameters.dx && this.parameters.pe && this.parameters.ou);
    if(this.functionId && this.parameters.dx && this.parameters.pe && this.parameters.ou){
      alert("Here1");
      this.router.navigate(['function',this.functionId,"dx",this.parameters.dx,"pe",this.parameters.pe,"ou",this.parameters.ou]);
    }
  }
}
