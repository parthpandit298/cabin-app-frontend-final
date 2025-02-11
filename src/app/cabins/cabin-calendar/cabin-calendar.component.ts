import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Booking,BookingService } from '../../services/booking.service';

@Component({
  selector: 'app-cabin-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="header">
      <h1>Available Cabins</h1>
      <button class="signout-button" (click)="signOut()">Sign Out</button>
    </div>

    <div class="calendar-container">
      <!-- Date and Time Selector -->
      <div class="datetime-selector">
        <label for="dateSelector">Select Date:</label>
        <input type="date" id="dateSelector" [(ngModel)]="selectedDate" (change)="updateWeekFromDate()">
        <label for="startTimeSelector">Start Time:</label>
        <select id="startTimeSelector" [(ngModel)]="selectedStartTime">
          <option *ngFor="let time of timeSlots" [value]="time">{{ time }}</option>
        </select>
        <label for="durationSelector">Duration (hours):</label>
        <input type="number" id="durationSelector" [(ngModel)]="selectedDuration" min="0.5" max="8" step="0.5">
        <button class="btn-submit" (click)="submitBooking()">Submit</button>
        <p *ngIf="bookingConflict" class="conflict-message">This slot is already booked and will not be booked again.</p>
      </div>

      <h2>Cabin {{ cabinId }} Weekly Schedule</h2>

      <!-- Weekly Calendar Grid -->
      <div class="weekly-calendar">
        <div class="time-label"></div>
        <div *ngFor="let time of timeSlots" class="time-header">{{ time }}</div>

        <ng-container *ngFor="let day of daysOfWeek">
          <div class="day-label">{{ formatDate(day) }}</div>
          <div *ngFor="let time of timeSlots; let index = index" class="slot-container">
            <div 
              class="slot" 
              [class.available]="!isOccupied(day, time)" 
              [class.occupied]="isOccupied(day, time)"
              (click)="onSlotClick(day, time, index)">
              {{ getSlotStatus(day, time) }}
            </div>
          </div>
        </ng-container>
      </div>

      <button class="back-button" (click)="goBack()">Back to Cabins</button>
    </div>

    <!-- Booking & Cancel Popup -->
    <div class="modal" *ngIf="showBookingPopup">
      <div class="modal-content">
        <h3 *ngIf="!isOccupied(selectedDay, selectedSlot)">Book Slot</h3>
        <h3 *ngIf="isOccupied(selectedDay, selectedSlot)">Cancel Booking</h3>

        <p>Selected Time: {{ selectedSlot }} on {{ formatDate(selectedDay) }}</p>

        <div *ngIf="!isOccupied(selectedDay, selectedSlot)">
          <button class="btn-confirm" (click)="confirmBooking()">Confirm</button>
        </div>

        <div *ngIf="isOccupied(selectedDay, selectedSlot)">
          <p>Do you want to cancel this booking?</p>
          <button class="btn-cancel" (click)="cancelBooking()">Yes</button>
        </div>

        <button class="btn-close" (click)="showBookingPopup = false">Close</button>
      </div>
    </div>
  `,
  styles: [`
    /* (Same styles you had before) */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: #007bff;
      color: white;
      padding: 1rem 2rem;
      border-radius: 12px 12px 0 0;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    h1 { margin: 0; font-size: 2rem; }
    .signout-button {
      background-color: #dc3545;
      border: none;
      padding: 0.6rem 1.4rem;
      color: white;
      border-radius: 8px;
      cursor: pointer;
      font-weight: bold;
      transition: background-color 0.3s ease, transform 0.2s ease;
    }
    .signout-button:hover {
      background-color: #c82333;
      transform: translateY(-2px);
    }
    .calendar-container {
      max-width: 1200px;
      width: 90%;
      margin: 2rem auto;
      padding: 2rem;
      background: #fdfdfd;
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      text-align: center;
    }
    .datetime-selector {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      justify-content: center;
      align-items: center;
      margin: 1.5rem 0;
      background: #ffffff;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    /* etc... keep your existing styles */
  `]
})
export class CabinCalendarComponent implements OnInit {
  cabinId: number = 0; 
  selectedDate: string = this.getTodayDate();
  selectedStartTime: string = '';
  daysOfWeek: string[] = [];
  timeSlots = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
    '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM'
  ];

  // We'll track occupied slots in memory
  cabinSchedules: { [day: string]: { [time: string]: boolean } } = {};

  showBookingPopup = false;
  selectedDay = '';
  selectedSlot = '';
  selectedSlotIndex = -1;
  selectedDuration = 0.5;
  bookingConflict = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const paramId = params.get('id');
      if (paramId) {
        this.cabinId = +paramId;
      }
      this.updateWeekFromDate();
      // Load current bookings from backend
      this.loadBookingsFromBackend();
    });
  }

  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  updateWeekFromDate() {
    const startDate = new Date(this.selectedDate);
    this.daysOfWeek = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      return date.toISOString().split('T')[0];
    });
  }

  loadBookingsFromBackend() {
    // Get all bookings for this cabin
    this.bookingService.getCabinBookings(this.cabinId).subscribe({
      next: (bookings) => {
        // Reset local schedule info
        this.cabinSchedules = {};

        // For each booking, mark all relevant time slots as occupied
        bookings.forEach((bk) => {
          // We'll assume bk.date is in YYYY-MM-DD
          const day = bk.date;
          // We need to find the index of bk.startTime in timeSlots 
          // but let's keep it simpler by matching strings or parse times
          const startIndex = this.timeSlots.indexOf(bk.startTime);
          if (startIndex !== -1) {
            const slotsNeeded = Math.floor(bk.duration / 0.5);
            for (let i = 0; i < slotsNeeded; i++) {
              const slotIndex = startIndex + i;
              if (slotIndex < this.timeSlots.length) {
                const time = this.timeSlots[slotIndex];
                if (!this.cabinSchedules[day]) {
                  this.cabinSchedules[day] = {};
                }
                this.cabinSchedules[day][time] = true;
              }
            }
          }
        });
      },
      error: (err) => {
        console.error('Error loading cabin bookings:', err);
      }
    });
  }

  isOccupied(day: string, time: string): boolean {
    return this.cabinSchedules?.[day]?.[time] ?? false;
  }

  getSlotStatus(day: string, time: string): string {
    return this.isOccupied(day, time) ? 'Occupied' : 'Available';
  }

  onSlotClick(day: string, time: string, index: number) {
    this.selectedDay = day;
    this.selectedSlot = time;
    this.selectedSlotIndex = index;
    this.bookingConflict = this.isOccupied(day, time);
    this.showBookingPopup = true;
  }

  confirmBooking() {
    if (this.bookingConflict) {
      // Already occupied
      return;
    }
    // We'll post a new booking to the backend
    // Grab current user from localStorage for example
    const currentUser = localStorage.getItem('currentUser');

    const booking: any = {
      user: { username: currentUser }, // Or a real user ID if you have it
      cabin: { id: this.cabinId },
      date: this.selectedDay,
      startTime: this.selectedSlot,
      duration: this.selectedDuration
    };

    this.bookingService.bookCabin(booking).subscribe({
      next: (savedBooking) => {
        console.log('Booking saved:', savedBooking);
        alert('Booking successful!');
        this.showBookingPopup = false;
        // Reload bookings to see updated schedule
        this.loadBookingsFromBackend();
      },
      error: (err) => {
        console.error('Error booking cabin:', err);
        alert('Failed to book cabin. ' + (err.error || ''));
      }
    });
  }

  cancelBooking() {
    // For actual cancellation, you'd need a DELETE endpoint or a method in your backend 
    // that cancels or removes a booking. 
    // For now, let's just close the popup:
    alert('Cancel feature not implemented yet!');
    this.showBookingPopup = false;
  }

  submitBooking() {
    const index = this.timeSlots.indexOf(this.selectedStartTime);
    if (index !== -1) {
      this.onSlotClick(this.selectedDate, this.selectedStartTime, index);
    }
  }

  goBack() {
    this.router.navigate(['/cabins']);
  }

  signOut() {
    this.router.navigate(['/login']);
  }
}
