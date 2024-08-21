import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { TableConfiguration } from '../../models/table-configuration';

import { drawTable } from '../../helpers/index';
import { LegendSet } from '../../models/legend-set.model';
import { VisualizationExportService } from '../../../../services';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'ngx-dhis2-table-item',
  templateUrl: './table-item.component.html',
  styleUrls: ['./table-item.component.css']
})
export class TableItemComponent implements OnInit {
  @Input()
  tableConfiguration: TableConfiguration;
  @Input()
  analyticsObject: any;
  @Input()
  legendSets: LegendSet[];

  @ViewChild('table')
  table: ElementRef;

  tableObject: any;
  sort_direction: string[] = [];
  current_sorting: boolean[] = [];
  constructor(private visualizationExportService: VisualizationExportService) {
    this.tableObject = null;
  }

  ngOnInit() {
    if (this.analyticsObject && this.tableConfiguration) {
      this.tableObject = drawTable(
        this.analyticsObject,
        this.tableConfiguration,
        this.legendSets
      );
    }
  }
  sortData(tableObject, n, isLastItem) {
    if (tableObject.columns.length === 1 && isLastItem) {
      this.current_sorting = [];
      this.current_sorting[n] = true;
      let table,
        rows,
        switching,
        i,
        x,
        y,
        shouldSwitch,
        dir,
        switchcount = 0;
      table = document.getElementById('myPivotTable');
      switching = true;
      //  Set the sorting direction to ascending:
      dir = 'asc';
      /*Make a loop that will continue until
       no switching has been done:*/
      while (switching) {
        //  start by saying: no switching is done:
        switching = false;
        rows = table.getElementsByTagName('TR');
        /*Loop through all table rows (except the
         first, which contains table headers):*/
        for (i = 0; i < rows.length - 1; i++) {
          // start by saying there should be no switching:
          shouldSwitch = false;
          /*Get the two elements you want to compare,
           one from current row and one from the next:*/
          x = rows[i].getElementsByTagName('TD')[n];
          y = rows[i + 1].getElementsByTagName('TD')[n];
          /*check if the two rows should switch place,
           based on the direction, asc or desc:*/
          if (dir === 'asc') {
            if (parseFloat(x.innerHTML)) {
              if (parseFloat(x.innerHTML) > parseFloat(y.innerHTML)) {
                // if so, mark as a switch and break the loop:
                shouldSwitch = true;
                break;
              }
            } else {
              if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                // if so, mark as a switch and break the loop:
                shouldSwitch = true;
                break;
              }
            }
            this.sort_direction[n] = 'asc';
          } else if (dir === 'desc') {
            if (parseFloat(x.innerHTML)) {
              if (parseFloat(x.innerHTML) < parseFloat(y.innerHTML)) {
                // if so, mark as a switch and break the loop:
                shouldSwitch = true;
                break;
              }
            } else {
              if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                // if so, mark as a switch and break the loop:
                shouldSwitch = true;
                break;
              }
            }
            this.sort_direction[n] = 'desc';
          }
        }
        if (shouldSwitch) {
          /*If a switch has been marked, make the switch
           and mark that a switch has been done:*/
          rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
          switching = true;
          // Each time a switch is done, increase this count by 1:
          switchcount++;
        } else {
          /*If no switching has been done AND the direction is 'asc',
           set the direction to 'desc' and run the while loop again.*/
          if (switchcount === 0 && dir === 'asc') {
            dir = 'desc';
            this.sort_direction[n] = 'desc';
            switching = true;
          }
        }
      }
    }
  }

  downloadTable(downloadFormat) {
    if (this.tableConfiguration) {
      const title = `${this.tableConfiguration.title || 'Untitled'}-${
        this.tableConfiguration.subtitle
      }`;
      if (this.table) {
        const el = this.table.nativeElement;
        if (downloadFormat === 'XLS') {
          this.visualizationExportService.exportXLS(
            title,
            this.tableConfiguration.id
          );
        } else if (downloadFormat === 'CSV') {
          if (el) {
            this.visualizationExportService.exportCSV(title, el);
          }
        }
      }
    } else {
      console.warn('Problem downloading data');
    }
  }
}
