var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, Input } from '@angular/core';
import { DashboardService } from "../../providers/dashboard.service";
import { ActivatedRoute } from "@angular/router";
import { Subject } from "rxjs";
export var DashboardItemContainerComponent = (function () {
    function DashboardItemContainerComponent(route, dashboardService) {
        this.route = route;
        this.dashboardService = dashboardService;
        this.loading = true;
        this.totalItems = 0;
        this.dimensionValues$ = new Subject();
    }
    DashboardItemContainerComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.route.queryParams.forEach(function (params) {
            _this.dashboardService.find(_this.dashboardId)
                .subscribe(function (dashboard) {
                _this.totalItems = dashboard.dashboardItems.length;
                _this.dashboard = dashboard;
                _this.loading = false;
            }, function (error) {
                console.log(error);
            });
        });
    };
    DashboardItemContainerComponent.prototype.updateFilters = function (filterValue) {
        console.log(filterValue);
        this.dimensionValues$.next(filterValue);
    };
    __decorate([
        Input(), 
        __metadata('design:type', String)
    ], DashboardItemContainerComponent.prototype, "dashboardId", void 0);
    __decorate([
        Input(), 
        __metadata('design:type', String)
    ], DashboardItemContainerComponent.prototype, "dashboardShape", void 0);
    DashboardItemContainerComponent = __decorate([
        Component({
            selector: 'app-dashboard-item-container',
            templateUrl: './dashboard-item-container.component.html',
            styleUrls: ['./dashboard-item-container.component.css']
        }), 
        __metadata('design:paramtypes', [ActivatedRoute, DashboardService])
    ], DashboardItemContainerComponent);
    return DashboardItemContainerComponent;
}());
//# sourceMappingURL=dashboard-item-container.component.js.map