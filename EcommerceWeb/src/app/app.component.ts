import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserStorageService } from './services/storage/user-storage.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule, MatToolbarModule, MatButtonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'EcommerceWeb';
  isCustomerLoggedIn: boolean = UserStorageService.isCustomerLoggedIn();
  isAdminLoggedIn: boolean = UserStorageService.isAdminLoggedIn();

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.router.events.subscribe(() => {
      this.isCustomerLoggedIn = UserStorageService.isCustomerLoggedIn();
      this.isAdminLoggedIn = UserStorageService.isAdminLoggedIn();
    });
  }

  logout() {
    UserStorageService.signOut();
    this.router.navigateByUrl('login');
  }
}