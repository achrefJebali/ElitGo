import { Component, OnInit, OnDestroy } from '@angular/core';
import { QuizService } from '../../services/quiz.service';
import { Quiz } from '../../models/quiz.model';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { QuestionDTO } from '../../models/question-dto';
import { Question, StudentAnswer } from '../../models/student-answer.model';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.css'],
})
export class QuizComponent implements OnInit, OnDestroy {
  searchTerm: string = '';
getImagePath(arg0: string) {
throw new Error('Method not implemented.');
}
encodeURI(arg0: string) {
throw new Error('Method not implemented.');
}
  isQuizSubmitted: boolean = false;
  quizScore: number | undefined;  // Store the score

  quizzes: Quiz[] = []; // List of quizzes
  questions: QuestionDTO[] = []; // Questions for the selected quiz
  userRole: string | null = null;
  quizId: number = 0;
  isQuizStarted: boolean = false; // Track if a quiz is started
  selectedQuiz: Quiz | null = null; // Store the selected quiz
  studentAnswers: StudentAnswer[] = []; // Store the user's answers

  currentPage = 1;
  itemsPerPage = 6;
  isLoading = false;
 
  isCameraActive: boolean = false;
  timer: any;
  remainingTime: number = 0;
  totalTime: number = 50;

  constructor(
    private quizService: QuizService,
    private router: Router
  ) {}
  
  waitForImagesToLoad(container: HTMLElement): Promise<void> {
    const images = Array.from(container.getElementsByTagName('img'));
    const promises = images.map((img) => {
      return new Promise<void>((resolve) => {
        if (img.complete) {
          resolve();
        } else {
          img.onload = () => resolve();
          img.onerror = () => resolve(); // éviter blocage si image absente
        }
      });
    });
  
    return Promise.all(promises).then(() => {});
  }
  
