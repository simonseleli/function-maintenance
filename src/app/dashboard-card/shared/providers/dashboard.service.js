var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Observable } from "rxjs";
import { isArray } from "rxjs/util/isArray";
import { Constants } from "./constants";
import { Utilities } from "./utilities";
export var DashboardService = (function () {
    function DashboardService(http, constant, utility) {
        this.http = http;
        this.constant = constant;
        this.utility = utility;
        this.url = this.constant.api + 'dashboards';
        this.dashboards = [];
    }
    DashboardService.prototype.all = function () {
        var _this = this;
        return Observable.create(function (observer) {
            if (_this.dashboards.length > 0) {
                observer.next(_this.dashboards);
                observer.complete();
            }
            else {
                _this.http.get(_this.url + '.json?paging=false&fields=id,name,dashboardItems[:all,users[:all],resources[:all],reports[:all]]')
                    .map(function (res) { return res.json(); })
                    .catch(_this.utility.handleError)
                    .subscribe(function (response) {
                    response.dashboards.forEach(function (dashboard) {
                        if (_this.utility.isUndefined(_this.dashboards.filter(function (item) {
                            return item.id == dashboard.id ? item : null;
                        })[0])) {
                            _this.dashboards.push(dashboard);
                        }
                    });
                    observer.next(_this.dashboards);
                    observer.complete();
                }, function (error) {
                    observer.next(error);
                });
            }
        });
    };
    DashboardService.prototype.getDashboardItemWithObjectAndAnalytics = function (dashboardId, dashboardItemId, customDimensions) {
        var _this = this;
        return Observable.create(function (observer) {
            for (var _i = 0, _a = _this.dashboards; _i < _a.length; _i++) {
                var dashboard = _a[_i];
                if (dashboard.id == dashboardId) {
                    var _loop_1 = function(dashboardItem) {
                        if (dashboardItem.id == dashboardItemId) {
                            if (dashboardItem.hasOwnProperty('object')) {
                                if (customDimensions.length > 0) {
                                    customDimensions.forEach(function (dimension) {
                                        if (dimension.name == 'ou') {
                                            dashboardItem.object.custom_ou = dimension.value;
                                        }
                                        if (dimension.name == 'pe') {
                                            dashboardItem.object.custom_pe = dimension.value;
                                        }
                                    });
                                    _this.http.get(_this._getDashBoardItemAnalyticsUrl(dashboardItem.object, dashboardItem.type, true)).map(function (res) { return res.json(); })
                                        .catch(_this.utility.handleError)
                                        .subscribe(function (analyticObject) {
                                        dashboardItem['analytic'] = analyticObject;
                                        observer.next(dashboardItem);
                                        observer.complete();
                                    }, function (analyticError) { return observer.error(analyticError); });
                                }
                                else {
                                    observer.next(dashboardItem);
                                    observer.complete();
                                }
                            }
                            else {
                                _this.http.get(_this.constant.api + _this.utility.formatEnumString(dashboardItem.type) + "s/" + dashboardItem[_this.utility.formatEnumString(dashboardItem.type)].id + ".json?fields=*,dataElementDimensions[dataElement[id,optionSet[id,options[id,name]]]],displayDescription,program[id,name],programStage[id,name],interpretations[*,user[id,displayName],likedBy[id,displayName],comments[lastUpdated,text,user[id,displayName]]],columns[dimension,filter,legendSet,items[id,dimensionItem,dimensionItemType,displayName]],rows[dimension,filter,legendSet,items[id,dimensionItem,dimensionItemType,displayName]],filters[dimension,filter,legendSet,items[id,dimensionItem,dimensionItemType,displayName]],access,userGroupAccesses,publicAccess,displayDescription,user[displayName,dataViewOrganisationUnits],!href,!rewindRelativePeriods,!userOrganisationUnit,!userOrganisationUnitChildren,!userOrganisationUnitGrandChildren,!externalAccess,!relativePeriods,!columnDimensions,!rowDimensions,!filterDimensions,!organisationUnitGroups,!itemOrganisationUnitGroups,!indicators,!dataElements,!dataElementOperands,!dataElementGroups,!dataSets,!periods,!organisationUnitLevels,!organisationUnits")
                                    .map(function (res) { return res.json(); })
                                    .catch(_this.utility.handleError)
                                    .subscribe(function (dashboardObject) {
                                    //get orgUnitModel also
                                    //dashboardObject['orgUnitModel'] = this.getOrgUnitModel(dashboardObject);
                                    //dashboardObject['periodModel'] = this.getPeriodModel(dashboardObject);
                                    //dashboardObject['layout'] = this.getLayout(dashboardObject);
                                    dashboardItem['object'] = dashboardObject;
                                    //get analytic object also
                                    _this.http.get(_this._getDashBoardItemAnalyticsUrl(dashboardObject, dashboardItem.type, null))
                                        .map(function (res) { return res.json(); })
                                        .catch(_this.utility.handleError)
                                        .subscribe(function (analyticObject) {
                                        dashboardItem['analytic'] = analyticObject;
                                        observer.next(dashboardItem);
                                        observer.complete();
                                    }, function (analyticError) { return observer.error(analyticError); });
                                }, function (error) {
                                    observer.error(error);
                                });
                            }
                            return "break";
                        }
                    };
                    for (var _b = 0, _c = dashboard.dashboardItems; _b < _c.length; _b++) {
                        var dashboardItem = _c[_b];
                        var state_1 = _loop_1(dashboardItem);
                        if (state_1 === "break") break;
                    }
                    break;
                }
            }
        });
    };
    DashboardService.prototype._formatAnalyticsObjectFromEventTables = function (analyticsObject) {
        var return_object = {};
    };
    DashboardService.prototype.find = function (id) {
        var _this = this;
        return Observable.create(function (observer) {
            var dashboard = _this.dashboards.filter(function (item) {
                return item.id == id ? item : null;
            })[0];
            if (_this.utility.isUndefined(dashboard)) {
                _this.load(id).subscribe(function (dashboard) {
                    observer.next(dashboard);
                    observer.complete();
                }, function (error) {
                    observer.error(error);
                });
            }
            else {
                observer.next(dashboard);
                observer.complete();
            }
        });
    };
    DashboardService.prototype.load = function (id) {
        var _this = this;
        return Observable.create(function (observer) {
            _this.http.get(_this.url + '/' + id + '.json?fields=id,name,dashboardItems[:all,users[:all],resources[:all],reports[:all]]')
                .map(function (res) { return res.json(); })
                .catch(_this.utility.handleError)
                .subscribe(function (dashboard) {
                if (_this.utility.isUndefined(_this.dashboards.filter(function (item) {
                    return item.id == id ? item : null;
                })[0])) {
                    _this.dashboards.push(dashboard);
                }
                observer.next(dashboard);
                observer.complete();
            }, function (error) {
                observer.error(error);
            });
        });
    };
    DashboardService.prototype.create = function (dashboardData) {
        var _this = this;
        return Observable.create(function (observer) {
            _this.utility.getUniqueId()
                .subscribe(function (uniqueId) {
                dashboardData.id = uniqueId;
                _this.http.post(_this.url, dashboardData)
                    .map(function (res) { return res.json(); })
                    .catch(_this.utility.handleError)
                    .subscribe(function (response) {
                    _this.load(uniqueId).subscribe(function (dashboard) {
                        //sort dashboard
                        _this.dashboards.sort(function (a, b) {
                            if (a.name < b.name) {
                                return -1;
                            }
                            else if (a.name > b.name) {
                                return 1;
                            }
                            else {
                                return 0;
                            }
                        });
                        observer.next(dashboard);
                        observer.complete();
                    }, function (error) { return observer.error(error); });
                }, function (error) {
                    observer.error(error);
                });
            });
        });
    };
    DashboardService.prototype.updateDashboardName = function (dashboardName, dashboardId) {
        for (var _i = 0, _a = this.dashboards; _i < _a.length; _i++) {
            var dashboard = _a[_i];
            if (dashboard.id == dashboardId) {
                dashboard.name = dashboardName;
                break;
            }
        }
        return this.http.put(this.url + '/' + dashboardId, { name: dashboardName })
            .catch(this.utility.handleError);
    };
    DashboardService.prototype.delete = function (id) {
        for (var _i = 0, _a = this.dashboards; _i < _a.length; _i++) {
            var dashboard = _a[_i];
            if (dashboard.id == id) {
                this.dashboards.splice(this.dashboards.indexOf(dashboard), 1);
                break;
            }
        }
        return this.http.delete(this.url + '/' + id)
            .map(function (res) { return res.json(); })
            .catch(this.utility.handleError);
    };
    DashboardService.prototype.removeDashboardItem = function (dashboardItemId, dashboardId) {
        this.find(dashboardId).subscribe(function (dashboard) {
            dashboard.dashboardItems.splice(dashboard.dashboardItems.indexOf({ id: dashboardItemId }), 1);
        });
    };
    DashboardService.prototype._getDashBoardItemAnalyticsUrl = function (dashBoardObject, dashboardType, useCustomDimension) {
        if (useCustomDimension === void 0) { useCustomDimension = false; }
        console.log(dashBoardObject);
        var url = this.constant.api;
        if (dashboardType == 'MAP' && dashBoardObject.layer == 'boundary') {
            url += 'geoFeatures';
        }
        else {
            url += "analytics";
        }
        var column = "";
        var row = "";
        var filter = "";
        //checking for columns
        column = this.getDashboardObjectDimension('columns', dashBoardObject, useCustomDimension);
        row = this.getDashboardObjectDimension('rows', dashBoardObject, useCustomDimension);
        filter = this.getDashboardObjectDimension('filters', dashBoardObject, useCustomDimension);
        //set url base on type
        if (dashboardType == "EVENT_CHART") {
            url += "/events/aggregate/" + dashBoardObject.program.id + ".json?stage=" + dashBoardObject.programStage.id + "&";
        }
        else if (dashboardType == "EVENT_REPORT") {
            if (dashBoardObject.dataType == "AGGREGATED_VALUES") {
                url += "/events/aggregate/" + dashBoardObject.program.id + ".json?stage=" + dashBoardObject.programStage.id + "&";
            }
            else {
                url += "/events/query/" + dashBoardObject.program.id + ".json?stage=" + dashBoardObject.programStage.id + "&pageSize=50&";
            }
        }
        else if (dashboardType == "EVENT_MAP") {
            url += "/events/aggregate/" + dashBoardObject.program.id + ".json?stage=" + dashBoardObject.programStage.id + "&";
        }
        else if (dashboardType = 'MAP' && dashBoardObject.layer == 'event') {
            url += "/events/query/" + dashBoardObject.program.id + ".json?stage=" + dashBoardObject.programStage.id + "&";
            console.log(dashBoardObject);
            //@todo consider start and end date
            url += 'startDate=' + dashBoardObject.startDate + '&' + 'endDate=' + dashBoardObject.endDate + '&';
        }
        else {
            url += ".json?";
        }
        //@todo find best way to structure geoFeatures
        if (dashBoardObject.layer == 'boundary') {
            url += this.getGeoFeatureParameters(dashBoardObject);
        }
        else {
            url += column + '&' + row;
            url += filter == "" ? "" : '&' + filter;
        }
        // url += "&user=" + currentUserId;
        url += "&displayProperty=NAME" + dashboardType == "EVENT_CHART" ?
            "&outputType=EVENT&"
            : dashboardType == "EVENT_REPORT" ?
                "&outputType=EVENT&displayProperty=NAME"
                : dashboardType == "EVENT_MAP" ?
                    "&outputType=EVENT&displayProperty=NAME"
                    : "&displayProperty=NAME";
        if (dashBoardObject.layer == 'event') {
            url += "&coordinatesOnly=true";
        }
        return url;
    };
    DashboardService.prototype._getGeoFeatureUrl = function (mapView) {
        var url = this.constant.api + 'geoFeatures.json?';
        url += this.getGeoFeatureParameters(mapView);
        url += "&displayProperty=NAME";
        return url;
    };
    DashboardService.prototype._getDashBoardItemMapAnalyticsUrl = function (dashBoardObject, dashboardType, useCustomDimension) {
        if (useCustomDimension === void 0) { useCustomDimension = false; }
        var url = this.constant.api;
        var geoUrl = this.constant.api;
        var urlArray = [];
        if (dashBoardObject.layer == 'boundary') {
            geoUrl += 'geoFeatures.json?';
        }
        else {
            geoUrl += 'geoFeatures.json?';
            url += "analytics";
        }
        var column = "";
        var row = "";
        var filter = "";
        //checking for columns
        column = this.getDashboardObjectDimension('columns', dashBoardObject, useCustomDimension);
        row = this.getDashboardObjectDimension('rows', dashBoardObject, useCustomDimension);
        filter = this.getDashboardObjectDimension('filters', dashBoardObject, useCustomDimension);
        //set url base on type
        if (dashboardType == "EVENT_CHART") {
            url += "/events/aggregate/" + dashBoardObject.program.id + ".json?stage=" + dashBoardObject.programStage.id + "&";
        }
        else if (dashboardType == "EVENT_REPORT") {
            if (dashBoardObject.dataType == "AGGREGATED_VALUES") {
                url += "/events/aggregate/" + dashBoardObject.program.id + ".json?stage=" + dashBoardObject.programStage.id + "&";
            }
            else {
                url += "/events/query/" + dashBoardObject.program.id + ".json?stage=" + dashBoardObject.programStage.id + "&";
            }
        }
        else if (dashboardType == "EVENT_MAP") {
            url += "/events/aggregate/" + dashBoardObject.program.id + ".json?stage=" + dashBoardObject.programStage.id + "&";
        }
        else {
            url += ".json?";
        }
        //@todo find best way to structure geoFeatures
        if (dashBoardObject.layer == 'boundary') {
            geoUrl += this.getGeoFeatureParameters(dashBoardObject);
        }
        else {
            geoUrl += this.getGeoFeatureParameters(dashBoardObject);
            url += column + '&' + row;
            url += filter == "" ? "" : '&' + filter;
        }
        // url += "&user=" + currentUserId;
        url += "&displayProperty=NAME" + dashboardType == "EVENT_CHART" ?
            "&outputType=EVENT&"
            : dashboardType == "EVENT_REPORT" ?
                "&outputType=EVENT&displayProperty=NAME"
                : dashboardType == "EVENT_MAP" ?
                    "&outputType=EVENT&displayProperty=NAME"
                    : "&displayProperty=NAME";
        if (dashBoardObject.layer == 'boundary') {
            urlArray.push(geoUrl);
        }
        else {
            urlArray.push(geoUrl);
            urlArray.push(url);
        }
        return urlArray;
    };
    DashboardService.prototype.getDashboardObjectDimension = function (dimension, dashboardObject, custom) {
        if (custom === void 0) { custom = false; }
        var items = "";
        dashboardObject[dimension].forEach(function (dimensionValue) {
            items += items != "" ? '&' : "";
            if (dimensionValue.dimension != 'dy') {
                items += dimension == 'filters' ? 'filter=' : 'dimension=';
                items += dimensionValue.dimension;
                items += dimensionValue.hasOwnProperty('legendSet') ? '-' + dimensionValue.legendSet.id : "";
                items += ':';
                items += dimensionValue.hasOwnProperty('filter') ? dimensionValue.filter : "";
                if (custom && dashboardObject.hasOwnProperty('custom_' + dimensionValue.dimension)) {
                    items += dashboardObject['custom_' + dimensionValue.dimension] + ';';
                }
                else {
                    dimensionValue.items.forEach(function (itemValue, itemIndex) {
                        items += itemValue.dimensionItem;
                        items += itemIndex == dimensionValue.items.length - 1 ? "" : ";";
                    });
                }
            }
        });
        return items;
    };
    DashboardService.prototype.getOrgUnitModel = function (dashboardObject) {
        var orgUnitModel = {
            selection_mode: "orgUnit",
            selected_level: "",
            selected_group: "",
            orgunit_levels: [],
            orgunit_groups: [],
            selected_orgunits: [],
            user_orgunits: []
        };
        var dimensionItems;
        for (var _i = 0, _a = dashboardObject.columns; _i < _a.length; _i++) {
            var columnDimension = _a[_i];
            if (columnDimension.dimension == 'ou') {
                dimensionItems = columnDimension.items;
                break;
            }
            else {
                for (var _b = 0, _c = dashboardObject.rows; _b < _c.length; _b++) {
                    var rowDimension = _c[_b];
                    if (rowDimension.dimension == 'ou') {
                        dimensionItems = rowDimension.items;
                        break;
                    }
                    else {
                        for (var _d = 0, _e = dashboardObject.filters; _d < _e.length; _d++) {
                            var filterDimension = _e[_d];
                            if (filterDimension.dimension == 'ou') {
                                dimensionItems = filterDimension.items;
                                break;
                            }
                        }
                    }
                }
            }
        }
        dimensionItems.forEach(function (item) {
            if (item.hasOwnProperty('dimensionItemType')) {
                orgUnitModel.selected_orgunits.push({ id: item.id, name: item.displayName });
            }
            else {
                //find selected organisation group
                if (item.dimensionItem.substring(0, 8) == 'OU_GROUP') {
                    orgUnitModel.selected_group = item.dimensionItem;
                }
                //find selected level
                if (item.dimensionItem.substring(0, 5) == 'LEVEL') {
                    orgUnitModel.selected_level = item.dimensionItem;
                }
            }
        });
        //get user orgunits
        // if(dashboardObject.user.dataViewOrganisationUnits.length > 0) {
        //   console.log(dashboardObject.user.dataViewOrganisationUnits.length)
        //   dashboardObject.user.dataViewOrganisationUnits.forEach(orgUnit => {
        //     orgUnitModel.user_orgunits.push(orgUnit.id);
        //   });
        // }
        return orgUnitModel;
    };
    DashboardService.prototype.getPeriodModel = function (dashboardObject) {
        var periodModel = [];
        var dimensionItems;
        for (var _i = 0, _a = dashboardObject.columns; _i < _a.length; _i++) {
            var columnDimension = _a[_i];
            if (columnDimension.dimension == 'pe') {
                dimensionItems = columnDimension.items;
                break;
            }
            else {
                for (var _b = 0, _c = dashboardObject.rows; _b < _c.length; _b++) {
                    var rowDimension = _c[_b];
                    if (rowDimension.dimension == 'pe') {
                        dimensionItems = rowDimension.items;
                        break;
                    }
                    else {
                        for (var _d = 0, _e = dashboardObject.filters; _d < _e.length; _d++) {
                            var filterDimension = _e[_d];
                            if (filterDimension.dimension == 'pe') {
                                dimensionItems = filterDimension.items;
                                break;
                            }
                        }
                    }
                }
            }
        }
        dimensionItems.forEach(function (item) {
            periodModel.push({ id: item.id, name: item.displayName, selected: true });
        });
        return periodModel;
    };
    DashboardService.prototype.getLayout = function (dashboardObject) {
        var layout = {};
        if (dashboardObject.hasOwnProperty('series')) {
            layout = {
                series: dashboardObject.series,
                category: dashboardObject.category,
            };
        }
        var rows = [];
        dashboardObject.rows.forEach(function (row) {
            rows.push(row.dimension);
        });
        var columns = [];
        dashboardObject.columns.forEach(function (column) {
            columns.push(column.dimension);
        });
        var filters = [];
        dashboardObject.filters.forEach(function (filter) {
            filters.push(filter.dimension);
        });
        layout['rows'] = rows;
        layout['columns'] = columns;
        layout['filters'] = filters;
        return layout;
    };
    DashboardService.prototype.getDashboardItemMetadataIdentifiers = function (dashboardObject) {
        var items = "";
        dashboardObject.rows.forEach(function (dashBoardObjectRow) {
            if (dashBoardObjectRow.dimension === "dx") {
                dashBoardObjectRow.items.forEach(function (dashBoardObjectRowItem) {
                    items += dashBoardObjectRowItem.id + ";";
                });
            }
            else {
                //find identifiers in the column if not in row
                dashboardObject.columns.forEach(function (dashBoardObjectColumn) {
                    if (dashBoardObjectColumn.dimension === "dx") {
                        dashBoardObjectColumn.items.forEach(function (dashBoardObjectColumnItem) {
                            items += dashBoardObjectColumnItem.id + ";";
                        });
                    }
                });
            }
        });
        return items.slice(0, -1);
    };
    DashboardService.prototype.updateShape = function (dashboardId, dashboardItemId, shape) {
        //update dashboard item pool
        this.find(dashboardId).subscribe(function (dashboard) {
            for (var _i = 0, _a = dashboard.dashboardItems; _i < _a.length; _i++) {
                var dashboardItem = _a[_i];
                if (dashboardItem.id == dashboardItemId) {
                    dashboardItem.shape = shape;
                    break;
                }
            }
        });
        //update permanently to the source
        //@todo find best way to show success for no body request
        this.http.put(this.constant.root_url + 'api/dashboardItems/' + dashboardItemId + '/shape/' + shape, '').map(function (res) { return res.json(); }).subscribe(function (response) {
        }, function (error) {
            console.log(error);
        });
    };
    DashboardService.prototype.addDashboardItem = function (dashboardId, dashboardItemData) {
        var _this = this;
        return Observable.create(function (observer) {
            var updatableDashboardId = _this.getUpdatableDashboardItem(dashboardId, dashboardItemData);
            var existingDashboardId = _this.dashboardItemExist(dashboardId, dashboardItemData.id);
            if (_this.utility.isNull(existingDashboardId) && _this.utility.isNull(updatableDashboardId)) {
                var options = new RequestOptions({ headers: new Headers({ 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }) });
                _this.http.post(_this.url + '/' + dashboardId + '/items/content?type=' + dashboardItemData.type + '&id=' + dashboardItemData.id, options)
                    .map(function (res) { return res.json(); })
                    .catch(_this.utility.handleError)
                    .subscribe(function (response) {
                    //get and update the created item
                    _this.http.get(_this.url + '/' + dashboardId + '.json?fields=id,name,dashboardItems[:all,users[:all],resources[:all],reports[:all]]')
                        .map(function (res) { return res.json(); })
                        .catch(_this.utility.handleError).subscribe(function (dashboard) {
                        for (var _i = 0, _a = dashboard.dashboardItems; _i < _a.length; _i++) {
                            var dashboardItem = _a[_i];
                            if (!dashboardItem.hasOwnProperty('shape')) {
                                dashboardItem.shape = 'NORMAL';
                                _this.updateShape(dashboardId, dashboardItem.id, 'NORMAL');
                            }
                            if (dashboardItem.type == 'APP') {
                                _this.updateDashboard(dashboardId, dashboardItem);
                                observer.next({ status: 'created', id: dashboardItem.id });
                                observer.complete();
                                break;
                            }
                            else {
                                if (dashboardItem[_this.utility.camelCaseName(dashboardItem.type)].hasOwnProperty('id')) {
                                    if (dashboardItem[_this.utility.camelCaseName(dashboardItem.type)].id == dashboardItemData.id) {
                                        _this.updateDashboard(dashboardId, dashboardItem);
                                        observer.next({ status: 'created', id: dashboardItem.id });
                                        observer.complete();
                                        break;
                                    }
                                }
                                else {
                                    _this.updateDashboard(dashboardId, dashboardItem);
                                    observer.next({ status: 'created', id: dashboardItem.id });
                                    observer.complete();
                                    break;
                                }
                            }
                        }
                    }, function (error) {
                        observer.error(error);
                    });
                }, function (error) {
                    observer.error(error);
                });
            }
            else if (!_this.utility.isNull(updatableDashboardId)) {
                var options = new RequestOptions({ headers: new Headers({ 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }) });
                _this.http.post(_this.url + '/' + dashboardId + '/items/content?type=' + dashboardItemData.type + '&id=' + dashboardItemData.id, options)
                    .map(function (res) { return res.json(); })
                    .catch(_this.utility.handleError)
                    .subscribe(function (response) {
                    //get and update the created item
                    _this.http.get(_this.url + '/' + dashboardId + '.json?fields=id,name,dashboardItems[:all,users[:all],resources[:all],reports[:all]]')
                        .map(function (res) { return res.json(); })
                        .catch(_this.utility.handleError).subscribe(function (dashboard) {
                        for (var _i = 0, _a = dashboard.dashboardItems; _i < _a.length; _i++) {
                            var dashboardItem = _a[_i];
                            if (!dashboardItem.hasOwnProperty('shape')) {
                                dashboardItem.shape = 'NORMAL';
                                _this.updateShape(dashboardId, dashboardItem.id, 'NORMAL');
                            }
                            if (dashboardItem.id == updatableDashboardId) {
                                _this.updateDashboard(dashboardId, dashboardItem, 'update');
                                observer.next({ status: 'updated', id: dashboardItem.id });
                                observer.complete();
                                break;
                            }
                        }
                    }, function (error) { return observer.error(error); });
                }, function (error) {
                    observer.error(error);
                });
            }
            else if (!_this.utility.isNull(existingDashboardId) && _this.utility.isNull(updatableDashboardId)) {
                _this.updateDashboard(dashboardId, null, 'exist', existingDashboardId);
                observer.next({ status: 'Already exist', id: existingDashboardId });
                observer.complete();
            }
        });
    };
    DashboardService.prototype.updateDashboard = function (dashboardId, dashboardItem, action, dashboardItemId) {
        if (action === void 0) { action = 'save'; }
        for (var _i = 0, _a = this.dashboards; _i < _a.length; _i++) {
            var dashboard = _a[_i];
            if (dashboard.id == dashboardId) {
                if (action == 'save') {
                    dashboard.dashboardItems.unshift(dashboardItem);
                }
                else if (action == 'update') {
                    for (var _b = 0, _c = dashboard.dashboardItems; _b < _c.length; _b++) {
                        var item = _c[_b];
                        if (item.id == dashboardItem.id) {
                            dashboard.dashboardItems.splice(dashboard.dashboardItems.indexOf(item), 1);
                            dashboard.dashboardItems.unshift(dashboardItem);
                            break;
                        }
                    }
                }
                else {
                    for (var _d = 0, _e = dashboard.dashboardItems; _d < _e.length; _d++) {
                        var item = _e[_d];
                        if (item.id == dashboardItemId) {
                            var itemBuffer = item;
                            dashboard.dashboardItems.splice(dashboard.dashboardItems.indexOf(item), 1);
                            dashboard.dashboardItems.unshift(itemBuffer);
                            break;
                        }
                    }
                }
                break;
            }
        }
    };
    DashboardService.prototype.getUpdatableDashboardItem = function (dashboardId, dashboardFavourate) {
        var dashboardItemId = null;
        if (dashboardFavourate.type != 'APP') {
            for (var _i = 0, _a = this.dashboards; _i < _a.length; _i++) {
                var dashboard = _a[_i];
                if (dashboard.id == dashboardId) {
                    if (dashboard.dashboardItems.length > 0) {
                        for (var _b = 0, _c = dashboard.dashboardItems; _b < _c.length; _b++) {
                            var dashboardItem = _c[_b];
                            if (dashboardItem.type == dashboardFavourate.type) {
                                if (!this.utility.isUndefined(dashboardItem[this.utility.camelCaseName(dashboardFavourate.type)])) {
                                    if (!dashboardItem[this.utility.camelCaseName(dashboardFavourate.type)].hasOwnProperty('id')) {
                                        dashboardItemId = dashboardItem.id;
                                    }
                                }
                                break;
                            }
                        }
                    }
                    break;
                }
            }
        }
        return dashboardItemId;
    };
    DashboardService.prototype.dashboardItemExist = function (dashboardId, dashboardFavourateId) {
        var itemId = null;
        for (var _i = 0, _a = this.dashboards; _i < _a.length; _i++) {
            var dashboard = _a[_i];
            if (dashboard.id == dashboardId) {
                if (dashboard.dashboardItems.length > 0) {
                    for (var _b = 0, _c = dashboard.dashboardItems; _b < _c.length; _b++) {
                        var dashboardItem = _c[_b];
                        if (!this.utility.isUndefined(dashboardItem[this.utility.camelCaseName(dashboardItem.type)])) {
                            if (dashboardItem[this.utility.camelCaseName(dashboardItem.type)].hasOwnProperty('id')) {
                                if (dashboardItem[this.utility.camelCaseName(dashboardItem.type)].id == dashboardFavourateId) {
                                    itemId = dashboardItem.id;
                                    break;
                                }
                            }
                        }
                        else {
                            //for APP type
                            if (dashboardItem.appKey == dashboardFavourateId) {
                                itemId = dashboardItem.id;
                                break;
                            }
                        }
                    }
                }
                break;
            }
        }
        return itemId;
    };
    DashboardService.prototype.deleteDashboardItem = function (dashboardId, dashboardItemId) {
        //Delete from the pool first
        this.find(dashboardId).subscribe(function (dashboard) {
            for (var _i = 0, _a = dashboard.dashboardItems; _i < _a.length; _i++) {
                var dashboardItem = _a[_i];
                if (dashboardItem.id == dashboardItemId) {
                    dashboard.dashboardItems.splice(dashboard.dashboardItems.indexOf(dashboardItem), 1);
                }
            }
        });
        return this.http.delete(this.url + '/' + dashboardId + '/items/' + dashboardItemId)
            .map(function (res) { return res.json(); });
    };
    DashboardService.prototype.loadDashboardSharingData = function (dashboardId) {
        var _this = this;
        return Observable.create(function (observer) {
            var _loop_2 = function(dashboard) {
                if (dashboard.id == dashboardId) {
                    if (dashboard.hasOwnProperty('sharing')) {
                        observer.next(dashboard['sharing']);
                        observer.complete();
                    }
                    else {
                        _this.http.get(_this.constant.api + 'sharing?type=dashboard&id=' + dashboardId)
                            .map(function (res) { return res.json(); })
                            .catch(_this.utility.handleError)
                            .subscribe(function (sharing) {
                            //persist sharing locally
                            dashboard['sharing'] = sharing;
                            observer.next(sharing);
                            observer.complete();
                        }, function (error) { return observer.error(error); });
                    }
                    return "break";
                }
            };
            for (var _i = 0, _a = _this.dashboards; _i < _a.length; _i++) {
                var dashboard = _a[_i];
                var state_2 = _loop_2(dashboard);
                if (state_2 === "break") break;
            }
        });
    };
    DashboardService.prototype.saveSharingData = function (sharingData, dashboardId) {
        //update to the pull first
        this.dashboards.forEach(function (dashboard) {
            if (dashboard.id == dashboardId) {
                dashboard['sharing'] = sharingData;
            }
        });
        //update to the server
        return this.http.post(this.constant.api + 'sharing?type=dashboard&id=' + dashboardId, sharingData)
            .map(function (res) { return res.json(); })
            .catch(this.utility.handleError);
    };
    DashboardService.prototype.getGeoFeatureParameters = function (dashboardObject) {
        var dimensionItems;
        var params = 'ou=ou:';
        var columnItems = this.findDimensionItems(dashboardObject.columns, 'ou');
        var rowItems = this.findDimensionItems(dashboardObject.rows, 'ou');
        var filterItems = this.findDimensionItems(dashboardObject.filters, 'ou');
        if (columnItems != null) {
            dimensionItems = columnItems;
        }
        else if (rowItems != null) {
            dimensionItems = rowItems;
        }
        else if (filterItems != null) {
            dimensionItems = filterItems;
        }
        if (dimensionItems.length > 0) {
            dimensionItems.forEach(function (item) {
                params += item.dimensionItem + ";";
            });
        }
        return params;
    };
    DashboardService.prototype.findDimensionItems = function (dimensionHolder, dimension) {
        var items = null;
        if (dimensionHolder.length > 0) {
            for (var _i = 0, dimensionHolder_1 = dimensionHolder; _i < dimensionHolder_1.length; _i++) {
                var holder = dimensionHolder_1[_i];
                if (holder.dimension == dimension) {
                    items = holder.items;
                    break;
                }
            }
        }
        return items;
    };
    DashboardService.prototype.getDimensionArray = function (dashboardObject, dimension) {
        var dimensionArray = [];
        var found = false;
        //find in the column list first
        var columnItems = this.findDimensionItems(dashboardObject.columns, dimension);
        if (columnItems != null) {
            dimensionArray = columnItems;
            found = true;
        }
        //find in the row list if not found
        if (!found) {
            var rowItems = this.findDimensionItems(dashboardObject.rows, dimension);
            if (rowItems != null) {
                dimensionArray = rowItems;
                found = true;
            }
        }
        //find in the filter list if still not found
        if (!found) {
            var filterItems = this.findDimensionItems(dashboardObject.filters, dimension);
            if (filterItems != null) {
                dimensionArray = filterItems;
                found = true;
            }
        }
        return dimensionArray;
    };
    DashboardService.prototype.getOrganisationUnitString = function (object, ou) {
        var orgUnitArray = this.getDimensionArray(object, ou);
        var organisationUnitString = "";
        orgUnitArray.forEach(function (organisationUnit) {
            organisationUnitString += organisationUnit.id + ";";
        });
        organisationUnitString = organisationUnitString.substring(0, organisationUnitString.length - 1);
        return organisationUnitString;
    };
    DashboardService.prototype.getMapObject = function (dashboardItemId, dashboardId) {
        var _this = this;
        return Observable.create(function (observer) {
            for (var _i = 0, _a = _this.dashboards; _i < _a.length; _i++) {
                var dashboard = _a[_i];
                if (dashboard.id == dashboardId) {
                    var _loop_3 = function(dashboardItem) {
                        if (dashboardItem.id == dashboardItemId) {
                            if (dashboardItem.hasOwnProperty('mapObject')) {
                                observer.next(dashboardItem.mapObject);
                                observer.complete();
                            }
                            else {
                                _this.http.get(_this.constant.api + _this.utility.formatEnumString(dashboardItem.type) + "s/" + dashboardItem[_this.utility.formatEnumString(dashboardItem.type)].id + ".json?fields=id,user,displayName~rename(name),longitude,latitude,zoom,basemap,mapViews[*,columns[dimension,filter,items[dimensionItem,dimensionItemType,displayName]],rows[dimension,filter,items[dimensionItem,dimensionItemType,displayName]],filters[dimension,filter,items[dimensionItem,dimensionItemType,displayName]],dataDimensionItems,program[id,displayName],programStage[id,displayName],legendSet[id,displayName],!lastUpdated,!href,!created,!publicAccess,!rewindRelativePeriods,!userOrganisationUnit,!userOrganisationUnitChildren,!userOrganisationUnitGrandChildren,!externalAccess,!access,!relativePeriods,!columnDimensions,!rowDimensions,!filterDimensions,!user,!organisationUnitGroups,!itemOrganisationUnitGroups,!userGroupAccesses,!indicators,!dataElements,!dataElementOperands,!dataElementGroups,!dataSets,!periods,!organisationUnitLevels,!organisationUnits,!sortOrder,!topLimit]").map(function (res) { return res.json(); })
                                    .catch(_this.utility.handleError)
                                    .subscribe(function (resultObject) {
                                    //Initialize map object
                                    var mapObject = {
                                        basemap: resultObject.basemap,
                                        id: resultObject.id,
                                        name: resultObject.name,
                                        zoom: resultObject.zoom,
                                        latitude: resultObject.latitude,
                                        longitude: resultObject.longitude
                                    };
                                    //Retrieve analytic calls and objects from map views
                                    var analyticCalls = [];
                                    var objects = [];
                                    var boundaryView = null;
                                    resultObject.mapViews.forEach(function (view) {
                                        //Get boundary layer when dealing with different thematic layers
                                        if (view.layer != 'boundary') {
                                            //TODO remove this hard coding after mpande knows how to handle event layers
                                            if (view.layer == 'event') {
                                                mapObject.type = 'event';
                                            }
                                            else {
                                                mapObject.type = 'aggregate';
                                            }
                                            objects.push(view);
                                            analyticCalls.push(_this.http.get(_this._getDashBoardItemAnalyticsUrl(view, 'MAP')).map(function (res) { return res.json(); }).catch(_this.utility.handleError));
                                            //get also the geoFeature
                                            analyticCalls.push(_this.http.get(_this._getGeoFeatureUrl(view)).map(function (res) { return res.json(); }).catch(_this.utility.handleError));
                                        }
                                        else {
                                            boundaryView = view;
                                        }
                                    });
                                    //handle boundary separately to avoid confusion
                                    if (boundaryView != null) {
                                        analyticCalls.push(_this.http.get(_this._getGeoFeatureUrl(boundaryView)).map(function (res) { return res.json(); }).catch(_this.utility.handleError));
                                    }
                                    //Combine all calls
                                    var analytics = [];
                                    var geoFeatures = [];
                                    var dataLayers = [];
                                    var boundaryLayer = {};
                                    Observable.forkJoin(analyticCalls).subscribe(function (requestResult) {
                                        requestResult.forEach(function (value, index) {
                                            //get geoFeature and analytic object
                                            if (isArray(value)) {
                                                geoFeatures.push(value);
                                            }
                                            else {
                                                analytics.push(value);
                                            }
                                        });
                                        //combine related objects for layers
                                        objects.forEach(function (objectValue, objectIndex) {
                                            dataLayers.push({
                                                object: objectValue,
                                                analytic: analytics[objectIndex],
                                                geoFeature: geoFeatures[objectIndex]
                                            });
                                        });
                                        //process boundary layer
                                        //TODO find best way to dynamically retrieve boundary layer
                                        boundaryLayer = {
                                            object: boundaryView,
                                            geoFeature: geoFeatures[objects.length]
                                        };
                                        //update mapObject
                                        mapObject.dataLayers = dataLayers;
                                        mapObject.boundaryLayer = boundaryLayer;
                                        //save result in dashboard item
                                        dashboardItem.mapObject = mapObject;
                                        //return as observable
                                        observer.next(mapObject);
                                        observer.complete();
                                    }, function (error) {
                                        observer.error(error);
                                    });
                                }, function (error) {
                                    observer.error(error);
                                });
                            }
                            return "break";
                        }
                    };
                    for (var _b = 0, _c = dashboard.dashboardItems; _b < _c.length; _b++) {
                        var dashboardItem = _c[_b];
                        var state_3 = _loop_3(dashboardItem);
                        if (state_3 === "break") break;
                    }
                    break;
                }
            }
        });
    };
    DashboardService.prototype.getGeoFeatures = function (url) {
        var _this = this;
        return Observable.create(function (observer) {
            _this.http.get(_this.constant.api + url).map(function (res) { return res.json(); })
                .catch(_this.utility.handleError)
                .subscribe(function (mapObject) {
                observer.next(mapObject);
                observer.complete();
            }, function (error) {
                observer.error(error);
            });
        });
    };
    DashboardService.prototype.convertToMapObject = function (dashboardObject) {
        var _this = this;
        return Observable.create(function (observer) {
            var orgUnitArray = _this.getDimensionArray(dashboardObject.object, 'ou');
            var periodArray = _this.getDimensionArray(dashboardObject.object, 'pe');
            var dataArray = _this.getDimensionArray(dashboardObject.object, 'dx');
            var analytics = dashboardObject.analytic;
            var object = dashboardObject.object;
            var mapObjectFormat = {
                basemap: "none",
                boundaryLayer: {},
                dataLayers: [],
                id: dashboardObject.object.id,
                latitude: 0,
                longitude: 0,
                name: dashboardObject.object.name,
                zoom: 0
            };
            var boundaryLayer = {
                "id": "h4Za9tihPPF",
                "name": "h4Za9tihPPF",
                "method": 2,
                "labels": false,
                "displayName": "h4Za9tihPPF",
                "labelFontColor": "#normal",
                "layer": "boundary",
                "labelFontStyle": "normal",
                "radiusHigh": 15,
                "eventClustering": false,
                "colorLow": "ff0000",
                "opacity": 1,
                "parentLevel": 0,
                "parentGraphMap": {},
                "labelFontSize": "11px",
                "colorHigh": "00ff00",
                "completedOnly": false,
                "eventPointRadius": 0,
                "hidden": false,
                "classes": 5,
                "labelFontWeight": "normal",
                "radiusLow": 5,
                "attributeDimensions": [],
                "translations": [],
                "interpretations": [],
                "columns": [],
                "dataElementDimensions": [],
                "categoryDimensions": [],
                "programIndicatorDimensions": [],
                "attributeValues": [],
                "userAccesses": [],
                "dataDimensionItems": [],
                "filters": [],
                "rows": [],
                "categoryOptionGroups": []
            };
            var orgUnitParams = "";
            if (orgUnitArray.length > 0) {
                orgUnitArray.forEach(function (item, index) {
                    orgUnitParams += index > 0 ? ";" : "";
                    orgUnitParams += item.dimensionItem;
                });
            }
            var analyticParams = [];
            dataArray.forEach(function (dataParam) {
                periodArray.forEach(function (periodParam) {
                    analyticParams.push({
                        ou: orgUnitParams,
                        dx: dataParam.dimensionItem,
                        pe: periodParam.dimensionItem
                    });
                });
            });
            var urlArray = [];
            analyticParams.forEach(function (param) {
                var analyticsUrl = 'analytics.json?dimension=dx:' + param.dx + '&dimension=ou:' + param.ou + '&filter=pe:' + param.pe + '&displayProperty=NAME';
                var geoJsonUrl = 'geoFeatures.json?ou=ou:' + param.ou;
                urlArray.push(analyticsUrl);
                urlArray.push(geoJsonUrl);
            });
            Observable.forkJoin($.map(urlArray, function (url) {
                return _this.http.get(_this.constant.api + url).map(function (res) { return res.json(); });
            }))
                .subscribe(function (responses) {
                responses.forEach(function (response, responseIndex) {
                    if (responseIndex % 2 == 1) {
                        return;
                    }
                    mapObjectFormat.dataLayers.push({ object: _this.getLayerConiguration(dashboardObject.object), analytic: responses[responseIndex], geoFeature: responses[responseIndex + 1] });
                });
                mapObjectFormat.boundaryLayer = { geoFeature: responses[1], object: boundaryLayer };
                observer.next(mapObjectFormat);
                observer.complete();
            });
        });
    };
    DashboardService.prototype.getSingleDataAnalytics = function (param, analytics, geoFeatures) {
        var pe = param.pe;
        var dx = param.dx;
        var ou = param.ou;
        var rows = analytics.rows;
        var names = analytics.metaData.names;
        var analytic = {
            headers: [],
            metaData: {
                co: [],
                dx: [],
                pe: [],
                names: {},
                ou: []
            },
            rows: []
        };
        rows.forEach(function (row) {
            if (row[0] == dx) {
                // row[1] = geoFeatures[0].id
                analytic.rows.push(row);
            }
        });
        if (analytics.rows.length == 0) {
            analytic.rows.push([dx, pe, 0]);
        }
        analytic.metaData.dx.push(dx);
        analytic.metaData.names[dx] = names[dx] + "  " + pe;
        analytic.metaData.ou = analytics.metaData.ou;
        return analytic;
    };
    DashboardService.prototype.getLayerConiguration = function (object) {
        var defaultObject = {
            classes: 5,
            colorHigh: "00ff00",
            colorLow: "ff0000",
            colorScale: "#ffffd4,#fed98e,#fe9929,#d95f0e,#993404",
            columns: [],
            completedOnly: false,
            dataDimensionItems: [],
            dataElementDimensions: [],
            displayName: object.displayName,
            eventClustering: false,
            eventPointRadius: 0,
            filters: [],
            hidden: false,
            id: object.id,
            interpretations: [],
            labelFontColor: "##000000",
            labelFontSize: "11px",
            labelFontStyle: "normal",
            labelFontWeight: "normal",
            labels: false,
            layer: "thematic1",
            method: 3,
            name: object.name,
            opacity: 0.8,
            parentGraphMap: Object,
            parentLevel: 0,
            program: Object,
            programIndicatorDimensions: [],
            radiusHigh: 15,
            radiusLow: 5,
            rows: [],
            translations: [],
            userAccesses: []
        };
        return defaultObject;
    };
    DashboardService.prototype.getGeoFeature = function (ou) {
        var _this = this;
        return Observable.create(function (observer) {
            _this.http.get(_this.constant.api + 'geoFeatures.json?ou=ou:' + ou).map(function (res) { return res.json(); })
                .catch(_this.utility.handleError)
                .subscribe(function (mapObject) {
                observer.next(mapObject);
                observer.complete();
            }, function (error) {
                observer.error(error);
            });
        });
    };
    DashboardService = __decorate([
        Injectable(), 
        __metadata('design:paramtypes', [Http, Constants, Utilities])
    ], DashboardService);
    return DashboardService;
}());
//# sourceMappingURL=dashboard.service.js.map