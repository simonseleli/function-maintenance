import { createSelector } from '@ngrx/store';
import { getRootState, AppState } from '../reducers';
import { RouterReducerState } from '@ngrx/router-store';

export const getRouteState = createSelector(
  getRootState,
  (state: AppState) => state.route
);

export const getRouteUrl = createSelector(
  getRouteState,
  (routeState: RouterReducerState) =>
    routeState && routeState.state ? routeState.state.url : ''
);

export const getQueryParams = createSelector(
  getRouteState,
  (routeState: any) =>
    routeState && routeState.state ? routeState.state.queryParams : null
);
