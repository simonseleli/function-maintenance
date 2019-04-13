import { createSelector } from '@ngrx/store';

import { AppState, getRootState } from '../reducers';
import { CurrentVisualizationState } from '../reducers/current-visualization.reducer';

export const getCurrentVisualization = createSelector(
  getRootState,
  (state: AppState) => state.currentVisualization
);

export const getCurrentVisualizationDataSelections = createSelector(
  getCurrentVisualization,
  (currentVisualization: CurrentVisualizationState) => {
    const currentVisualizationLayers = currentVisualization.layers;
    return currentVisualizationLayers[0]
      ? currentVisualizationLayers[0].dataSelections
      : [];
  }
);
