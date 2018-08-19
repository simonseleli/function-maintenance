import { Action } from '@ngrx/store';
import {
  VisualizationLayer,
  VisualizationDataSelection
} from '../../shared/modules/ngx-dhis2-visualization/models';

export enum CurrentVisualizationActionTypes {
  AddOrUpdateCurrentVisualization = '[CurrentVisualization] Add or Update current visualization',
  UpdateCurrentVisualizationWithDataSelections = '[CurrentVisualization] Update Current visualization with data selections'
}

export class AddOrUpdateCurrentVisualizationAction implements Action {
  readonly type =
    CurrentVisualizationActionTypes.AddOrUpdateCurrentVisualization;
  constructor(
    public currentVisualization: { id: string; layers: VisualizationLayer[] }
  ) {}
}

export class UpdateCurrentVisualizationWithDataSelectionsAction
  implements Action {
  readonly type =
    CurrentVisualizationActionTypes.UpdateCurrentVisualizationWithDataSelections;
  constructor(public dataSelections: VisualizationDataSelection[]) {}
}

export type CurrentVisualizationActions =
  | AddOrUpdateCurrentVisualizationAction
  | UpdateCurrentVisualizationWithDataSelectionsAction;
