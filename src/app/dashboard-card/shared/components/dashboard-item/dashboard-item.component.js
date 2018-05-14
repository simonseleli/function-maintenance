var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DashboardService } from "../../providers/dashboard.service";
import { ActivatedRoute } from "@angular/router";
import { Utilities } from "../../providers/utilities";
import { Constants } from "../../providers/constants";
import { VisualizerService } from "../../providers/visualizer.service";
import { Observable } from "rxjs";
export var DASHBOARD_SHAPES = {
    'NORMAL': ['col-md-4', 'col-sm-6', 'col-xs-12'],
    'DOUBLE_WIDTH': ['col-md-8', 'col-sm-6', 'col-xs-12'],
    'FULL_WIDTH': ['col-md-12', 'col-sm-12', 'col-xs-12']
};
export var VISUALIZATION_OPTIONS = [
    { type: 'CHART', shown: true, selected: false },
    { type: 'TABLE', shown: true, selected: false },
    { type: 'CHART', shown: true, selected: false },
    { type: 'CHART', shown: true, selected: false }
];
export var DashboardItemComponent = (function () {
    function DashboardItemComponent(dashboardService, route, utility, visualizationService, constants) {
        this.dashboardService = dashboardService;
        this.route = route;
        this.utility = utility;
        this.visualizationService = visualizationService;
        this.constants = constants;
        this.status = {};
        this.show_options = true;
        this.onDelete = new EventEmitter();
        this.onItemLoaded = new EventEmitter();
        this.customShape = null;
        this.loadingMap = true;
        this.displayMap = 'hidden';
        this.dataElements = [];
        this.organisationUnits = {};
        this.topLayers = {};
        this.defaultTopLayer = "";
        this.mapProperties = {};
        this.legendHtml = [];
        this.arrayOfDefaultLayers = [];
        this.sourceType = null;
        this.layerController = 'hidden';
        this.customLayout = null;
        this.cardReady = false;
        this.cardConfiguration = {
            showHeadersIcons: true
        };
        this.orgunit_model = {
            selection_mode: "Usr_orgUnit",
            selected_level: "",
            show_update_button: true,
            selected_group: "",
            orgunit_levels: [],
            orgunit_groups: [],
            selected_orgunits: [],
            user_orgunits: [],
            type: "report",
            selected_user_orgunit: "USER_ORGUNIT"
        };
        this.disableOrgunit = false;
        this.disablePeriod = false;
        this.isFullScreen = false;
        this.isInterpretationShown = this.interpretationReady = false;
        this.confirmDelete = false;
        this.chartHasError = this.tableHasError = false;
        this.loadingChart = this.loadingTable = true;
        this.chartTypes = this.constants.chartTypes;
        this.currentChartType = null;
    }
    DashboardItemComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.mapId = this.itemData.id;
        //TODO find best way to disable filters
        if (this.itemData.type == 'MAP') {
            this.disableOrgunit = true;
            this.disablePeriod = true;
        }
        this.dimensionValues.subscribe(function (dimension) {
            // console.log(dimension);
            if (dimension != null) {
                _this.updateDashboardCard(dimension);
            }
            else {
                _this.currentVisualization = _this.itemData.type;
                _this.dashboardShapeBuffer = _this.itemData.shape;
                //load dashbordItem object
                if ((_this.currentVisualization == 'CHART') ||
                    (_this.currentVisualization == 'EVENT_CHART') ||
                    (_this.currentVisualization == 'TABLE') ||
                    (_this.currentVisualization == 'REPORT_TABLE') ||
                    (_this.currentVisualization == 'EVENT_REPORT')) {
                    _this.updateDasboardItemForAnalyticTypeItems(_this.itemData.id);
                }
                else if (_this.currentVisualization == 'MAP') {
                    _this.displayMap = 'hidden';
                    _this.loadingMap = true;
                    _this.dashboardService.getMapObject(_this.itemData.id, _this.dashboardId).subscribe(function (mapObject) {
                        _this.displayMap = 'visible';
                        _this.loadingMap = false;
                        _this.sourceType = 'MAP';
                        _this.drawMap(mapObject);
                    });
                }
                else {
                    _this.onItemLoaded.emit(true);
                }
            }
        });
    };
    DashboardItemComponent.prototype.ngAfterViewInit = function () {
    };
    DashboardItemComponent.prototype.visualize = function (dashboardItemType, dataArray) {
        var _this = this;
        this.displayMap = 'hidden';
        if ((dashboardItemType == 'CHART') || (dashboardItemType == 'EVENT_CHART')) {
            this.drawChart(dataArray);
        }
        else if ((dashboardItemType == 'TABLE') || (dashboardItemType == 'EVENT_REPORT') || (dashboardItemType == 'REPORT_TABLE')) {
            this.drawTable(dataArray);
        }
        else if (dashboardItemType == 'DICTIONARY') {
        }
        else if (dashboardItemType == 'MAP') {
            this.displayMap = 'hidden';
            this.loadingMap = true;
            if (dataArray.basemap) {
                this.displayMap = 'visible';
                this.loadingMap = false;
                this.drawMap(dataArray);
            }
            else {
                var orgunitString = this.dashboardService.getOrganisationUnitString(this.itemData.object, 'ou');
                this.dashboardService.getGeoFeature(orgunitString).subscribe(function (feature) {
                    _this.displayMap = 'visible';
                    _this.loadingMap = false;
                    _this.dashboardService.convertToMapObject(_this.itemData).subscribe(function (response) {
                        dataArray = response;
                        _this.drawMap(dataArray);
                    });
                });
            }
        }
    };
    DashboardItemComponent.prototype.setVisualization = function (visualizationType) {
        var _this = this;
        this.currentVisualization = visualizationType;
        // this.dashboardLayout.changeVisualisation(visualizationType,this.itemData.analytic.headers);
        this.getVisualizationArray(this.itemData, visualizationType).subscribe(function (dataArray) {
            _this.visualize(visualizationType, dataArray);
        });
    };
    DashboardItemComponent.prototype.getVisualizationArray = function (itemData, visualizationType) {
        var _this = this;
        return Observable.create(function (observer) {
            var dataArray = [];
            if (visualizationType != 'MAP') {
                if (itemData.hasOwnProperty('mapObject')) {
                    itemData.mapObject.dataLayers.forEach(function (layer) {
                        dataArray.push({ object: layer.object, analytic: layer.analytic });
                    });
                }
                else {
                    dataArray = [{ object: itemData.object, analytic: itemData.analytic }];
                }
            }
            else {
                if (itemData.hasOwnProperty('mapObject')) {
                    dataArray = itemData.mapObject;
                }
                else {
                    _this.dashboardService.convertToMapObject(_this.itemData);
                }
            }
            observer.next(dataArray);
            observer.complete();
        });
    };
    DashboardItemComponent.prototype.drawChart = function (dataArray) {
        var _this = this;
        var chartObjects = [];
        dataArray.forEach(function (data) {
            var layout = {};
            if (!_this.utility.isNull(_this.customLayout)) {
                layout['series'] = _this.customLayout.series;
                layout['category'] = _this.customLayout.category;
            }
            else {
                layout['series'] = data.object.series ? data.object.series : data.object.columns[0].dimension;
                layout['category'] = data.object.category ? data.object.category : data.object.rows[0].dimension;
            }
            //manage chart types
            var chartType;
            if (!_this.utility.isNull(_this.currentChartType)) {
                chartType = _this.currentChartType;
            }
            else {
                chartType = data.object.type ? data.object.type.toLowerCase() : 'bar';
            }
            var chartConfiguration = {
                'type': chartType,
                'title': data.object.title ? data.object.title : data.object.displayName,
                'show_labels': true,
                'xAxisType': layout.category,
                'yAxisType': layout.series
            };
            chartObjects.push(_this.visualizationService.drawChart(data.analytic, chartConfiguration));
        });
        this.chartObjects = chartObjects;
        this.loadingChart = false;
    };
    DashboardItemComponent.prototype.drawTable = function (dataArray) {
        var _this = this;
        var tableObjects = [];
        dataArray.forEach(function (data) {
            var display_list = false;
            if (_this.currentVisualization = 'EVENT_REPORT') {
                if (data.dataType == 'EVENTS') {
                    display_list = true;
                }
            }
            var config = { rows: [], columns: [], hide_zeros: true, display_list: display_list };
            if (!_this.utility.isNull(_this.customLayout)) {
                //get columns
                if (_this.customLayout.columns.length > 0) {
                    _this.customLayout.columns.forEach(function (column) {
                        config.columns.push(column);
                    });
                }
                else {
                    config.columns = ['co'];
                }
                if (_this.customLayout.rows.length > 0) {
                    _this.customLayout.rows.forEach(function (row) {
                        config.rows.push(row);
                    });
                }
                else {
                    config.rows = ['ou', 'dx', 'pe'];
                }
            }
            else {
                //get columns
                if (data.object.hasOwnProperty('columns')) {
                    data.object.columns.forEach(function (colValue) {
                        if (colValue.dimension != 'dy') {
                            config.columns.push(colValue.dimension);
                        }
                    });
                }
                else {
                    config.columns = ['co'];
                }
                //get rows
                if (data.object.hasOwnProperty('rows')) {
                    data.object.rows.forEach(function (rowValue) {
                        if (rowValue.dimension != 'dy') {
                            config.rows.push(rowValue.dimension);
                        }
                    });
                }
                else {
                    config.rows = ['ou', 'dx', 'pe'];
                }
            }
            tableObjects.push(_this.visualizationService.drawTable(data.analytic, config));
        });
        this.tableObjects = tableObjects;
        this.loadingTable = false;
    };
    DashboardItemComponent.prototype.drawMap = function (mapObject) {
        var _this = this;
        this.baseMaps = {
            OpenStreetMap: L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
                maxZoom: 18,
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy;<a href="https://carto.com/attribution">CARTO</a>'
            }),
            OpenStreetMap_BlackAndWhite: L.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
                maxZoom: 18,
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }),
            Esri_WorldImagery: L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            })
        };
        var dataLayers;
        /**
         * Draw Map
         * */
        var mapProperties = this.prepareMapProperties(mapObject);
        this.boundaryLayer = this.prepareTopBoundaryLayer(mapObject);
        this.mapProperties = mapProperties;
        this.getDataLayer(mapObject);
        setTimeout(function () {
            var mapConfigurations = {};
            if (mapObject.type == 'event') {
                mapConfigurations = {
                    center: L.latLng(mapProperties.latitude, mapProperties.longitude),
                    zoom: mapProperties.zoom,
                    layers: [_this.baseMaps.OpenStreetMap, _this.boundaryLayer].concat(_this.arrayOfDefaultLayers)
                };
                _this.layerController = 'hidden';
            }
            else {
                _this.arrayOfDefaultLayers.push(_this.boundaryLayer);
                mapConfigurations = {
                    zoomControl: false,
                    scrollWheelZoom: false,
                    center: L.latLng(mapProperties.latitude, mapProperties.longitude),
                    zoom: mapProperties.zoom,
                    layers: [_this.baseMaps.OpenStreetMap].concat(_this.arrayOfDefaultLayers)
                };
            }
            var map = L.map(_this.mapId, mapConfigurations);
            map.fitBounds(_this.boundaryLayer.getBounds());
            //
            L.control.zoom({ position: "topright" }).addTo(map);
            //
            L.control.layers(_this.baseMaps, _this.topLayers).addTo(map);
            //
            L.control.scale().addTo(map);
            var legendDiv = L.Control.extend({
                options: {
                    position: 'bottomright'
                },
                onAdd: function (map) {
                    var selectionDiv = L.DomUtil.create('div');
                    selectionDiv.innerHTML = _this.extractLegend(_this.legendHtml);
                    selectionDiv.style.width = '100px';
                    selectionDiv.style.height = '150px';
                    return selectionDiv;
                },
                onRemove: function (map) {
                    // Nothing to do here
                }
            });
            map.addControl(new legendDiv());
            _this.map = map;
        }, 10);
    };
    DashboardItemComponent.prototype.closeLayerController = function (event) {
        this.layerController = 'hidden';
    };
    DashboardItemComponent.prototype.openLayerController = function (event) {
        this.layerController = 'visible';
        var divElement = document.getElementById('layers_division_' + this.mapId);
        divElement.innerHTML = this.extractLegend(this.legendHtml);
    };
    DashboardItemComponent.prototype.updateChartType = function (type) {
        var _this = this;
        this.loadingChart = true;
        this.currentChartType = type;
        this.getVisualizationArray(this.itemData, this.currentVisualization).subscribe(function (dataArray) {
            _this.drawChart(dataArray);
        });
    };
    DashboardItemComponent.prototype.setChartType = function (type) {
        this.currentChartType = type;
        this.updateChartType(this.currentChartType);
    };
    //Methods for dashboard item  shape
    DashboardItemComponent.prototype.dashboardShapeClass = function (shape) {
        return shape ? DASHBOARD_SHAPES[shape] : DASHBOARD_SHAPES['NORMAL'];
    };
    DashboardItemComponent.prototype.resizeDashboard = function (currentShape) {
        var shapes = ['NORMAL', 'DOUBLE_WIDTH', 'FULL_WIDTH'];
        var newShape = '';
        if (shapes.indexOf(currentShape) + 1 < shapes.length) {
            newShape = shapes[shapes.indexOf(currentShape) + 1];
        }
        else {
            newShape = shapes[0];
        }
        this.dashboardService.updateShape(this.dashboardId, this.itemData.id, newShape);
        //@todo find best way to close interpretation on normal screen
        if (newShape == 'NORMAL') {
            this.isInterpretationShown = false;
        }
        //Also resize map
        this.resizeMap();
    };
    DashboardItemComponent.prototype.resizeMap = function () {
        var _this = this;
        if (this.map) {
            setTimeout(function () {
                _this.map.invalidateSize();
            }, 200);
        }
    };
    DashboardItemComponent.prototype.toggleFullScreen = function () {
        this.isFullScreen = !this.isFullScreen;
        this.resizeMap();
    };
    DashboardItemComponent.prototype.canShowIcons = function (visualizationType) {
        var noFooterVisualization = ['USERS', 'REPORTS', 'RESOURCES', 'APP'];
        var canShow = true;
        noFooterVisualization.forEach(function (visualizationValue) {
            if (visualizationType == visualizationValue) {
                canShow = false;
            }
        });
        return canShow;
    };
    DashboardItemComponent.prototype.toggleInterpretation = function () {
        if (this.isInterpretationShown) {
            this.isInterpretationShown = false;
            this.itemData.shape = this.dashboardShapeBuffer;
        }
        else {
            this.isInterpretationShown = true;
            if (this.itemData.shape == 'NORMAL') {
                this.dashboardShapeBuffer = this.itemData.shape;
                this.itemData.shape = 'DOUBLE_WIDTH';
            }
            else {
                this.dashboardShapeBuffer = this.itemData.shape;
            }
        }
    };
    DashboardItemComponent.prototype.deleteDashboardItem = function (id) {
        var _this = this;
        this.dashboardService.deleteDashboardItem(this.dashboardId, id)
            .subscribe(function (response) {
            _this.onDelete.emit(id);
        }, function (error) {
            console.log('error deleting item');
        });
    };
    DashboardItemComponent.prototype.updateDashboardCard = function (dimension) {
        //TODO find best way to update  map types
        if (this.currentVisualization != 'MAP') {
            this.updateDasboardItemForAnalyticTypeItems(this.itemData.id, dimension.length == 2 ? dimension : [dimension]);
        }
    };
    DashboardItemComponent.prototype.updateDasboardItemForAnalyticTypeItems = function (dashboardItemId, customDimensions) {
        var _this = this;
        if (customDimensions === void 0) { customDimensions = []; }
        this.loadingChart = this.loadingTable = true;
        this.dashboardService.getDashboardItemWithObjectAndAnalytics(this.dashboardId, dashboardItemId, customDimensions)
            .subscribe(function (dashboardItem) {
            _this.cardReady = true;
            _this.onItemLoaded.emit(true);
            _this.itemData = dashboardItem;
            _this.visualize(_this.currentVisualization, [{ object: dashboardItem.object, analytic: dashboardItem.analytic }]);
            //@todo find best way to autoplay interpretation
            _this.autoplayInterpretation(dashboardItem);
        }, function (error) {
            _this.tableHasError = _this.chartHasError = true;
            _this.loadingChart = _this.loadingTable = false;
        });
    };
    DashboardItemComponent.prototype.updateDashboardItemLayout = function (layout) {
        this.customLayout = layout;
        this.loadingChart = this.loadingTable = true;
        this.visualize(this.currentVisualization, [{ object: this.itemData.object, analytic: this.itemData.object }]);
    };
    DashboardItemComponent.prototype.autoplayInterpretation = function (dashboardItem) {
        var _this = this;
        this.interpretationReady = true;
        var interpretationIndex = 0;
        var interpretationLength = dashboardItem.object.interpretations.length;
        if (interpretationLength > 0) {
            Observable.interval(4000).subscribe(function (value) {
                if (interpretationIndex <= interpretationLength - 1) {
                    _this.interpretation = dashboardItem.object.interpretations[interpretationIndex].text;
                    interpretationIndex += 1;
                }
                else {
                    interpretationIndex = 0;
                    _this.interpretation = dashboardItem.object.interpretations[interpretationIndex].text;
                }
            });
        }
    };
    /** start map functions */
    DashboardItemComponent.prototype.getDataElements = function (analytics, thematicLayer, rows, organisationUnits) {
        var _this = this;
        var metaDataNames = analytics.metaData.names;
        var period = this.preparePeriod(analytics.metaData.pe);
        var dataElementCarrier = {};
        analytics.metaData.dx.forEach(function (dataElementsUids) {
            dataElementCarrier = { name: metaDataNames[dataElementsUids], uid: dataElementsUids, organisationUnitScores: [], };
        });
        if (organisationUnits) {
            organisationUnits.forEach(function (organisationUnit) {
                dataElementCarrier.organisationUnitScores.push(_this.getDataValue(rows, dataElementCarrier.uid, organisationUnit, period));
            });
        }
        else {
            analytics.metaData.ou.forEach(function (organisationUnit) {
                dataElementCarrier.organisationUnitScores.push(_this.getDataValue(rows, dataElementCarrier.uid, organisationUnit, period));
            });
        }
        dataElementCarrier.boundaries = organisationUnits;
        dataElementCarrier.hook = thematicLayer;
        dataElementCarrier.legendSetting = analytics.legendSetting;
        return dataElementCarrier;
    };
    DashboardItemComponent.prototype.preparePeriod = function (period) {
        var periodValue = "";
        if (period instanceof Array) {
            periodValue = period[0];
        }
        return periodValue;
    };
    DashboardItemComponent.prototype.getFeatures = function (geoFeatures) {
        var geoJsonTemplate = {
            "type": "FeatureCollection",
            "features": []
        };
        if (geoFeatures) {
            geoFeatures.forEach(function (features) {
                var sampleGeometry = {
                    "type": "Feature",
                    "geometry": { "type": "", "coordinates": [] },
                    "properties": { "id": "", "name": "" }
                };
                sampleGeometry.properties.id = features.id;
                sampleGeometry.properties.name = features.na;
                sampleGeometry.geometry.coordinates = JSON.parse(features.co);
                if (features.le >= 4) {
                    sampleGeometry.geometry.type = 'Point';
                }
                else if (features.le >= 1) {
                    sampleGeometry.geometry.type = 'MultiPolygon';
                }
                geoJsonTemplate.features.push(sampleGeometry);
            });
        }
        return geoJsonTemplate;
    };
    DashboardItemComponent.prototype.getGeoJsonObject = function (geoFeatures) {
        var geoFeatureArray = [];
        geoFeatureArray = this.getFeatures(geoFeatures);
        if (geoFeatureArray) {
            return geoFeatureArray;
        }
    };
    DashboardItemComponent.prototype.getDataValue = function (rows, dataElement, organisationUnit, period) {
        var template = {
            dataElementId: dataElement,
            period: period,
            organisationUnitUid: organisationUnit.id ? organisationUnit.id : organisationUnit,
            organisationUnitName: organisationUnit.na ? organisationUnit.na : organisationUnit,
            dataElementValue: ""
        };
        var orgunitId = organisationUnit.id ? organisationUnit.id : organisationUnit;
        var orgunitName = organisationUnit.na ? organisationUnit.na : organisationUnit;
        if (rows.length > 0) {
            rows.forEach(function (row) {
                if (row[0] == dataElement && row[1] == orgunitId) {
                    template.dataElementValue = +row[2];
                    return false;
                }
            });
            return template;
        }
        else {
            return template;
        }
    };
    DashboardItemComponent.prototype.getDataLayer = function (mapObject) {
        var _this = this;
        var dataLayers = mapObject.dataLayers;
        var layers = [];
        if (mapObject.type == 'event') {
            var analytics_1 = null;
            dataLayers.forEach(function (dataLayer) {
                if (dataLayer.analytic) {
                    analytics_1 = dataLayer.analytic;
                }
            });
            var markers_1 = L.markerClusterGroup({
                chunkedLoading: true, iconCreateFunction: function (cluster) {
                    return L.divIcon({ html: '<b style="margin-top:10px;">' + cluster.getChildCount() + '</b>' });
                }, showCoverageOnHover: false
            });
            if (analytics_1) {
                analytics_1.rows.forEach(function (row) {
                    var a = [row[4], row[3], "<b>Water Point: </b>" + row[5]];
                    var title = a[2];
                    var marker = L.marker(L.latLng(a[0], a[1]), { title: title, icon: L.icon({
                            iconUrl: 'assets/marker-icon.png'
                        }) });
                    marker.bindPopup(title);
                    markers_1.addLayer(marker);
                });
            }
            layers = markers_1;
            this.arrayOfDefaultLayers = layers;
        }
        else {
            var polygon = false;
            dataLayers.forEach(function (dataLayer) {
                var analytics = dataLayer.analytic;
                var features = dataLayer['geoFeature'];
                var object = dataLayer['object'];
                layers.push(_this.getThematicLayer(analytics, features, object));
            });
            var index_1 = 0;
            layers.forEach(function (layer, layerIndex) {
                var layerNameArray = Object.getOwnPropertyNames(layer);
                var layerObjects = layer[layerNameArray[0]];
                var features = layer[layerNameArray[0]].features;
                var organisationUnitScores = layer[layerNameArray[0]].organisationUnitScore;
                var featureCollection = _this.getGeoJsonObject(features);
                var period = "";
                var value = "";
                var scoresCount = organisationUnitScores.length;
                if (featureCollection.features.length > 0) {
                    var inValue_1 = [];
                    featureCollection.features.forEach(function (geoJsonFeature, featureIndex) {
                        organisationUnitScores.forEach(function (score, scoreIndex) {
                            period = score.period;
                            if (score.orgunit.id == geoJsonFeature.properties.id) {
                                inValue_1.push(score.orgunit.id);
                                value = score.value;
                            }
                            else if (scoreIndex >= scoresCount - 1 && inValue_1.indexOf(geoJsonFeature.properties.id) == -1) {
                                value = "";
                            }
                            geoJsonFeature.properties.dataelement = {
                                id: layerNameArray[0],
                                name: layerNameArray[0],
                                period: period,
                                value: value
                            };
                        });
                        if (!geoJsonFeature.properties.dataelement) {
                            geoJsonFeature.properties.dataelement = {
                                id: layerNameArray[0],
                                name: layerNameArray[0],
                                period: period,
                                value: 0
                            };
                        }
                        geoJsonFeature.properties.legend = _this.prepareDataLegend(layerObjects);
                    });
                    // if (polygon) {
                    var layer_1 = L.geoJSON(featureCollection.features);
                    layer_1.setStyle(_this.getStyle);
                    layer_1.on({
                        click: function (event) {
                            var clickedFeature = event.layer.feature;
                            var properties = clickedFeature.properties;
                            var featureName = properties.name;
                            var dataElementName = properties.dataelement.name;
                            var dataElementValue = properties.dataelement.value;
                            var period = properties.dataelement.period;
                            var popUpContent = "<div style='color:#333!important;'>" +
                                "<table>" +
                                "<tr><td style='color:#333!important;'>" + featureName + "</td></tr>" +
                                "<tr><td style='color:#333!important;'>" + dataElementName + "</td></tr>" +
                                "<tr><td style='color:#333!important;'>" + period + " : " + dataElementValue + "</td></tr>" +
                                "</table>" +
                                "</div>";
                            var toolTip = layer_1.getTooltip();
                            if (toolTip) {
                                layer_1.closeTooltip();
                                layer_1.bindPopup(popUpContent, { keepInView: true });
                            }
                            else {
                                layer_1.bindPopup(popUpContent, { keepInView: true });
                            }
                        },
                        add: function (event) {
                            layer_1.closeTooltip();
                            layer_1.closePopup();
                        },
                        dblclick: function (event) {
                        },
                        remove: function (event) {
                            var toolTip = layer_1.getTooltip();
                            if (toolTip) {
                                layer_1.closeTooltip();
                            }
                            var popUp = layer_1.getPopup();
                            if (popUp && popUp.isOpen()) {
                                layer_1.closePopup();
                            }
                        },
                        mouseover: function (event) {
                            var hoveredFeature = event.layer.feature;
                            var properties = hoveredFeature.properties;
                            var featureName = properties.name;
                            var dataElementName = properties.dataelement.name;
                            var dataElementValue = properties.dataelement.value;
                            var toolTipContent = "<div style='color:#333!important;'>" +
                                "<table>" +
                                "<tr><th style='color:#333!important;'>" + featureName + "</th>";
                            if (dataElementValue == "") {
                                toolTipContent += "<td style='color:#333!important;' ></td>";
                            }
                            else {
                                toolTipContent += "<td style='color:#333!important;' > (" + dataElementValue + ")</td>";
                            }
                            toolTipContent += "</tr>" +
                                "</table>" +
                                "</div>";
                            layer_1.closeTooltip();
                            var popUp = layer_1.getPopup();
                            if (popUp && popUp.isOpen()) {
                            }
                            else {
                                layer_1.bindTooltip(toolTipContent, {
                                    direction: 'top',
                                    permanent: false,
                                    sticky: false,
                                    interactive: true,
                                    opacity: 2
                                });
                            }
                            layer_1.setStyle(function (feature) {
                                var properties = feature.properties;
                                var color = function () {
                                    var dataElementScore = properties.dataelement.value;
                                    return feature.properties.legend(dataElementScore);
                                };
                                var featureStyle = {
                                    "fillOpacity": 0.7,
                                    "weight": 1,
                                    "stroke": true,
                                };
                                var hov = hoveredFeature.properties;
                                if (hov.id == properties.id) {
                                    featureStyle.opacity = 0.6;
                                    featureStyle.fillOpacity = 0.7;
                                    featureStyle.color = "#000000";
                                }
                                return featureStyle;
                            });
                        },
                        mouseout: function (event) {
                            var hoveredFeature = event.layer.feature;
                            var toolTip = layer_1.getTooltip();
                            if (toolTip) {
                                layer_1.closeTooltip();
                            }
                            layer_1.setStyle(function (feature) {
                                var properties = feature.properties;
                                var color = function () {
                                    var dataElementScore = properties.dataelement.value;
                                    return feature.properties.legend(dataElementScore);
                                };
                                var featureStyle = {
                                    "fillOpacity": 0.7,
                                    "weight": 1,
                                    "opacity": 1,
                                    "stroke": true,
                                };
                                var hov = hoveredFeature.properties;
                                if (hov.id == properties.id) {
                                    featureStyle.fillOpacity = 0.7;
                                    featureStyle.color = "#6F6E6D";
                                }
                                return featureStyle;
                            });
                        },
                    });
                    _this.arrayOfDefaultLayers.push(layer_1);
                    _this.topLayers['Boundaries'] = _this.boundaryLayer;
                    _this.topLayers[layerNameArray[0]] = layer_1;
                    if (index_1 == 0) {
                        _this.defaultTopLayer = layerNameArray[0];
                    }
                    else {
                    }
                    index_1++;
                }
            });
        }
        return layers;
    };
    DashboardItemComponent.prototype.prepareMapProperties = function (mapObject) {
        if (!mapObject.basemap) {
            var sampleObject = {
                "basemap": "none",
                "id": "urfxn5ieRsV",
                "name": "Functional Water Points",
                "zoom": 5,
                "latitude": -9.598041300301933,
                "longitude": 34.66629999999997,
                "dataLayers": [],
                "boundaryLayer": []
            };
            sampleObject.dataLayers.push(mapObject);
            return sampleObject;
        }
        return mapObject;
    };
    DashboardItemComponent.prototype.getThematicLayer = function (analytics, features, object) {
        var _this = this;
        var thematicLayer = {};
        var dx = analytics.metaData.dx;
        var names = analytics.metaData.names;
        var ou = analytics.metaData.ou;
        var pe = analytics.metaData.pe;
        var rows = analytics.rows;
        var legendSetting = {
            classes: object.classes,
            colorHigh: object.colorHigh,
            colorLow: object.colorLow,
            colorScale: object.colorScale,
            method: object.method
        };
        dx.forEach(function (dataElement) {
            thematicLayer[names[dataElement]] = {
                id: dataElement,
                name: names[dataElement],
                legendSettings: legendSetting,
                features: features,
                organisationUnitScore: _this.getOrganisationUnitScore(dataElement, pe, ou, features, rows)
            };
        });
        return thematicLayer;
    };
    DashboardItemComponent.prototype.extractLegend = function (legendArray) {
        var legends = "";
        var availableNames = [];
        legendArray.forEach(function (legend) {
            var id = Object.getOwnPropertyNames(legend);
            if (availableNames.indexOf(id + "") >= 0) {
            }
            else {
                availableNames.push(id + "");
                legends += legend[id + ""];
            }
        });
        return legends;
    };
    DashboardItemComponent.prototype.getOrganisationUnitScore = function (dataElement, pe, ous, features, rows) {
        var score = [];
        features.forEach(function (ou) {
            rows.forEach(function (row, index) {
                if (isNaN(row[1])) {
                    if (row[0] == dataElement && row[1] == ou.id) {
                        score.push({ orgunit: ou, orgunitname: ou.na, dataElement: dataElement, period: pe[0], value: row[2] });
                    }
                }
                else {
                    if (row[0] == dataElement) {
                        score.push({ orgunit: ou, orgunitname: ou.na, dataElement: dataElement, period: pe[0], value: row[2] });
                    }
                }
            });
        });
        return score;
    };
    DashboardItemComponent.prototype.getCorrespondingOrgUnits = function (layer, layers, sourceType) {
        var organisationUnits = {};
        layers.forEach(function (geoLayer) {
            if (geoLayer[layer] && sourceType == "MAP") {
                organisationUnits = geoLayer[layer];
                return false;
            }
            if (geoLayer[layer] && sourceType == null) {
                var thematic = layer.split('_')[1];
                if (geoLayer[thematic]) {
                    organisationUnits = geoLayer[thematic].metaData.ou;
                }
            }
        });
        return organisationUnits;
    };
    /**
     * Map Functions
     * */
    DashboardItemComponent.prototype.prepareTopLayers = function (dataLayers) {
        var _this = this;
        this.topLayers['Boundaries'] = this.boundaryLayer;
        this.arrayOfDefaultLayers.push(this.boundaryLayer);
        var index = 0;
        dataLayers.forEach(function (dataLayer, dataLayerIndex) {
            dataLayer.features = [];
            var featureCollection = _this.getGeoJsonObject(dataLayer.boundaries);
            var organisationUnitScores = dataLayer.organisationUnitScores;
            if (featureCollection.features.length > 0) {
                featureCollection.features.forEach(function (geoJsonFeature, featureIndex) {
                    if (dataLayer.uid == organisationUnitScores[featureIndex].dataElementId) {
                        geoJsonFeature.properties.dataelement = {};
                        dataLayer.organisationUnitScores[featureIndex].organisationUnitName = geoJsonFeature.properties.name;
                        geoJsonFeature.properties.dataelement = {
                            id: organisationUnitScores[featureIndex].dataElementId,
                            name: dataLayer.name,
                            period: organisationUnitScores[featureIndex].period,
                            value: organisationUnitScores[featureIndex].dataElementValue
                        };
                        geoJsonFeature.properties.legend = _this.prepareDataLegend(dataLayer);
                        dataLayer.features.push(geoJsonFeature);
                        /**
                         * Prepare TOp Layer
                         * */
                        var layer_2 = L.geoJSON(dataLayer.features);
                        layer_2.setStyle(_this.getStyle);
                        layer_2.on({
                            click: function (event) {
                                var clickedFeature = event.layer.feature;
                                var properties = clickedFeature.properties;
                                var featureName = properties.name;
                                var dataElementName = properties.dataelement.name;
                                var dataElementValue = properties.dataelement.value;
                                var period = properties.dataelement.period;
                                var popUpContent = "<div style='color:#333!important;'>" +
                                    "<table>" +
                                    "<tr><td style='color:#333!important;'>" + featureName + "</td></tr>" +
                                    "<tr><td style='color:#333!important;'>" + dataElementName + "</td></tr>" +
                                    "<tr><td style='color:#333!important;'>" + period + " : " + dataElementValue + "</td></tr>" +
                                    "</table>" +
                                    "</div>";
                                var toolTip = layer_2.getTooltip();
                                if (toolTip) {
                                    layer_2.closeTooltip();
                                    layer_2.bindPopup(popUpContent, { keepInView: true });
                                }
                                else {
                                    layer_2.bindPopup(popUpContent, { keepInView: true });
                                }
                            },
                            add: function (event) {
                                layer_2.closeTooltip();
                                layer_2.closePopup();
                            },
                            dblclick: function (event) {
                            },
                            remove: function (event) {
                                var toolTip = layer_2.getTooltip();
                                if (toolTip) {
                                    layer_2.closeTooltip();
                                }
                                var popUp = layer_2.getPopup();
                                if (popUp && popUp.isOpen()) {
                                    layer_2.closePopup();
                                }
                            },
                            mouseover: function (event) {
                                var hoveredFeature = event.layer.feature;
                                var properties = hoveredFeature.properties;
                                var featureName = properties.name;
                                var dataElementName = properties.dataelement.name;
                                var dataElementValue = properties.dataelement.value;
                                var toolTipContent = "<div style='color:#333!important;'>" +
                                    "<table>" +
                                    "<tr><th style='color:#333!important;'>" + featureName + "</th>";
                                if (dataElementValue == "") {
                                    toolTipContent += "<td style='color:#333!important;' ></td>";
                                }
                                else {
                                    toolTipContent += "<td style='color:#333!important;' > (" + dataElementValue + ")</td>";
                                }
                                toolTipContent += "</tr>" +
                                    "</table>" +
                                    "</div>";
                                layer_2.closeTooltip();
                                var popUp = layer_2.getPopup();
                                if (popUp && popUp.isOpen()) {
                                }
                                else {
                                    layer_2.bindTooltip(toolTipContent, {
                                        direction: 'top',
                                        permanent: false,
                                        sticky: false,
                                        interactive: true,
                                        opacity: 2
                                    });
                                }
                                layer_2.setStyle(function (feature) {
                                    var properties = feature.properties;
                                    var color = function () {
                                        var dataElementScore = properties.dataelement.value;
                                        return feature.properties.legend(dataElementScore);
                                    };
                                    var featureStyle = {
                                        "fillOpacity": 0.7,
                                        "weight": 1,
                                        "stroke": true,
                                    };
                                    var hov = hoveredFeature.properties;
                                    if (hov.id == properties.id) {
                                        featureStyle.opacity = 0.6;
                                        featureStyle.fillOpacity = 0.7;
                                        featureStyle.color = "#000000";
                                    }
                                    return featureStyle;
                                });
                            },
                            mouseout: function (event) {
                                var hoveredFeature = event.layer.feature;
                                var toolTip = layer_2.getTooltip();
                                if (toolTip) {
                                    layer_2.closeTooltip();
                                }
                                layer_2.setStyle(function (feature) {
                                    var properties = feature.properties;
                                    var color = function () {
                                        var dataElementScore = properties.dataelement.value;
                                        return feature.properties.legend(dataElementScore);
                                    };
                                    var featureStyle = {
                                        "fillOpacity": 0.7,
                                        "weight": 1,
                                        "opacity": 1,
                                        "stroke": true,
                                    };
                                    var hov = hoveredFeature.properties;
                                    if (hov.id == properties.id) {
                                        featureStyle.fillOpacity = 0.7;
                                        featureStyle.color = "#6F6E6D";
                                    }
                                    return featureStyle;
                                });
                            },
                        });
                        _this.arrayOfDefaultLayers.push(layer_2);
                        _this.topLayers[dataLayer.name] = layer_2;
                        if (index == 0) {
                            _this.defaultTopLayer = dataLayer.name;
                        }
                        else {
                        }
                        index++;
                    }
                });
            }
        });
        this.sortLayers(this.arrayOfDefaultLayers, this.topLayers, dataLayers);
    };
    DashboardItemComponent.prototype.prepareHTMLLegend = function (coloringArray, legend, dataLayer) {
        var div = '<div style="background-color:white;width:90px;height:140px;font-size: 9px;padding: 5px;z-index:-100!important;" class="legend-content">';
        div += '<table style="width:80px;text-align: center;">';
        div += '<caption><b>' + dataLayer.name + '</b></caption>';
        legend.forEach(function (leg, index) {
            div += '<tr><td style="background-color:' + coloringArray[index] + ';color:' + coloringArray[index] + ';width:20px;"></td><td>' + leg.min + ' - ' + leg.max + '</td></tr>';
        });
        div += '</div>';
        div += '</table>';
        return div;
    };
    DashboardItemComponent.prototype.sortLayers = function (defaultLayers, topLayers, dataLayers) {
        var _this = this;
        this.topLayers = {};
        this.arrayOfDefaultLayers = [];
        var cacheArray = [];
        cacheArray[0] = { Boundaries: this.boundaryLayer };
        dataLayers.forEach(function (layer) {
            var bufferObject = {};
            bufferObject[layer.name] = topLayers[layer.name];
            cacheArray[Number(layer.hook.substring(8))] = bufferObject;
        });
        cacheArray.forEach(function (sortedLayer) {
            if (sortedLayer['Boundaries']) {
                _this.topLayers['Boundaries'] = sortedLayer['Boundaries'];
                _this.arrayOfDefaultLayers.push(sortedLayer['Boundaries']);
            }
            dataLayers.forEach(function (layer) {
                if (sortedLayer[layer.name]) {
                    _this.topLayers[layer.name] = sortedLayer[layer.name];
                    _this.arrayOfDefaultLayers.push(sortedLayer[layer.name]);
                }
                else {
                }
            });
        });
    };
    DashboardItemComponent.prototype.prepareTopBoundaryLayer = function (mapObject) {
        var _this = this;
        var boundaries = {};
        console.log(mapObject.boundaryLayer);
        var boundary = mapObject.boundaryLayer;
        if (boundary) {
            var features = boundary.geoFeature;
            var featureCollection_1 = this.getGeoJsonObject(features);
            if (featureCollection_1.features.length > 0) {
                featureCollection_1.features.forEach(function (geoJsonFeature, featureIndex) {
                    /**
                     * Prepare TOp Layer
                     * */
                    var layer = L.geoJSON(featureCollection_1.features);
                    layer.setStyle(_this.getBoundaryStyle);
                    layer.on({
                        mouseover: function (event) {
                            var hoveredFeature = event.layer.feature;
                            var properties = hoveredFeature.properties;
                            var toolTipContent = "<div style='color:#333!important;'>" +
                                "<table>" +
                                "<tr><th style='color:#333!important;'>" + properties.name + "</th></tr>" +
                                "</table>" +
                                "</div>";
                            layer.closeTooltip();
                            var popUp = layer.getPopup();
                            if (popUp && popUp.isOpen()) {
                            }
                            else {
                                layer.bindTooltip(toolTipContent, {
                                    direction: 'top',
                                    permanent: false,
                                    sticky: false,
                                    interactive: true,
                                    opacity: 2
                                });
                            }
                            var featureStyle = {
                                "fillOpacity": 0.0001,
                                "opacity": 1,
                                "stroke": true,
                            };
                            var hov = hoveredFeature.properties;
                            if (hov.id == properties.id) {
                                featureStyle.fillOpacity = 0.0001;
                                featureStyle.color = "#000000";
                                featureStyle.weight = 1;
                            }
                            return featureStyle;
                        },
                        mouseout: function (event) {
                            var hoveredFeature = event.layer.feature;
                            var toolTip = layer.getTooltip();
                            if (toolTip) {
                                layer.closeTooltip();
                            }
                            layer.setStyle(function (feature) {
                                var properties = feature.properties;
                                var featureStyle = {
                                    "fillOpacity": 0.0001,
                                    "weight": 1,
                                    "opacity": 1,
                                    "stroke": true,
                                };
                                var hov = hoveredFeature.properties;
                                if (hov.id == properties.id) {
                                    featureStyle.fillOpacity = 0.0001;
                                    featureStyle.color = "#333333";
                                }
                                return featureStyle;
                            });
                        },
                    });
                    boundaries = layer;
                });
            }
        }
        return boundaries;
    };
    DashboardItemComponent.prototype.prepareDataLegend = function (dataLayer) {
        var _this = this;
        var legendSetting = dataLayer.legendSettings;
        var colorList = legendSetting.colorScale;
        var legendType = '';
        if (legendSetting.method == 2) {
            legendType = 'equalInterval';
        }
        if (legendSetting.method == 3) {
            legendType = 'equalCounts';
        }
        var dataContainer = [];
        dataLayer.organisationUnitScore.forEach(function (data) {
            if (data.value != "") {
                dataContainer.push(Number(data.value));
            }
        });
        var sortedDataContainer = dataContainer.sort(function (n1, n2) { return n1 - n2; });
        var dataRange = {
            min: sortedDataContainer[0],
            max: sortedDataContainer[sortedDataContainer.length - 1] ? sortedDataContainer[sortedDataContainer.length - 1] : sortedDataContainer[0],
            size: sortedDataContainer.length
        };
        var colorize = function (colorList) {
            if (colorList) {
                colorList = colorList.split(',');
            }
            else {
                colorList = _this.produceColorClassRange(legendSetting.classes);
            }
            return colorList;
        };
        var coloringArray = colorize(colorList);
        console.log(dataRange, legendSetting.classes, colorList, legendType);
        return function (dataElementScore, counter) {
            var legend = [];
            if (legendType == 'equalInterval') {
                legend = _this.equalIntervalLegend(sortedDataContainer, dataRange, legendSetting);
            }
            if (legendType == 'equalCounts') {
                legend = _this.equalCountsLegend(sortedDataContainer, dataRange, legendSetting);
            }
            var leg = {};
            leg[dataLayer.id] = _this.prepareHTMLLegend(coloringArray, legend, dataLayer);
            _this.legendHtml.push(leg);
            counter++;
            var decideColor = function (value, legend) {
                var colorIndex = null;
                var counts = 0;
                var countFound = false;
                if (value == "")
                    return colorIndex;
                legend.forEach(function (legendElement, legendIndex) {
                    if (!countFound) {
                        if (legendType == 'equalInterval') {
                            if (value == legendElement.min && value != legendElement.max) {
                                colorIndex = counts;
                                countFound = true;
                            }
                            else if (value == legendElement.max && value == legendElement.min) {
                                colorIndex = legend.length - 1;
                                countFound = true;
                            }
                            else if (value <= legendElement.max) {
                                colorIndex = counts;
                                countFound = true;
                            }
                            else if (value < legendElement.max && value >= legendElement.min) {
                                colorIndex = counts;
                                countFound = true;
                            }
                            else {
                                colorIndex = null;
                                countFound = false;
                            }
                        }
                        if (legendType == 'equalCounts') {
                            if (value < legendElement.max && value >= legendElement.min) {
                                colorIndex = counts;
                                countFound = true;
                            }
                            else {
                                if (value == legendElement.max && value == legendElement.min) {
                                    colorIndex = legend.length - 1;
                                    countFound = true;
                                }
                                else if (legendIndex == legend.length - 1 && value == legendElement.max) {
                                    colorIndex = legend.length - 1;
                                    countFound = true;
                                }
                                else {
                                    colorIndex = null;
                                    countFound = false;
                                }
                            }
                        }
                    }
                    else {
                        return countFound;
                    }
                    counts++;
                });
                return colorIndex;
            };
            var color = null;
            if (decideColor(dataElementScore, legend) != null) {
                color = coloringArray[decideColor(dataElementScore, legend)];
            }
            else {
                color = "rgba(255,255,255,0)";
            }
            return color;
        };
    };
    DashboardItemComponent.prototype.equalIntervalLegend = function (elements, dataRange, legendSetting) {
        var legend = [];
        var lengthOfElements = elements.length;
        var starter = dataRange.min;
        var end = dataRange.max;
        var classes = legendSetting.classes;
        var difference = Math.ceil((end - starter) / legendSetting.classes);
        var count = 0;
        if (lengthOfElements == 1) {
            for (var i = 0; i < classes; i++) {
                legend.push({
                    max: elements[0],
                    min: elements[0],
                });
            }
        }
        else {
            var maximunValue = [];
            var maximus = 0;
            for (var i = starter; i < dataRange.max; i += difference) {
                count++;
                if (count < classes) {
                    legend.push({
                        max: +(i + difference).toFixed(1),
                        min: maximunValue[maximus - 1] ? maximunValue[maximus - 1] : i,
                    });
                    maximunValue.push(+(i + difference).toFixed(1));
                    maximus++;
                }
                else {
                    legend.push({
                        max: elements[lengthOfElements - 1],
                        min: maximunValue[maximus - 1]
                    });
                }
            }
        }
        return legend;
    };
    DashboardItemComponent.prototype.equalCountsLegend = function (elements, dataRange, legendSetting) {
        var legend = [];
        var classes = legendSetting.classes;
        var lengthOfElements = elements.length;
        var count = 0;
        for (var element = 0; element < classes; element++) {
            if (element + 1 < classes) {
                if (lengthOfElements == 1) {
                    legend.push({
                        max: elements[0],
                        min: elements[0],
                    });
                }
                else {
                    console.log(elements);
                    if (elements.length < classes) {
                        if (element == classes - 2) {
                            legend.push({
                                max: elements[element],
                                min: elements[element],
                            });
                        }
                        else {
                            legend.push({
                                max: elements[element + 1],
                                min: elements[element],
                            });
                        }
                    }
                    else {
                        legend.push({
                            max: elements[element + 1],
                            min: elements[element],
                        });
                    }
                }
            }
            else {
                if (lengthOfElements == 1) {
                    legend.push({
                        max: elements[0],
                        min: elements[0],
                    });
                }
                else {
                    legend.push({
                        max: elements[elements.length - 1],
                        min: elements[elements.length - 2],
                    });
                }
            }
        }
        return legend;
    };
    DashboardItemComponent.prototype.produceColorClassRange = function (colorRange) {
        var colorClass = [];
        if (colorRange <= 9 && colorRange >= 0) {
            var counts = (100 / colorRange);
            var colorValueNumber = 0;
            for (var singleColorIndex = 0; singleColorIndex < 100; singleColorIndex += counts) {
                colorValueNumber = singleColorIndex;
                if (colorValueNumber > 100) {
                    colorValueNumber = 100;
                }
                else if (colorValueNumber < 0) {
                    colorValueNumber = 0;
                }
                var r = Math.floor((255 * colorValueNumber) / 100), g = Math.floor((255 * (100 - colorValueNumber)) / 100), b = 0;
                var rgb = 'rgba(' + r + ',' + g + ',' + b + ',1)';
                rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
                colorClass.push((rgb && rgb.length === 4) ? "#" +
                    ("0" + parseInt(rgb[1], 10).toString(16)).slice(-2) +
                    ("0" + parseInt(rgb[2], 10).toString(16)).slice(-2) +
                    ("0" + parseInt(rgb[3], 10).toString(16)).slice(-2) : '');
            }
        }
        return colorClass;
    };
    DashboardItemComponent.prototype.getStyle = function (feature) {
        var color = function () {
            var dataElementValue = feature.properties.dataelement.value;
            var style = feature.properties.legend(dataElementValue);
            return style;
        };
        var featureStyle = {
            "color": "#6F6E6D",
            "fillColor": color(),
            "fillOpacity": 0.7,
            "weight": 1,
            "opacity": 0.6,
            "stroke": true
        };
        return featureStyle;
    };
    DashboardItemComponent.prototype.getBoundaryStyle = function (feature) {
        var color = function () {
            return "#ffffff";
        };
        var featureStyle = {
            "color": "#333",
            "fillColor": color(),
            "fillOpacity": 0.0001,
            "weight": 1,
            "opacity": 1,
            "stroke": true
        };
        return featureStyle;
    };
    __decorate([
        Input(), 
        __metadata('design:type', Object)
    ], DashboardItemComponent.prototype, "itemData", void 0);
    __decorate([
        Input(), 
        __metadata('design:type', String)
    ], DashboardItemComponent.prototype, "dashboardId", void 0);
    __decorate([
        Input(), 
        __metadata('design:type', Object)
    ], DashboardItemComponent.prototype, "status", void 0);
    __decorate([
        Input(), 
        __metadata('design:type', Observable)
    ], DashboardItemComponent.prototype, "dimensionValues", void 0);
    __decorate([
        Input(), 
        __metadata('design:type', Object)
    ], DashboardItemComponent.prototype, "show_options", void 0);
    __decorate([
        Output(), 
        __metadata('design:type', EventEmitter)
    ], DashboardItemComponent.prototype, "onDelete", void 0);
    __decorate([
        Output(), 
        __metadata('design:type', EventEmitter)
    ], DashboardItemComponent.prototype, "onItemLoaded", void 0);
    __decorate([
        Input(), 
        __metadata('design:type', String)
    ], DashboardItemComponent.prototype, "customShape", void 0);
    DashboardItemComponent = __decorate([
        Component({
            selector: 'app-dashboard-item',
            templateUrl: 'dashboard-item.component.html',
            styleUrls: ['dashboard-item.component.css']
        }), 
        __metadata('design:paramtypes', [DashboardService, ActivatedRoute, Utilities, VisualizerService, Constants])
    ], DashboardItemComponent);
    return DashboardItemComponent;
}());
//# sourceMappingURL=dashboard-item.component.js.map