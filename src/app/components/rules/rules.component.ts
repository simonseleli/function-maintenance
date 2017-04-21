import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-rules',
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.css']
})
export class RulesComponent implements OnInit {

  rules:Array<any>=[];
  constructor() { }

  noRules = {message:'There is a no rule registerd.'};
  ngOnInit() {
  }

  newRule;
  addNewRule(){
    this.newRule = {
      name:"",
      description:"",
      json:{}
    }
  }
  errors:any = {}
  saveNewRule(){
    this.errors = {}
    let canSave = true;
    if(this.newRule.name == ""){
      canSave = false;
      this.errors.name = {
        type:'danger',
        object:{message:"Please enter a valid name."}
      }
    }
    if(canSave){
      this.rules.push(this.newRule);
      this.newRule = undefined;
    }
  }
  deleteRule(index){
    this.rules.splice(index,1);
  }
}
