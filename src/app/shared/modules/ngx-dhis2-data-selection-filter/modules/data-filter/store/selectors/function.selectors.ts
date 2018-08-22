import { createSelector } from '@ngrx/store';
import * as _ from 'lodash';
import * as fromFunction from '../reducers/function.reducer';

import * as fromFunctionRuleReducer from '../reducers/function-rule.reducer';
import * as fromFunctionRuleSelectors from './function-rule.selectors';

import * as fromModels from '../models';

export const getFunctionInitiatedStatus = createSelector(
  fromFunction.getFunctionState,
  (functionState: fromFunction.State) => functionState.loadInitiated
);

export const getActiveFunctionId = createSelector(
  fromFunction.getFunctionState,
  (functionState: fromFunction.State) => functionState.activeFunctionId
);
export const getActiveFunction = createSelector(
  fromFunction.getFunctionEntities,
  getActiveFunctionId,
  (functionEntities: any, activeFunctionId: string) =>
    functionEntities[activeFunctionId]
);

export const getFunctions = createSelector(
  fromFunction.getAllFunctions,
  fromFunctionRuleReducer.getFunctionRuleEntities,
  getActiveFunctionId,
  (
    functionList: fromModels.FunctionObject[],
    functionRuleEntities: any,
    activeFunctionId: string
  ) =>
    _.map(functionList, (functionObject: fromModels.FunctionObject) => {
      return functionObject
        ? {
            ...functionObject,
            active: functionObject.id === activeFunctionId,
            rules: _.filter(
              _.map(
                functionObject.rules || [],
                ruleId => functionRuleEntities[ruleId]
              ),
              functionRule => functionRule !== null
            )
          }
        : null;
    })
);

export const getSelectedFunctions = createSelector(
  fromFunction.getAllFunctions,
  fromFunctionRuleReducer.getFunctionRuleEntities,
  (functionList: fromModels.FunctionObject[], functionRuleEntities: any) => {
    return functionList.length > 0 && _.keys(functionRuleEntities).length > 0
      ? _.filter(
          _.map(
            _.filter(
              functionList,
              (functionObject: fromModels.FunctionObject) =>
                functionObject.selected
            ),
            (selectedFunction: fromModels.FunctionObject) => {
              return selectedFunction
                ? {
                    ...selectedFunction,
                    rules: _.filter(
                      _.map(
                        selectedFunction.rules || [],
                        ruleId => functionRuleEntities[ruleId]
                      ),
                      functionRule =>
                        functionRule !== null && functionRule.selected
                    )
                  }
                : null;
            }
          ),
          functionObject => functionObject !== null
        )
      : [];
  }
);
