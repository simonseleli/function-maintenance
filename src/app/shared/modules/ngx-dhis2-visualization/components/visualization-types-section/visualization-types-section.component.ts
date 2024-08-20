import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  TABLE_ICON,
  COLUMN_CHART_ICON,
  MAP_ICON,
  INFO_ICON
} from '../../icons';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'app-visualization-types-section',
  templateUrl: './visualization-types-section.component.html',
  styleUrls: ['./visualization-types-section.component.css']
})
export class VisualizationTypesSectionComponent implements OnInit {
  @Input() currentVisualization: string;
  @Output()
  visualizationTypeChange: EventEmitter<string> = new EventEmitter<string>();
  @Output() onToggleInterpretation = new EventEmitter();

  tableIcon: string;
  chartIcon: string;
  mapIcon: string;
  infoIcon: string;

  constructor() {
    this.tableIcon = TABLE_ICON;
    this.chartIcon = COLUMN_CHART_ICON;
    this.mapIcon = MAP_ICON;
    this.infoIcon = INFO_ICON;
  }

  ngOnInit() {}

  onVisualizationSelect(e, type) {
    e.stopPropagation();
    this.visualizationTypeChange.emit(type);
  }

  toggleInterpretaion(e) {
    e.stopPropagation();
    this.onToggleInterpretation.emit();
  }
}
