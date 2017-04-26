import { Component, OnInit,Input, forwardRef,Provider } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

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

  constructor() {
  }

  noRules = {message:'There is a no rule registered.'};
  ngOnInit() {
  }

  newRule;
  addNewRule(){
    this.newRule = {
      name:"",
      description:"",
      json:""
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
  options:any = {fontSize:"20px",maxLines: 20};
  onNewRecord(event){
    console.log(event);
    this.newRule = JSON.parse(event);
  }

  private rules:Array<any>=[];

  //Placeholders for the callbacks which are later provided
  //by the Control Value Accessor
  private onTouchedCallback: () => void = noop;
  private onChangeCallback: (_: any) => void;

  //get accessor
  get value(): any {
    return this.rules;
  };

  //set accessor including call the onchange callback
  set value(v: any) {
    if (v !== this.rules) {
      this.rules = v;
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
