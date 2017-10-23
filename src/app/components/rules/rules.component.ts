import { Component, OnInit,Input, forwardRef,Provider,Output,EventEmitter } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import {HttpClientService} from "../../services/http-client.service";

const noop = () => {
};

export const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => RulesComponent),
  multi: true
};

@Component({
  selector: 'app-rules',
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.css'],
  providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR]
})
export class RulesComponent implements OnInit, ControlValueAccessor {
  setDisabledState(isDisabled:boolean):void {
  }

  //@Input() rules:Array<any>=[];

  constructor(private http:HttpClientService) {
  }

  noRules = {message:'There is a no rule registered.'};
  ngOnInit() {

  }

  newRule;
  addNewRule(){
    this.newRule = {
      id:"",
      name:"",
      description:"",
      json:""
    }
  }
  errors:any = {};
  savingRule;
  saveNewRule(){
    if(!this.newRule.id){
      this.savingRule = true;
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
        this.http.get("system/id").subscribe((results:any)=>{
          this.newRule.id = results.codes[0];
          this.selectRule(this.newRule);
          this.rules.push(this.newRule);
          this.newRule = undefined;
          this.savingRule = false;
        })
      }else{
        this.savingRule = false;
      }
    }else{
      this.selectRule(this.newRule);
      this.newRule = undefined;
      this.savingRule = false;
    }
  }
  deleteRule(index){
    this.rules.splice(index,1);
  }
  @Output() onSelectRule : EventEmitter<any> = new EventEmitter<any>();
  selectedRule;
  selectRule(rule){
    console.log("Rules",rule);
    this.selectedRule = rule.id;
    this.onSelectRule.emit(rule);
  }
  onChange(event){
    console.log("Event:",event);
  }
  options:any = {fontSize:"20px",maxLines: 20};
  onNewRecord(event){
    this.newRule = JSON.parse(event);
  }

  editRule(rule){
    console.log("Rule:",rule.json);
    this.newRule = rule;
    this.newRule.json = JSON.stringify(this.newRule.json);
  }
  rules:Array<any>=[];

  //Placeholders for the callbacks which are later provided
  //by the Control Value Accessor
  onTouchedCallback: () => void = noop;
  onChangeCallback: (_: any) => void;

  //get accessor
  get value(): any {
    return this.rules;
  };

  //set accessor including call the onchange callback
  set value(v: any) {
    if (v !== this.rules) {
      this.rules = v;
      if(this.rules.length > 0){
        this.selectRule(this.rules[0])
      }
      this.onChangeCallback(v);
    }
  }

  //Set touched on blur
  onBlur() {
    this.onTouchedCallback();
  }

  //From ControlValueAccessor interface
  writeValue(value: any) {
    if (value !== this.rules) {
      this.rules = value;
    }
  }

  //From ControlValueAccessor interface
  registerOnChange(fn: any) {
    this.onChangeCallback = fn;
  }

  //From ControlValueAccessor interface
  registerOnTouched(fn: any) {
    this.onTouchedCallback = fn;
  }
}
