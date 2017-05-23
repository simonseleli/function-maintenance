import { Component, OnInit, ViewChild } from '@angular/core';
import {FunctionService} from "../../services/function.service";
import { ActivatedRoute,Params,Router,NavigationStart } from '@angular/router';
import {FunctionParameters} from "../../models/function-parameters";

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  id;
  @ViewChild('editor') editor;
  parameters:FunctionParameters;

  constructor(private functionService:FunctionService, private route:ActivatedRoute) {
    this.route.params.subscribe((params:any)=> {
      this.id = params.id;
      this.parameters = {
        dx: params.dx,
        pe: params.pe,
        ou: params.ou
      }
      this.init()
    })
  }

  func

  ngOnInit() {

  }

  currentLayout = {
    rows: ['pe'],
    columns: ['dx'],
    filters: ['ou']
  }

  loading;
  init() {
    this.loading = true;
    this.functionService.get(this.id).subscribe((func:any)=> {
      this.func = func;
      this.loading = false;
      this.run();
    })
  }

  results

  run() {
    this.results = false;
    this.functionService.run(this.parameters, this.func).subscribe((results:any)=> {
      this.results = results;
    })
  }

  prepareCardData() {
    return {
      id: 'pivot',
      type: 'TABLE',
      shape: 'FULL_WIDTH'
    }
  }

  getCurrentDimension() {
    let currentDimensions = [];
    currentDimensions.push({name: 'dx', value: this.parameters.dx});
    currentDimensions.push({name: 'pe', value: this.parameters.pe});
    currentDimensions.push({name: 'ou', value: this.parameters.ou});
    return currentDimensions;
  }
  save(){
    this.loading = true;
    if(this.func.name && this.func.name != ""){
      this.func.function = this.editor.oldText;
      this.functionService.save(this.func).subscribe((results)=>{
        this.func = results;
        this.loading = false;
      },(error)=>{
        this.loading = false;
        //this.loadingError = error;
      })
    }else{
      alert("Please write name for function.");
    }
  }
  onLayoutUpdate(event){
    this.loading = true;
    setTimeout(()=>{
      this.currentLayout = event;
      this.loading = false;
    })
  }
}
