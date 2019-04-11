import { Action } from '@ngrx/store';
import {
  FunctionObject,
  FunctionRule
} from 'src/app/shared/modules/ngx-dhis2-data-selection-filter/modules/data-filter/models';

import { VisualizationDataSelection } from '../../shared/modules/ngx-dhis2-visualization/models';
import { CurrentVisualizationState } from '../reducers/current-visualization.reducer';

export enum CurrentVisualizationActionTypes {
  AddOrUpdateCurrentVisualization = '[CurrentVisualization] Add or Update current visualization',
  UpdateCurrentVisualizationWithDataSelections = '[CurrentVisualization] Update Current visualization with data selections',
  SimulateVisualization = '[CurrentVisualization] Simulate current visualization',
  AddVisualizationItem = '[CurrentVisualization] Add visualization Item'
}

export class AddOrUpdateCurrentVisualizationAction implements Action {
  readonly type =
    CurrentVisualizationActionTypes.AddOrUpdateCurrentVisualization;
  constructor(public currentVisualization: CurrentVisualizationState) {}
}

export class UpdateCurrentVisualizationWithDataSelectionsAction
  implements Action {
  readonly type =
    CurrentVisualizationActionTypes.UpdateCurrentVisualizationWithDataSelections;
  constructor(public dataSelections: VisualizationDataSelection[]) {}
}

export class SimulateVisualizationAction implements Action {
  readonly type = CurrentVisualizationActionTypes.SimulateVisualization;
  constructor(
    public functionObject: FunctionObject,
    public functionRule: FunctionRule,
    public simulate: boolean
  ) {}
}

export class AddVisualizationItemAction implements Action {
  readonly type = CurrentVisualizationActionTypes.AddVisualizationItem;
  constructor(public visualizationItem: any) {}
}

export type CurrentVisualizationActions =
  | AddOrUpdateCurrentVisualizationAction
  | UpdateCurrentVisualizationWithDataSelectionsAction
  | SimulateVisualizationAction
  | AddVisualizationItemAction;
