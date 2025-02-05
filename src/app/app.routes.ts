import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { CabinListComponent } from './cabins/cabin-list/cabin-list.component';
import { CabinCalendarComponent } from './cabins/cabin-calendar/cabin-calendar.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'cabins', component: CabinListComponent },
  { path: 'cabin/:id', component: CabinCalendarComponent }
];