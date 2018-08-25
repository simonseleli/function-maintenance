import { Action } from '@ngrx/store';
import {
  VisualizationLayer,
  VisualizationDataSelection
} from '../../shared/modules/ngx-dhis2-visualization/models';
import {
  FunctionObject,
  FunctionRule
} from '../../shared/modules/ngx-dhis2-data-selection-filter/modules/data-filter/store/models';

export enum CurrentVisualizationActionTypes {
  AddOrUpdateCurrentVisualization = '[CurrentVisualization] Add or Update current visualization',
  UpdateCurrentVisualizationWithDataSelections = '[CurrentVisualization] Update Current visualization with data selections',
  SimulateVisualization = '[CurrentVisualization] Simulate current visualization',
  AddVisualizationItem = '[CurrentVisualization] Add visualization Item'
}

export class AddOrUpdateCurrentVisualizationAction implements Action {
  readonly type =
    CurrentVisualizationActionTypes.AddOrUpdateCurrentVisualization;
  constructor(
    public currentVisualization: {
      id: string;
      type: string;
      layers: VisualizationLayer[];
    }
  ) {}
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
