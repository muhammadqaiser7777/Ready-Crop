import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private backendUrl = 'http://192.168.0.102:5000/'; // Define backend URL

  constructor(private http: HttpClient) {}

  // Generic GET request
  get(endpoint: string, params?: any): Observable<any> {
    return this.http.get(`${this.backendUrl}${endpoint}`, { params });
  }

  // Generic POST request with optional options (e.g. responseType)
// back-end-service.service.ts
post(endpoint: string, data: any, options: any = {}): Observable<any> {
  return this.http.post(`${this.backendUrl}${endpoint}`, data, options);
}


  // Generic PUT request
  put(endpoint: string, data: any): Observable<any> {
    return this.http.put(`${this.backendUrl}${endpoint}`, data);
  }

  // Generic DELETE request
  delete(endpoint: string): Observable<any> {
    return this.http.delete(`${this.backendUrl}${endpoint}`);
  }
}
