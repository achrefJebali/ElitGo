import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InterviewService } from '../services/interview.service';
import { Interview } from '../models/interview.model';
import { User, Role } from '../models/user.model';
import { LayoutComponent } from '../layout/layout.component';
import { DashboardHeaderComponent } from '../dashboard/dashboard-header/dashboard-header.component';
import { UserService } from '../services/user.service';
import { GoogleMeetService } from '../services/google-meet.service';

@Component({
  selector: 'app-interview',
  standalone: true,
  imports: [CommonModule, FormsModule, DashboardHeaderComponent],
  templateUrl: './interview.component.html',
  styleUrls: ['./interview.component.scss']
})
export class InterviewComponent implements OnInit {
  students: User[] = [];
  teachers: User[] = [];    
  interviews: Interview[] = [];
  newInterview: Interview = {
    date: new Date(),
    meeting_link: '',
    studentId: null,
    teacherId: null,
    duration: 30,
    notes: ''
  };
  
  // Common meeting platforms and their domains
  private meetingPlatforms = [
    { name: 'Google Meet', domain: 'meet.google.com' },
    { name: 'Zoom', domain: 'zoom.us' },
    { name: 'Microsoft Teams', domain: 'teams.microsoft.com' },
    { name: 'WebEx', domain: 'webex.com' }
  ];
  editingInterview: Interview | null = null;

  constructor(
    private interviewService: InterviewService, 
    private userService: UserService,
    private googleMeetService: GoogleMeetService
  ) {}

  ngOnInit(): void {
    console.log('Interview component initialized');
    // Load interviews (which will also load students and teachers)
    this.loadInterviews();
    
    // Generate a meeting link for the new interview form
    this.generateMeetingLink();
  }
  
  // Original methods kept for backward compatibility
  loadStudents(): Promise<void> {
    return this.loadStudentsPromise();
  }
  
  loadTeachers(): Promise<void> {
    return this.loadTeachersPromise();
  }

  loadInterviews(): void {
    console.log('Loading interviews...');
    
    // First load students and teachers to ensure they're available for name mapping
    Promise.all([
      this.loadStudentsPromise(),
      this.loadTeachersPromise()
    ]).then(() => {
      console.log('Students and teachers loaded, now loading interviews');
      
      // Now load interviews
      this.interviewService.getAllInterviews().subscribe({
        next: (data) => {
          console.log('Interviews received from API:', data);
          
          if (Array.isArray(data)) {
            // Process dates to ensure they're Date objects
            const processedData = data.map(interview => ({
              ...interview,
              date: new Date(interview.date)
            }));
            
            // Sort interviews by date (newest first)
            processedData.sort((a, b) => b.date.getTime() - a.date.getTime());
            
            // We have real data from the API
            this.interviews = processedData;
            console.log('Using real interviews from API, count:', this.interviews.length);
            
            // Update interview names with available data
            this.updateInterviewNames();
          } else {
            console.warn('Invalid data format received from API');
            this.interviews = [];
          }
        },
        error: (error) => {
          console.error('Error fetching interviews:', error);
          this.interviews = [];
          // Try to retry once in case of network issues
          setTimeout(() => this.retryLoadInterviews(), 1000);
        }
      });
    }).catch(error => {
      console.error('Error loading students or teachers:', error);
    });
  }
  
  retryLoadInterviews(): void {
    console.log('Retrying loading interviews...');
    this.interviewService.getAllInterviews().subscribe({
      next: (data) => {
        console.log('Retry received interviews:', data);
        if (Array.isArray(data)) {
          // Process dates to ensure they're Date objects
          const processedData = data.map(interview => ({
            ...interview,
            date: new Date(interview.date)
          }));
          
          // Sort interviews by date (newest first)
          processedData.sort((a, b) => b.date.getTime() - a.date.getTime());
          
          this.interviews = processedData;
          console.log('Retry successful, interviews count:', this.interviews.length);
          this.updateInterviewNames();
        } else {
          console.warn('Invalid data format received from API during retry');
          this.interviews = [];
        }
      },
      error: (error) => {
        console.error('Error in retry fetching interviews:', error);
      }
    });
  }

