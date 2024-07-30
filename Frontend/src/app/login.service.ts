import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthState } from './store/auth/auth.reducer';
import * as AuthActions from './store/auth/auth.actions';
import { Store } from '@ngrx/store';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private apiUrl = 'http://localhost:3000/api/auth';
  private cookieKey = 'authToken';

  constructor(private http: HttpClient, private store: Store<AuthState>,  private cookieService: CookieService) {}



  login(username: string, password: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, { username, password });
  }

  register(username: string, password: string, email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/register`, { username, password, email });
  }


  logout(): void {
    this.cookieService.delete(this.cookieKey);
    this.store.dispatch(AuthActions.logout());
  }

  getToken(): string | null {
    return this.cookieService.get(this.cookieKey);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }
  setToken(token: string): void {
    this.cookieService.set(this.cookieKey, token);
  }
}