  downloadPDF(quiz: Quiz): void {
    this.selectedQuiz = quiz;
  
    this.quizService.getQuestionsByQuizId(quiz.quizId).subscribe((questionsData) => {
      this.questions = questionsData;
  
      setTimeout(() => {
        const element = document.getElementById('quiz-pdf-content');
        if (!element) {
          console.error("Element 'quiz-pdf-content' non trouvé !");
          return;
        }
  
        this.waitForImagesToLoad(element).then(() => {
          html2canvas(element, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: true,
          }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
  
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
  
            const imgProps = {
              width: canvas.width,
              height: canvas.height,
            };
  
            const imgHeight = (imgProps.height * pageWidth) / imgProps.width;
            let heightLeft = imgHeight;
            let position = 0;
  
            pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight);
            heightLeft -= pageHeight;
  
            while (heightLeft > 0) {
              position = heightLeft - imgHeight;
              pdf.addPage();
              pdf.addImage(imgData, 'PNG', 0, position, pageWidth, imgHeight);
              heightLeft -= pageHeight;
            }
  
            pdf.save(`quiz_${quiz.title || 'exam'}.pdf`);
          }).catch((error) => {
            console.error("Erreur lors de la génération du canvas:", error);
          });
        });
      }, 500);
    });
  }
  

  ngOnInit(): void {
    this.loadQuizzes();
    this.userRole = this.getUserRole();
    this.checkCameraAccess();
    this.monitorTabVisibility();
  }

  ngOnDestroy(): void {
    clearInterval(this.timer); // Cleanup the timer when the component is destroyed
    document.removeEventListener('visibilitychange', this.onVisibilityChange); // Remove event listener on destroy
  }

  getUserRole(): string | null {
    return sessionStorage.getItem('userRole');
  }

  loadQuizzes(): void {
    this.isLoading = true;
    this.quizService.getQuizzes().subscribe({
      next: (data) => {
        this.quizzes = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading quizzes', err);
        this.isLoading = false;
      },
    });
  }  navigateToUpdateQuiz(quizId: number): void {
    this.router.navigate(['/update-quiz', quizId]);
  }  deleteQuiz(id: number): void {
    if (!confirm('Voulez-vous vraiment supprimer ce quiz ?')) return;

    this.quizService.deleteQuiz(id).subscribe({
      next: () => {
        this.quizzes = this.quizzes.filter(quiz => quiz.quizId !== id);
      },
      error: (err) => console.error('Error deleting quiz', err),
    });
  }
  getAnswerForQuestion(questionId: number): string {
    const userAnswer = this.studentAnswers.find(
      (answer) => answer.question.question_id === questionId
    );
    return userAnswer ? userAnswer.answer : 'No answer';
  }
  
  isAnswerCorrect(question: Question): boolean {
    const userAnswer = this.studentAnswers.find(
      (answer) => answer.question.question_id === question.question_id
    );
    return userAnswer ? userAnswer.answer === question.correctAnswer : false;
  }

  startQuiz(quizId: number): void {
    // Prompt the user for camera access
    const userConfirmed = confirm('Please allow camera access to start the quiz. Click OK to allow and Cancel to close the quiz.');
  
    if (userConfirmed) {
      // If the user allows the camera access
      this.checkCameraAccess().then(() => {
        this.quizId = quizId;
        this.isQuizStarted = true;
        this.selectedQuiz = this.quizzes.find(quiz => quiz.quizId === quizId) || null;
  
        this.quizService.getQuestionsByQuizId(quizId).subscribe(
          (questions) => {
            this.questions = questions;
          },
          (error) => {
            console.error('Error fetching questions:', error);
          }
        );
  
        // Start timer when quiz begins
        this.startTimer();
      }).catch(() => {
        // If camera access is denied, close the quiz or redirect
        alert('Camera access is required to start the quiz. The quiz will be closed.');
        this.redirectToHome(); // Close or redirect user
      });
    } else {
      // If the user denies camera access
      alert('Camera access is required to start the quiz. The quiz will be closed.');
      this.redirectToHome(); // Close or redirect user
    }
  }

  checkCameraAccess(): Promise<void> {
    return new Promise((resolve, reject) => {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          this.isCameraActive = true;
          console.log('Camera is open');
          resolve(); // Camera is allowed, resolve the promise
        })
        .catch((err) => {
          this.isCameraActive = false;
          console.log('Camera access denied or unavailable', err);
          reject(); // Camera access denied, reject the promise
        });
    });
  }
  

  monitorCameraStatus(): void {
    this.timer = setInterval(() => {
      navigator.mediaDevices.enumerateDevices().then(devices => {
        const cameraDevice = devices.find(device => device.kind === 'videoinput');
        if (!cameraDevice) {
          this.isCameraActive = false;
          console.log('Camera is closed');
          this.redirectToHome(); // Redirect or alert user if camera is closed
        }
      });
    }, 3000); // Check every 3 seconds
  }

  monitorTabVisibility(): void {
    document.addEventListener('visibilitychange', this.onVisibilityChange);
  }

  onVisibilityChange = (): void => {
    if (document.hidden && this.isQuizStarted) {
      alert('You have switched tabs. The exam will now be terminated.');
      this.redirectToHome(); // Redirect user away if they switch tabs
    }
  };

  // Redirect user to home or another page if camera is closed or if tab is switched
  redirectToHome(): void {
    alert('The exam is terminated because the camera is no longer active or you switched tabs.');
    this.router.navigate(['/']); // Redirect to the home page or another appropriate page
  }

  startTimer(): void {
    this.remainingTime = this.totalTime;
    this.timer = setInterval(() => {
      if (this.remainingTime > 0) {
        this.remainingTime--;
      } else {
        this.submitQuiz();
      }
    }, 1000); // Update every second
  }

  submitQuiz(): void {
    let score = 0;
    this.isQuizSubmitted = true;

    this.questions.forEach((question) => {
      const userAnswer = this.studentAnswers.find(
        (answer) => answer.question.question_id === question.question_id
      );
      if (userAnswer && userAnswer.answer === question.correctAnswer) {
        score++;
      }
    });

    this.quizScore = score;
    console.log(`Your score is: ${score}`);
  }

  // Handle the user's selection of an answer
  selectAnswer(questionId: number, answer: string): void {
    const question = this.questions.find(q => q.question_id === questionId);
  
    if (!question) {
      console.error('Question not found');
      return;
    }
  
    // Check if the answer already exists for this question
    const existingAnswer = this.studentAnswers.find(
      (studentAnswer) => studentAnswer.question.question_id === questionId
    );
  
    if (existingAnswer) {
      existingAnswer.answer = answer; // Update existing answer
    } else {
      // Create a new answer entry with the full question object
      this.studentAnswers.push({
        id: this.studentAnswers.length + 1,
        answer,
        answerTime: new Date().toISOString(),
        question,
      });
    }
  }

  // Return paginated quizzes
  get paginatedQuizzes(): Quiz[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.quizzes.slice(startIndex, startIndex + this.itemsPerPage);
  }

  // Return filtered and paginated quizzes
  get filteredQuizzes(): Quiz[] {
    let filtered = this.paginatedQuizzes;
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      filtered = filtered.filter(quiz =>
        quiz.title && quiz.title.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    return filtered;
  }

  // Total pages for pagination
  get totalPages(): number {
    return Math.ceil(this.quizzes.length / this.itemsPerPage);
  }

  // Change the current page
  changePage(page: number): void {
    this.currentPage = page;
  }
}