  // Helper method to update interview names
  private updateInterviewNames(): void {
    console.log('Updating interview names, interviews count:', this.interviews.length);
    console.log('Students available:', this.students.length);
    console.log('Teachers available:', this.teachers.length);
    
    this.interviews.forEach(interview => {
      // Always update student name, even if previously set
      if (interview.studentId) {
        // Handle both number and string IDs with proper comparison
        const student = this.students.find(s => 
          s.id === interview.studentId || 
          (typeof s.id === 'number' && typeof interview.studentId === 'string' && s.id === parseInt(interview.studentId)) ||
          (typeof s.id === 'string' && typeof interview.studentId === 'number' && parseInt(s.id) === interview.studentId)
        );
        
        if (student) {
          interview.studentName = student.name;
          console.log(`Found student name ${student.name} for ID ${interview.studentId}`);
        } else {
          // If student not found in our local cache, set a placeholder with ID
          interview.studentName = `Student ID: ${interview.studentId}`;
          console.warn(`Student with ID ${interview.studentId} not found in local cache`);
        }
      } else {
        interview.studentName = 'No Student Assigned';
      }
      
      // Always update teacher name, even if previously set
      if (interview.teacherId) {
        // Handle both number and string IDs with proper comparison
        const teacher = this.teachers.find(t => 
          t.id === interview.teacherId || 
          (typeof t.id === 'number' && typeof interview.teacherId === 'string' && t.id === parseInt(interview.teacherId)) ||
          (typeof t.id === 'string' && typeof interview.teacherId === 'number' && parseInt(t.id) === interview.teacherId)
        );
        
        if (teacher) {
          interview.teacherName = teacher.name;
          console.log(`Found teacher name ${teacher.name} for ID ${interview.teacherId}`);
        } else {
          // If teacher not found in our local cache, set a placeholder with ID
          interview.teacherName = `Teacher ID: ${interview.teacherId}`;
          console.warn(`Teacher with ID ${interview.teacherId} not found in local cache`);
        }
      } else {
        interview.teacherName = 'No Teacher Assigned';
      }
    });
    
    console.log('Final interviews after updating names:', this.interviews.length);
  }
  // Helper method to load students as a promise
  loadStudentsPromise(): Promise<void> {
    console.log('Loading students...');
    return new Promise<void>((resolve, reject) => {
      this.userService.getStudents().subscribe({
        next: (data) => {
          if (Array.isArray(data) && data.length > 0) {
            console.log('Students loaded successfully:', data.length, 'students found');
            
            // Process and validate each student before adding to the list
            this.students = data.map(student => {
              // Ensure each student has a valid ID and name
              return {
                id: student.id,
                name: student.name || `Unknown (ID: ${student.id})`,
                email: student.email || '',
                username: student.username || '',
                role: student.role || Role.STUDENT
              };
            });
            
            // Sort students by name for easier selection
            this.students.sort((a, b) => a.name.localeCompare(b.name));
            
            console.log('Students processed and sorted:', this.students);
          } else {
            console.warn('No students returned from API or invalid data format');
            // Create sample data if no valid students found
            this.students = [{
              id: 1,
              name: 'Sample Student',
              email: 'student@example.com',
              username: 'student1',
              role: Role.STUDENT
            }];
          }
          
          resolve();
        },
        error: (err) => {
          console.error('Error loading students:', err);
          
          // Create sample data on error
          console.log('Creating sample students due to error');
          this.students = [
            {
              id: 1,
              name: 'Sample Student 1',
              email: 'student1@example.com',
              username: 'student1',
              role: Role.STUDENT
            },
            {
              id: 3,
              name: 'Sample Student 2',
              email: 'student2@example.com',
              username: 'student2',
              role: Role.STUDENT
            }
          ];
          
          resolve(); // Resolve anyway to continue the flow
        }
      });
    });
  }
  
