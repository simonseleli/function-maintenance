import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { FunctionRule } from '../models/function-rule.model';
import {
  FunctionRuleActions,
  FunctionRuleActionTypes
} from '../actions/function-rule.actions';
import { createSelector, createFeatureSelector } from '@ngrx/store';

export interface State extends EntityState<FunctionRule> {
  // additional entities state properties
  activeFunctionRuleId: string;
}

export const adapter: EntityAdapter<FunctionRule> = createEntityAdapter<
  FunctionRule
>();

export const initialState: State = adapter.getInitialState({
  // additional entity state properties
  activeFunctionRuleId: ''
});

export function reducer(
  state = initialState,
  action: FunctionRuleActions
): State {
  switch (action.type) {
    case FunctionRuleActionTypes.AddFunctionRule: {
      return adapter.addOne(action.payload.functionRule, state);
    }

    case FunctionRuleActionTypes.UpsertFunctionRule: {
      return adapter.upsertOne(action.payload.functionRule, state);
    }

    case FunctionRuleActionTypes.AddFunctionRules: {
      return adapter.addMany(action.functionRules, {
        ...state,
        activeFunctionRuleId:
          action.functionRules && action.functionRules[0]
            ? action.functionRules[0].id
            : ''
      });
    }

    case FunctionRuleActionTypes.UpsertFunctionRules: {
      return adapter.upsertMany(action.payload.functionRules, state);
    }

    case FunctionRuleActionTypes.UpdateFunctionRule: {
      return adapter.updateOne(
        { id: action.id, changes: action.changes },
        state
      );
    }

    case FunctionRuleActionTypes.UpdateFunctionRules: {
      return adapter.updateMany(action.payload.functionRules, state);
    }

    case FunctionRuleActionTypes.DeleteFunctionRule: {
      return adapter.removeOne(action.payload.id, state);
    }

    case FunctionRuleActionTypes.DeleteFunctionRules: {
      return adapter.removeMany(action.payload.ids, state);
    }

    case FunctionRuleActionTypes.LoadFunctionRules: {
      return adapter.addAll(action.payload.functionRules, state);
    }

    case FunctionRuleActionTypes.ClearFunctionRules: {
      return adapter.removeAll(state);
    }

    case FunctionRuleActionTypes.SetActiveFunctionRule: {
      return action.functionRule
        ? { ...state, activeFunctionRuleId: action.functionRule.id }
        : state;
    }

    default: {
      return state;
    }
  }
}

export const getFunctionRuleState = createFeatureSelector<State>(
  'functionRule'
);

export const {
  selectEntities: getFunctionRuleEntities,
  selectAll: getAllFunctionRules
} = adapter.getSelectors(getFunctionRuleState);
