import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8080/api/auth';  // Adjust if needed

  constructor(private http: HttpClient) {}

  signup(userData: { username: string; password: string; email: string; }): Observable<any> {
    return this.http.post(`${this.baseUrl}/signup`, userData);
  }

  login(userData: { username: string; password: string; }): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, userData);
  }
}