  // Helper method to load teachers as a promise
  loadTeachersPromise(): Promise<void> {
    console.log('Loading teachers...');
    return new Promise<void>((resolve, reject) => {
      this.userService.getTeachers().subscribe({
        next: (data) => {
          if (Array.isArray(data) && data.length > 0) {
            console.log('Teachers loaded successfully:', data.length, 'teachers found');
            
            // Process and validate each teacher before adding to the list
            this.teachers = data.map(teacher => {
              // Ensure each teacher has a valid ID and name
              return {
                id: teacher.id,
                name: teacher.name || `Unknown Teacher (ID: ${teacher.id})`,
                email: teacher.email || '',
                username: teacher.username || '',
                role: teacher.role || Role.TEACHER
              };
            });
            
            // Sort teachers by name for easier selection
            this.teachers.sort((a, b) => a.name.localeCompare(b.name));
            
            console.log('Teachers processed and sorted:', this.teachers);
          } else {
            console.warn('No teachers returned from API or invalid data format');
            // Create sample data if no valid teachers found
            this.teachers = [{
              id: 2,
              name: 'Sample Teacher',
              email: 'teacher@example.com',
              username: 'teacher1',
              role: Role.TEACHER
            }];
          }
          
          resolve();
        },
        error: (err) => {
          console.error('Error loading teachers:', err);
          
          // Create sample data on error
          console.log('Creating sample teachers due to error');
          this.teachers = [
            {
              id: 2,
              name: 'Sample Teacher 1',
              email: 'teacher1@example.com',
              username: 'teacher1',
              role: Role.TEACHER
            },
            {
              id: 4,
              name: 'Sample Teacher 2',
              email: 'teacher2@example.com',
              username: 'teacher2',
              role: Role.TEACHER
            }
          ];
          
          resolve(); // Resolve anyway to continue the flow
        }
      });
    });
  }

