import {Component, OnInit, Input, Output, EventEmitter, ViewChild} from '@angular/core';
import {DashboardService} from "../../providers/dashboard.service";
import {ActivatedRoute} from "@angular/router";
import {Utilities} from "../../providers/utilities";
import {Constants} from "../../providers/constants";
import {VisualizerService} from "../../providers/visualizer.service";
import {Observable} from "rxjs";

/** map imports */
import {Map} from 'leaflet';
import FeatureCollection  = GeoJSON.FeatureCollection;
import StyleFunction = L.StyleFunction;
import PathOptions = L.PathOptions;
import GeoJSONOptions = L.GeoJSONOptions;
import GeoJSONEvent = L.GeoJSONEvent;
import Feature = GeoJSON.Feature;
import GeometryObject = GeoJSON.GeometryObject;

declare var $: any;
declare var L: any;
declare var L: any;
declare var localStorage: any;
declare var document: any;

export const DASHBOARD_SHAPES = {
  'NORMAL': ['col-md-4', 'col-sm-6', 'col-xs-12'],
  'DOUBLE_WIDTH': ['col-md-8', 'col-sm-6', 'col-xs-12'],
  'FULL_WIDTH': ['col-md-12', 'col-sm-12', 'col-xs-12']
}

export const VISUALIZATION_OPTIONS = [
  {type: 'CHART', shown: true, selected: false},
  {type: 'TABLE', shown: true, selected: false},
  {type: 'CHART', shown: true, selected: false},
  {type: 'CHART', shown: true, selected: false}
]

@Component({
  selector: 'app-dashboard-item',
  templateUrl: 'dashboard-item.component.html',
  styleUrls: ['dashboard-item.component.css']
})
export class DashboardItemComponent implements OnInit {

  @Input() itemData: any;
  @Input() dashboardId: string;
  @Input() status: any = {};
  @Input() dimensionValues: Observable<any>;
  @Input() show_options = true;
  @Output() onDelete: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() onItemLoaded: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() customShape: string = null;


  // @ViewChild(DashboardLayoutComponent) dashboardLayout: DashboardLayoutComponent;
  public isFullScreen: boolean;
  public isInterpretationShown: boolean;
  public interpretationReady: boolean;
  public currentVisualization: string;
  public dashboardShapeBuffer: string;
  public confirmDelete: boolean;
  public chartObjects: any[];
  public tableObjects: any[];
  public loadingChart: boolean = true;
  public loadingTable: boolean = true;
  public loadingMap: any = true;
  public displayMap: any = 'hidden';
  public chartHasError: boolean;
  public tableHasError: boolean;
  public currentChartType: string;
  public metadataIdentifiers: string;
  public chartTypes: any;


  private dataElements: any = [];
  private organisationUnits: any = {};
  private metaData: any;


  public map: Map;
  public baseMaps: any;
  public topLayers: any = {};
  public defaultTopLayer: any = "";
  public geoJsonFeatures: any;
  public geoFeatures: any;
  public dataFromAnalytics: any;
  public dataRange: any;
  public analytics: any;
  public mapProperties: any = {};
  public topSelectedLayerTitle: any = "";
  public boundary: any;
  public boundaryLayer: any;
  public overlays: any;
  public legendHtml: any = [];
  public arrayOfDefaultLayers: Array<any> = [];
  public legendPinned:boolean = false;
  public showButtonLegend:boolean = false;
  public mapId: string;
  public mapObject: any;
  public sourceType: any = null;
  public layerController: any = 'hidden';

  interpretation: string;
  customLayout: any = null;
  cardReady: boolean = false;
  cardConfiguration: any = {
    showHeadersIcons: true
  };
  orgunit_model: any = {
    selection_mode: "Usr_orgUnit",
    selected_level: "",
    show_update_button: true,
    selected_group: "",
    orgunit_levels: [],
    orgunit_groups: [],
    selected_orgunits: [],
    user_orgunits: [],
    type: "report", // can be 'data_entry'
    selected_user_orgunit: "USER_ORGUNIT"
  };
  disableOrgunit: boolean = false;
  disablePeriod: boolean = false;

  constructor(private dashboardService: DashboardService,
              private route: ActivatedRoute,
              private utility: Utilities,
              private visualizationService: VisualizerService,
              private constants: Constants) {
    this.isFullScreen = false;
    this.isInterpretationShown = this.interpretationReady = false;
    this.confirmDelete = false;
    this.chartHasError = this.tableHasError = false;
    this.chartTypes = this.constants.chartTypes;
    this.currentChartType = null;
  }

  ngOnInit() {
    this.mapId = this.itemData.id;

    //TODO find best way to disable filters
    if(this.itemData.type == 'MAP') {
      this.disableOrgunit = true;
      this.disablePeriod = true;
    }

    this.currentVisualization = this.itemData.type;
    this.dashboardShapeBuffer = this.itemData.shape;
    //load dashbordItem object
    if ((this.currentVisualization == 'CHART') ||
      (this.currentVisualization == 'EVENT_CHART') ||
      (this.currentVisualization == 'TABLE') ||
      (this.currentVisualization == 'REPORT_TABLE') ||
      (this.currentVisualization == 'EVENT_REPORT')) {
      this.updateDasboardItemForAnalyticTypeItems(this.itemData.id);
    } else if (this.currentVisualization == 'MAP') {
      this.displayMap = 'hidden';
      this.loadingMap = true;
      this.dashboardService.getMapObject(this.itemData.id, this.dashboardId).subscribe(mapObject => {
        this.displayMap = 'visible';
        this.loadingMap = false;
        this.sourceType = 'MAP';
        this.drawMap(mapObject);
      });

    } else {
      this.onItemLoaded.emit(true)
    }

    this.dimensionValues.subscribe(dimension => {
      // console.log(dimension);
      if(dimension != null) {
        this.updateDashboardCard(dimension);
      } else {

      }

    })
  }

  ngAfterViewInit() {
  }

