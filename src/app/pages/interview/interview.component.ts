import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InterviewService } from '../services/interview.service';
import { Interview } from '../models/interview.model';
import { LayoutComponent } from '../layout/layout.component';
import { FooterComponent } from '../footer/footer.component';
import { DashboardHeaderComponent } from '../dashboard/dashboard-header/dashboard-header.component';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-interview',
  standalone: true,
  imports: [CommonModule, FormsModule, FooterComponent, DashboardHeaderComponent],
  templateUrl: './interview.component.html',
  styleUrls: ['./interview.component.scss']
})
export class InterviewComponent implements OnInit {
  interviews: Interview[] = [];
  newInterview: Interview = {
    date: new Date(),
    status: 'Pending',
    score: 0,
    meeting_link: '',
    extraBonus: 0
  };
  editingInterview: Interview | null = null;

  constructor(private interviewService: InterviewService, private userService: UserService) {}

  ngOnInit(): void {
    this.loadInterviews();
  }

  loadInterviews(): void {
    this.interviewService.getAllInterviews().subscribe({
      next: (data) => {
        this.interviews = data;
      },
      error: (error) => {
        console.error('Error fetching interviews:', error);
      }
    });
  }

  addInterview(): void {
    this.interviewService.addInterview(this.newInterview).subscribe({
      next: (response) => {
        this.interviews.push(response);
        this.newInterview = {
          date: new Date(),
          status: 'Pending',
          score: 0,
          meeting_link: '',
          extraBonus: 0
        };
      },
      error: (error) => {
        console.error('Error adding interview:', error);
      }
    });
  }

  deleteInterview(id: number): void {
    this.interviewService.deleteInterview(id).subscribe({
      next: () => {
        this.interviews = this.interviews.filter(interview => interview.id !== id);
      },
      error: (error) => {
        console.error('Error deleting interview:', error);
      }
    });
  }

  startEditing(interview: Interview): void {
    // Create a deep copy to avoid direct object reference
    this.editingInterview = {
      ...interview,
      date: new Date(interview.date)
    };
  }

  cancelEditing(): void {
    this.editingInterview = null;
  }

  updateInterview(interview: Interview): void {
    if (!interview.id) return;
    
    this.interviewService.updateInterview(interview).subscribe({
      next: (updatedInterview) => {
        const index = this.interviews.findIndex(i => i.id === interview.id);
        if (index !== -1) {
          this.interviews[index] = updatedInterview;
        }
        this.editingInterview = null;
      },
      error: (error) => {
        console.error('Error updating interview:', error);
      }
    });
  }
 
  logout(): void {
    this.userService.logout();
    window.location.href = '/login';
  }
}
