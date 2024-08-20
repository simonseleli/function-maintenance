import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';

// models
import { VisualizationLayer } from '../../models';

// actions
import { VisualizationLayerActionTypes } from '../actions';

export interface VisualizationLayerState
  extends EntityState<VisualizationLayer> {}

export const visualizationLayerAdapter: EntityAdapter<
  VisualizationLayer
> = createEntityAdapter<VisualizationLayer>();

const initialState: VisualizationLayerState = visualizationLayerAdapter.getInitialState(
  {}
);

export function visualizationLayerReducer(
  state: VisualizationLayerState = initialState,
  action: any
): VisualizationLayerState {
  switch (action.type) {
    case VisualizationLayerActionTypes.AddVisualizationLayers:
      return visualizationLayerAdapter.addMany(
        action.visualizationLayers,
        state
      );
    case VisualizationLayerActionTypes.ADD_VISUALIZATION_LAYER:
      return visualizationLayerAdapter.addOne(action.visualizationLayer, state);
    case VisualizationLayerActionTypes.UPDATE_VISUALIZATION_LAYER:
    case VisualizationLayerActionTypes.LOAD_VISUALIZATION_ANALYTICS_SUCCESS:
      return visualizationLayerAdapter.updateOne(
        { id: action.id, changes: action.changes },
        state
      );
    case VisualizationLayerActionTypes.UPDATE_VISUALIZATION_LAYERS: {
      return visualizationLayerAdapter.updateMany(
        action.VisualizationLayers,
        state
      );
    }
    case VisualizationLayerActionTypes.ReplaceVisualizationLayerId: {
      return visualizationLayerAdapter.updateOne(
        { id: action.currentId, changes: { id: action.newId } },
        state
      );
    }
    case VisualizationLayerActionTypes.RemoveVisualizationLayer: {
      return visualizationLayerAdapter.removeOne(action.id, state);
    }
  }
  return state;
}
