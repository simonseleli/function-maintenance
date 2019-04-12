import { createSelector } from '@ngrx/store';
import * as _ from 'lodash';

import { Visualization, VisualizationLayer } from '../../models';
import { getVisualizationLayerEntities } from '../reducers';
import { getVisualizationObjectById } from './visualization-object.selectors';

export const getCurrentVisualizationObjectLayers = (layerIds: string[]) =>
  createSelector(
    getVisualizationLayerEntities,
    visualizationLayerEntities =>
      _.filter(
        _.map(
          layerIds || [],
          (layerId: string) => visualizationLayerEntities[layerId]
        ),
        (layer: VisualizationLayer) => layer !== null
      )
  );
