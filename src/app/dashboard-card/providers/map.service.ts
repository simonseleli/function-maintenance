import { Injectable } from '@angular/core';
import {Visualization} from "../models/visualization";
import {Observable} from "rxjs";
import {Http, Response} from "@angular/http";
import {AnalyticsService} from "./analytics.service";
import {VisualizationStore} from "./visualization-store";
import {MapConfiguration} from "../models/map-configuration";
import {VisualizationLayer} from "../models/visualization-layer";
import {VisualizerService} from "./visualizer.service";
import {Constants} from "./constants";

@Injectable()
export class MapService {

  constructor(
    private visualizationStore: VisualizationStore,
    private analyticsService: AnalyticsService,
    private visualizationService: VisualizerService,
    private http: Http,
    private constant: Constants
  ) { }



  public getSanitizedMapData(mapData: Visualization, customFilters): Observable<Visualization> {
    return Observable.create(observer => {
      let mapDataFromStore = this.visualizationStore.find(mapData.id);
      if(mapDataFromStore != null) {
        if(mapDataFromStore.type != 'MAP') {
          let convertedSettings = [];

          /**
           * Check if layer has map configuration
           */
          if(!mapDataFromStore.details.hasOwnProperty('mapConfiguration')) {
            mapDataFromStore.details.mapConfiguration = this._getMapConfiguration({});
          }

          mapDataFromStore.layers.forEach(layer => {
            this._convertToMapType(layer.settings).subscribe(mapSettings => {
              /**
               * Prepare to update operating layers
               */
              if(mapSettings.length > 0) {
                mapSettings.forEach(mapLayer => {
                  convertedSettings.push(mapLayer);
                })
              }
            });
          });

          let totalRequestCount: number = convertedSettings.length;
          let requestCount: number = 0;
          let settingCount: number = 0;
          convertedSettings.forEach(setting => {
            settingCount++;
            setting.layer = 'thematic' + settingCount;
            Observable.forkJoin(
              this.analyticsService.getAnalytics(setting,'MAP',customFilters),
              this._getGeoFeatures(setting)
            ).subscribe(result => {
              requestCount++;
              setting.geoFeatures = result[1];

              mapDataFromStore.operatingLayers.push({
                settings: setting,
                analytics: result[0]
              });

              if(totalRequestCount == requestCount) {
                /**
                 * Also save in visualization store
                 */
                this.visualizationStore.createOrUpdate(mapDataFromStore);

                /**
                 * Return the sanitized data back to chart service
                 */
                observer.next(mapDataFromStore);
                observer.complete();
              }
            })
          })
        } else  {
          observer.next(mapDataFromStore);
          observer.complete();
        }

        /**
         * Also update in visualization store
         */
        this.visualizationStore.createOrUpdate(mapDataFromStore);

        /**
         * Return the sanitized data back to chart service
         */
        observer.next(mapDataFromStore);
        observer.complete();

      } else {
        if(mapData.details.hasOwnProperty('favorite')) {
          let favoriteType = mapData.details.favorite.hasOwnProperty('type') ? mapData.details.favorite.type : null;
          let favoriteId = mapData.details.favorite.hasOwnProperty('id') ? mapData.details.favorite.id : null;

          /**
           * Check if favorite has required parameters for favorite call
           */
          if(favoriteType != null && favoriteId != null) {
            this.http.get(this.constant.api + favoriteType + 's/' + favoriteId + '.json?fields=id,user,displayName~rename(name),longitude,latitude,zoom,basemap,mapViews[*,columns[dimension,filter,items[dimensionItem,dimensionItemType,displayName]],rows[dimension,filter,items[dimensionItem,dimensionItemType,displayName]],filters[dimension,filter,items[dimensionItem,dimensionItemType,displayName]],dataDimensionItems,program[id,displayName],programStage[id,displayName],legendSet[id,displayName],!lastUpdated,!href,!created,!publicAccess,!rewindRelativePeriods,!userOrganisationUnit,!userOrganisationUnitChildren,!userOrganisationUnitGrandChildren,!externalAccess,!access,!relativePeriods,!columnDimensions,!rowDimensions,!filterDimensions,!user,!organisationUnitGroups,!itemOrganisationUnitGroups,!userGroupAccesses,!indicators,!dataElements,!dataElementOperands,!dataElementGroups,!dataSets,!periods,!organisationUnitLevels,!organisationUnits,!sortOrder,!topLimit]')
              .map((res: Response) => res.json())
              .catch(error => Observable.throw(new Error(error)))
              .subscribe(favoriteResponse => {

                /**
                 * Add map configurations to map data
                 * @type {MapConfiguration}
                 */
                mapData.details.mapConfiguration = this._getMapConfiguration(favoriteResponse);

                if(favoriteResponse.hasOwnProperty('mapViews')) {
                  let responseCount: number = 0;
                  let totalResponse: number = favoriteResponse.mapViews.length;

                  favoriteResponse.mapViews.forEach(view => {
                    //Get boundary layer when dealing with different thematic layers
                    if (view.layer != 'boundary') {
                      Observable.forkJoin(
                        this.analyticsService.getAnalytics(view,mapData.type, customFilters),
                        this._getGeoFeatures(view)
                      ).subscribe(viewResult => {
                        responseCount += 1;

                        /**
                         * Add geoFeatures on map data
                         */
                        view.geoFeatures = viewResult[1];

                        /**
                         * Update map data
                         */
                        mapData.layers.push({settings: view, analytics: viewResult[0]});

                        /**
                         * Also update operating layers for runtime activities, this will be used for on fly updates
                         */
                        // mapData.operatingLayers.push({settings: view, analytics: viewResult[0]});

                        /**
                         * Check if every request has completed
                         */
                        if(responseCount == totalResponse) {
                          /**
                           * Also save in visualization store
                           */
                          console.log(mapData)
                          this.visualizationStore.createOrUpdate(mapData);

                          /**
                           * Return the sanitized data back to chart service
                           */
                          observer.next(mapData);
                          observer.complete();
                        }

                      }, viewError => {
                        observer.error(viewError);
                      })
                    } else {
                      this._getGeoFeatures(view).subscribe(geoFeatures => {
                        responseCount += 1;
                        view.geoFeatures = geoFeatures;
                        mapData.layers.push({settings: view, analytics: {}});

                        /**
                         * Check if every request has completed
                         */
                        if(responseCount == totalResponse) {
                          /**
                           * Also save in visualization store
                           */
                          this.visualizationStore.createOrUpdate(mapData);

                          /**
                           * Return the sanitized data back to chart service
                           */
                          observer.next(mapData);
                          observer.complete();
                        }
                      }, boundaryError => {
                        observer.error(boundaryError);
                      })
                    }
                  });

                } else {
                  observer.error({message: 'The object does not have map views in it'});
                }
              }, favoriteError => {
                observer.error(favoriteError)
              })
          } else {
            observer.error({message: 'Favorite essential parameters are not supplied'});
          }
        } else {
          observer.error({message: 'There is no favorite reference on this object'});
        }
      }
    })
  }

