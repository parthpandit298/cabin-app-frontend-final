import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Cabin,CabinService } from '../../services/cabin.service';

@Component({
  selector: 'app-cabin-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="header">
      <h1>Available Cabins</h1>
      <button class="signout-button" (click)="signOut()">Sign Out</button>
    </div>

    <div class="cabin-container">
      <div class="cabin-grid">
        <div 
          class="cabin-card" 
          *ngFor="let cabin of cabins"
          (click)="goToCabin(cabin.id)"
        >
          <h2>{{ cabin.name }}</h2>
          <p>Next Available: {{ cabin.nextVacantTime }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
      background-color: #007bff;
      color: white;
      border-radius: 8px;
      margin-bottom: 1.5rem;
    }
    
    .signout-button {
      background-color: #dc3545;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      transition: background 0.2s ease-in-out;
    }
    
    .signout-button:hover {
      background-color: #c82333;
    }

    .cabin-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .cabin-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
      margin-top: 2rem;
    }

    .cabin-card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      cursor: pointer;
      transition: transform 0.2s;
    }

    .cabin-card:hover {
      transform: translateY(-5px);
    }

    h1 {
      margin: 0;
    }

    h2 {
      margin: 0;
      color: #007bff;
    }

    p {
      margin: 0.5rem 0 0;
      color: #666;
    }
  `]
})
export class CabinListComponent implements OnInit {
  cabins: Cabin[] = [];

  constructor(
    private router: Router,
    private cabinService: CabinService
  ) {}

  ngOnInit() {
    this.loadCabins();
  }

  loadCabins() {
    this.cabinService.getAllCabins().subscribe({
      next: (data) => {
        this.cabins = data;
      },
      error: (err) => {
        console.error('Error fetching cabins:', err);
      }
    });
  }

  goToCabin(cabinId: number) {
    this.router.navigate(['/cabin', cabinId]);
  }

  signOut() {
    localStorage.removeItem('currentUser');
    alert('You have been signed out.');
    this.router.navigate(['/login']);
  }
}
