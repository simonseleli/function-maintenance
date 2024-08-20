import { createSelector } from '@ngrx/store';

import { Visualization } from '../../models';
import {
  getVisualizationObjectEntities,
  getVisualizationLayerEntities
} from '../reducers';
import { getCurrentVisualizationConfig } from './visualization-configuration.selectors';
import { getCurrentVisualizationObjectLayers } from './visualization-layer.selectors';

export const getVisualizationObjectById = id =>
  createSelector(
    getVisualizationObjectEntities,
    visualizationObjectEntity => visualizationObjectEntity[id]
  );

export const getCombinedVisualizationObjectById = id =>
  createSelector(
    getVisualizationObjectById(id),
    getVisualizationLayerEntities,
    (visualizationObject, visualizationLayerEntities) => {
      return visualizationObject
        ? {
            ...visualizationObject,
            layers: (visualizationObject.layers || [])
              .map((layerId: string) => visualizationLayerEntities[layerId])
              .filter(layer => layer)
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
