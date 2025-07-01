import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../Services/back-end-service.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  showPassword: boolean = false;
  loginForm: FormGroup;
  errorMessage: string = '';
  loading: boolean = false;

  @Output() signupClicked = new EventEmitter<void>();
  @Output() forgotPasswordClicked = new EventEmitter<void>();
  @Output() loginSuccess = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  get passwordControl() {
    return this.loginForm.get('password');
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    this.errorMessage = '';
    
    if (this.loginForm.valid) {
      this.loading = true; // <<< Start loader
      const loginData = {
        email: this.loginForm.value.email.toLowerCase().trim(),
        password: this.loginForm.value.password
      };
  
      this.apiService.post('login', loginData).subscribe({
        next: (response) => {
          this.loading = false; // <<< Stop loader
          Object.entries(response).forEach(([key, value]) => {
            localStorage.setItem(key, String(value));
          });
          this.loginSuccess.emit();
        },
        error: (error) => {
          this.loading = false; // <<< Stop loader
          console.error('Login error:', error);
          this.handleLoginError(error);
        }
      });
    }
  }
  
  

  private handleLoginError(error: any) {
    if (error.status === 404) {
      this.errorMessage = 'User not found';
    } else if (error.status === 401) {
      this.errorMessage = 'Invalid credentials';
    } else if (error.error?.error) {
      this.errorMessage = error.error.error;
    } else {
      this.errorMessage = 'Internal server error. Please try again later.';
    }
  }

  onSignupClick() {
    this.signupClicked.emit();
  }

  onForgotPasswordClick() {
    this.forgotPasswordClicked.emit();
  }
}