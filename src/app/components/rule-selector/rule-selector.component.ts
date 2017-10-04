import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-rule-selector',
  templateUrl: './rule-selector.component.html',
  styleUrls: ['./rule-selector.component.css']
})
export class RuleSelectorComponent implements OnInit {

  @Input() rules:any;
  selectedRule
  constructor() { }

  ngOnInit() {
  }
  select(rule){
    this.selectedRule = rule
  }
}
