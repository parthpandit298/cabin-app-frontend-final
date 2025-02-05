import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

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
        <input type="number" id="durationSelector" [(ngModel)]="selectedDuration" min="0.5" max="1.5" step="0.5">
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
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: #007bff;
      color: white;
      padding: 1rem;
      border-radius: 12px 12px 0 0;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    .signout-button {
      background-color: #dc3545;
      border: none;
      padding: 0.5rem 1rem;
      color: white;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.3s ease;
    }
    .signout-button:hover {
      background-color: #c82333;
    }
    .datetime-selector {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      margin: 1.5rem 0;
      background: #f1f3f5;
      padding: 1rem;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    .datetime-selector label {
      font-weight: bold;
      color: #333;
    }
    .datetime-selector input, .datetime-selector select {
      padding: 0.5rem;
      border: 1px solid #ccc;
      border-radius: 6px;
      font-size: 1rem;
      outline: none;
    }
    .btn-submit {
      background: #007bff;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.3s ease;
    }
    .btn-submit:hover {
      background: #0056b3;
    }
    .conflict-message {
      color: red;
      font-weight: bold;
    }
    .calendar-container {
      max-width: 1200px;
      width: 90%;
      margin: 2rem auto;
      padding: 2rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
      text-align: center;
    }
    .weekly-calendar {
      display: grid;
      grid-template-columns: 120px repeat(16, 1fr);
      gap: 8px;
      background: #f9f9f9;
      border-radius: 12px;
      padding: 1.5rem;
      overflow-x: auto;
    }
    .time-header, .day-label {
      font-weight: 600;
      padding: 12px;
      background: #007bff;
      color: white;
      border-radius: 8px;
      text-align: center;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    .day-label {
      background: #2c3e50;
    }
    .slot {
      width: 100%;
      padding: 12px;
      text-align: center;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.3s ease-in-out, transform 0.2s ease-in-out;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .slot.available {
      background: #28a745;
      color: white;
    }
    .slot.occupied {
      background: #dc3545;
      color: white;
    }
    .slot:hover {
      transform: scale(1.05);
    }
    .back-button {
      margin-top: 1.5rem;
      padding: 0.75rem 1.5rem;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      cursor: pointer;
      transition: background 0.3s ease-in-out;
    }
    .back-button:hover {
      background: #0056b3;
    }
    .modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .modal-content {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      width: 350px;
      text-align: center;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    }
  `]
})
export class CabinCalendarComponent implements OnInit {
  cabinId: string = '';
  selectedDate: string = this.getTodayDate();
  selectedStartTime: string = '';
  daysOfWeek: string[] = [];
  timeSlots = [
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
    '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM'
  ];

  cabinSchedules: { [day: string]: { [time: string]: boolean } } = {};
  showBookingPopup = false;
  selectedDay = '';
  selectedSlot = '';
  selectedSlotIndex = -1;
  selectedDuration = 0.5;
  bookingConflict = false;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.cabinId = params.get('id') || '';
      this.updateWeekFromDate();
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
    this.loadBookings();
  }

  loadBookings() {
    const savedData = localStorage.getItem(`cabin_${this.cabinId}_weekly_bookings`);
    this.cabinSchedules = savedData ? JSON.parse(savedData) : {};
  }

  isOccupied(day: string, time: string): boolean {
    return this.cabinSchedules?.[day]?.[time] ?? false;
  }

  getSlotStatus(day: string, time: string): string {
    return this.isOccupied(day, time) ? "Occupied" : "Available";
  }

  onSlotClick(day: string, time: string, index: number) {
    this.selectedDay = day;
    this.selectedSlot = time;
    this.selectedSlotIndex = index;
    this.bookingConflict = this.isOccupied(day, time);
    this.showBookingPopup = true;
  }

  confirmBooking() {
    if (this.bookingConflict) return;
    const slotsToOccupy = Math.floor(this.selectedDuration / 0.5);
    for (let i = 0; i < slotsToOccupy; i++) {
      if (this.selectedSlotIndex + i < this.timeSlots.length) {
        const timeSlot = this.timeSlots[this.selectedSlotIndex + i];
        this.cabinSchedules[this.selectedDay] = this.cabinSchedules[this.selectedDay] || {};
        this.cabinSchedules[this.selectedDay][timeSlot] = true;
      }
    }
    localStorage.setItem(`cabin_${this.cabinId}_weekly_bookings`, JSON.stringify(this.cabinSchedules));
    this.showBookingPopup = false;
  }

  cancelBooking() {
    const slotsToFree = Math.floor(this.selectedDuration / 0.5);
    for (let i = 0; i < slotsToFree; i++) {
      if (this.selectedSlotIndex + i < this.timeSlots.length) {
        const timeSlot = this.timeSlots[this.selectedSlotIndex + i];
        delete this.cabinSchedules[this.selectedDay][timeSlot];
      }
    }
    localStorage.setItem(`cabin_${this.cabinId}_weekly_bookings`, JSON.stringify(this.cabinSchedules));
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
