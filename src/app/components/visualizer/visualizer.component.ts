import { Component, OnInit, Input} from '@angular/core';
import {VisualizerService} from "../../dashboard-card/providers/visualizer.service";

@Component({
  selector: 'app-visualizer',
  templateUrl: './visualizer.component.html',
  styleUrls: ['./visualizer.component.css'],
  providers:[VisualizerService]
})
export class VisualizerComponent implements OnInit {

  @Input() analyticsResults;
  constructor(private visualizerService:VisualizerService) { }

  chartObject
  ngOnInit() {
    /*this.chartObject = this.visualizerService.drawChart(this.analyticsResults,{
      'type':"pie",
      'title': "Title",
      'xAxisType': ['pe'],
      'yAxisType': ['dx']
    });*/
  }

}
