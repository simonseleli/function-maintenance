import {Component, OnInit, Input, OnChanges} from '@angular/core';
import {Visualization} from "../../models/visualization";
import {TableService} from "../../providers/table.service";
import {Observable} from "rxjs";

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit {

  @Input() tableData: Visualization;
  @Input() customFilters: any[] = [];
  @Input() cardStatus: Observable<string>;
  cardStatusId: string = '';
  loading: boolean = true;
  hasError: boolean = false;
  errorMessage: string = 'Unknown error has occurred';
  tableObjects: any[];
  constructor(
    private tableService: TableService
  ) {
  }

  ngOnInit() {
    this.initializeTable();
    this.cardStatus.subscribe(statusId => {
      console.log(statusId)
      if(this.cardStatusId != statusId) {
        this.cardStatusId = statusId;
        console.log(this.cardStatusId);
        this.initializeTable();
      }
    })
  }

  initializeTable() {
    this.loading = true;
    this.hasError = false;
    this.tableService.getSanitizedTableData(this.tableData, this.customFilters).subscribe(sanitizedData => {
      this.tableData = sanitizedData;
      this.tableObjects = this.tableService.getTableObjects(this.tableData);
      this.loading = false;
    }, error => {
      this.loading = false;
      this.hasError = true;
      this.errorMessage = error.hasOwnProperty('message') ? error.message : error;
      console.log(this.errorMessage);
    })
  }

}
