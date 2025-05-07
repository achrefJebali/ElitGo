import { Component } from '@angular/core';
import { PredictionService } from './../../services/prediction.service';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-prediction',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule
  ],
  templateUrl: './prediction.component.html',
  styleUrls: ['./prediction.component.css']
})
export class PredictionComponent {
  predictionForm: FormGroup;
  predictionResult: any = null;
  error: string | null = null;

  constructor(private fb: FormBuilder, private predictionService: PredictionService) {
    this.predictionForm = this.fb.group({
      Hours_Studied: [0],
      Attendance: [0],
      Parental_Involvement: [''],
      Access_to_Resources: [''],
      Extracurricular_Activities: [''],
      Sleep_Hours: [0],
      Previous_Scores: [0],
      Motivation_Level: [''],
      Internet_Access: [''],
      Tutoring_Sessions: [0],
      Family_Income: [''],
      Teacher_Quality: [''],
      School_Type: [''],
      Peer_Influence: [''],
      Physical_Activity: [0],
      Learning_Disabilities: [''],
      Parental_Education_Level: [''],
      Distance_from_Home: [''],
      Gender: ['']
    });
  }

  onSubmit() {
    const formData = this.predictionForm.value;
    this.predictionService.predict(formData).subscribe(
      (result) => {
        this.predictionResult = result;
        this.error = null;
      },
      (err) => {
        this.error = err;
        this.predictionResult = null;
      }
    );
  }
}
