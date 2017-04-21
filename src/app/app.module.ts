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

@NgModule({
  declarations: [
    AppComponent,
    RunnerComponent,
    VisualizerComponent,
    RulesComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AceEditorModule,
    PrettyJsonModule,
    SelectModule,
    Ng2HighchartsModule
  ],
  providers: [HttpClientService],
  bootstrap: [AppComponent]
})
export class AppModule { }
