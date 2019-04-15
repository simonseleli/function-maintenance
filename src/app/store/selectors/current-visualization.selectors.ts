import { createSelector } from '@ngrx/store';
import * as _ from 'lodash';

import { AppState, getRootState } from '../reducers';
import { CurrentVisualizationState } from '../reducers/current-visualization.reducer';
import { getActiveFunctionRule } from 'src/app/shared/modules/ngx-dhis2-data-selection-filter/modules/data-filter/store/selectors/function-rule.selectors';
import { VisualizationDataSelection } from 'src/app/shared/modules/ngx-dhis2-visualization/models';
import { FunctionRule } from 'src/app/shared/modules/ngx-dhis2-data-selection-filter/modules/data-filter/models';
import { getVisualizationLayout } from 'src/app/shared/modules/ngx-dhis2-visualization/helpers';

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

export const getSelectedFunctionParameters = createSelector(
  getCurrentVisualizationDataSelections,
  getActiveFunctionRule,
  (
    dataSelections: VisualizationDataSelection[],
    activeFunctionRule: FunctionRule
  ) => {
    // Get ou parameters
    const ouDimension = _.find(dataSelections, ['dimension', 'ou']);
    const ouParameters = _.join(
      _.map(ouDimension ? ouDimension.items : [], (item: any) => item.id),
      ';'
    );

    // Get pe parameters
    const peDimension = _.find(dataSelections, ['dimension', 'pe']);
    const peParameters = _.join(
      _.map(peDimension ? peDimension.items : [], (item: any) => item.id),
      ';'
    );

    const dimensions = (dataSelections || []).filter(
      (selection: VisualizationDataSelection) =>
        ['ou', 'pe', 'dx'].indexOf(selection.dimension) === -1
    );

    return {
      ou: ouParameters,
      pe: peParameters,
      rule: activeFunctionRule,
      layout: getVisualizationLayout(dataSelections),
      dimensions,
      success: analyticsObject => {},
      error: error => {}
    };
  }
);