  addInterview(): void {
    console.log('Adding interview with data:', this.newInterview);
    
    // Show loading message to user
    const loadingMessage = 'Scheduling interview...';
    console.log(loadingMessage);
    
    // Ensure meeting link is auto-generated if empty
    if (!this.newInterview.meeting_link || this.newInterview.meeting_link.trim() === '') {
      this.generateMeetingLink();
    }
    
    try {
      // Validate required fields
      if (!this.newInterview.date) {
        alert('Please select a date');
        return;
      }
  
      if (!this.newInterview.studentId) {
        alert('Please select a student');
        return;
      }
  
      if (!this.newInterview.teacherId) {
        alert('Please select a teacher');
        return;
      }
  
      // Ensure duration is set and valid (minimum 15 minutes required by backend)
      if (!this.newInterview.duration || this.newInterview.duration < 15) {
        this.newInterview.duration = 30; // Default to 30 minutes if missing or too short
      }
  
      // Make sure the date is a proper Date object and handle ISO string conversion
      if (typeof this.newInterview.date === 'string') {
        try {
          this.newInterview.date = new Date(this.newInterview.date);
          console.log('Converted string date to Date object:', this.newInterview.date);
        } catch (e) {
          console.error('Error converting date string:', e);
          alert('Invalid date format. Please try again.');
          return;
        }
      }
      
      // Debug date format to ensure it's valid
      console.log('Date as ISO string:', this.newInterview.date.toISOString());
  
      // Populate student and teacher names before saving
      if (this.newInterview.studentId) {
        const student = this.students.find(s => s.id === this.newInterview.studentId || 
                                              Number(s.id) === Number(this.newInterview.studentId));
        if (student) {
          this.newInterview.studentName = student.name;
          console.log('Found student:', student);
        } else {
          console.warn('Student not found in local cache with ID:', this.newInterview.studentId);
        }
      }
      
      if (this.newInterview.teacherId) {
        const teacher = this.teachers.find(t => t.id === this.newInterview.teacherId || 
                                              Number(t.id) === Number(this.newInterview.teacherId));
        if (teacher) {
          this.newInterview.teacherName = teacher.name;
          console.log('Found teacher:', teacher);
        } else {
          console.warn('Teacher not found in local cache with ID:', this.newInterview.teacherId);
        }
      }
  
      // Create a clean copy of the interview object with only the fields we need
      const interviewToAdd = {
        date: this.newInterview.date,
        meeting_link: this.newInterview.meeting_link || '',  // Ensure not undefined
        duration: this.newInterview.duration,
        studentId: typeof this.newInterview.studentId === 'string' ? 
                   parseInt(this.newInterview.studentId) : this.newInterview.studentId,
        teacherId: typeof this.newInterview.teacherId === 'string' ? 
                  parseInt(this.newInterview.teacherId) : this.newInterview.teacherId,
        notes: this.newInterview.notes || ''  // Ensure not undefined
      };
  
      console.log('Sending interview data to backend:', JSON.stringify(interviewToAdd));
      
      // Use direct object with carefully formatted properties to avoid conversion issues
      const directPayload = {
        date: this.newInterview.date instanceof Date ? this.newInterview.date.toISOString() : this.newInterview.date,
        meeting_link: this.newInterview.meeting_link || '',
        duration: this.newInterview.duration || 30,
        student: { id: Number(this.newInterview.studentId) },
        teacher: { id: Number(this.newInterview.teacherId) },
        studentId: Number(this.newInterview.studentId), // Add explicit studentId
        teacherId: Number(this.newInterview.teacherId), // Add explicit teacherId
        notes: this.newInterview.notes || ''
      };
      
      console.log('Alternative direct payload:', JSON.stringify(directPayload));
  
      // Try direct format first as it better matches the backend expectations
      this.interviewService.http.post(`http://localhost:8085/Interview/add-interview`, directPayload, {
        headers: this.interviewService.getHeaders()
      }).subscribe({
        next: (response) => {
          console.log('Interview added successfully:', response);
          alert('Interview scheduled successfully');
          this.loadInterviews();
          
          // Reset the form
          this.newInterview = {
            date: new Date(),
            meeting_link: '',
            studentId: null,
            teacherId: null,
            duration: 30,
            notes: ''
          };
        },
        error: (error) => {
          console.error('Direct format failed, trying service method:', error);
          
          // If direct fails, fall back to using the service method
          this.interviewService.addInterview(interviewToAdd).subscribe({
            next: (response) => {
              console.log('Interview added successfully with fallback:', response);
              alert('Interview scheduled successfully');
              this.loadInterviews();
              
              // Reset the form
              this.newInterview = {
                date: new Date(),
                meeting_link: '',
                studentId: null,
                teacherId: null,
                duration: 30,
                notes: ''
              };
            },
            error: (fallbackError) => {
              console.error('All attempts failed:', fallbackError);
              let errorMessage = 'Failed to schedule interview after multiple attempts.';
              
              // Provide more useful error information
              if (fallbackError.message) {
                errorMessage += ' Error: ' + fallbackError.message;
              } else if (typeof fallbackError === 'string') {
                errorMessage += ' ' + fallbackError;
              } else if (fallbackError.status === 0) {
                errorMessage += ' Cannot connect to server. Please check if the backend is running.';
              } else if (fallbackError.error && typeof fallbackError.error === 'string') {
                errorMessage += ' Server says: ' + fallbackError.error;
              }
              
              alert(errorMessage);
            }
          });
        }
      });
    } catch (e) {
      console.error('Unexpected error in addInterview:', e);
      alert('An unexpected error occurred. Please check the console for details.');
    }
  }

  deleteInterview(id: number): void {
    if (!confirm('Are you sure you want to delete this interview?')) {
      return;
    }
    
    console.log(`Attempting to delete interview with ID: ${id}`);
    this.interviewService.deleteInterview(id).subscribe({
      next: () => {
        console.log(`Successfully deleted interview with ID: ${id}`);
        // Remove the deleted interview from the array
        this.interviews = this.interviews.filter(interview => interview.id !== id);
        // Show success message
        alert('Interview deleted successfully');
      },
      error: (error) => {
        console.error('Error deleting interview:', error);
        // Try to reload the interviews to ensure UI is in sync with backend
        this.loadInterviews();
        alert('Failed to delete interview. Please try again later.');
      }
    });
  }

