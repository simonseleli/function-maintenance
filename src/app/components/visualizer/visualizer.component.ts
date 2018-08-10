import { Component, OnInit, Input} from '@angular/core';

@Component({
  selector: 'app-visualizer',
  templateUrl: './visualizer.component.html',
  styleUrls: ['./visualizer.component.css']
})
export class VisualizerComponent implements OnInit {

  @Input() analyticsResults;
  constructor() { }

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
