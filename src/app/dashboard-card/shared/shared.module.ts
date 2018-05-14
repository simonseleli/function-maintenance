import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Dhis2MenuComponent } from './components/dhis2-menu/dhis2-menu.component';
import { PeriodFilterComponent } from './components/period-filter/period-filter.component';
import {FormsModule} from "@angular/forms";
import { OrgUnitFilterComponent } from './components/org-unit-filter/org-unit-filter.component';
import { ClickOutsideDirective } from './directives/click-outside.directive';
import { LoaderComponent } from './components/loader/loader.component';
import { DimensionFiltersComponent } from './components/dimension-filters/dimension-filters.component';
import {TooltipModule} from "ng2-bootstrap";
import {HttpClientService} from "./providers/http-client.service";
import {Constants} from "./providers/constants";
import {VisualizerService} from "./providers/visualizer.service";
import {Ng2HighchartsModule} from "ng2-highcharts";
import { ReadableNamePipe } from './pipes/readable-name.pipe';
import {DashboardItemComponent} from "./components/dashboard-item/dashboard-item.component";
import {DashboardService} from "./providers/dashboard.service";
import {Utilities} from "./providers/utilities";
import { DashboardItemContainerComponent } from './components/dashboard-item-container/dashboard-item-container.component';
import {TreeModule} from "angular-tree-component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TreeModule,
    TooltipModule.forRoot(),
    Ng2HighchartsModule
  ],
  declarations: [Dhis2MenuComponent, PeriodFilterComponent, OrgUnitFilterComponent, ClickOutsideDirective, LoaderComponent, DimensionFiltersComponent, ReadableNamePipe, DashboardItemComponent, DashboardItemContainerComponent],
  providers: [HttpClientService, Constants, VisualizerService, DashboardService, Utilities],
  exports: [Dhis2MenuComponent, PeriodFilterComponent, OrgUnitFilterComponent, DimensionFiltersComponent, LoaderComponent, Ng2HighchartsModule, ReadableNamePipe, DashboardItemContainerComponent, DashboardItemComponent]
})
export class SharedModule { }