  startEditing(interview: Interview): void {
    console.log('Starting to edit interview:', interview);
    // Create a deep copy to avoid direct object reference
    this.editingInterview = {
      ...interview,
      date: new Date(interview.date)
    };
    console.log('Editing interview object created:', this.editingInterview);
  }

  cancelEditing(): void {
    this.editingInterview = null;
  }

  updateInterview(interview: Interview): void {
    if (!interview.id) {
      console.error('Cannot update interview without ID');
      return;
    }
    
    console.log('Updating interview:', interview);
    
    // Validate required fields
    if (!interview.date) {
      alert('Please select a date');
      return;
    }

    if (!interview.studentId) {
      alert('Please select a student');
      return;
    }

    if (!interview.teacherId) {
      alert('Please select a teacher');
      return;
    }

    // Ensure duration is set
    if (!interview.duration) {
      interview.duration = 30; // Default to 30 minutes
    }
    
    // Ensure student and teacher names are set
    if (interview.studentId) {
      const student = this.students.find(s => s.id === interview.studentId);
      if (student) {
        interview.studentName = student.name;
      }
    }
    
    if (interview.teacherId) {
      const teacher = this.teachers.find(t => t.id === interview.teacherId);
      if (teacher) {
        interview.teacherName = teacher.name;
      }
    }
    
    // Create a clean copy of the interview object with only the fields we need
    const interviewToUpdate = {
      id: interview.id,
      date: interview.date,
      meeting_link: interview.meeting_link || '',
      duration: interview.duration,
      studentId: interview.studentId,
      teacherId: interview.teacherId,
      studentName: interview.studentName,
      teacherName: interview.teacherName,
      notes: interview.notes
    };
    
    this.interviewService.updateInterview(interviewToUpdate).subscribe({
      next: (updatedInterview) => {
        console.log('Interview updated successfully:', updatedInterview);
        
        // Find and update the interview in the array
        const index = this.interviews.findIndex(i => i.id === interview.id);
        if (index !== -1) {
          // Ensure date is a Date object
          this.interviews[index] = {
            ...updatedInterview,
            date: new Date(updatedInterview.date)
          };
          console.log('Updated interview in array:', this.interviews[index]);
        } else {
          console.warn('Could not find interview in array to update');
          // Reload all interviews to ensure consistency
          this.loadInterviews();
        }
        
        // Exit edit mode
        this.editingInterview = null;
        
        // Show success message
        alert('Interview updated successfully');
      },
      error: (error) => {
        console.error('Error updating interview:', error);
        alert('Failed to update interview. Please try again later.');
      }
    });
  }
 
  logout(): void {
    this.userService.logout();
    window.location.href = '/login';
  }

  /**
   * Génère un lien de réunion Jitsi Meet qui fonctionne immédiatement
   * sans authentification ou configuration complexe
   */
  generateMeetingLink(): void {
    // Vérifier si un lien existe déjà
    if (this.newInterview.meeting_link && this.newInterview.meeting_link.trim() !== '') {
      console.log('Utilisation du lien existant:', this.newInterview.meeting_link);
      return;
    }

    // Créer un lien Jitsi Meet qui fonctionne immédiatement sans authentification
    const uniqueId = `elitgo-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const jitsiLink = `https://meet.jit.si/${uniqueId}`;
    
    console.log('Lien de réunion Jitsi généré:', jitsiLink);
    this.newInterview.meeting_link = jitsiLink;
  }
  
  /**
   * Generates a temporary Google Meet link with valid pattern
   * Used as fallback if official API integration fails
   */

  
  /**
   * Vérifie si l'URL est un lien de réunion valide
   */
  isValidMeetingUrl(url: string): boolean {
    // Accepter les liens Jitsi Meet
    if (url && url.includes('meet.jit.si/')) {
      return true;
    }
    
    // Accepter également d'autres plateformes populaires
    if (url && (
      url.includes('zoom.us/') ||
      url.includes('teams.microsoft.com/') ||
      url.includes('meet.google.com/')
    )) {
      return true;
    }
    
    // Vérifier si c'est une URL valide
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}
