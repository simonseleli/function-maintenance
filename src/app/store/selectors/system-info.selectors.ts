import { createSelector } from '@ngrx/store';
import { getRootState, AppState } from '../reducers';
import { getSystemInfosState } from '../reducers/system-info.reducer';

export const getSystemInfoState = createSelector(
  getRootState,
  (state: AppState) => state.systemInfo
);

export const getSystemInfos = createSelector(
  getSystemInfoState,
  getSystemInfosState
);

export const getSystemInfo = createSelector(
  getSystemInfos,
  (systemInfos: any[]) => systemInfos[0]
);
