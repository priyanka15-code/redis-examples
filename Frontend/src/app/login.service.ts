import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private apiUrl = 'http://localhost:3000/api/';
  private cookieKey = 'authToken';

  constructor(
    private http: HttpClient,
    private router: Router,
    private cookieService: CookieService
  ) {}

  login(username: string, password: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${this.apiUrl}auth/login`, { username, password })
      .pipe(
        map(response => {
          this.setToken(response.token);
          return response;
        })
      );
  }

  validateToken(): Observable<boolean> {
    const token = this.getToken();
    if (!token) {
      return of(false);
    }
    return this.http.post<{ valid: boolean }>(`${this.apiUrl}auth/validate-token`, { token }).pipe(
      map(response => response.valid),
      catchError(() => of(false))
    );
  }

  register(username: string, password: string, email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}auth/register`, { username, password, email });
  }

  logout(): void {
    this.cookieService.delete(this.cookieKey);
    this.router.navigate(['/']);
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

  getusers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}users/get`);
  }

  deleteUser(_id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}users/delete/${_id}`);
  }

  sendMultipleRequests(): Observable<any[]> {
    const numRequests = 100; 
    const requests = [];

    for (let i = 0; i < numRequests; i++) {
      const timestamp = Date.now();
      const request = this.http.post<{ message: string }>(`${this.apiUrl}auth/register`, {
        username: `user${i}_${timestamp}`,
        password: 'password123',
        email: `user${i}_${timestamp}@example.com`
      });
      requests.push(request);
    }

    return forkJoin(requests);
  }
  getUsersPaginated(page: number, limit: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}users/get?page=${page}&limit=${limit}`);
  }
}
