import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DemoAngularMaterialModule } from '../../../DemoAngularMaterialModule';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, DemoAngularMaterialModule, RouterModule],
  template: `
    <div class="coming-soon-container">
      <mat-card class="coming-soon-card">
        <mat-icon class="icon">shopping_bag</mat-icon>
        <h2>My Orders</h2>
        <p>You haven't placed any orders yet. This section is coming soon!</p>
        <button mat-raised-button color="primary" routerLink="/customer/dashboard">Go to Dashboard</button>
      </mat-card>
    </div>
  `,
  styles: [`
    .coming-soon-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
      background: #f5f5f5;
      padding: 20px;
    }
    .coming-soon-card {
      max-width: 400px;
      width: 100%;
      padding: 40px 20px;
      text-align: center;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      background: #ffffff;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #3f51b5;
      margin-bottom: 20px;
    }
    h2 {
      margin: 0 0 10px 0;
      color: #333;
      font-weight: 600;
    }
    p {
      color: #666;
      margin: 0 0 24px 0;
      line-height: 1.5;
    }
    button {
      width: 100%;
      padding: 8px 0;
    }
  `]
})
export class MyOrdersComponent {}
