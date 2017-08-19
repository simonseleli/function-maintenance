import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardCardComponent } from './components/dashboard-card/dashboard-card.component';
import { FilterContainerComponent } from './components/filter-container/filter-container.component';
import {SharedModule} from './shared/shared.module';
import { ChartComponent } from './components/chart/chart.component';
import {ChartService} from './providers/chart.service';
import { TableComponent } from './components/table/table.component';
import { MapComponent } from './components/map/map.component';
import {Store} from './providers/store';
import {TableService} from './providers/table.service';
import {MapService} from './providers/map.service';
import { ErrorNotifierComponent } from './components/error-notifier/error-notifier.component';
import {VisualizationStore} from './providers/visualization-store';
import {AnalyticsService} from './providers/analytics.service';
import {Utilities} from './providers/utilities';
import {VisualizerService} from './providers/visualizer.service';
import {NgxPaginationModule} from 'ngx-pagination';
// import { Angular2Csv } from 'angular2-csv/Angular2-csv';
@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    NgxPaginationModule
  ],
  declarations: [DashboardCardComponent, FilterContainerComponent, ChartComponent, TableComponent, MapComponent, ErrorNotifierComponent],
  exports: [DashboardCardComponent],
  providers: [VisualizationStore, ChartService, TableService, MapService, AnalyticsService, Utilities, VisualizerService]
})
export class DashboardCardModule { }