  visualize(dashboardItemType, dataArray) {
    this.displayMap = 'hidden';
    if ((dashboardItemType == 'CHART') || (dashboardItemType == 'EVENT_CHART')) {
      this.drawChart(dataArray);
    } else if ((dashboardItemType == 'TABLE') || (dashboardItemType == 'EVENT_REPORT') || (dashboardItemType == 'REPORT_TABLE')) {
      this.drawTable(dataArray)
    } else if (dashboardItemType == 'DICTIONARY') {
      //this.metadataIdentifiers = this.dashboardService.getDashboardItemMetadataIdentifiers(this.itemData.object)
    } else if (dashboardItemType == 'MAP') {
      this.displayMap = 'hidden';
      this.loadingMap = true;
      if (dataArray.basemap) {
        this.displayMap = 'visible';
        this.loadingMap = false;
        this.drawMap(dataArray);
      } else {


        let orgunitString = this.dashboardService.getOrganisationUnitString(this.itemData.object, 'ou');
        this.dashboardService.getGeoFeature(orgunitString).subscribe(feature => {
          this.displayMap = 'visible';
          this.loadingMap = false;
          this.dashboardService.convertToMapObject(this.itemData).subscribe(response => {
            dataArray = response;
            this.drawMap(dataArray);
          });

        })
      }
    }
  }

  setVisualization(visualizationType) {
    this.currentVisualization = visualizationType;
    // this.dashboardLayout.changeVisualisation(visualizationType,this.itemData.analytic.headers);
    this.getVisualizationArray(this.itemData, visualizationType).subscribe(dataArray => {
      this.visualize(visualizationType, dataArray);
    })

  }

  getVisualizationArray(itemData: any, visualizationType): Observable<any[]> {
    return Observable.create(observer => {
      let dataArray: any[] = [];
      if (visualizationType != 'MAP') {
        if (itemData.hasOwnProperty('mapObject')) {
          itemData.mapObject.dataLayers.forEach(layer => {
            dataArray.push({object: layer.object, analytic: layer.analytic})
          });
        } else {
          dataArray = [{object: itemData.object, analytic: itemData.analytic}];
        }
      } else {
        if (itemData.hasOwnProperty('mapObject')) {
          dataArray = itemData.mapObject;
        } else {

          this.dashboardService.convertToMapObject(this.itemData);
        }
      }
      observer.next(dataArray);
      observer.complete()
    })

  }

  drawChart(dataArray: any[]) {
    let chartObjects: any[] = [];
    dataArray.forEach(data => {
      let layout: any = {};
      if (!this.utility.isNull(this.customLayout)) {
        layout['series'] = this.customLayout.series;
        layout['category'] = this.customLayout.category;
      } else {
        layout['series'] = data.object.series ? data.object.series : data.object.columns[0].dimension
        layout['category'] = data.object.category ? data.object.category : data.object.rows[0].dimension;
      }

      //manage chart types
      let chartType: string;
      if (!this.utility.isNull(this.currentChartType)) {
        chartType = this.currentChartType;
      } else {
        chartType = data.object.type ? data.object.type.toLowerCase() : 'bar'
      }

      let chartConfiguration = {
        'type': chartType,
        'title': data.object.title ? data.object.title : data.object.displayName,
        'show_labels': true,
        'xAxisType': layout.category,
        'yAxisType': layout.series
      };
      chartObjects.push(this.visualizationService.drawChart(data.analytic, chartConfiguration));
    })
    this.chartObjects = chartObjects;
    this.loadingChart = false;
  }

  drawTable(dataArray) {
    let tableObjects: any[] = [];

    dataArray.forEach(data => {
      let display_list: boolean = false;
      if (this.currentVisualization = 'EVENT_REPORT') {
        if (data.dataType == 'EVENTS') {
          display_list = true;
        }
      }
      let config = {rows: [], columns: [], hide_zeros: true, display_list: display_list};

      if (!this.utility.isNull(this.customLayout)) {
        //get columns
        if (this.customLayout.columns.length > 0) {
          this.customLayout.columns.forEach(column => {
            config.columns.push(column)
          })
        } else {
          config.columns = ['co'];
        }

        if (this.customLayout.rows.length > 0) {
          this.customLayout.rows.forEach(row => {
            config.rows.push(row)
          })
        } else {
          config.rows = ['ou', 'dx', 'pe'];
        }
      } else {
        //get columns
        if (data.object.hasOwnProperty('columns')) {
          data.object.columns.forEach(colValue => {
            if (colValue.dimension != 'dy') {
              config.columns.push(colValue.dimension);
            }
          });
        } else {
          config.columns = ['co'];
        }

        //get rows
        if (data.object.hasOwnProperty('rows')) {
          data.object.rows.forEach(rowValue => {
            if (rowValue.dimension != 'dy') {
              config.rows.push(rowValue.dimension)
            }
          })
        } else {
          config.rows = ['ou', 'dx', 'pe'];
        }
      }

      tableObjects.push(this.visualizationService.drawTable(data.analytic, config));
    });
    this.tableObjects = tableObjects;
    this.loadingTable = false;
  }

