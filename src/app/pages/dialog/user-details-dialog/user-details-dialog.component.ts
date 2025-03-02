import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { User } from '../../models/user.model';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-user-details-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2>User Profile Details</h2>
        <button class="close-button" mat-icon-button (click)="close()">
          <mat-icon>x</mat-icon>
        </button>
      </div>

      <mat-dialog-content>
        <div class="user-info">
          <div class="profile-section">
            <div class="profile-image">
              <img [src]="data.photo || 'images/small-avatar-1.jpg'" alt="Profile photo">
            </div>
            <div class="user-name">
              <h3>{{data.name || data.username}}</h3>
              <span class="role-badge" [class]="data.role.toLowerCase()">{{data.role}}</span>
            </div>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <label>Username</label>
              <p>{{data.username}}</p>
            </div>
            <div class="info-item">
              <label>Email</label>
              <p>{{data.email}}</p>
            </div>
            <div class="info-item" *ngIf="data.phone">
              <label>Phone</label>
              <p>{{data.phone}}</p>
            </div>
            <div class="info-item" *ngIf="data.address">
              <label>Address</label>
              <p>{{data.address}}</p>
            </div>
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions>
        <button class="close-btn" (click)="close()">Close</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .dialog-header {
      background: #343a40;
      color: white;
      padding: 16px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .dialog-header h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 500;
    }

    .close-button {
      color: white;
      margin: -8px -12px -8px auto;
    }

    mat-dialog-content {
      padding: 0 24px;
      margin: 0;
      max-height: calc(80vh - 120px);
      overflow-y: auto;
    }

    .user-info {
      padding-bottom: 24px;
    }

    .profile-section {
      text-align: center;
      margin-bottom: 32px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .profile-image {
      margin-bottom: 16px;
      display: inline-block;
    }

    .profile-image img {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      object-fit: cover;
      border: 4px solid white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .user-name h3 {
      margin: 0 0 8px;
      font-size: 1.5rem;
      color: #2c3e50;
    }

    .role-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .role-badge.student {
      background-color: #e9ecef;
      color: #343a40;
    }

    .role-badge.teacher {
      background-color: #e9ecef;
      color: #343a40;
    }

    .role-badge.admin {
      background-color: #e9ecef;
      color: #343a40;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-top: 24px;
    }

    .info-item {
      background: #f8f9fa;
      padding: 16px;
      border-radius: 8px;
      transition: all 0.2s ease;
    }

    .info-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .info-item label {
      display: block;
      font-size: 0.875rem;
      color: #6c757d;
      margin-bottom: 4px;
      font-weight: 500;
    }

    .info-item p {
      margin: 0;
      font-size: 1rem;
      color: #2c3e50;
      word-break: break-word;
    }

    mat-dialog-actions {
      padding: 16px 24px;
      border-top: 1px solid #e9ecef;
      display: flex;
      justify-content: flex-end;
      margin: 0;
      background: #f8f9fa;
    }

    .close-btn {
      background: #343a40;
      color: white;
      border: none;
      padding: 8px 24px;
      border-radius: 4px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .close-btn:hover {
      background: #23272b;
    }

    @media (max-width: 600px) {
      .info-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class UserDetailsDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: User,
    private dialogRef: MatDialogRef<UserDetailsDialogComponent>
  ) {}

  close(): void {
    this.dialogRef.close();
  }
}
