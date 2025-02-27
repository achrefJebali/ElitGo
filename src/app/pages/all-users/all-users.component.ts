import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { UserService } from '../services/user.service';
import { DashboardHeaderComponent } from '../dashboard/dashboard-header/dashboard-header.component';
import { User } from '../models/user.model';
import { InscriptionComponent } from '../inscription/inscription.component';
import { EditUserComponent } from '../edit-user/edit-user.component';

@Component({
  selector: 'app-all-users',
  standalone: true,
  imports: [DashboardHeaderComponent, InscriptionComponent, EditUserComponent, MatDialogModule, MatTableModule],
  templateUrl: './all-users.component.html',
  styleUrl: './all-users.component.css'
})
export class AllUsersComponent implements OnInit {
  displayedColumns: string[] = ['id', 'username', 'email', 'role', 'actions'];
  dataSource = new MatTableDataSource<User>();

  constructor(private userService: UserService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getUser().subscribe(users => {
      this.dataSource.data = users;
    });
  }

  // Open Dialog for Adding User
  openAddDialog(): void {
    const dialogRef = this.dialog.open(InscriptionComponent, {
      width: '2000px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.addUser(result).subscribe(() => this.loadUsers());
      }
    });
  }

  // Open Dialog for Editing User
  openEditDialog(user: User): void {
    const dialogRef = this.dialog.open(EditUserComponent, {
      width: '2000px',
      data: { ...user } // Pass user data
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.modifyUser(result).subscribe(() => this.loadUsers());
      }
    });
  }

  deleteUser(userId: number): void {
    if (confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) {
      this.userService.removeUser(userId).subscribe(() => this.loadUsers());
    }
  }
}