  private _getGeoFeatures(view): Observable<any> {
    return this.http.get(this._getGeoFeatureUrl(view))
      .map((res: Response) => res.json())
      .catch(error => Observable.throw(new Error(error)));
  }

  private _getGeoFeatureUrl(mapView) {
    let url: string = this.constant.api + 'geoFeatures.json?';
    url += this._getGeoFeatureParameters(mapView);
    url += "&displayProperty=NAME";
    return url;
  }

  private _getGeoFeatureParameters(mapView): string {
    let dimensionItems: any;
    let params: string = 'ou=ou:';
    let columnItems = this._findDimensionItems(mapView.columns, 'ou');
    let rowItems = this._findDimensionItems(mapView.rows, 'ou');
    let filterItems = this._findDimensionItems(mapView.filters, 'ou');
    if (columnItems != null) {
      dimensionItems = columnItems;
    } else if (rowItems != null) {
      dimensionItems = rowItems;
    } else if (filterItems != null) {
      dimensionItems = filterItems;
    }

    if (dimensionItems.length > 0) {
      dimensionItems.forEach(item => {
        params += item.dimensionItem + ";";

      })
    }
    return params;
  }

  private _findDimensionItems(dimensionHolder, dimension): any {
    let items: any = null;
    if (dimensionHolder.length > 0) {
      for (let holder of dimensionHolder) {
        if (holder.dimension == dimension) {
          items = holder.items;
          break;
        }
      }
    }
    return items;
  }

