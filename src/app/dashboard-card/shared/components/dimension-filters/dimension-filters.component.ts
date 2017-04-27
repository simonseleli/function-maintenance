import {Component, OnInit, EventEmitter, Output, Input} from '@angular/core';

@Component({
  selector: 'app-dimension-filters',
  templateUrl: './dimension-filters.component.html',
  styleUrls: ['./dimension-filters.component.css']
})
export class DimensionFiltersComponent implements OnInit {

  @Output() onFilterUpdate: EventEmitter<any> = new EventEmitter<any>();
  @Input() orgunit_model: any = {
    selection_mode: "Usr_orgUnit",
    selected_level: "",
    show_update_button:true,
    selected_group: "",
    orgunit_levels: [],
    orgunit_groups: [],
    selected_orgunits: [],
    user_orgunits: [],
    type:"report", // can be 'data_entry'
    selected_user_orgunit: "USER_ORGUNIT"
  };

  // The organisation unit configuration object This will have to come from outside.
  @Input() orgunit_tree_config: any = {
    show_search : true,
    search_text : 'Search',
    level: null,
    loading: true,
    loading_message: 'Loading Organisation units...',
    multiple: false,
    multiple_key:"none",
  placeholder: "Select Organisation Unit"
  };
  @Input() period_tree_config: any = {
    show_search : true,
    search_text : 'Search',
    level: null,
    loading: false,
    loading_message: 'Loading Periods...',
    multiple: false,
    multiple_key:"none",
    starting_periods: [],
    starting_year: null,
    placeholder: "Select period"
  };
  constructor() {
  }

  ngOnInit() {
  }

  getPeriodValues(event) {
    this.updateFilter(event);
  }

  getOrgUnitValues(event) {
    this.updateFilter(event);
  }

  updateFilter(value) {
    this.onFilterUpdate.emit(value);
  }
}
