import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AceEditorModule } from 'ng2-ace-editor';
import {PrettyJsonModule} from 'angular2-prettyjson';

import { AppComponent } from './app.component';
import {HttpClientService} from "./services/http-client.service";
import {SelectModule} from 'ng2-select';
import { RunnerComponent } from './components/runner/runner.component';
import { VisualizerComponent } from './components/visualizer/visualizer.component';
import {Ng2HighchartsModule} from "ng2-highcharts";
import { RulesComponent } from './components/rules/rules.component';
import { RouterModule,Routes }   from '@angular/router';
import { MessageComponent } from './components/message/message.component';
import { TooltipModule } from 'ng2-bootstrap/tooltip';
import { AccordionModule } from 'ng2-bootstrap/accordion';
import {OrgUnitFilterComponent} from "./components/organisation-unit/org-unit-filter.component";
import TreeModule from "angular2-tree-component/dist/angular2-tree-component";
import {FilterLevelPipe} from "./services/filter-level.pipe";
import { SelectorComponent } from './components/selector/selector.component';
import {PeriodFilterComponent} from "./components/period-filter/period-filter.component";
import {FilterService} from "./services/filter.service";
import {Constants} from "./dashboard-card/providers/constants";
import {DashboardCardModule} from "./dashboard-card/dashboard-card.module";
import {LayoutComponent} from "./components/layout/layout.component";
import {DndModule,DragDropService,DragDropConfig} from "ng2-dnd";
import {DataFilterComponent} from "./components/data-filter/data-filter.component";
import {FilterByNamePipe} from "./services/filter-by-name.pipe";
import {DataFilterService} from "./services/data-filter.service";
import {Store} from "./dashboard-card/providers/store";

@NgModule({
  declarations: [
    AppComponent,
    RunnerComponent,
    VisualizerComponent,
    RulesComponent,
    MessageComponent,
    OrgUnitFilterComponent,
    FilterLevelPipe,
    SelectorComponent,
    PeriodFilterComponent,
    LayoutComponent,
    DataFilterComponent,
    FilterByNamePipe
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AceEditorModule,
    PrettyJsonModule,
    TreeModule,
    SelectModule,
    Ng2HighchartsModule,
    TooltipModule.forRoot(),
    AccordionModule.forRoot(),
    DashboardCardModule,
    DndModule
  ],
  providers: [HttpClientService,FilterService,Constants,DragDropService,DragDropConfig,DataFilterService,Store],
  bootstrap: [AppComponent]
})
export class AppModule { }