  drawMap(mapObject) {
    this.baseMaps = {
      'OpenStreetMap': L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy;<a href="https://carto.com/attribution">CARTO</a>'
      }),
      'OpenStreetMap Black&White': L.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }),
      'Esri World Imagery': L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      })
    };


    let dataLayers: any;
    /**
     * Draw Map
     * */
    let mapProperties = this.prepareMapProperties(mapObject);
    this.boundaryLayer = this.prepareTopBoundaryLayer(mapObject);

    this.mapProperties = mapProperties;
    this.getDataLayer(mapObject);
    setTimeout(() => {
      this.topSelectedLayerTitle = this.getTopSelectedLayer(this.topLayers);
      let mapConfigurations = {};
      if (mapObject.type == 'event') {
        mapConfigurations = {
          center: L.latLng(mapProperties.latitude, mapProperties.longitude),
          zoom: mapProperties.zoom,
          layers: [this.baseMaps.OpenStreetMap, this.boundaryLayer, ...this.arrayOfDefaultLayers]
        };

        this.layerController = 'hidden';
      } else {
        this.showButtonLegend = true;
        this.arrayOfDefaultLayers.push(this.boundaryLayer);
        mapConfigurations = {
          zoomControl: false,
          scrollWheelZoom: false,
          center: L.latLng(mapProperties.latitude, mapProperties.longitude),
          zoom: mapProperties.zoom,
          layers: [this.baseMaps.OpenStreetMap, ...this.arrayOfDefaultLayers]
        }

        // this.openLayerController(null);
      }


      let map = L.map(this.mapId, mapConfigurations);
      map.fitBounds(this.boundaryLayer.getBounds());

      map.on('zoomend', (a) => {
        let color = mapObject.dataLayers[0].object.eventPointColor
        $('.' + mapObject.id).css({'backgroundColor': '#' + color});
      });

      map.on("overlayadd overlayremove", (event) => {
        let color = mapObject.dataLayers[0].object.eventPointColor
        $('.' + mapObject.id).css({'backgroundColor': '#' + color});
      })


      //
      L.control.zoom({position: "topright"}).addTo(map);
      //
      L.control.layers(this.baseMaps, this.topLayers).addTo(map);
      //
      L.control.scale().addTo(map);

      // let legendDiv = L.Control.extend({
      //   options: {
      //     position: 'bottomright'
      //   },
      //   onAdd: (map) => {
      //     var selectionDiv = L.DomUtil.create('div');
      //     selectionDiv.innerHTML = this.extractLegend(this.legendHtml);
      //     selectionDiv.style.width = '100px';
      //     selectionDiv.style.height = '150px';
      //
      //     return selectionDiv;
      //   },
      //
      //   onRemove: function (map) {
      //     // Nothing to do here
      //   }
      // });
      //
      // map.addControl(new legendDiv());

      this.map = map;
    }, 10);

  }

  pinLegend(){
    this.legendPinned = !this.legendPinned;
  }
  getTopSelectedLayer(topLayers) {
    topLayers = Object.keys(topLayers);
    let layerName = "";
    topLayers.forEach(layer => {
      if (layer != "Boundaries") {
        layerName = layer;
        return false;
      }
    })

    return layerName;
  }

  closeLayerController(event) {
    if (!this.legendPinned){
      this.layerController = 'hidden';
    }

  }


  openLayerController(event) {
    this.layerController = 'visible';
    let divElement = document.getElementById('layers_division_' + this.mapId);
    divElement.innerHTML = this.extractLegend(this.legendHtml);
  }

  updateChartType(type) {
    this.loadingChart = true;
    this.currentChartType = type;

    this.getVisualizationArray(this.itemData, this.currentVisualization).subscribe(dataArray => {
      this.drawChart(dataArray);
    })
  }

  setChartType(type) {
    this.currentChartType = type;
    this.updateChartType(this.currentChartType)
  }

  //Methods for dashboard item  shape

  dashboardShapeClass(shape): Array<any> {
    return shape ? DASHBOARD_SHAPES[shape] : DASHBOARD_SHAPES['NORMAL'];
  }

  resizeDashboard(currentShape) {
    let shapes = ['NORMAL', 'DOUBLE_WIDTH', 'FULL_WIDTH'];
    let newShape = '';
    if (shapes.indexOf(currentShape) + 1 < shapes.length) {
      newShape = shapes[shapes.indexOf(currentShape) + 1]
    } else {
      newShape = shapes[0];
    }
    this.dashboardService.updateShape(this.dashboardId, this.itemData.id, newShape);

    //@todo find best way to close interpretation on normal screen
    if (newShape == 'NORMAL') {
      this.isInterpretationShown = false;
    }

    //Also resize map
    this.resizeMap()
  }

  resizeMap() {
    if(this.map) {
      setTimeout(() => {
        this.map.invalidateSize();
      }, 200);
    }
  }

  toggleFullScreen() {
    this.isFullScreen = !this.isFullScreen;
    this.resizeMap();
  }

  canShowIcons(visualizationType): boolean {
    let noFooterVisualization = ['USERS', 'REPORTS', 'RESOURCES', 'APP'];
    let canShow = true;
    noFooterVisualization.forEach(visualizationValue => {
      if (visualizationType == visualizationValue) {
        canShow = false
      }
    })
    return canShow;
  }

  toggleInterpretation() {
    if (this.isInterpretationShown) {
      this.isInterpretationShown = false;
      this.itemData.shape = this.dashboardShapeBuffer;
    } else {
      this.isInterpretationShown = true;
      if (this.itemData.shape == 'NORMAL') {
        this.dashboardShapeBuffer = this.itemData.shape;
        this.itemData.shape = 'DOUBLE_WIDTH';
      } else {
        this.dashboardShapeBuffer = this.itemData.shape;
      }
    }
  }

  deleteDashboardItem(id) {
    this.dashboardService.deleteDashboardItem(this.dashboardId, id)
      .subscribe(response => {
          this.onDelete.emit(id);
        },
        error => {
          console.log('error deleting item')
        })
  }

  updateDashboardCard(dimension) {
    //TODO find best way to update  map types
    if(this.currentVisualization != 'MAP') {
      this.updateDasboardItemForAnalyticTypeItems(this.itemData.id, dimension.length == 2 ? dimension : [dimension]);
    }
  }

  updateDasboardItemForAnalyticTypeItems(dashboardItemId, customDimensions = []) {
    this.loadingChart = true;
    this.loadingTable = true;

    this.dashboardService.getDashboardItemWithObjectAndAnalytics(this.dashboardId, dashboardItemId, customDimensions)
      .subscribe(dashboardItem => {
        this.cardReady = true;
        this.onItemLoaded.emit(true);
        this.itemData = dashboardItem;
        this.visualize(this.currentVisualization, [{object: dashboardItem.object, analytic: dashboardItem.analytic}]);
        //@todo find best way to autoplay interpretation
        this.autoplayInterpretation(dashboardItem);
      }, error => {
        this.tableHasError = this.chartHasError = true;
        this.loadingChart = this.loadingTable = false;
      })
  }

  updateDashboardItemLayout(layout) {
    this.customLayout = layout;
    this.loadingChart = this.loadingTable = true;
    this.visualize(this.currentVisualization, [{object: this.itemData.object, analytic: this.itemData.object}]);
  }

  autoplayInterpretation(dashboardItem) {
    this.interpretationReady = true;
    let interpretationIndex = 0;
    let interpretationLength = dashboardItem.object.interpretations.length;
    if (interpretationLength > 0) {
      Observable.interval(4000).subscribe(value => {
        if (interpretationIndex <= interpretationLength - 1) {
          this.interpretation = dashboardItem.object.interpretations[interpretationIndex].text;
          interpretationIndex += 1;
        } else {
          interpretationIndex = 0;
          this.interpretation = dashboardItem.object.interpretations[interpretationIndex].text
        }
      })
    }
  }

  /** start map functions */
  getDataElements(analytics, thematicLayer, rows, organisationUnits) {
    let metaDataNames: any = analytics.metaData.names;
    let period: any = this.preparePeriod(analytics.metaData.pe);

    let dataElementCarrier: any = {};
    analytics.metaData.dx.forEach((dataElementsUids) => {
      dataElementCarrier = {name: metaDataNames[dataElementsUids], uid: dataElementsUids, organisationUnitScores: [],};
    });

    if (organisationUnits) {
      organisationUnits.forEach((organisationUnit) => {
        dataElementCarrier.organisationUnitScores.push(this.getDataValue(rows, dataElementCarrier.uid, organisationUnit, period));
      });
    } else {
      analytics.metaData.ou.forEach((organisationUnit) => {
        dataElementCarrier.organisationUnitScores.push(this.getDataValue(rows, dataElementCarrier.uid, organisationUnit, period));
      });
    }

    dataElementCarrier.boundaries = organisationUnits;
    dataElementCarrier.hook = thematicLayer;

    dataElementCarrier.legendSetting = analytics.legendSetting;
    return dataElementCarrier;

  }

  preparePeriod(period) {
    let periodValue: any = "";
    if (period instanceof Array) {
      periodValue = period[0];
    }
    return periodValue;
  }

  getFeatures(geoFeatures) {
    let geoJsonTemplate: FeatureCollection<any> = {
      "type": "FeatureCollection",
      "features": []
    }


    if (geoFeatures) {
      geoFeatures.forEach((features) => {

        let sampleGeometry: any = {
          "type": "Feature",
          "geometry": {"type": "", "coordinates": []},
          "properties": {"id": "", "name": ""}
        };
        sampleGeometry.properties.id = features.id;
        sampleGeometry.properties.name = features.na;
        sampleGeometry.geometry.coordinates = JSON.parse(features.co);


        if (features.le >= 4) {
          sampleGeometry.geometry.type = 'Point';
        } else if (features.le >= 1) {
          sampleGeometry.geometry.type = 'MultiPolygon';
        }

        geoJsonTemplate.features.push(sampleGeometry);
      });

    }
    return geoJsonTemplate;
  }

  getGeoJsonObject(geoFeatures) {

    let geoFeatureArray: any = []
    geoFeatureArray = this.getFeatures(geoFeatures);
    if (geoFeatureArray) {
      return geoFeatureArray;
    }

  }

  getDataValue(rows, dataElement, organisationUnit, period) {
    let template: any = {
      dataElementId: dataElement,
      period: period,
      organisationUnitUid: organisationUnit.id ? organisationUnit.id : organisationUnit,
      organisationUnitName: organisationUnit.na ? organisationUnit.na : organisationUnit,
      dataElementValue: ""
    };

    let orgunitId = organisationUnit.id ? organisationUnit.id : organisationUnit;
    let orgunitName = organisationUnit.na ? organisationUnit.na : organisationUnit;
    if (rows.length > 0) {

      rows.forEach((row) => {

        if (row[0] == dataElement && row[1] == orgunitId) {
          template.dataElementValue = +row[2];
          return false;
        }

      })
      return template;
    } else {
      return template;
    }
  }

  calculateClusterSIze(childCount) {
    let width, height = 40;

    if (childCount < 100) {
      width = 30, height = 30;
    }

    if (childCount < 10) {
      width = 20, height = 20;
    }

    return [width, height];
  }

  calculateMarginTop(iconSize) {
    let size = iconSize[0];
    if (size == 30) {
      return 5;
    }
    if (size == 20) {
      return 2;
    }

    return 10;
  }

  getDataLayer(mapObject) {


    let dataLayers = mapObject.dataLayers;
    let layers = [];
    if (mapObject.type == 'event') {

      let analytics = null;
      let color = null;
      dataLayers.forEach(dataLayer => {
        if (dataLayer.analytic) {
          analytics = dataLayer.analytic;
          color = dataLayer.object.eventPointColor;

          let markers = L.markerClusterGroup.layerSupport({
            chunkedLoading: true, iconCreateFunction: (cluster) => {
              let markers = cluster.getAllChildMarkers();
              let iconSize = this.calculateClusterSIze(cluster.getChildCount());
              let marginTop = this.calculateMarginTop(iconSize);

              $('.' + mapObject.id).css({'backgroundColor': '#' + color});
              return L.divIcon(
                {
                  html: '<b style="margin-top:' + marginTop + 'px;">' + cluster.getChildCount() + '</b>',
                  className: 'marker-cluster ' + mapObject.id,
                  iconSize: new L.Point(iconSize[0], iconSize[1])
                }
              );
            }, showCoverageOnHover: false, spiderfyOnMaxZoom: false
          });

          markers.on('clusterclick', function (a) {
            $('.' + mapObject.id).css({'backgroundColor': '#' + color});
          });

          if (analytics) {
            analytics.rows.forEach(row => {
              let titleConfig = "<b>Water Point: </b>" + row[5] + "<br/>" + "<b>Coordinate:</b>" + row[4] + "," + row[3] + "<br/>" + "<b>Code:</b>" + row[6];
              let a = [row[4], row[3], titleConfig];
              let title = a[2];
              let marker = L.marker(L.latLng(a[0], a[1]), {
                title: title, icon: L.icon({
                  iconUrl: 'assets/marker-icon.png',
                  iconSize: [18, 27], // size of the icon
                  iconAnchor: [10, 27], // point of the icon which will correspond to marker's location
                  popupAnchor: [0, -27]
                })
              });
              marker.bindPopup(title);
              markers.addLayer(marker);
            })
          }


          layers = markers;
          this.arrayOfDefaultLayers.push(layers);
          this.topLayers[this.getClusterLayerName(dataLayer.object)] = layers;

        }
      })


    } else {
      let polygon = false;
      dataLayers.forEach(dataLayer => {
        let analytics = dataLayer.analytic;
        let features = dataLayer['geoFeature'];
        let object = dataLayer['object'];
        layers.push(this.getThematicLayer(analytics, features, object))
      })

      let index = 0;
      layers.forEach((layer, layerIndex) => {

        let layerNameArray = Object.getOwnPropertyNames(layer);
        let layerObjects = layer[layerNameArray[0]];
        let features = layer[layerNameArray[0]].features;
        let organisationUnitScores = layer[layerNameArray[0]].organisationUnitScore;
        let featureCollection = this.getGeoJsonObject(features);
        let period = "";
        let value = "";
        let scoresCount = organisationUnitScores.length;

        if (featureCollection.features.length > 0) {
          let inValue = [];

          featureCollection.features.forEach((geoJsonFeature, featureIndex) => {

            organisationUnitScores.forEach((score, scoreIndex) => {
              period = score.period;


              if (score.orgunit.id == geoJsonFeature.properties.id) {
                inValue.push(score.orgunit.id);
                value = score.value;

              } else if (scoreIndex >= scoresCount - 1 && inValue.indexOf(geoJsonFeature.properties.id) == -1) {
                value = "";
              }

              geoJsonFeature.properties.dataelement = {
                id: layerNameArray[0],
                name: layerNameArray[0],
                period: period,
                value: value
              };
            })

            if (!geoJsonFeature.properties.dataelement) {
              geoJsonFeature.properties.dataelement = {
                id: layerNameArray[0],
                name: layerNameArray[0],
                period: period,
                value: 0
              };
            }

            geoJsonFeature.properties.legend = this.prepareDataLegend(layerObjects);

          })

          // if (polygon) {
          let layer = L.geoJSON(featureCollection.features);
          layer.setStyle(this.getStyle);
          layer.on({
            click: (event) => {

              let clickedFeature: Feature<GeometryObject> = event.layer.feature;
              let properties: any = clickedFeature.properties;

              let featureName = properties.name;
              let dataElementName = properties.dataelement.name;
              let dataElementValue = properties.dataelement.value;
              let period = properties.dataelement.period;
              let popUpContent: string =
                "<div style='color:#333!important;'>" +
                "<table>" +
                "<tr><td style='color:#333!important;'>" + featureName + "</td></tr>" +
                "<tr><td style='color:#333!important;'>" + dataElementName + "</td></tr>" +
                "<tr><td style='color:#333!important;'>" + period + " : " + dataElementValue + "</td></tr>" +
                "</table>" +
                "</div>";


              let toolTip = layer.getTooltip();
              if (toolTip) {
                layer.closeTooltip();
                layer.bindPopup(popUpContent, {keepInView: true});
              } else {
                layer.bindPopup(popUpContent, {keepInView: true});
              }

            },
            add: (event) => {

              layer.closeTooltip();

              layer.closePopup();
            }
            ,

            dblclick: (event) => {

            },
            remove: (event) => {
              let toolTip = layer.getTooltip();
              if (toolTip) {
                layer.closeTooltip();
              }

              let popUp = layer.getPopup();

              if (popUp && popUp.isOpen()) {
                layer.closePopup();
              }
            },
            mouseover: (event) => {
              let hoveredFeature: Feature<GeometryObject> = event.layer.feature;
              let properties: any = hoveredFeature.properties;
              let featureName = properties.name;
              let dataElementName = properties.dataelement.name;
              let dataElementValue = properties.dataelement.value;
              let toolTipContent: string =
                "<div style='color:#333!important;'>" +
                "<table>" +
                "<tr><th style='color:#333!important;'>" + featureName + "</th>";
              if (dataElementValue == "") {
                toolTipContent += "<td style='color:#333!important;' ></td>";
              } else {

                toolTipContent += "<td style='color:#333!important;' > (" + dataElementValue + ")</td>";

              }
              toolTipContent += "</tr>" +
                "</table>" +
                "</div>";
              layer.closeTooltip();
              let popUp = layer.getPopup();
              if (popUp && popUp.isOpen()) {

              } else {
                layer.bindTooltip(toolTipContent, {
                  direction: 'top',
                  permanent: false,
                  sticky: false,
                  interactive: true,
                  opacity: 2
                })
              }

              layer.setStyle((feature: GeoJSON.Feature<GeoJSON.GeometryObject>) => {
                let properties: any = feature.properties;

                let color: any = () => {
                  let dataElementScore: any = properties.dataelement.value;

                  return (feature.properties as any).legend(dataElementScore);

                }
                let featureStyle: any =
                  {
                    "fillOpacity": 0.7,
                    "weight": 1,
                    "stroke": true,
                  }
                let hov: any = hoveredFeature.properties;
                if (hov.id == properties.id) {
                  featureStyle.opacity = 0.6;
                  featureStyle.fillOpacity = 0.7;
                  featureStyle.color = "#000000";

                }


                return featureStyle;
              });

            },
            mouseout: (event) => {
              let hoveredFeature: Feature<GeometryObject> = event.layer.feature;
              let toolTip = layer.getTooltip();
              if (toolTip) {
                layer.closeTooltip();
              }

              layer.setStyle((feature: GeoJSON.Feature<GeoJSON.GeometryObject>) => {
                let properties: any = feature.properties;

                let color: any = () => {
                  let dataElementScore: any = properties.dataelement.value;
                  return (feature.properties as any).legend(dataElementScore);

                }
                let featureStyle: any =
                  {
                    "fillOpacity": 0.7,
                    "weight": 1,
                    "opacity": 1,
                    "stroke": true,
                  }
                let hov: any = hoveredFeature.properties;
                if (hov.id == properties.id) {
                  featureStyle.fillOpacity = 0.7;
                  featureStyle.color = "#6F6E6D";
                }


                return featureStyle;
              });


            },


          });


          this.arrayOfDefaultLayers.push(layer);


          this.topLayers['Boundaries'] = this.boundaryLayer;
          this.topLayers[layerNameArray[0]] = layer;
          if (index == 0) {
            this.defaultTopLayer = layerNameArray[0];
          } else {

          }


          index++;

        }


      })

    }


    return layers;
  }

  getClusterLayerName(dataLayer) {
    let name = dataLayer.name;
    if (dataLayer) {
      if (dataLayer.dataElementDimensions && dataLayer.dataElementDimensions.length > 0) {
        dataLayer.dataElementDimensions.forEach(dimension => {
          name = dimension.filter;
        })
      }
    }
    return name;
  }

  prepareMapProperties(mapObject) {

    if (!mapObject.basemap) {
      let sampleObject = {
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
  }

  getThematicLayer(analytics, features, object) {
    let thematicLayer = {};
    let dx = analytics.metaData.dx;
    let names = analytics.metaData.names;
    let ou = analytics.metaData.ou;
    let pe = analytics.metaData.pe;
    let rows = analytics.rows;
    let legendSetting = {
      classes: object.classes,
      colorHigh: object.colorHigh,
      colorLow: object.colorLow,
      colorScale: object.colorScale,
      method: object.method
    };
    dx.forEach(
      dataElement => {
        thematicLayer[names[dataElement]] = {
          id: dataElement,
          name: names[dataElement],
          legendSettings: legendSetting,
          features: features,
          organisationUnitScore: this.getOrganisationUnitScore(dataElement, pe, ou, features, rows)
        };
      }
    )

    return thematicLayer;
  }

  extractLegend(legendArray) {
    let legends = "";
    let availableNames: any = [];
    legendArray.forEach(legend => {
      let id = Object.getOwnPropertyNames(legend);

      if (availableNames.indexOf(id + "") >= 0) {

      } else {
        availableNames.push(id + "");
        legends += legend[id + ""];
      }
    })


    return legends;
  }


  getOrganisationUnitScore(dataElement, pe, ous, features, rows) {
    let score = [];
    features.forEach(ou => {
      rows.forEach((row, index) => {
        if (isNaN(row[1])) {
          if (row[0] == dataElement && row[1] == ou.id) {
            score.push({orgunit: ou, orgunitname: ou.na, dataElement: dataElement, period: pe[0], value: row[2]});
          }
        } else {
          if (row[0] == dataElement) {
            score.push({orgunit: ou, orgunitname: ou.na, dataElement: dataElement, period: pe[0], value: row[2]});
          }
        }

      })
    })
    return score;


  }


  getCorrespondingOrgUnits(layer, layers, sourceType) {
    let organisationUnits = {};
    layers.forEach(geoLayer => {

      if (geoLayer[layer] && sourceType == "MAP") {
        organisationUnits = geoLayer[layer];
        return false;
      }

      if (geoLayer[layer] && sourceType == null) {
        let thematic = layer.split('_')[1];
        if (geoLayer[thematic]) {
          organisationUnits = geoLayer[thematic].metaData.ou;
        }

      }

    })
    return organisationUnits;
  }

  /**
   * Map Functions
   * */


  prepareTopLayers(dataLayers: any) {
    this.topLayers['Boundaries'] = this.boundaryLayer;
    this.arrayOfDefaultLayers.push(this.boundaryLayer);
    let index = 0;
    dataLayers.forEach((dataLayer, dataLayerIndex) => {
      dataLayer.features = [];
      let featureCollection = this.getGeoJsonObject(dataLayer.boundaries);
      let organisationUnitScores = dataLayer.organisationUnitScores;
      if (featureCollection.features.length > 0) {

        featureCollection.features.forEach((geoJsonFeature, featureIndex) => {
          if (dataLayer.uid == organisationUnitScores[featureIndex].dataElementId) {

            geoJsonFeature.properties.dataelement = {};
            dataLayer.organisationUnitScores[featureIndex].organisationUnitName = geoJsonFeature.properties.name;
            geoJsonFeature.properties.dataelement = {
              id: organisationUnitScores[featureIndex].dataElementId,
              name: dataLayer.name,
              period: organisationUnitScores[featureIndex].period,
              value: organisationUnitScores[featureIndex].dataElementValue
            };

            geoJsonFeature.properties.legend = this.prepareDataLegend(dataLayer);
            dataLayer.features.push(geoJsonFeature);


            /**
             * Prepare TOp Layer
             * */
            let layer = L.geoJSON(dataLayer.features);
            layer.setStyle(this.getStyle);
            layer.on({
              click: (event) => {

                let clickedFeature: Feature<GeometryObject> = event.layer.feature;
                let properties: any = clickedFeature.properties;

                let featureName = properties.name;
                let dataElementName = properties.dataelement.name;
                let dataElementValue = properties.dataelement.value;
                let period = properties.dataelement.period;
                let popUpContent: string =
                  "<div style='color:#333!important;'>" +
                  "<table>" +
                  "<tr><td style='color:#333!important;'>" + featureName + "</td></tr>" +
                  "<tr><td style='color:#333!important;'>" + dataElementName + "</td></tr>" +
                  "<tr><td style='color:#333!important;'>" + period + " : " + dataElementValue + "</td></tr>" +
                  "</table>" +
                  "</div>";


                let toolTip = layer.getTooltip();
                if (toolTip) {
                  layer.closeTooltip();
                  layer.bindPopup(popUpContent, {keepInView: true});
                } else {
                  layer.bindPopup(popUpContent, {keepInView: true});
                }

              },
              add: (event) => {

                layer.closeTooltip();

                layer.closePopup();
              }
              ,
              dblclick: (event) => {

              },
              remove: (event) => {
                let toolTip = layer.getTooltip();
                if (toolTip) {
                  layer.closeTooltip();
                }

                let popUp = layer.getPopup();

                if (popUp && popUp.isOpen()) {
                  layer.closePopup();
                }
              },
              mouseover: (event) => {
                let hoveredFeature: Feature<GeometryObject> = event.layer.feature;
                let properties: any = hoveredFeature.properties;
                let featureName = properties.name;
                let dataElementName = properties.dataelement.name;
                let dataElementValue = properties.dataelement.value;
                let toolTipContent: string =
                  "<div style='color:#333!important;'>" +
                  "<table>" +
                  "<tr><th style='color:#333!important;'>" + featureName + "</th>";
                if (dataElementValue == "") {
                  toolTipContent += "<td style='color:#333!important;' ></td>";
                } else {

                  toolTipContent += "<td style='color:#333!important;' > (" + dataElementValue + ")</td>";

                }
                toolTipContent += "</tr>" +
                  "</table>" +
                  "</div>";
                layer.closeTooltip();
                let popUp = layer.getPopup();
                if (popUp && popUp.isOpen()) {

                } else {
                  layer.bindTooltip(toolTipContent, {
                    direction: 'top',
                    permanent: false,
                    sticky: false,
                    interactive: true,
                    opacity: 2
                  })
                }

                layer.setStyle((feature: GeoJSON.Feature<GeoJSON.GeometryObject>) => {
                  let properties: any = feature.properties;

                  let color: any = () => {
                    let dataElementScore: any = properties.dataelement.value;

                    return (feature.properties as any).legend(dataElementScore);

                  }
                  let featureStyle: any =
                    {
                      "fillOpacity": 0.7,
                      "weight": 1,
                      "stroke": true,
                    }
                  let hov: any = hoveredFeature.properties;
                  if (hov.id == properties.id) {
                    featureStyle.opacity = 0.6;
                    featureStyle.fillOpacity = 0.7;
                    featureStyle.color = "#000000";

                  }


                  return featureStyle;
                });

              },
              mouseout: (event) => {
                let hoveredFeature: Feature<GeometryObject> = event.layer.feature;
                let toolTip = layer.getTooltip();
                if (toolTip) {
                  layer.closeTooltip();
                }

                layer.setStyle((feature: GeoJSON.Feature<GeoJSON.GeometryObject>) => {
                  let properties: any = feature.properties;

                  let color: any = () => {
                    let dataElementScore: any = properties.dataelement.value;
                    return (feature.properties as any).legend(dataElementScore);

                  }
                  let featureStyle: any =
                    {
                      "fillOpacity": 0.7,
                      "weight": 1,
                      "opacity": 1,
                      "stroke": true,
                    }
                  let hov: any = hoveredFeature.properties;
                  if (hov.id == properties.id) {
                    featureStyle.fillOpacity = 0.7;
                    featureStyle.color = "#6F6E6D";
                  }


                  return featureStyle;
                });


              },


            });
            this.arrayOfDefaultLayers.push(layer);
            this.topLayers[dataLayer.name] = layer;
            if (index == 0) {
              this.defaultTopLayer = dataLayer.name;
            } else {

            }


            index++;


          }
        });

      }

    })


    this.sortLayers(this.arrayOfDefaultLayers, this.topLayers, dataLayers);

  }

  prepareHTMLLegend(coloringArray, legend, dataLayer) {
    let div = '<div style="background-color:white;width:90px;height:140px;font-size: 9px;padding: 5px;z-index:-100!important;" class="legend-content">';
    div += '<table style="width:80px;text-align: center;">';
    div += '<caption><b>' + dataLayer.name + '</b></caption>';
    legend.forEach((leg, index) => {
      div += '<tr><td style="background-color:' + coloringArray[index] + ';color:' + coloringArray[index] + ';width:20px;"></td><td>' + leg.min + ' - ' + leg.max + '</td></tr>';
    })
    div += '</div>';
    div += '</table>';

    return div;
  }

  sortLayers(defaultLayers, topLayers, dataLayers) {
    this.topLayers = {};
    this.arrayOfDefaultLayers = [];
    let cacheArray = [];
    cacheArray[0] = {Boundaries: this.boundaryLayer};
    dataLayers.forEach(layer => {
      let bufferObject = {}
      bufferObject[layer.name] = topLayers[layer.name];
      cacheArray[Number(layer.hook.substring(8))] = bufferObject;
    })

    cacheArray.forEach(sortedLayer => {
      if (sortedLayer['Boundaries']) {
        this.topLayers['Boundaries'] = sortedLayer['Boundaries'];
        this.arrayOfDefaultLayers.push(sortedLayer['Boundaries']);
      }

      dataLayers.forEach(layer => {
        if (sortedLayer[layer.name]) {
          this.topLayers[layer.name] = sortedLayer[layer.name];
          this.arrayOfDefaultLayers.push(sortedLayer[layer.name]);
        } else {

        }
      })

    })

  }

  prepareTopBoundaryLayer(mapObject: any) {
    let boundaries: any = {};
    let boundary = mapObject.boundaryLayer;
    if (boundary) {

      let features: any = boundary.geoFeature;

      let featureCollection = this.getGeoJsonObject(features);

      if (featureCollection.features.length > 0) {

        featureCollection.features.forEach((geoJsonFeature, featureIndex) => {


          /**
           * Prepare TOp Layer
           * */
          let layer = L.geoJSON(featureCollection.features);
          layer.setStyle(this.getBoundaryStyle);
          layer.on({
            mouseover: (event) => {
              let hoveredFeature: Feature<GeometryObject> = event.layer.feature;

              let properties: any = hoveredFeature.properties;

              let toolTipContent: string =
                "<div style='color:#333!important;'>" +
                "<table>" +
                "<tr><th style='color:#333!important;'>" + properties.name + "</th></tr>" +
                "</table>" +
                "</div>";
              layer.closeTooltip();
              let popUp = layer.getPopup();
              if (popUp && popUp.isOpen()) {

              } else {
                layer.bindTooltip(toolTipContent, {
                  direction: 'top',
                  permanent: false,
                  sticky: false,
                  interactive: true,
                  opacity: 2
                })
              }

              let featureStyle: any =
                {
                  "fillOpacity": 0.0001,
                  "opacity": 1,
                  "stroke": true,
                }

              let hov: any = hoveredFeature.properties;
              if (hov.id == properties.id) {
                featureStyle.fillOpacity = 0.0001;
                featureStyle.color = "#000000";
                featureStyle.weight = 1;
              }

              return featureStyle;

            },
            mouseout: (event) => {
              let hoveredFeature: Feature<GeometryObject> = event.layer.feature;
              let toolTip = layer.getTooltip();
              if (toolTip) {
                layer.closeTooltip();
              }

              layer.setStyle((feature: GeoJSON.Feature<GeoJSON.GeometryObject>) => {
                let properties: any = feature.properties;

                let featureStyle: any =
                  {
                    "fillOpacity": 0.0001,
                    "weight": 1,
                    "opacity": 1,
                    "stroke": true,
                  }
                let hov: any = hoveredFeature.properties;
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
  }


  prepareDataLegend(dataLayer: any) {
    let legendSetting: any = dataLayer.legendSettings;
    let colorList: any = legendSetting.colorScale;
    let legendType = '';
    if (legendSetting.method == 2) {
      legendType = 'equalInterval';
    }


    if (legendSetting.method == 3) {
      legendType = 'equalCounts';
    }

    let dataContainer: Array<number> = [];
    dataLayer.organisationUnitScore.forEach((data) => {
      if (data.value != "") {
        dataContainer.push(Number(data.value));
      }

    })
    var sortedDataContainer: Array<number> = dataContainer.sort((n1, n2) => n1 - n2);


    let dataRange = {
      min: sortedDataContainer[0],
      max: sortedDataContainer[sortedDataContainer.length - 1] ? sortedDataContainer[sortedDataContainer.length - 1] : sortedDataContainer[0],
      size: sortedDataContainer.length
    };


    let colorize = (colorList) => {

      if (colorList) {

        colorList = colorList.split(',');

      } else {
        colorList = this.produceColorClassRange(legendSetting.classes);

      }


      return colorList;

    }

    let coloringArray: any = colorize(colorList);
    return (dataElementScore: any, counter: any) => {
      let legend: Array<Object> = [];

      if (legendType == 'equalInterval') {
        legend = this.equalIntervalLegend(sortedDataContainer, dataRange, legendSetting);
      }

      if (legendType == 'equalCounts') {
        legend = this.equalCountsLegend(sortedDataContainer, dataRange, legendSetting);
      }

      let leg = {};
      leg[dataLayer.id] = this.prepareHTMLLegend(coloringArray, legend, dataLayer);

      this.legendHtml.push(leg);

      counter++;

      let decideColor: any = (value, legend) => {
        let colorIndex: any = null;
        let counts = 0;
        let countFound = false;
        if (value == "") return colorIndex;
        legend.forEach((legendElement, legendIndex) => {

          if (!countFound) {


            if (legendType == 'equalInterval') {
              if (value == legendElement.min && value != legendElement.max) {
                colorIndex = counts;
                countFound = true;
              } else if (value == legendElement.max && value == legendElement.min) {


                colorIndex = legend.length - 1;
                countFound = true;
              } else if (value <= legendElement.max) {
                colorIndex = counts;
                countFound = true;
              } else if (value < legendElement.max && value >= legendElement.min) {
                colorIndex = counts;
                countFound = true;
              } else {
                colorIndex = null;
                countFound = false;
              }


            }

            if (legendType == 'equalCounts') {

              if (value < legendElement.max && value >= legendElement.min) {
                colorIndex = counts;
                countFound = true;
              } else {

                if (value == legendElement.max && value == legendElement.min) {
                  colorIndex = legend.length - 1;
                  countFound = true;
                } else if (legendIndex == legend.length - 1 && value == legendElement.max) {
                  colorIndex = legend.length - 1;
                  countFound = true;
                }
                else {
                  colorIndex = null;
                  countFound = false;
                }

              }

            }


          } else {

            return countFound;
          }

          counts++;
        })

        return colorIndex;
      }

      let color: any = null;
      if (decideColor(dataElementScore, legend) != null) {
        color = coloringArray[decideColor(dataElementScore, legend)];
      } else {
        color = "rgba(255,255,255,0)";
      }

      return color;
    }
  }


  equalIntervalLegend(elements, dataRange, legendSetting) {
    let legend: Array<Object> = [];
    let lengthOfElements = elements.length;
    let starter = dataRange.min;
    let end = dataRange.max;
    let classes = legendSetting.classes;


    let difference = Math.ceil((end - starter) / legendSetting.classes);
    let count = 0;

    if (lengthOfElements == 1) {
      for (let i = 0; i < classes; i++) {

        legend.push({
          max: elements[0],
          min: elements[0],
        });

      }
    } else {
      let maximunValue: Array<any> = [];
      let maximus: number = 0;
      for (let i = starter; i < dataRange.max; i += difference) {
        count++;
        if (count < classes) {
          legend.push({
            max: +(i + difference).toFixed(1),
            min: maximunValue[maximus - 1] ? maximunValue[maximus - 1] : i,
          });
          maximunValue.push(+(i + difference).toFixed(1));
          maximus++;
        } else {
          legend.push({
            max: elements[lengthOfElements - 1],
            min: maximunValue[maximus - 1]
          });
        }

      }
    }

    return legend;
  }


  equalCountsLegend(elements, dataRange, legendSetting) {
    let legend: Array<Object> = [];
    let classes = legendSetting.classes;
    let lengthOfElements = elements.length;
    let count = 0;
    for (let element = 0; element < classes; element++) {
      if (element + 1 < classes) {
        if (lengthOfElements == 1) {
          legend.push({
            max: elements[0],
            min: elements[0],
          });
        }
        else {
          if (elements.length < classes) {
            if (element == classes - 2) {
              legend.push({
                max: elements[element],
                min: elements[element],
              });
            } else {
              legend.push({
                max: elements[element + 1],
                min: elements[element],
              });
            }

          } else {
            legend.push({
              max: elements[element + 1],
              min: elements[element],
            });
          }

        }

      } else {

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
  }

  produceColorClassRange(colorRange: any) {

    let colorClass: any = [];

    if (colorRange <= 9 && colorRange >= 0) {
      let counts = (100 / colorRange);
      let colorValueNumber: any = 0;
      for (let singleColorIndex = 0; singleColorIndex < 100; singleColorIndex += counts) {
        colorValueNumber = singleColorIndex;
        if (colorValueNumber > 100) {
          colorValueNumber = 100;
        }
        else if (colorValueNumber < 0) {
          colorValueNumber = 0;
        }

        var r = Math.floor((255 * colorValueNumber) / 100),
          g = Math.floor((255 * (100 - colorValueNumber)) / 100),
          b = 0;

        let rgb: any = 'rgba(' + r + ',' + g + ',' + b + ',1)';
        rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);


        colorClass.push((rgb && rgb.length === 4) ? "#" +
          ("0" + parseInt(rgb[1], 10).toString(16)).slice(-2) +
          ("0" + parseInt(rgb[2], 10).toString(16)).slice(-2) +
          ("0" + parseInt(rgb[3], 10).toString(16)).slice(-2) : '');
      }


    }
    return colorClass;

  }

  getStyle(feature: GeoJSON.Feature<GeoJSON.GeometryObject>) {

    let color: any = () => {

      let dataElementValue: number = (feature.properties as any).dataelement.value;
      let style: number = (feature.properties as any).legend(dataElementValue);
      return style;
    }

    let featureStyle: any = {
      "color": "#6F6E6D",
      "fillColor": color(),
      "fillOpacity": 0.7,
      "weight": 1,
      "opacity": 0.6,
      "stroke": true
    }

    return featureStyle;
  }

  getBoundaryStyle(feature: GeoJSON.Feature<GeoJSON.GeometryObject>) {

    let color: any = () => {

      return "#ffffff";
    }

    let featureStyle: any = {
      "color": "#333",
      "fillColor": color(),
      "fillOpacity": 0.0001,
      "weight": 1,
      "opacity": 1,
      "stroke": true
    }

    return featureStyle;
  }

  /** end map functions */

}
