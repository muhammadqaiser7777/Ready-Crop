import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../Services/back-end-service.service';

@Component({
  standalone: true,
  selector: 'app-signup',
  imports: [CommonModule, FormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  @Output() signupSuccess = new EventEmitter<void>();
  @Output() loginClicked = new EventEmitter<void>();

  fullName: string = '';
  email: string = '';
  gender: string = 'male';
  password: string = '';
  confirmPassword: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  // OTP Variables
  showOtpPopup: boolean = false;
  otp: string = '';
  otpErrorMessage: string = '';
  isVerifyingOtp: boolean = false;
  otpTimer: number = 180;
  isOtpBlocked: boolean = true;

  constructor(private apiService: ApiService) {}

  togglePassword(field: string) {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else if (field === 'confirmPassword') {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  get passwordsMatch(): boolean {
    return this.password === this.confirmPassword;
  }

  validateForm(): boolean {
    if (!this.fullName.trim() || !this.email.trim() || !this.password.trim() || !this.confirmPassword.trim()) {
      this.errorMessage = 'All fields are required';
      return false;
    }
    if (!this.passwordsMatch) {
      this.errorMessage = 'Passwords do not match';
      return false;
    }
    return true;
  }

  onSignup() {
    this.errorMessage = '';
    if (!this.validateForm()) return;
  
    this.isLoading = true;
  
    const signupData = {
      full_name: this.fullName,
      email: this.email.toLowerCase().trim(),
      password: this.password,
      gender: this.gender
    };
  
    this.apiService.post('signup', signupData).subscribe({
      next: (response) => {
        localStorage.setItem('auth_token', response.auth_token);
        localStorage.setItem('email', response.email);
        localStorage.setItem('full_name', response.full_name);
        localStorage.setItem('profile_pic', response.profile_pic);
        localStorage.setItem('status', response.status);
  
        this.isLoading = false;
  
        // Show OTP popup
        this.showOtpPopup = true;
        this.startOtpTimer();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.error || 'Unexpected error occurred';
      }
    });
  }
  

  startOtpTimer() {
    this.isOtpBlocked = true;
    this.otpTimer = 180;
    const interval = setInterval(() => {
      this.otpTimer--;
      if (this.otpTimer === 0) {
        this.isOtpBlocked = false;
        clearInterval(interval);
      }
    }, 1000);
  }

  verifyOtp() {
    this.otpErrorMessage = '';
    this.isVerifyingOtp = true;

    const requestData = {
      email: localStorage.getItem('email'),
      auth_token: localStorage.getItem('auth_token'),
      otp: this.otp
    };

    this.apiService.post('verify', requestData).subscribe({
      next: () => {
        localStorage.setItem('status', 'Verified'); // Set status to Verified
        this.isVerifyingOtp = false;
        this.showOtpPopup = false;
        this.signupSuccess.emit();
      },
      error: (err) => {
        this.isVerifyingOtp = false;
        this.otpErrorMessage = err.error?.error || 'Invalid OTP';
      }
    });
  }

  regenerateOtp() {
    if (this.isOtpBlocked) return;

    this.apiService.post('otp-refresh', { email: localStorage.getItem('email') }).subscribe({
      next: () => {
        alert('New OTP sent to your email.');
        this.startOtpTimer();
      },
      error: () => {
        alert('Failed to regenerate OTP.');
      }
    });
  }

  validateOtpInput(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  onLoginClick() {
    this.loginClicked.emit();
  }
}
