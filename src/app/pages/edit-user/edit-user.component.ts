import { Component, Inject } from '@angular/core';
import {  NgModel, FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { User } from '../models/user.model';

@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [FormsModule, MatDialogModule], // Ensure standalone usage
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.css']
})
export class EditUserComponent {
  constructor(
    public dialogRef: MatDialogRef<EditUserComponent>,
    @Inject(MAT_DIALOG_DATA) public user: User
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }
}
