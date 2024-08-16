import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { catchError, delay, forkJoin, map, Observable, of } from 'rxjs';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private apiUrl = 'http://localhost:3000/api/';
  private cookieKey = 'authToken';

  constructor(
    private http: HttpClient,
    private router: Router,
    private cookieService: CookieService,
    
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

  registerbusiness(data: { username: string; password: string; email: string; business: string }): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}merge/register`, data);
  }

  registerback(data: { username: string; password: string; email: string; business: string }): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}back/register`, data);
  }
  
  filterByBusiness(businessId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}merge/filterByBusiness/${businessId}`);
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

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}users/get`);
  }

  getBusiness(): Observable<any[]>{
    return this.http.get<any[]>(`${this.apiUrl}business/get`);
  }

  getMerge(): Observable<any[]>{
    return this.http.get<any[]>(`${this.apiUrl}merge/get`);
  }

  deleteUser(_id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}users/delete/${_id}`);
  }

  private sendRequests(endpoint: string, createPayload: (index: number, timestamp: number) => any): Observable<any[]> {
    const numRequests = 10; 
    const requests = [];

    for (let i = 0; i < numRequests; i++) {
      const timestamp = Date.now();
      const payload = createPayload(i, timestamp);
      const request = this.http.post<{ message: string }>(`${this.apiUrl}${endpoint}`, payload);
      requests.push(request);
    }

    return forkJoin(requests);
  }

  sendUserRequests(): Observable<any[]> {
    const createUserPayload = (index: number, timestamp: number) => ({
      username: `user${index}_${timestamp}`,
      password: 'password123',
      email: `user${index}_${timestamp}@example.com`
    });

    return this.sendRequests('auth/register', createUserPayload);
  }

  sendBusinessRequests(): Observable<any[]> {
    const createBusinessPayload = (index: number, timestamp: number) => ({
      businessname: `business${index}_${timestamp}`
    });

    return this.sendRequests('business/register', createBusinessPayload);
  }

  async fetchBusinessIds(): Promise<string[]> {
    try {
      const response = await axios.get(`${this.apiUrl}business/get`);
      return response.data.map((business: { _id: string; }) => business._id);
    } catch (error: any) {
      console.error('Error fetching business IDs:', error.response ? error.response.data : error.message);
      return [];
    }
  }

  async sendRequestsSequentially(businessId: string, index: number, numberOfRequests: number): Promise<void> {
    for (let i = 0; i < numberOfRequests; i++) {
      const uniqueIndex = `${index}-${i}`; 
      const timestamp = new Date().toISOString(); 
      
      const requestPayload = {
        username: `user${uniqueIndex}_${timestamp}`,
        password: 'password123',
        email: `user${uniqueIndex}_${timestamp}@example.com`,
        business: businessId,
      };

      try {
        const response = await axios.post(`${this.apiUrl}merge/register`, requestPayload);
        console.log(`Response for request ${i} with businessId ${businessId}:`, response.data);
      } catch (error: any) {
        console.error(`Error for request ${i} with businessId ${businessId}:`, error.response ? error.response.data : error.message);
      }
    }
  }
  
  async processRequests(): Promise<void> {
    const businessIds = await this.fetchBusinessIds();

    if (businessIds.length > 3) {
      console.log('Sending requests for the first business ID...');
      await this.sendRequestsSequentially(businessIds[0], 1, 5);
      console.log('Sending requests for the 2nd business ID...');
      await this.sendRequestsSequentially(businessIds[1], 1, 5);
      console.log('Sending requests for the first business ID...');
      await this.sendRequestsSequentially(businessIds[0], 1, 10);
      console.log('Sending requests for the 3rd business ID...');
      await this.sendRequestsSequentially(businessIds[2], 1, 4);
     

      
    } else {
      console.error('No business IDs found.');
    }

    console.log('All requests sent.');
  }

  
  getUsersPaginated(page: number, limit: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}users/get?page=${page}&limit=${limit}`);
  }

  private totalItems = 10000;

  getItems(page = 1, itemsPerPage = 10): Observable<string[]> {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const items = [];

    for (let i = startIndex; i < endIndex; i++) {
      if (i < this.totalItems) {
        items.push(`Item ${i + 1}`);
      }
    }

    return of(items).pipe(delay(500));
  }

}
