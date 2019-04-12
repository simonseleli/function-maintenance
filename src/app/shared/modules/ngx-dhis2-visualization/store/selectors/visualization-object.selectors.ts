import { createSelector } from '@ngrx/store';

import { Visualization } from '../../models';
import { getVisualizationObjectEntities } from '../reducers';
import { getCurrentVisualizationConfig } from './visualization-configuration.selectors';
import { getCurrentVisualizationObjectLayers } from './visualization-layer.selectors';

export const getVisualizationObjectById = id =>
  createSelector(
    getVisualizationObjectEntities,
    visualizationObjectEntity => {
      console.log('called');
      return visualizationObjectEntity[id];
    }
  );

export const getCombinedVisualizationObjectById = id =>
  createSelector(
    getVisualizationObjectById(id),
    getCurrentVisualizationConfig(id),
    getCurrentVisualizationObjectLayers(id),
    (visualizationObject, visualizationConfig, visualizationLayers) => {
      return visualizationObject
        ? {
            ...visualizationObject,
            config: visualizationConfig,
            layers: visualizationLayers
          }
        : null;
    }
  );

export const getCurrentVisualizationProgress = id =>
  createSelector(
    getVisualizationObjectById(id),
    (visualizationObject: Visualization) =>
      visualizationObject ? visualizationObject.progress : null
  );
