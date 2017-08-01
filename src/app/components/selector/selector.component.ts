import { Component, OnInit, EventEmitter,Output } from '@angular/core';

@Component({
  selector: 'app-selector',
  templateUrl: './selector.component.html',
  styleUrls: ['./selector.component.css']
})
export class SelectorComponent implements OnInit {

  showOrgTree:boolean = true;
  @Output() onLayoutUpdate = new EventEmitter();
  constructor() { }

  parameters:any = {
    //dx: "FwpCBGQvYdL.BktmzfgqCjX"
  }
  ngOnInit() {
  }


  onOrgUnitUpdate(event){
    this.parameters.ou = event.value;
    //this.updateSelection();
  }
  onPeriodUpdate(event){
    this.parameters.pe = event.value;
    //this.updateSelection();
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
    console.log("Ondata Update:",event);
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
