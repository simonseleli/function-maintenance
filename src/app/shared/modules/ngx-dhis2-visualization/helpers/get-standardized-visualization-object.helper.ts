import * as _ from 'lodash';

import { Visualization } from '../models';
import { checkIfVisualizationIsNonVisualizable } from './check-if-visualization-is-non-visualizable.helper';
import { getStandardizedVisualizationUiConfig } from './get-standardized-visualization-ui-config.helper';

export function getStandardizedVisualizationObject(
  visualizationItem: any
): Visualization {
  const isNonVisualizable = checkIfVisualizationIsNonVisualizable(
    visualizationItem.type
  );
  const visualizationObject = {
    id: visualizationItem.id,
    title: getVisualizationTitle(visualizationItem),
    name: getVisualizationName(visualizationItem),
    type: visualizationItem.type,
    favorite: getFavoriteDetails(visualizationItem),
    created: visualizationItem.created,
    appKey: visualizationItem.appKey,
    lastUpdated: visualizationItem.lastUpdated,
    isNew: visualizationItem.isNew,
    isNonVisualizable,
    uiConfig: getStandardizedVisualizationUiConfig(visualizationItem),
    progress: {
      statusCode: 200,
      statusText: 'OK',
      percent: 0,
      message: 'Loading..'
    },
    layers: getVisualizationLayers(visualizationItem)
  };
  return visualizationObject;
}

function getVisualizationLayers(visualizationItem: any) {
  if (!visualizationItem) {
    return [];
  }

  const favoriteItemArray =
    visualizationItem[_.camelCase(visualizationItem.type)];

  return _.isArray(favoriteItemArray)
    ? (favoriteItemArray || []).map((item: any) => item.id)
    : [];
}

function getVisualizationName(visualizationItem: any) {
  if (!visualizationItem) {
    return null;
  }

  switch (visualizationItem.type) {
    case 'APP':
      return visualizationItem.appKey;
    case 'MESSAGES':
      return 'Messages';
    case 'RESOURCES':
      return 'Resources';
    case 'REPORTS':
      return 'Reports';
    case 'USERS':
      return 'Users';
    default:
      return visualizationItem.name
        ? visualizationItem.name
        : visualizationItem.type &&
          visualizationItem.hasOwnProperty(_.camelCase(visualizationItem.type))
        ? _.isPlainObject(
            visualizationItem[_.camelCase(visualizationItem.type)]
          )
          ? visualizationItem[_.camelCase(visualizationItem.type)].displayName
          : 'Untitled'
        : 'Untitled';
  }
}

function getVisualizationTitle(visualizationItem: any) {
  return visualizationItem.title
    ? visualizationItem.title
    : visualizationItem.type &&
      visualizationItem.hasOwnProperty(_.camelCase(visualizationItem.type))
    ? _.isPlainObject(visualizationItem[_.camelCase(visualizationItem.type)])
      ? visualizationItem[_.camelCase(visualizationItem.type)].title
      : undefined
    : undefined;
}

function getFavoriteDetails(visualizationItem: any) {
  if (!visualizationItem) {
    return null;
  }
  const favoriteItem = visualizationItem[_.camelCase(visualizationItem.type)];
  return _.isPlainObject(favoriteItem)
    ? {
        id: favoriteItem.id,
        type: _.camelCase(visualizationItem.type),
        name: getVisualizationName(visualizationItem),
        useTypeAsBase: true,
        requireAnalytics: true
      }
    : null;
}
