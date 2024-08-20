import {
  ActionReducer,
  ActionReducerMap,
  createFeatureSelector,
  createSelector,
  MetaReducer
} from '@ngrx/store';
import { environment } from '../../../environments/environment';
import { UserState, userReducer } from './user.reducer';
import { SystemInfoState, systemInfoReducer } from './system-info.reducer';
import { RouterReducerState, routerReducer } from '@ngrx/router-store';
import {
  CurrentVisualizationState,
  currentVisualizationReducer
} from './current-visualization.reducer';

export interface AppState {
  /**
   * User state
   */
  user: UserState;

  /**
   * System info state
   */
  systemInfo: SystemInfoState;

  /**
   * Router state
   */
  route: RouterReducerState;

  /**
   * Current visualization state
   */
  currentVisualization: CurrentVisualizationState;
}

export const reducers: ActionReducerMap<AppState> = {
  user: userReducer,
  systemInfo: systemInfoReducer,
  route: routerReducer,
  currentVisualization: currentVisualizationReducer
};

export const metaReducers: MetaReducer<AppState>[] = !environment.production
  ? []
  : [];

export const getRootState = (state: AppState) => state;
