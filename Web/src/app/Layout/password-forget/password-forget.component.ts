import { Component, EventEmitter, Output, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../Services/back-end-service.service';

@Component({
  standalone: true,
  selector: 'app-password-forget',
  imports: [CommonModule, FormsModule],
  templateUrl: './password-forget.component.html',
  styleUrl: './password-forget.component.css'
})
export class PasswordForgetComponent implements OnInit, OnDestroy {
  @Output() backToLogin = new EventEmitter<void>();
  @Output() passwordResetSuccess = new EventEmitter<void>(); // Event for redirecting after success

  email: string = '';
  emailValid: boolean = false;
  otp: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  isLoading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';
  otpErrorMessage: string = '';
  passwordErrorMessage: string = '';

  showOtpPopover: boolean = false;
  showPasswordPopover: boolean = false;

  otpCountdown: number = 180;
  passwordCountdown: number = 0;
  otpTimer: any;
  passwordTimer: any;
  emailValidationTimer: any;
  
  otpButtonCountdown: number = 180;
  isOtpButtonDisabled: boolean = true;
  otpButtonTimer: any;

  constructor(private apiService: ApiService) {}

  validateEmail() {
    clearTimeout(this.emailValidationTimer);
    this.emailValidationTimer = setTimeout(() => {
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      this.emailValid = emailPattern.test(this.email);
      this.clearMessages();
    }, 500);
  }

  clearMessages() {
    this.successMessage = '';
    this.errorMessage = '';
    this.otpErrorMessage = '';
    this.passwordErrorMessage = '';
  }

  onSubmit() {
    if (!this.emailValid) {
      this.errorMessage = "Please enter a valid email.";
      return;
    }
  
    const formattedEmail = this.email.toLowerCase().trim();
  
    this.isLoading = true;
    this.apiService.post('password-forget', { email: formattedEmail }).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response?.message === "OTP sent successfully") {
          sessionStorage.setItem('email', formattedEmail);
          this.successMessage = "OTP sent successfully! Check your email.";
          this.errorMessage = '';
          this.showOtpPopover = true;
          this.startOtpCountdown();  // Start OTP expiration countdown
          this.startOtpButtonCountdown();  // Start OTP button countdown at the same time
        } else {
          this.errorMessage = "Unexpected response from server.";
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.error === "User not found"
          ? "User not found. Please enter a registered email."
          : "Internal server error. Please try again later.";
      }
    });
  }
  

  refreshOtp() {
    const email = sessionStorage.getItem('email');
    if (!email) {
      this.errorMessage = "Session expired. Please request a new OTP.";
      return;
    }
  
    this.apiService.post('otp-refresh', { email }).subscribe({
      next: (response) => {
        if (response?.message === "OTP regenerated successfully") {
          this.successMessage = "New OTP generated successfully! Check your email.";
          this.errorMessage = '';
          this.otpErrorMessage = '';
          this.startOtpCountdown();  // Restart OTP expiration countdown
          this.startOtpButtonCountdown();  // Restart OTP button countdown at the same time
        } else {
          this.errorMessage = "Unexpected response from server.";
        }
      },
      error: (err) => {
        this.errorMessage = err?.error?.error === "Database error while retrieving OTP data"
          ? "Error retrieving OTP. Please try again later."
          : "Unexpected error occurred. Please try again.";
      }
    });
  }
  
  startOtpCountdown() {
    clearInterval(this.otpTimer);
    this.otpCountdown = 180;
    this.isOtpButtonDisabled = true;

    this.otpTimer = setInterval(() => {
      this.otpCountdown--;
      if (this.otpCountdown <= 0) {
        clearInterval(this.otpTimer);
        this.otpErrorMessage = "OTP expired. Please request a new one.";
        this.isOtpButtonDisabled = false;
      }
    }, 1000);
  }

  verifyOtp() {
    if (this.otp.length !== 6) {
      this.otpErrorMessage = "Please enter a valid 6-digit OTP.";
      return;
    }

    this.apiService.post('verify-identity', { email: sessionStorage.getItem('email'), otp: this.otp }).subscribe({
      next: (response) => {
        sessionStorage.setItem('tempToken', response?.temp_token);
        this.successMessage = "OTP verified successfully. Set your new password.";
        this.otpErrorMessage = '';
        this.showOtpPopover = false;
        this.showPasswordPopover = true;
        this.passwordCountdown = this.otpCountdown;
        this.startPasswordCountdown();
        clearInterval(this.otpTimer);
      },
      error: () => {
        this.otpErrorMessage = "Invalid OTP. Please try again.";
      }
    });
  }

  startPasswordCountdown() {
    clearInterval(this.passwordTimer);
    this.passwordTimer = setInterval(() => {
      this.passwordCountdown--;
      if (this.passwordCountdown <= 0) {
        clearInterval(this.passwordTimer);
        this.showPasswordPopover = false;
        this.errorMessage = "Session expired. Please request a new OTP.";
      }
    }, 1000);
  }

  passwordsMatch(): boolean {
    return this.newPassword === this.confirmPassword && this.newPassword.length >= 8;
  }

  changePassword() {
    if (!this.passwordsMatch()) {
      this.passwordErrorMessage = "Passwords do not match or are too short.";
      return;
    }

    this.apiService.post('set-new-password', {
      email: sessionStorage.getItem('email'),
      temp_token: sessionStorage.getItem('tempToken'),
      new_password: this.newPassword
    }).subscribe({
      next: () => {
        this.successMessage = "Password changed successfully. Redirecting to login...";
        this.passwordErrorMessage = '';
        this.showPasswordPopover = false;
        sessionStorage.clear();
        clearInterval(this.passwordTimer);

        setTimeout(() => {
          this.passwordResetSuccess.emit(); // Emit event to redirect to login
        }, 2000);
      },
      error: (err) => {
        this.passwordErrorMessage = err?.error?.error === "Temporary token verification failed."
          ? "Temporary token verification failed."
          : "Internal server error. Please try again later.";
      }
    });
  }

  resendOtp() {
    this.onSubmit();
  }

  startOtpButtonCountdown() {
    clearInterval(this.otpButtonTimer);
    this.isOtpButtonDisabled = true;
    this.otpButtonCountdown = 180;

    this.otpButtonTimer = setInterval(() => {
      this.otpButtonCountdown--;
      if (this.otpButtonCountdown <= 0) {
        clearInterval(this.otpButtonTimer);
        this.isOtpButtonDisabled = false;
      }
    }, 1000);
  }

  ngOnInit() {
    this.startOtpButtonCountdown();
  }

  ngOnDestroy() {
    clearInterval(this.otpTimer);
    clearInterval(this.passwordTimer);
    clearInterval(this.otpButtonTimer);
  }
}