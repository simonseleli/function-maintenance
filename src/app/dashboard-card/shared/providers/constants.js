var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from "@angular/core";
export var Constants = (function () {
    function Constants() {
        this.root_url = '../../../';
        this.api = this.root_url + 'api/25/';
        this.chartTypes = [
            {
                type: 'column',
                description: 'Column chart',
                icon: 'assets/img/bar.png'
            },
            {
                type: 'line',
                description: 'Line chart',
                icon: 'assets/img/line.png'
            },
            {
                type: 'combined',
                description: 'Combined chart',
                icon: 'assets/img/combined.png'
            },
            {
                type: 'bar',
                description: 'Bar chart',
                icon: 'assets/img/column.png'
            },
            {
                type: 'area',
                description: 'Area chart',
                icon: 'assets/img/area.png'
            },
            {
                type: 'pie',
                description: 'Pie chart',
                icon: 'assets/img/pie.png'
            },
            {
                type: 'stacked_column',
                description: 'stacked column chart',
                icon: 'assets/img/column-stacked.png'
            },
            // {
            //   type: 'gauge',
            //   description: 'Gauge chart',
            //   icon: 'assets/img/gauge.jpg'
            // },
            {
                type: 'radar',
                description: 'Radar chart',
                icon: 'assets/img/radar.png'
            },
        ];
    }
    Constants = __decorate([
        Injectable(), 
        __metadata('design:paramtypes', [])
    ], Constants);
    return Constants;
}());
//# sourceMappingURL=constants.js.map