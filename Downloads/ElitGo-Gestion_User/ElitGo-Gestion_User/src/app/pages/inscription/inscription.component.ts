import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors, AsyncValidatorFn } from '@angular/forms';
import { Observable, of, timer, Subject } from 'rxjs';
import { map, switchMap, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { User } from '../models/user.model';
import { UserService } from '../services/user.service';
import { LayoutComponent } from '../layout/layout.component';
import { FooterComponent } from '../footer/footer.component';
import { OpenStreetMapService } from '../services/open-street-map.service';

interface RegistrationForm extends Omit<User, 'id' | 'token'> {
  confirmPassword: string;
}

@Component({
  selector: 'app-inscription',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, HttpClientModule, LayoutComponent, FooterComponent],
  templateUrl: './inscription.component.html',
  styleUrls: ['./inscription.component.css'],
})
export class InscriptionComponent implements OnInit, AfterViewInit {
  registrationForm!: FormGroup;
  submitted = false;
  showPassword = false;
  showConfirmPassword = false;
  
  @ViewChild('addressInput') addressInput!: ElementRef<HTMLInputElement>;
  addressSuggestions: string[] = [];
  showAddressSuggestions = false;
  private addressInputChanged = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private userService: UserService, 
    private router: Router,
    private fb: FormBuilder,
    private openStreetMapService: OpenStreetMapService
  ) {
    this.initForm();
  }

  ngOnInit() {
    // Form is already initialized in constructor
    
    // Set up address search with OpenStreetMap
    this.setupAddressAutocomplete();
  }
  
  ngAfterViewInit() {
    // Nothing needed here since we're using reactive approach
  }
  
  // Set up address autocomplete with OpenStreetMap
  private setupAddressAutocomplete(): void {
    // Listen for changes to the address input
    this.addressInputChanged.pipe(
      debounceTime(300), // Wait for 300ms pause in events
      distinctUntilChanged(), // Only emit when the value has changed
      switchMap(query => this.openStreetMapService.searchAddress(query)),
      takeUntil(this.destroy$) // Clean up on component destroy
    ).subscribe(suggestions => {
      this.addressSuggestions = suggestions;
      this.showAddressSuggestions = suggestions.length > 0;
    });
  }
  
  // Handle address input changes
  onAddressInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.addressInputChanged.next(input.value);
  }
  
  // Select an address suggestion
  selectAddressSuggestion(address: string): void {
    this.registrationForm.patchValue({ address });
    this.showAddressSuggestions = false;
  }

  private createEmailValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) {
        return of(null);
      }

      return timer(500).pipe(
        switchMap(() => this.userService.checkEmailExists(control.value)),
        map(exists => exists ? { emailExists: true } : null)
      );
    };
  }

  private createUsernameValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) {
        return of(null);
      }

      return timer(500).pipe(
        switchMap(() => this.userService.checkUsernameExists(control.value)),
        map(exists => exists ? { usernameExists: true } : null)
      );
    };
  }

  private initForm(): void {
    this.registrationForm = this.fb.group({
      name: ['', [
        Validators.required, 
        Validators.minLength(2),
        Validators.pattern(/^[A-Za-z\s]+$/) // Only letters and spaces allowed
      ]],
      username: ['', 
        [
          Validators.required, 
          Validators.minLength(4)
        ],
        [this.createUsernameValidator()]
      ],
      email: ['', 
        [
          Validators.required, 
          Validators.email,
          Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
        ],
        [this.createEmailValidator()]
      ],
      phone: ['', [
        Validators.required, 
        Validators.pattern(/^\+?[0-9]{8,15}$/)
      ]],
      address: ['', Validators.required],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        this.createPasswordStrengthValidator()
      ]],
      confirmPassword: ['', Validators.required],
      photo: [''],
      status: ['ACTIVE'],
      balance: [0],
      role: ['STUDENT'],
      isPaid: [false],
      weeklyInterviews: [0]
    }, {
      validators: this.passwordMatchValidator
    });

    // Add real-time validation for username and email
    this.f['username'].valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(() => {
      if (this.f['username'].valid) {
        this.f['username'].updateValueAndValidity({ emitEvent: false });
      }
    });

    this.f['email'].valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(() => {
      if (this.f['email'].valid) {
        this.f['email'].updateValueAndValidity({ emitEvent: false });
      }
    });

    // Real-time validation for password strength
    this.f['password'].valueChanges.subscribe(() => {
      this.f['password'].updateValueAndValidity();
    });
  }

  private createPasswordStrengthValidator(): ValidationErrors | null {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (!value) {
        return null;
      }

      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumeric = /[0-9]/.test(value);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

      const passwordValid = hasUpperCase && hasLowerCase && hasNumeric && hasSpecialChar;

      return !passwordValid ? {
        passwordStrength: {
          hasUpperCase,
          hasLowerCase,
          hasNumeric,
          hasSpecialChar,
        }
      } : null;
    };
  }

  private passwordMatchValidator(fg: FormGroup) {
    const password = fg.get('password');
    const confirmPassword = fg.get('confirmPassword');
    
    if (!password || !confirmPassword) return null;
    
    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  get f() { 
    return this.registrationForm.controls; 
  }

  togglePasswordVisibility(field: 'password' | 'confirmPassword') {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  getErrorMessage(fieldName: string): string {
    const control = this.f[fieldName];
    if (!control || !control.errors || !control.touched) return '';

    const errors = control.errors;

    const errorMessages: { [key: string]: string } = {
      required: 'This field is required',
      email: 'Please enter a valid email address',
      minlength: `Minimum length is ${control.errors['minlength']?.requiredLength} characters`,
      pattern: this.getPatternErrorMessage(fieldName),
      passwordMismatch: 'Passwords do not match',
      passwordStrength: this.getPasswordStrengthError(control.errors['passwordStrength']),
      emailExists: 'This email is already registered',
      usernameExists: 'This username is already taken'
    };

    return errorMessages[Object.keys(errors)[0]] || 'Invalid input';
  }

  private getPasswordStrengthError(strengthErrors: any): string {
    if (!strengthErrors) return '';

    const { hasUpperCase, hasLowerCase, hasNumeric, hasSpecialChar } = strengthErrors;
    const missing = [];

    if (!hasUpperCase) missing.push('uppercase letter');
    if (!hasLowerCase) missing.push('lowercase letter');
    if (!hasNumeric) missing.push('number');
    if (!hasSpecialChar) missing.push('special character');

    return `Password must contain at least one ${missing.join(', ')}`;
  }

  private getPatternErrorMessage(fieldName: string): string {
    switch (fieldName) {
      case 'name':
        return 'Name can only contain letters and spaces';
      case 'phone':
        return 'Please enter a valid phone number (8-15 digits)';
      case 'email':
        return 'Please enter a valid email address';
      default:
        return 'Invalid format';
    }
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.registrationForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.f).forEach(key => {
        const control = this.f[key];
        control.markAsTouched();
      });
      return;
    }

    const formValue = this.registrationForm.value;
    const { confirmPassword, ...userData } = formValue;

    this.userService.addUser(userData as User).subscribe({
      next: (response) => {
        console.log('User successfully created!', response);
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('There was an error!', error);
        if (error.status === 409) {
          if (error.error.includes('email')) {
            this.f['email'].setErrors({ emailExists: true });
          }
          if (error.error.includes('username')) {
            this.f['username'].setErrors({ usernameExists: true });
          }
        }
      }
    });
  }
}
