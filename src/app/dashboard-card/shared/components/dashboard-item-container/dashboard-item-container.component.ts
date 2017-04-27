import {Component, OnInit, Input, ViewChild} from '@angular/core';
import {DashboardService} from "../../providers/dashboard.service";
import {ActivatedRoute} from "@angular/router";
import {Subject} from "rxjs";

@Component({
  selector: 'app-dashboard-item-container',
  templateUrl: './dashboard-item-container.component.html',
  styleUrls: ['./dashboard-item-container.component.css']
})
export class DashboardItemContainerComponent implements OnInit {

  loading: boolean = true;
  totalItems: number = 0;
  dashboard: any;
  @Input() dashboardId: string;
  @Input() dashboardShape: string;
  dimensionValues$ = new Subject<Array<any>>();
  constructor(
    private route: ActivatedRoute,
    private dashboardService: DashboardService
  ) { }

  ngOnInit() {
    this.route.queryParams.forEach(params => {
      this.dashboardService.find(this.dashboardId)
        .subscribe(
          dashboard => {
            this.totalItems = dashboard.dashboardItems.length;
            this.dashboard = dashboard;
            this.loading = false;
          }, error => {
            console.log(error);
          });
    })
  }

  updateFilters(filterValue) {
    console.log(filterValue)
    this.dimensionValues$.next(filterValue);
  }

}
