import { TableConfiguration } from '../models/table-configuration';
import * as _ from 'lodash';
export function getTableConfiguration(
  favoriteObject: any,
  visualizationLayout: any,
  type: string
): TableConfiguration {
  return {
    id: `${favoriteObject ? favoriteObject.id : _.random(1000, 1000)}_table`,
    title: favoriteObject.hasOwnProperty('displayName')
      ? favoriteObject.displayName
      : favoriteObject.hasOwnProperty('name')
      ? favoriteObject.name
      : '',
    subtitle: favoriteObject.hasOwnProperty('subtitle')
      ? favoriteObject.subtitle
      : '',
    showColumnTotal: favoriteObject.hasOwnProperty('colTotal')
      ? favoriteObject.colTotal
      : true,
    showColumnSubtotal: favoriteObject.hasOwnProperty('colSubtotal')
      ? favoriteObject.colSubtotal
      : true,
    showRowTotal: favoriteObject.hasOwnProperty('rowTotal')
      ? favoriteObject.rowTotal
      : true,
    showRowSubtotal: favoriteObject.hasOwnProperty('rowSubtotal')
      ? favoriteObject.rowSubtotal
      : true,
    showDimensionLabels: favoriteObject.hasOwnProperty('showDimensionLabels')
      ? favoriteObject.showDimensionLabels
      : true,
    hideEmptyRows: favoriteObject.hasOwnProperty('hideEmptyRows')
      ? favoriteObject.hideEmptyRows
      : true,
    showHierarchy: favoriteObject.hasOwnProperty('showHierarchy')
      ? favoriteObject.showHierarchy
      : true,
    displayList: checkForEventDataType(favoriteObject, type),
    rows: visualizationLayout.rows ? visualizationLayout.rows : ['pe'],
    columns: visualizationLayout.columns ? visualizationLayout.columns : ['dx'],
    filters: visualizationLayout.filters ? visualizationLayout.filters : ['ou'],
    legendSet: favoriteObject.legendSet || null,
    legendDisplayStrategy: favoriteObject.legendDisplayStrategy,
    styles: null
  };
}

function checkForEventDataType(favoriteObject, favoriteType): boolean {
  let displayList = false;
  if (favoriteType === 'EVENT_REPORT') {
    if (
      favoriteObject.hasOwnProperty('dataType') &&
      favoriteObject.dataType === 'EVENTS'
    ) {
      displayList = true;
    }
  }
  return displayList;
}
