import {Component, OnInit, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'app-filter-container',
  templateUrl: './filter-container.component.html',
  styleUrls: ['./filter-container.component.css']
})
export class FilterContainerComponent implements OnInit {

  @Output() onFilterUpdate: EventEmitter<any> = new EventEmitter<any>();
  filterShown: boolean = false;
  constructor() { }

  ngOnInit() {
  }

  getFilterValues(filterValue) {
    this.onFilterUpdate.emit(filterValue);
  }

}
