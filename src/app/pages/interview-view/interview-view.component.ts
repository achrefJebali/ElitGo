import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InterviewService } from '../services/interview.service';
import { Interview } from '../models/interview.model';
import { User, Role } from '../models/user.model';
import { UserService } from '../services/user.service';
import { DashboardHeaderComponent } from '../dashboard/dashboard-header/dashboard-header.component';

@Component({
  selector: 'app-interview-view',
  standalone: true,
  imports: [CommonModule, FormsModule, DashboardHeaderComponent],
  templateUrl: './interview-view.component.html',
  styleUrls: ['./interview-view.component.css']
})
export class InterviewViewComponent implements OnInit {
  // Expose Role enum to be used in the template
  Role = Role;
  
  currentUser: User | null = null;
  interviews: Interview[] = [];
  selectedInterview: Interview | null = null;
  feedback: string = '';

  constructor(
    private interviewService: InterviewService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  loadCurrentUser(): void {
    const username = localStorage.getItem('username');
    const userRole = localStorage.getItem('userRole');
    
    console.log('Current username from localStorage:', username);
    console.log('Current user role from localStorage:', userRole);
    
    if (username) {
      this.userService.getUserByUsername(username).subscribe({
        next: (user) => {
          console.log('User details loaded from API:', user);
          this.currentUser = user;
          
          // Ensure role is set correctly
          if (!this.currentUser.role && userRole) {
            // Convert string role to enum Role
            switch(userRole) {
              case 'STUDENT':
                this.currentUser.role = Role.STUDENT;
                break;
              case 'TEACHER':
                this.currentUser.role = Role.TEACHER;
                break;
              case 'ADMIN':
                this.currentUser.role = Role.ADMIN;
                break;
              case 'ADMIN CLUB':
                this.currentUser.role = Role.ADMIN_CLUB;
                break;
              default:
                console.error('Unknown role:', userRole);
            }
          }
          
          console.log('Current user set to:', this.currentUser);
          this.loadUserInterviews();
        },
        error: (error) => {
          console.error('Error loading user by username:', error);
          // Try alternative approach to get user ID
          this.tryAlternativeUserLoad(username, userRole);
        }
      });
    } else {
      console.error('No username found in localStorage');
    }
  }
  
  // Alternative method to load user data if getUserByUsername fails
  tryAlternativeUserLoad(username: string, roleStr: string | null): void {
    console.log('Trying alternative user load approach');
    
    if (roleStr === 'STUDENT') {
      this.userService.getStudents().subscribe({
        next: (students) => {
          console.log('Got all students:', students);
          const student = students.find(s => s.username === username);
          if (student) {
            console.log('Found student by username:', student);
            this.currentUser = student;
            this.loadUserInterviews();
          } else {
            console.error('Student not found by username in student list');
          }
        },
        error: (err) => console.error('Error loading students:', err)
      });
    } else if (roleStr === 'TEACHER') {
      this.userService.getTeachers().subscribe({
        next: (teachers) => {
          console.log('Got all teachers:', teachers);
          const teacher = teachers.find(t => t.username === username);
          if (teacher) {
            console.log('Found teacher by username:', teacher);
            this.currentUser = teacher;
            this.loadUserInterviews();
          } else {
            console.error('Teacher not found by username in teacher list');
          }
        },
        error: (err) => console.error('Error loading teachers:', err)
      });
    }
  }

  loadUserInterviews(): void {
    if (!this.currentUser?.id) {
      console.error('Cannot load interviews - currentUser or currentUser.id is not set');
      return;
    }

    console.log('Loading interviews for user:', this.currentUser);
    
    // For debugging: Log the current user's ID and role in various formats
    console.log('Current user ID as number:', Number(this.currentUser.id));
    console.log('Current user ID as string:', String(this.currentUser.id));
    console.log('Current user role:', this.currentUser.role);

    this.interviewService.getAllInterviews().subscribe({
      next: (interviews) => {
        console.log('All interviews received:', interviews.length, 'interviews');
        if (interviews.length === 0) {
          console.log('No interviews available in the system');
          return;
        }
        
        const userId = this.currentUser?.id;
        console.log('Looking for interviews matching user ID:', userId, 'with role:', this.currentUser?.role);
        
        // Debug: Log all studentIds and teacherIds to check what we're comparing against
        console.log('Available interviews with IDs:', interviews.map(i => {
          return {
            id: i.id,
            studentId: i.studentId,
            teacherId: i.teacherId,
            date: i.date
          };
        }));
        
        // Filter interviews based on user role with improved ID comparison
        this.interviews = interviews.filter(interview => {
          let isMatch = false;
          if (this.currentUser?.role === 'STUDENT') {
            isMatch = this.compareIds(interview.studentId, userId);
            if (isMatch) {
              console.log('Found matching student interview:', interview);
            }
          } else if (this.currentUser?.role === 'TEACHER') {
            isMatch = this.compareIds(interview.teacherId, userId);
            if (isMatch) {
              console.log('Found matching teacher interview:', interview);
            }
          }
          return isMatch;
        });
        
        console.log('Filtered interviews for user:', this.interviews.length, 'interviews found');
        
        // If no interviews found using strict ID comparison, try a more lenient approach
        if (this.interviews.length === 0 && userId !== undefined) {
          console.log('No interviews found with strict ID matching, trying lenient matching');
          this.interviews = this.findInterviewsLenient(interviews, userId, this.currentUser?.role || '');
        }
        
        // Sort interviews by date (newest first)
        this.interviews.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateB.getTime() - dateA.getTime();
        });
      },
      error: (error) => console.error('Error loading interviews:', error)
    });
  }
  
  // More lenient interview finding logic
  findInterviewsLenient(interviews: Interview[], userId: number, role: string): Interview[] {
    console.log('Using lenient interview matching for user ID:', userId, 'role:', role);
    
    return interviews.filter(interview => {
      if (role === 'STUDENT' || role === Role.STUDENT) {
        // For students, try various comparisons
        const studentIdNum = typeof interview.studentId === 'string' ? parseInt(interview.studentId) : interview.studentId;
        const userIdNum = typeof userId === 'string' ? parseInt(userId as unknown as string) : userId;
        
        // Log every comparison attempt
        console.log(`Comparing student IDs - Interview studentId: ${interview.studentId} (${typeof interview.studentId}) vs User ID: ${userId} (${typeof userId})`);
        console.log(`As numbers: ${studentIdNum} vs ${userIdNum}`);
        
        // Check if there's a student object with an id property
        if (interview.student && typeof interview.student === 'object' && interview.student.id) {
          const nestedStudentId = Number(interview.student.id);
          console.log(`Found nested student ID: ${nestedStudentId} vs User ID: ${userIdNum}`);
          if (nestedStudentId === userIdNum) return true;
        }
        
        return studentIdNum === userIdNum || 
               interview.studentId == userId || // Loose equality check
               (typeof interview.studentId === 'string' && interview.studentId === userId.toString());
      } else if (role === 'TEACHER' || role === Role.TEACHER) {
        // For teachers, try various comparisons
        const teacherIdNum = typeof interview.teacherId === 'string' ? parseInt(interview.teacherId) : interview.teacherId;
        const userIdNum = typeof userId === 'string' ? parseInt(userId as unknown as string) : userId;
        
        // Log every comparison attempt
        console.log(`Comparing teacher IDs - Interview teacherId: ${interview.teacherId} (${typeof interview.teacherId}) vs User ID: ${userId} (${typeof userId})`);
        console.log(`As numbers: ${teacherIdNum} vs ${userIdNum}`);
        
        // Check if there's a teacher object with an id property
        if (interview.teacher && typeof interview.teacher === 'object' && interview.teacher.id) {
          const nestedTeacherId = Number(interview.teacher.id);
          console.log(`Found nested teacher ID: ${nestedTeacherId} vs User ID: ${userIdNum}`);
          if (nestedTeacherId === userIdNum) return true;
        }
        
        return teacherIdNum === userIdNum || 
               interview.teacherId == userId || // Loose equality check
               (typeof interview.teacherId === 'string' && interview.teacherId === userId.toString());
      }
      return false;
    });
  }

  selectInterview(interview: Interview): void {
    this.selectedInterview = interview;
  }

  // Helper method for comparing IDs that might be different types (string vs number)
  private compareIds(id1: any, id2: any): boolean {
    // First, log what we're comparing to aid debugging
    console.log(`Comparing IDs: ${id1} (${typeof id1}) vs ${id2} (${typeof id2})`);
    
    // Direct equality check
    if (id1 === id2) {
      console.log('  - Direct equality match');
      return true;
    }
    
    // Loose equality check (ignores type)
    if (id1 == id2) {
      console.log('  - Loose equality match');
      return true;
    }
    
    // Try parsing as numbers for comparison
    try {
      const num1 = typeof id1 === 'string' ? parseInt(id1) : id1;
      const num2 = typeof id2 === 'string' ? parseInt(id2) : id2;
      
      console.log(`  - As numbers: ${num1} vs ${num2}`);
      
      if (num1 === num2 && !isNaN(num1) && !isNaN(num2)) {
        console.log('  - Numeric equality match');
        return true;
      }
    } catch (e) {
      console.error('  - Error comparing as numbers:', e);
    }
    
    // Check if one is string representation of the other
    if (id1 !== null && id2 !== null && id1 !== undefined && id2 !== undefined) {
      if (id1.toString() === id2.toString()) {
        console.log('  - String representation match');
        return true;
      }
    }
    
    console.log('  - No match found');
    return false;
  }

  submitFeedback(): void {
    if (this.selectedInterview && this.feedback) {
      const updatedInterview = {
        ...this.selectedInterview,
        feedback: this.feedback
      };

      this.interviewService.updateInterview(updatedInterview).subscribe({
        next: (response) => {
          this.selectedInterview = response;
          this.feedback = '';
          alert('Feedback submitted successfully');
        },
        error: (error) => {
          console.error('Error submitting feedback:', error);
          alert('Failed to submit feedback. Please try again.');
        }
      });
    }
  }

  canSubmitFeedback(): boolean {
    return this.currentUser?.role === 'TEACHER';
  }
  
  // Helper method to format the time until interview
  getTimeUntilInterview(dateStr: Date | string): string {
    const now = new Date();
    const interviewDate = new Date(dateStr);
    const diff = interviewDate.getTime() - now.getTime();
    
    if (diff < 0) return 'Interview has passed';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${days}d ${hours}h ${minutes}m`;
  }
  
  // Create a test interview for the current user to verify functionality
  createTestInterview(): void {
    if (!this.currentUser?.id) {
      console.error('Cannot create test interview - no current user ID');
      return;
    }
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const testInterview: Interview = {
      id: Math.floor(Math.random() * 1000) + 1000, // Random ID for the test interview
      date: tomorrow,
      meeting_link: 'https://meet.google.com/test-interview',
      duration: 30,
      notes: 'Test interview created for debugging',
      feedback: '',
      score: 0,
      extraBonus: 0
    };
    
    // Set student or teacher ID based on current user role
    if (this.currentUser.role === Role.STUDENT) {
      testInterview.studentId = Number(this.currentUser.id);
      testInterview.studentName = this.currentUser.name;
      testInterview.teacherId = 1; // Assign to first teacher
      testInterview.teacherName = 'Test Teacher';
      console.log('Creating test interview for student:', testInterview);
    } else if (this.currentUser.role === Role.TEACHER) {
      testInterview.teacherId = Number(this.currentUser.id);
      testInterview.teacherName = this.currentUser.name;
      testInterview.studentId = 1; // Assign to first student
      testInterview.studentName = 'Test Student';
      console.log('Creating test interview for teacher:', testInterview);
    }
    
    // Add to interviews array for immediate display
    this.interviews.push(testInterview);
    
    // Sort interviews by date
    this.interviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Select the new interview
    this.selectInterview(testInterview);
    
    // Show success message
    alert('Test interview created successfully!');
  }
}
