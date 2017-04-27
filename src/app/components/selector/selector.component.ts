import { Component, OnInit, EventEmitter,Output } from '@angular/core';

@Component({
  selector: 'app-selector',
  templateUrl: './selector.component.html',
  styleUrls: ['./selector.component.css']
})
export class SelectorComponent implements OnInit {

  constructor() { }

  parameters:any = {
    dx: "FwpCBGQvYdL.BktmzfgqCjX"
  }
  ngOnInit() {
  }


  onOrgUnitUpdate(event){
    this.parameters.ou = event.value;
  }
  onPeriodUpdate(event){
    this.parameters.pe = event.value;
  }
  @Output() onRun : EventEmitter<any> = new EventEmitter<any>();
  run(){
    this.onRun.emit(this.parameters);
  }
}
