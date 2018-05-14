import {Component, OnInit, EventEmitter, Output, Input, ViewChild} from '@angular/core';
import {PeriodFilterComponent} from "../period-filter/period-filter.component";
import {OrgUnitFilterComponent} from "../org-unit-filter/org-unit-filter.component";

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
    if(!this.currentRunOption){
      this.currentRunOption = this.runOptions.OneOne;
    }
    if (this.parameters.ou && this.parameters.rule && this.parameters.pe) {
      this.currentRunOption.periods = this.parameters.ou.split(";").length > 1?2:this.parameters.ou.split(";").length
      this.run(this.currentRunOption);
    }
  }

  @Output() onRun:EventEmitter<any> = new EventEmitter<any>();

  objectKeys = Object.keys;

  runOptions={
    OneOne:{name:"1 Org Unit & 1 Period",orgUnits:1,periods:1},
    OneMany:{name:"1 Org Unit & Multiple Period",orgUnits:1,periods:2},
    ManyOne:{name:"Multiple Org Unit & 1 Period",orgUnits:2,periods:1},
    ManyMany:{name:"Multiple Org Unit & Multiple Period",orgUnits:2,periods:2},
    ZeroOne:{name:"0 Org Unit & 1 Period",orgUnits:0,periods:1,exception:true},
    OneZero:{name:"1 Org Unit & 0 Period",orgUnits:1,periods:0,exception:true}
  }
  currentRunOption
  @ViewChild('periodTree') periodComponent: PeriodFilterComponent;
  @ViewChild('orgUnitTree') orgUnitComponent: OrgUnitFilterComponent;
  run(counts) {
    let parameters:any = {
      rule:this.parameters.rule
    }
    if(counts.orgUnits == 2){
      this.orgUnitComponent.setMultipleOrgUnits()
    }else if(counts.orgUnits == 1){
      this.orgUnitComponent.setOneOrgUnit()
    }else{
      this.orgUnitComponent.setNoOrgUnits();
    }
    parameters.ou = this.orgUnitComponent.getSelectedOrgUnits()
    if(counts.periods == 2){
      this.periodComponent.setMultiplePeriod()
    }else if(counts.periods == 1){
      this.periodComponent.setOnePeriod()
    }else{
      this.periodComponent.setNoPeriod()
    }
    parameters.pe = this.periodComponent.getSelectedPeriods()
    this.onRun.emit(parameters);
    this.currentRunOption = counts;
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
