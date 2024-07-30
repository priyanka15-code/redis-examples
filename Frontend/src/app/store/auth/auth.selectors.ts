import { createSelector } from '@ngrx/store';
import { AuthState } from './auth.reducer';

export const selectAuthState = (state: { auth: AuthState }) => state.auth;

export const isAuthenticated = createSelector(
  selectAuthState,
  (authState: AuthState) => {
   
    return authState?.token != null;
  }
);
