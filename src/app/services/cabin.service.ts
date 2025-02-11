import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Cabin {
  id: number;
  name: string;
  nextVacantTime: string;
}

@Injectable({
  providedIn: 'root'
})
export class CabinService {
  private baseUrl = 'http://localhost:8080/api/cabins';

  constructor(private http: HttpClient) {}

  getAllCabins(): Observable<Cabin[]> {
    return this.http.get<Cabin[]>(this.baseUrl);
  }
}
