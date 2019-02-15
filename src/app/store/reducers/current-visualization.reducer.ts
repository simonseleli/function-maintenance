import * as _ from 'lodash';
import { VisualizationLayer } from '../../shared/modules/ngx-dhis2-visualization/models';
import { generateUid } from '../../shared/modules/ngx-dhis2-visualization/helpers';
import {
  CurrentVisualizationActions,
  CurrentVisualizationActionTypes
} from '../actions/current-visualization.actions';

export interface CurrentVisualizationState {
  id: string;
  loading: boolean;
  error?: null;
  type: string;
  layers: VisualizationLayer[];
}

const initialState: CurrentVisualizationState = {
  id: generateUid(),
  loading: true,
  type: 'CHART',
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
