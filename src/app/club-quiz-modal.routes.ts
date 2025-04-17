import { Route } from '@angular/router';
import { ClubQuizModalComponent } from './components/club-quiz-modal/club-quiz-modal.component';

export const CLUB_QUIZ_ROUTES: Route[] = [
  {
    path: 'club-quiz/:id',
    component: ClubQuizModalComponent
  }
];
