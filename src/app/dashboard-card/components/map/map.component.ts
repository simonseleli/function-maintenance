import {Component, OnInit, Input, ViewChild, ElementRef} from '@angular/core';
import {Visualization} from "../../models/visualization";
import {MapService} from "../../providers/map.service";
import FeatureCollection  = GeoJSON.FeatureCollection;
import StyleFunction = L.StyleFunction;
import Feature = GeoJSON.Feature;
import GeometryObject = GeoJSON.GeometryObject;
import GeoJSONEvent = L.GeoJSONEvent;
// import {settings} from "cluster";

declare var L;
declare var $;
declare var document;
declare var localStorage;

export class Map {
  id: any = "";
  name: any = "";
  basemap: any = "";
  baseMaps: Object;
  height: any = "";
  mapContainer?: any = "mapContainer";
  center: Object = {latitude: 0, longitude: 0, zoom: 0};
  layers: Object = {primaryLayers: [], secondaryLayers: []};

}

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})

export class MapComponent implements OnInit {

  @Input() mapData: Visualization;
  @Input() customFilters: any[];
  loading: boolean = true;
  hasError: boolean = false;
  errorMessage: string;


  public map: Map;
  public mapInterface: any;

  constructor(private mapService: MapService,private customToolTip: ElementRef) {

  }

  ngOnInit() {
    this.mapService.getSanitizedMapData(this.mapData,this.customFilters).subscribe(sanitizedData => {
      this.mapData = sanitizedData;

      this.drawMap(this.mapData);
      this.loading = false;
    }, error => {
      this.loading = false;
      this.hasError = true;
      this.errorMessage = error.hasOwnProperty('message') ? error.message : 'Unknown error has occurred';
      console.log(error.message)
    })
  }

  /**
   * Draw map on the html template
   * @param mapObject
   */
  drawMap(mapObject) {
    let originalMapObject = mapObject;
    /**
     * Configure map object for display in the template
     * @type {L.Map}
     */
    mapObject = this.prepareMapObjectConfiguration(mapObject);
    this.map = mapObject;
    this.mapInterface = L.map(this.prepareMapContainer(mapObject.mapContainer), {
      center: L.latLng(mapObject.center.latitude, mapObject.center.longitude),
      zoom: mapObject.center.zoom-1,
      zoomControl: true,
      scrollWheelZoom: false,
    });
    /**
     * Get All necessary map information in place ie. layers and basemaps
     * @type {Map}
     */
    let mapLayers = this.prepareMapLayers(originalMapObject, mapObject.baseMaps);
    this.map.layers = mapLayers;
    mapLayers.primaryLayers.forEach((primaryLayer, primaryLayerIndex) => {
      primaryLayer.addTo(this.mapInterface);

    })

    let bufferSecondary = {};
    mapLayers.secondaryLayers.forEach((secondaryLayer, secondaryLayerIndex) => {
      // secondaryLayer.addTo(this.mapInterface);
      bufferSecondary[Object.getOwnPropertyNames(secondaryLayer)[0]] = secondaryLayer[Object.getOwnPropertyNames(secondaryLayer)[0]]
    })

    // mapLayers.secondaryLayers = bufferSecondary;
    // if (mapLayers.primaryLayers[1]) {
    //   // this.mapInterface.fitBounds(mapLayers.primaryLayers[1].getBounds());
    // }
    //
    // console.log(mapLayers.secondaryLayers);

    L.control.zoom({position: "topright"}).addTo(this.mapInterface);
    L.control.layers(mapObject.baseMaps, bufferSecondary).addTo(this.mapInterface);
    L.control.scale().addTo(this.mapInterface);

  }


