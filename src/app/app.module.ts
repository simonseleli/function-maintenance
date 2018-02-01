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
import { RulesComponent } from './components/rules/rules.component';
import { MessageComponent } from './components/message/message.component';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TabsModule } from 'ngx-bootstrap/tabs';
import {OrgUnitFilterComponent} from "./components/org-unit-filter/org-unit-filter.component";
import {FilterLevelPipe} from "./services/filter-level.pipe";
import { SelectorComponent } from './components/selector/selector.component';
import {PeriodFilterComponent} from "./components/period-filter/period-filter.component";
import {FilterService} from "./services/filter.service";
import {DndModule,DragDropService,DragDropConfig} from "ng2-dnd";
import {DataFilterComponent} from "./components/data-filter/data-filter.component";
import {FilterByNamePipe} from "./services/filter-by-name.pipe";
import {DataFilterService} from "./services/data-filter.service";
/*import {Store} from "./dashboard-card/providers/store";*/
import {TreeModule} from "angular-tree-component";
import {FunctionService} from "./services/function.service";
import {NgxPaginationModule} from "ngx-pagination";
import {DataService} from "./services/data.service";
import {LocalStorageService} from "./services/local-storage.service";
import { AppRoutingModule } from './app-routing.module';
import { ListComponent } from './components/list/list.component';
import { FunctionComponent } from './components/function/function.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

import { MomentModule } from 'angular2-moment';
import {ToasterModule} from 'angular2-toaster';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {UserService} from "./services/user.service";
import { HasAccessPipe } from './pipes/has-access.pipe';
import { SearchPipe } from './pipes/search.pipe';
import { HasFunctionAccessPipe } from './pipes/has-function-access.pipe';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { PopoverModule } from 'ngx-bootstrap/popover';
import {ContextMenuModule} from "ngx-contextmenu/lib/ngx-contextmenu";
import {DataTableModule} from "angular2-datatable";
import { DataFilterPipe } from './pipes/data-filter.pipe';
import { TourNgBootstrapModule,TourService } from 'ngx-tour-ng-bootstrap';
import {MenuModule} from "./modules/menu/menu.module";
import {MultiselectComponent} from "./components/org-unit-filter/multiselect/multiselect.component";
import {OrgUnitService} from "./services/org-unit.service";
import { RuleSelectorComponent } from './components/rule-selector/rule-selector.component';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { DefaultRulePipe } from './pipes/default-rule.pipe';
import {ChartModule} from "./chart-module/chart.module";
import {TableModule} from "./table/table.module";
import {LayoutModule} from "./components/layout/layout.module";
import { EditorComponent } from './components/editor/editor.component';

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
    DataFilterComponent,
    FilterByNamePipe,
    ListComponent,
    FunctionComponent,
    DashboardComponent,
    MultiselectComponent,
    HasAccessPipe,
    SearchPipe,
    HasFunctionAccessPipe,
    DataFilterPipe,
    RuleSelectorComponent,
    DefaultRulePipe,
    EditorComponent
  ],
  imports: [
    BrowserModule,
    LayoutModule,
    BsDropdownModule.forRoot(),
    DataTableModule,
    MenuModule,
    FormsModule,
    HttpModule,
    AceEditorModule,
    PrettyJsonModule,
    TreeModule,
    SelectModule,
    TooltipModule.forRoot(),
    TabsModule.forRoot(),
    PopoverModule.forRoot(),
    TourNgBootstrapModule.forRoot(),
    DndModule,
    NgxPaginationModule,
    AppRoutingModule,
    ToasterModule,
    BrowserAnimationsModule,
    CollapseModule.forRoot(),
    ChartModule,
    TableModule,
    ContextMenuModule.forRoot({
      useBootstrap4: true,
      autoFocus: true,
    }),
    MomentModule
  ],
  providers: [HttpClientService,FilterService,
    OrgUnitService,UserService,DragDropService,DragDropConfig,DataFilterService,
    FunctionService,DataService,LocalStorageService],
  bootstrap: [AppComponent]
})
export class AppModule { }
