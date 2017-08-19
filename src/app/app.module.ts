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
import { MessageComponent } from './components/message/message.component';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import {OrgUnitFilterComponent} from "./components/organisation-unit/org-unit-filter.component";
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
import {TreeModule} from "angular2-tree-component";
import {FunctionService} from "./services/function.service";
import {NgxPaginationModule} from "ngx-pagination";
import {DataService} from "./services/data.service";
import {LocalStorageService} from "./services/local-storage.service";
import { AppRoutingModule } from './app-routing.module';
import { ListComponent } from './components/list/list.component';
import { FunctionComponent } from './components/function/function.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { MenuComponent } from './components/menu/menu.component';
import {FilterPipe} from "./components/menu/filter.pipe";
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
    FilterByNamePipe,
    ListComponent,
    FunctionComponent,
    DashboardComponent,
    MenuComponent,
    FilterPipe,
    HasAccessPipe,
    SearchPipe,
    HasFunctionAccessPipe
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
    PopoverModule.forRoot(),
    //AccordionModule.forRoot(),
    DashboardCardModule,
    DndModule,
    NgxPaginationModule,
    AppRoutingModule,
    ToasterModule,
    BrowserAnimationsModule,
    CollapseModule.forRoot(),
    ContextMenuModule.forRoot({
      useBootstrap4: true,
      autoFocus: true,
    }),
    MomentModule
  ],
  providers: [HttpClientService,FilterService,Constants,UserService,DragDropService,DragDropConfig,DataFilterService,Store,FunctionService,DataService,LocalStorageService],
  bootstrap: [AppComponent]
})
export class AppModule { }
