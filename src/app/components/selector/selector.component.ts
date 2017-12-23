import { Component, OnInit, EventEmitter,Output,Input } from '@angular/core';

@Component({
  selector: 'app-selector',
  templateUrl: './selector.component.html',
  styleUrls: ['./selector.component.css']
})
export class SelectorComponent implements OnInit {

  showOrgTree:boolean = true;
  disabled;
  @Output() onLayoutUpdate = new EventEmitter();

  constructor() {
  }

  @Input() rules:any
  parameters:any = {
    //dx: "FwpCBGQvYdL.BktmzfgqCjX"
  }

  ngOnInit() {
  }


  orgunit_settings = {
    //'selection_mode': 'Usr_orgUnit',
    'selection_mode': 'orgUnit',
    'selected_levels': [],
    'show_update_button': true,
    'selected_groups': [],
    'orgunit_levels': [],
    'orgunit_groups': [],
    'selected_orgunits': [],
    'user_orgunits': [],
    'type': 'report',
    'selected_user_orgunit': []
  }

  onOrgUnitUpdate(event) {
    this.parameters.ou = event.value;
    this.updateSelection();
  }

  onPeriodUpdate(event) {
    this.parameters.pe = event.value;
    this.updateSelection();
  }

  updateSelection() {
    if (this.parameters.ou && this.parameters.rule && this.parameters.pe) {
      this.run({orgUnits:1,periods:1});
    }
  }

  @Output() onRun:EventEmitter<any> = new EventEmitter<any>();

  runOptions={
    OneOne:{orgUnits:1,periods:1},
    OneMany:{orgUnits:1,periods:0},
    ManyOne:{orgUnits:0,periods:1},
    ManyMany:{orgUnits:0,periods:0},
  }
  run(counts) {
    let parameters:any = {
      rule:this.parameters.rule
    }
    console.log("Parameters:",this.parameters);
    if(counts.orgUnits == 1){
      let splt = this.parameters.ou.split(";");
      parameters.ou = splt[0];
    }else{
      parameters.ou = this.parameters.ou;
    }
    if(counts.periods == 1){
      let splt = this.parameters.pe.split(";");
      parameters.pe = splt[0];
    }else{
      parameters.pe = this.parameters.pe;
    }
    console.log("Parameters:",parameters)
    this.onRun.emit(parameters);
    console.log("Parameters:",this.parameters);
  }

  dataSelector;

  onDataUpdate(event) {
    this.dataSelector = event;
    this.parameters.dx = event.selectedData.value;
  }

  currentLayout = {
    rows: ['pe'],
    columns: ['dx'],
    filters: ['ou']
  }

  onLayUpdate(event) {
  }
  onRuleUpdate(event){
    this.parameters.rule = event;
    this.updateSelection();
  }
}
