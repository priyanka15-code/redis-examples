import { createReducer, on, Action } from '@ngrx/store';
import * as AuthActions from './auth.actions';

export interface AuthState {
  token: string | null;
}

const initialState: AuthState = {
  token: null,
};

export const authReducer = createReducer(
  initialState,
  on(AuthActions.loginSuccess, (state, { token }) => {
    return { ...state, token };
  }),
  on(AuthActions.logout, (state) => {
    return { ...state, token: null };
  })
);

export function reducer(state: AuthState | undefined, action: Action) {
  return authReducer(state, action);
}
