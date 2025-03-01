import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { } from '@angular/common/http';
import { FormationService } from '../../../services/formation.service';
import { Formation } from '../../../models/formation';
import { LayoutComponent } from '../../layout/layout.component';
import { FooterComponent } from '../../footer/footer.component';

@Component({
  selector: 'app-formation-display',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    LayoutComponent,
    FooterComponent
  ],
  templateUrl: './formation-display.component.html',
  styleUrls: ['./formation-display.component.css'],
  providers: [FormationService]
})
export class FormationDisplayComponent implements OnInit {
  formations: Formation[] = [];

  constructor(private formationService: FormationService) { }

  ngOnInit(): void {
    this.formationService.getFormations().subscribe({
      next: (data) => this.formations = data,
      error: (err) => console.error('Erreur:', err)
    });
  }
}