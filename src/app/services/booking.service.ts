import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Booking {
  id?: number;
  user: any;       // or {id: number} if you have user info
  cabin: any;      // or {id: number} 
  date: string;
  startTime: string;
  duration: number;
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private baseUrl = 'http://localhost:8080/api/bookings';

  constructor(private http: HttpClient) {}

  getCabinBookings(cabinId: number): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.baseUrl}/cabin/${cabinId}`);
  }

  bookCabin(booking: Booking): Observable<Booking> {
    return this.http.post<Booking>(`${this.baseUrl}/book`, booking);
  }
}
