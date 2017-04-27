var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Dhis2MenuComponent } from './components/dhis2-menu/dhis2-menu.component';
import { BannerComponent } from './components/banner/banner.component';
import { PeriodFilterComponent } from './components/period-filter/period-filter.component';
import { FormsModule } from "@angular/forms";
import { TreeModule } from "angular2-tree-component";
import { OrgUnitFilterComponent } from './components/org-unit-filter/org-unit-filter.component';
import { ClickOutsideDirective } from './directives/click-outside.directive';
import { LoaderComponent } from './components/loader/loader.component';
import { DimensionFiltersComponent } from './components/dimension-filters/dimension-filters.component';
import { RouterModule } from "@angular/router";
import { TooltipModule } from "ng2-bootstrap";
import { HttpClientService } from "./providers/http-client.service";
import { Constants } from "./providers/constants";
import { VisualizerService } from "./providers/visualizer.service";
import { Ng2HighchartsModule } from "ng2-highcharts";
import { ReadableNamePipe } from './pipes/readable-name.pipe';
import { DashboardItemComponent } from "./components/dashboard-item/dashboard-item.component";
import { DashboardService } from "./providers/dashboard.service";
import { Utilities } from "./providers/utilities";
import { DashboardItemContainerComponent } from './components/dashboard-item-container/dashboard-item-container.component';
export var SharedModule = (function () {
    function SharedModule() {
    }
    SharedModule = __decorate([
        NgModule({
            imports: [
                CommonModule,
                FormsModule,
                TreeModule,
                RouterModule,
                TooltipModule.forRoot(),
                Ng2HighchartsModule
            ],
            declarations: [Dhis2MenuComponent, BannerComponent, PeriodFilterComponent, OrgUnitFilterComponent, ClickOutsideDirective, LoaderComponent, DimensionFiltersComponent, ReadableNamePipe, DashboardItemComponent, DashboardItemContainerComponent],
            providers: [HttpClientService, Constants, VisualizerService, DashboardService, Utilities],
            exports: [Dhis2MenuComponent, BannerComponent, PeriodFilterComponent, OrgUnitFilterComponent, DimensionFiltersComponent, LoaderComponent, Ng2HighchartsModule, ReadableNamePipe, DashboardItemContainerComponent, DashboardItemComponent]
        }), 
        __metadata('design:paramtypes', [])
    ], SharedModule);
    return SharedModule;
}());
//# sourceMappingURL=shared.module.js.map