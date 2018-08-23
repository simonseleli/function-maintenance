import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FunctionRule } from '../../shared/modules/ngx-dhis2-data-selection-filter/modules/data-filter/store/models';

@Component({
  selector: 'app-function-rule-editor',
  templateUrl: './function-rule-editor.component.html',
  styleUrls: ['./function-rule-editor.component.css']
})
export class FunctionRuleEditorComponent implements OnInit {
  @Input()
  functionRule: FunctionRule;

  @Output()
  simulate: EventEmitter<FunctionRule> = new EventEmitter<FunctionRule>();
  @Output()
  save: EventEmitter<FunctionRule> = new EventEmitter<FunctionRule>();
  constructor() {}

  ngOnInit() {}

  onSimulate(e) {
    e.stopPropagation();
    this.save.emit(this.functionRule);
  }
  onSave(e) {
    e.stopPropagation();
    this.simulate.emit(this.functionRule);
  }
  showEditor = true;
  ngOnChanges(changes: SimpleChanges) {
    console.log("Change:",changes);
    if(changes.functionRule.previousValue){
      if(changes.functionRule.currentValue.id !== changes.functionRule.previousValue.id){
        this.showEditor = false;
        setTimeout(()=>{
          this.showEditor = true;
        })
      }
    }
    //this.doSomething(changes.categoryId.currentValue);
    // You can also use categoryId.previousValue and
    // categoryId.firstChange for comparing old and new values

  }
  onChange(event){

  }
}
