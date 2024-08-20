import { createSelector } from '@ngrx/store';
import { getRootState, AppState } from '../reducers';
import { selectAllUsers } from '../reducers/user.reducer';
import { User } from '../../core';
export const getUserState = createSelector(
  getRootState,
  (state: AppState) => state.user
);

export const getAllUser = createSelector(getUserState, selectAllUsers);

export const getCurrentUser = createSelector(
  getAllUser,
  (users: User[]) => users[0]
);
