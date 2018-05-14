var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, EventEmitter, Output, Input } from '@angular/core';
export var DimensionFiltersComponent = (function () {
    function DimensionFiltersComponent() {
        this.onFilterUpdate = new EventEmitter();
        this.orgunit_model = {
            selection_mode: "Usr_orgUnit",
            selected_level: "",
            show_update_button: true,
            selected_group: "",
            orgunit_levels: [],
            orgunit_groups: [],
            selected_orgunits: [],
            user_orgunits: [],
            type: "report",
            selected_user_orgunit: "USER_ORGUNIT"
        };
        // The organisation unit configuration object This will have to come from outside.
        this.orgunit_tree_config = {
            show_search: true,
            search_text: 'Search',
            level: null,
            loading: true,
            loading_message: 'Loading Organisation units...',
            multiple: false,
            multiple_key: "none",
            placeholder: "Select Organisation Unit"
        };
        this.period_tree_config = {
            show_search: true,
            search_text: 'Search',
            level: null,
            loading: false,
            loading_message: 'Loading Periods...',
            multiple: false,
            multiple_key: "none",
            starting_periods: [],
            starting_year: null,
            placeholder: "Select period"
        };
    }
    DimensionFiltersComponent.prototype.ngOnInit = function () {
    };
    DimensionFiltersComponent.prototype.getPeriodValues = function (event) {
        this.updateFilter(event);
    };
    DimensionFiltersComponent.prototype.getOrgUnitValues = function (event) {
        this.updateFilter(event);
    };
    DimensionFiltersComponent.prototype.updateFilter = function (value) {
        this.onFilterUpdate.emit(value);
    };
    __decorate([
        Output(), 
        __metadata('design:type', EventEmitter)
    ], DimensionFiltersComponent.prototype, "onFilterUpdate", void 0);
    __decorate([
        Input(), 
        __metadata('design:type', Object)
    ], DimensionFiltersComponent.prototype, "orgunit_model", void 0);
    __decorate([
        Input(), 
        __metadata('design:type', Object)
    ], DimensionFiltersComponent.prototype, "orgunit_tree_config", void 0);
    __decorate([
        Input(), 
        __metadata('design:type', Object)
    ], DimensionFiltersComponent.prototype, "period_tree_config", void 0);
    DimensionFiltersComponent = __decorate([
        Component({
            selector: 'app-dimension-filters',
            templateUrl: './dimension-filters.component.html',
            styleUrls: ['./dimension-filters.component.css']
        }), 
        __metadata('design:paramtypes', [])
    ], DimensionFiltersComponent);
    return DimensionFiltersComponent;
}());
//# sourceMappingURL=dimension-filters.component.js.map