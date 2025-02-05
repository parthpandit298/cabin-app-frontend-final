import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="auth-container">
      <div class="auth-box">
        <h2>Sign Up</h2>
        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="username">Username</label>
            <input
              type="text"
              id="username"
              [(ngModel)]="username"
              name="username"
              required
            />
            @if (usernameError) {
              <p class="error">{{ usernameError }}</p>
            }
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              [(ngModel)]="email"
              name="email"
              required
            />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              [(ngModel)]="password"
              name="password"
              required
            />
            @if (passwordError) {
              <p class="error">{{ passwordError }}</p>
            }
          </div>

          <button type="submit">Sign Up</button>
        </form>
        <p>
          Already have an account?
          <a routerLink="/login">Login</a>
        </p>
      </div>
    </div>
  `,
  styles: [
    `
      .auth-container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        background-color: #f5f5f5;
      }
      .auth-box {
        background: white;
        padding: 2rem;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        width: 100%;
        max-width: 400px;
      }
      .form-group {
        margin-bottom: 1rem;
      }
      label {
        display: block;
        margin-bottom: 0.5rem;
      }
      input {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #ddd;
        border-radius: 4px;
      }
      button {
        width: 100%;
        padding: 0.75rem;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
      button:hover {
        background-color: #0056b3;
      }
      p {
        text-align: center;
        margin-top: 1rem;
      }
      .error {
        color: red;
        font-size: 0.875rem;
        margin-top: 0.25rem;
      }
    `,
  ],
})
export class SignupComponent {
  username = '';
  email = '';
  password = '';
  usernameError = '';
  passwordError = '';

  constructor(private router: Router) {}

  onSubmit() {
    this.usernameError = '';
    this.passwordError = '';

    // Check if username meets requirements (1 capital letter & 1 number)
    const usernameRegex = /^(?=.*[A-Z])(?=.*\d).+$/;
    if (!usernameRegex.test(this.username)) {
      this.usernameError = 'Username must include at least 1 capital letter and 1 number.';
      return;
    }

    // Check if username already exists (mock logic)
    const existingUsers = ['User1', 'Admin123'];
    if (existingUsers.includes(this.username)) {
      this.usernameError = 'Username already exists. Please choose another.';
      return;
    }

    // Validate password (8+ characters, 1 capital letter, 1 number)
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(this.password)) {
      this.passwordError =
        'Password must be at least 8 characters long, include 1 capital letter, and 1 number.';
      return;
    }

    // Mock success signup
    console.log('Signup successful:', this.username, this.email);
    alert('Signup successful! Redirecting to cabins...');
    this.router.navigate(['/cabins']);
  }
}
