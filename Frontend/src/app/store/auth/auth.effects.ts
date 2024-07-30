import { Injectable } from '@angular/core';
import { Actions, ofType, createEffect } from '@ngrx/effects';
import {  of } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import { LoginService } from '../../login.service';
import * as AuthActions from './auth.actions';
import { CookieService } from 'ngx-cookie-service';
/* import { isNgrxMockEnvironment } from '@ngrx/store';
 */

@Injectable()
export class AuthEffects {

  constructor(private actions$: Actions, private authService: LoginService, private cookieService: CookieService) {}
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      mergeMap((action) =>
        this.authService.login(action.username, action.password).pipe(
          map((data) => AuthActions.loginSuccess({ token: data.token })),
          tap((action) => {
            this.cookieService.set('authToken', action.token);
          }),
          catchError((error) => of(AuthActions.loginFailure({ error })))
        )
      )
    )
  );
  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.register),
      mergeMap((action) =>
        this.authService
          .register(action.username, action.password, action.email)
          .pipe(
            map(() =>
              AuthActions.registerSuccess({
                username: action.username,
                password: action.password,
                email: action.email,
              })
            ),
            catchError((error) => of(AuthActions.registerFailure({ error })))
          )
      )
    )
  );

  
}


