import * as _ from 'lodash';
import {
  VisualizationLayer,
  VisualizationUiConfig
} from '../../shared/modules/ngx-dhis2-visualization/models';

import {
  CurrentVisualizationActions,
  CurrentVisualizationActionTypes
} from '../actions/current-visualization.actions';
import { generateUid } from 'src/app/core';
import { getStandardizedVisualizationUiConfig } from 'src/app/shared/modules/ngx-dhis2-visualization/helpers';

export interface CurrentVisualizationState {
  id: string;
  loading: boolean;
  error?: null;
  type: string;
  isNonVisualizable?: boolean;
  uiConfig?: VisualizationUiConfig;
  layers: VisualizationLayer[];
}

const initialState: CurrentVisualizationState = {
  id: generateUid(),
  loading: true,
  type: 'CHART',
  isNonVisualizable: false,
  uiConfig: getStandardizedVisualizationUiConfig({ type: 'CHART' }),
  layers: []
};

export function currentVisualizationReducer(
  state: CurrentVisualizationState = initialState,
  action: CurrentVisualizationActions
): CurrentVisualizationState {
  switch (action.type) {
    case CurrentVisualizationActionTypes.AddOrUpdateCurrentVisualization: {
      return {
        ...state,
        ...action.currentVisualization
      };
    }

    case CurrentVisualizationActionTypes.UpdateCurrentVisualizationWithDataSelections: {
      return {
        ...state,
        layers: _.map(state.layers, layer => {
          return {
            ...layer,
            dataSelections: action.dataSelections
          };
        })
      };
    }
  }
  return state;
}
