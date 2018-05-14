import { Component, OnInit, Input,Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-rule-selector',
  templateUrl: './rule-selector.component.html',
  styleUrls: ['./rule-selector.component.css']
})
export class RuleSelectorComponent implements OnInit {

  @Input() rules:any=[];
  searchText;
  selectedRule;
  @Output() onRuleUpdate: EventEmitter<any> = new EventEmitter<any>();
  constructor() { }

  ngOnInit() {
    if(this.rules.length > 0){
      this.select(this.rules[0]);
      this.update();
    }
  }
  select(rule){
    if(this.selectedRule != rule){
      this.selectedRule = rule
    }else{
      this.selectedRule = undefined;
    }
  }
  showRules;
  update(){
    this.onRuleUpdate.emit(this.selectedRule);
    this.showRules = false;
  }
}
