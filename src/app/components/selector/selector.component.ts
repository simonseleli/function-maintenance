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
  constructor() { }

  @Input() rules:any
  @Input() parameters:any = {
    //dx: "FwpCBGQvYdL.BktmzfgqCjX"
  }
  ngOnInit() {
  }


  orgunit_settings = {
    'selection_mode': 'Usr_orgUnit',
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
  onOrgUnitUpdate(event){
    this.parameters.ou = event.value;
    this.updateSelection();
  }
  onPeriodUpdate(event){
    this.parameters.pe = event.value;
    this.updateSelection();
  }
  updateSelection(){
    if(this.parameters.ou && this.parameters.dx && this.parameters.pe){
      this.run();
    }
  }
  @Output() onRun : EventEmitter<any> = new EventEmitter<any>();
  run(){
    this.onRun.emit(this.parameters);
  }
  dataSelector;
  onDataUpdate(event){
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
}