  private _getMapConfiguration(favoriteObject): MapConfiguration {
    return {
      id: favoriteObject.hasOwnProperty('id') ? favoriteObject.id : null,
      name: favoriteObject.hasOwnProperty('name') ? favoriteObject.name : null,
      basemap: favoriteObject.hasOwnProperty('basemap') ? favoriteObject.basemap : null,
      zoom: favoriteObject.hasOwnProperty('zoom') ? favoriteObject.zoom : 0,
      latitude: favoriteObject.hasOwnProperty('latitude') ? favoriteObject.latitude : 0,
      longitude: favoriteObject.hasOwnProperty('longitude') ? favoriteObject.longitude : 0
    }
  }

  private _convertToMapType(favoriteObject): Observable<any> {
    let mapLayers: any[] = [];
    return Observable.create(observer => {
      let orgUnitArray = this._getDimensionArray(favoriteObject, 'ou');
      let periodArray = this._getDimensionArray(favoriteObject, 'pe');
      let dataArray = this._getDimensionArray(favoriteObject, 'dx');

      if(dataArray.hasOwnProperty('items') && dataArray.items.length > 0) {
        dataArray.items.forEach(dataItem => {
          if(periodArray.hasOwnProperty('items') && dataArray.items.length > 0) {
            periodArray.items.forEach(periodItem => {
              let mapLayer: any = {};

              /**
               * Create data part of the new layer
               * @type {{dimension: string; items: T}}
               */
              mapLayer[dataArray.dimension] = [{
                dimension: 'dx',
                items: [dataItem]
              }];

              /**
               * Create period part of the new layer
               * @type {{dimension: string; items: T}}
               */
              mapLayer[periodArray.dimension] = [{
                dimension: 'pe',
                items: [periodItem]
              }];

              /**
               * Create orgunit part of the new layer
               * @type {{dimension: string; items: (T|any|Array|SortableItem[]|Array<any>|Highcharts.LabelItem[])}}
               */
              if(orgUnitArray.hasOwnProperty('items')) {
                mapLayer[orgUnitArray.dimension] = [{
                  dimension: 'ou',
                  items: orgUnitArray.items
                }];
              }

              mapLayers.push(mapLayer);
            })
          }
        })
      } else {
        console.warn('An error has occurred, something wrong with the favorite');
      }
      observer.next(mapLayers);
      observer.complete();
    })
  }

  private _getDimensionArray(favoriteObject, dimension) {
    let dimensionArray: any = {};
    let found: boolean = false;
    //find in the column list first
    let columnItems = this._findDimensionItems(favoriteObject.hasOwnProperty('columns') ? favoriteObject.columns : [], dimension);
    if (columnItems != null) {
      dimensionArray = {
        dimension: 'columns',
        items: columnItems
      };
      found = true;
    }

    //find in the row list if not found
    if (!found) {
      let rowItems = this._findDimensionItems(favoriteObject.hasOwnProperty('rows') ? favoriteObject.rows : [], dimension);
      if (rowItems != null) {
        dimensionArray = {
          dimension: 'rows',
          items: rowItems
        };
        found = true;
      }
    }

    //find in the filter list if still not found
    if (!found) {
      let filterItems = this._findDimensionItems(favoriteObject.hasOwnProperty('filters') ? favoriteObject.filters : [], dimension);
      if (filterItems != null) {
        dimensionArray = {
          dimension: 'filters',
          items: filterItems
        };
        found = true;
      }
    }

    return dimensionArray;

  }
}