  /**
   * Prepare map configuration compatible with leaflet map object
   * @param itemData
   * @returns {Map}
   */
  prepareMapObjectConfiguration(itemData): Map {
    let mapObject: Map;

    let baseMaps = {
      'OSM Light': L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy;<a href="https://carto.com/attribution">CARTO</a>'
      }),
      'OSM Black': L.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }), 'OSM Default': L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      }),
      'ESRI Imagery': L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      })
    };


    /**
     * Get map layers from itemData Object and  basemaps
     * @type {{primaryLayers: Array; secondaryLayers: Array}}
     */

    mapObject = {
      id: itemData.id,
      name: itemData.details.mapConfiguration.name,
      basemap: itemData.details.mapConfiguration.basemap,
      baseMaps: baseMaps,
      mapContainer: this.mapData.id,
      height: itemData.details.itemHeight,
      center: {
        latitude: itemData.details.mapConfiguration.latitude,
        longitude: itemData.details.mapConfiguration.longitude,
        zoom: itemData.details.mapConfiguration.zoom
      },
      layers: null
    }


    return mapObject;
  }

  /**
   * Prepare container for holding maps
   * @param mapContainer
   * @returns {any}
   */
  prepareMapContainer(mapContainer) {
    return mapContainer;
  }

  /**
   * Prepare map layers
   * @param mapObject
   * @param baseMaps
   * @returns {{primaryLayers: Array, secondaryLayers: Array}}
   */
  prepareMapLayers(mapObject, baseMaps) {

    let mapLayers = {primaryLayers: [], secondaryLayers: []};
    mapLayers.primaryLayers.push(baseMaps[Object.getOwnPropertyNames(baseMaps)[0]]);

    /**
     * Primary layers are default layers while secondary layers present for switching
     */

      // TODO: improve this section to make sure always you check operating layers first

    let availableLayers = mapObject.layers;//mapObject.operatingLayers ? mapObject.operatingLayers : mapObject.layers;
    let totalLayers = availableLayers.length;
    availableLayers.forEach(availableLayer => {

      if (availableLayer.settings.layer == "event") {
        /**
         * Handle Event Layers
         */
        let layerSetting = availableLayer.settings;
        let layerAnalytics = availableLayer.analytics;
        let secondaryLayer = {};

      }

      if (availableLayer.settings.layer == "boundary") {
        /**
         * Handle Boundary Layers
         */

        let layerSetting = availableLayer.settings;
        let layerAnalytics = availableLayer.analytics;
        let secondaryLayer = {};

        let boundaryLayer = this.prepareBoundaryLayer(layerSetting, layerAnalytics);
        secondaryLayer[boundaryLayer.name] = boundaryLayer.layer;
        mapLayers.primaryLayers.push(boundaryLayer.layer);
        mapLayers.secondaryLayers[totalLayers-1] = secondaryLayer;

      }

      if (availableLayer.settings.layer.indexOf('thematic') >= 0) {
        /**
         * Handle Thematic Layers
         */
        let layerSetting = availableLayer.settings;
        let layerAnalytics = availableLayer.analytics;
        let secondaryLayer = {};

        let thematicLayer = this.prepareThematicsLayer(layerSetting, layerAnalytics);
        secondaryLayer[thematicLayer.name] = thematicLayer.layer;
        mapLayers.primaryLayers.push(thematicLayer.layer);
        mapLayers.secondaryLayers.push(secondaryLayer);
      }
    })
    return mapLayers;
  }

  /**
   * Prepare thematic layers
   * @param layerSetting
   * @param layerAnalytics
   */
  prepareThematicsLayer(layerSetting, layerAnalytics) {
    let names = layerAnalytics.metaData.names;
    let pe = layerAnalytics.metaData.pe;
    let dx = layerAnalytics.metaData.dx;
    let ou = layerAnalytics.metaData.ou;
    let rows = layerAnalytics.rows;
    let features = this.getGeoJsonObject(layerSetting.geoFeatures).features;

    /**
     * Give each feature in a layer it's respective value
     */
    features = this.bindDataToLayers(features, names, pe, dx, ou, rows);
    let legend = this.prepareDataLegend(features, layerSetting);

    let layer = L.geoJSON(features, {
      onEachFeature: (feature, layer) => {

        // L.polyline(layer.getCenter()).bindLabel(feature.properties.name, {noHide: true}).addTo(this.mapInterface);
      },
      pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng);
      }
    });
    layer.setStyle((feature: GeoJSON.Feature<GeoJSON.GeometryObject>) => {
      let dataElementValue: number = (feature.properties as any).dataElement.value;
      let color: any = (dataElementValue) => {
        let style: number = legend(dataElementValue, 1);
        return style;
      }

      let featureStyle: any = {
        "color": "#6F6E6D",
        "fillColor": color(dataElementValue),
        "fillOpacity": layerSetting.opacity,
        "weight": 1,
        "opacity": layerSetting.opacity,
        "stroke": typeof (dataElementValue) == "number" ? true : false
      }

      return featureStyle;
    });
    layer.on(
      {
        click: (feature, layer) => {

        },
        mouseover: (event) => {
          let hoveredFeature: Feature<GeometryObject> = event.layer.feature;
          let hoveredFeatureProperties: any = hoveredFeature.properties;

          let hov: any = hoveredFeature.properties;
          let hoveredFeatureName = hoveredFeatureProperties.name;
          let dataElementName = hoveredFeatureProperties.dataElement.name;
          let dataElementValue = hoveredFeatureProperties.dataElement.value;

          let toolTipContent: string =
            "<div style='color:#333!important;font-size: 10px'>" +
            "<table>" +
            "<tr><td style='color:#333!important;'>" + hoveredFeatureName + "</td><td style='color:#333!important;' > (" + dataElementValue + ")</td>" +
            "</tr>" +
            "</table>" +
            "</div>";

          // layer.unbindTooltip();
          let popUp = layer.getPopup();
          if (typeof hoveredFeatureProperties.dataElement.value == "number") {

            this._toolTip(true,toolTipContent);

            // layer.bindTooltip(toolTipContent, {
            //   direction: 'top',
            //   permanent: false,
            //   sticky: true,
            //   interactive: true,
            //   opacity: 2
            // });
          }
          else if (typeof hoveredFeatureProperties.dataElement.value != "number") {
            // this.mapInterface.closePopup();
            this._toolTip(false,toolTipContent);
            // L.setPosition("LEONARD MPANDE",L.latLng(0,0));
          }

          // if (popUp && popUp.isOpen()) {
          //   layer.closeTooltip();
          // } else if (hov.id == properties.id && typeof properties.dataElement.value == "number") {
          //   layer.bindTooltip(toolTipContent, {
          //     direction: 'top',
          //     permanent: false,
          //     sticky: true,
          //     interactive: true,
          //     opacity: 2
          //   })
          // } else {
          //   layer.closeTooltip();
          // }

          // layer.setStyle((feature: GeoJSON.Feature<GeoJSON.GeometryObject>) => {
          //   let properties: any = feature.properties;
          //
          //   let color: any = () => {
          //     let dataElementScore: any = properties.dataElement.value;
          //
          //     return (feature.properties as any).legend(dataElementScore);
          //
          //   }
          //   let featureStyle: any =
          //     {
          //       "fillOpacity": layerSetting.opacity,
          //       "weight": 1,
          //       "stroke": false,
          //     }
          //
          //
          //   if (hov.id == properties.id && typeof properties.dataElement.value == "number") {
          //     featureStyle.weight = 3;
          //     featureStyle.opacity = 0.8;
          //     featureStyle.fillOpacity = layerSetting.opacity;
          //     featureStyle.color = "#000000";
          //     featureStyle.stroke = true;
          //   } else if (hov.id != properties.id && typeof properties.dataElement.value == "number") {
          //     featureStyle.weight = 1;
          //     featureStyle.opacity = 0.6;
          //     featureStyle.fillOpacity = layerSetting.opacity;
          //     featureStyle.stroke = true;
          //   }
          //
          //
          //   return featureStyle;
          // });

        },
        mouseout: (event) => {
          // this.mapInterface.closePopup();
          let hoveredFeature: Feature<GeometryObject> = event.layer.feature;
          let toolTip = layer.getTooltip();
          if (toolTip) {
            layer.closeTooltip();
          }

          layer.setStyle((feature: GeoJSON.Feature<GeoJSON.GeometryObject>) => {
            let properties: any = feature.properties;
            let dataElementScore: any = properties.dataElement.value;
            let settings = eval("(" + localStorage.getItem(this.mapData.id) + ")");
            let color: any = (dataElementScore) => {

              return (feature.properties as any).legend(dataElementScore);

            }
            let featureStyle: any =
              {
                "fillOpacity": layerSetting.opacity,
                "weight": 1,
                "opacity": 1,
                "stroke": typeof (dataElementScore) == "number" ? true : false,
              }
            let hov: any = hoveredFeature.properties;
            if (hov.id == properties.id && typeof properties.dataElement.value == "number") {
              featureStyle.fillOpacity = layerSetting.opacity;
              featureStyle.color = "#6F6E6D";
            }


            return featureStyle;
          });


        }


      }
    )


    return {name: layerSetting.name, layer: layer};
  }

  /**
   *
   * @param layerSetting
   * @param layerAnalytics
   * @returns {{name, layer: string}}
   */
  prepareBoundaryLayer(layerSetting, layerAnalytics){

    let boundaries: any = {};
    if (layerSetting) {

      let features: any = layerSetting.geoFeatures;

      let geoJson = this.getGeoJsonObject(features);
      let featureCollection = geoJson.features;
      let levels = geoJson.levels;
      if (featureCollection.length > 0) {

          /**
           * Prepare TOp Layer
           * */
          let layer = L.geoJSON(featureCollection);
          layer.setStyle((feature)=>{
            let color: any = () => {

              return "#ffffff";
            }

            let featureStyle: any = {
              "color": this.bondaryColor(feature,levels),
              "fillColor": color(),
              "fillOpacity": 0.0001,
              "weight": 1,
              "opacity": 1,
              "stroke": true
            }

            return featureStyle;
          });
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
      }

    }


    return {name: "Boundary", layer: boundaries};
  }


  bondaryColor(feature,levels){
    let colors = ['#333',"#3333D9","#FB5757","#FFB400","#0D7B20"];

    return levels.length==1?colors[levels.length-1]:colors[feature.le-1];
  }




  /**
   * This function takes data form analytics object and associate it
   * with it's respective organisation unit for particular thematic layer
   * @param features
   * @param names
   * @param pe
   * @param dx
   * @param ou
   * @param rows
   * @returns {any}
   */
  bindDataToLayers(features, names, pe, dx, ou, rows) {
    dx.forEach(element => {
      features.forEach((feature, featureIndex) => {
        let countLows = rows.length;
        features[featureIndex].properties['dataElement'] = {id: element, name: names[element], value: ""}
        rows.forEach((row, rowIndex) => {
          if (row[0] == element && row[1] == features[featureIndex].properties.id) {
            features[featureIndex].properties.dataElement.value = Number(row[2]);
          } else if (countLows == rowIndex) {
            features[featureIndex].properties.dataElement.value = "";
          }

        })
      })

    })
    return features
  }

  /**
   *
   * @param data
   * @param settings
   * @returns {(dataElementScore:any, counter:any)=>any}
   */
  prepareDataLegend(data, settings) {
    let legendSetting: any = settings;
    let colorList: any = legendSetting.colorScale;
    let legendType = '';
    if (legendSetting.method == 2) {
      legendType = 'equalInterval';
    }


    if (legendSetting.method == 3) {
      legendType = 'equalCounts';
    }

    let dataContainer: Array<number> = [];

    data.forEach(dataValue => {
      if (dataValue.properties.dataElement.value !== "") {
        dataContainer.push(dataValue.properties.dataElement.value);
      }

    })


    let sortedDataContainer: Array<number> = dataContainer.sort((n1, n2) => n1 - n2);


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
      // leg[dataLayer.id] = this.prepareHTMLLegend(coloringArray, legend, dataLayer);
      //
      // this.legendHtml.push(leg);

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

  /**
   *
   * @param elements
   * @param dataRange
   * @param legendSetting
   * @returns {Array<Object>}
   */
  equalIntervalLegend(elements:any, dataRange:any, legendSetting:any) {
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

  /**
   *
   * @param elements
   * @param dataRange
   * @param legendSetting
   * @returns {Array<Object>}
   */
  equalCountsLegend(elements:any, dataRange:any, legendSetting:any) {
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

  /**
   *
   * @param colorRange
   * @returns {any}
   */
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

  /**
   *
   * @param visible
   * @param htmlContent
   * @private
   */
  _toolTip(visible:boolean,htmlContent:any)
  {
    if (visible){
      this.customToolTip.nativeElement.querySelector("#customToolTip").innerHTML = htmlContent;
    }else{
      this.customToolTip.nativeElement.querySelector("#customToolTip").innerHTML = "";
      // console.log("Tooltip closed");
    }
  }

  /**
   *
   * @param geoFeatures
   * @returns {Array<Feature<any>>}
   */
  getGeoJsonObject(geoFeatures) {
    let levels:Array<Number> = [];
    let geoJsonTemplate: FeatureCollection<any> = {
      "type": "FeatureCollection",
      "features": []
    }


    if (geoFeatures) {
      geoFeatures.forEach((features) => {

        let sampleGeometry: any = {
          "type": "Feature",
          "le":features.le ,
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

        if (levels.indexOf(features.le)<0){
          levels.push(features.le)
        }

        geoJsonTemplate.features.push(sampleGeometry);
      });

    }

    if (geoJsonTemplate.features) {
      return {levels:levels,features:geoJsonTemplate.features};
    }

  }


}
