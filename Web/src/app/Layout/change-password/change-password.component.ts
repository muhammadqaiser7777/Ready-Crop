import { Component } from '@angular/core';
import { ApiService } from '../../Services/back-end-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-change-password',
  imports: [CommonModule, FormsModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css'
})
export class ChangePasswordComponent {
  password: string = '';
  newPassword: string = '';
  confirmNewPassword: string = '';
  showCurrentPassword: boolean = false;
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;
  backendError: string = '';
  successMessage: string = '';
  loading: boolean = false;

  constructor(private apiService: ApiService) {}

  passwordsMatch(): boolean {
    return (
      this.newPassword === this.confirmNewPassword &&
      this.newPassword.length > 0 &&
      this.password !== this.newPassword
    );
  }

  toggleShow(field: 'current' | 'new' | 'confirm'): void {
    if (field === 'current') this.showCurrentPassword = !this.showCurrentPassword;
    if (field === 'new') this.showNewPassword = !this.showNewPassword;
    if (field === 'confirm') this.showConfirmPassword = !this.showConfirmPassword;
  }

  clearMessages(): void {
    this.backendError = '';
    this.successMessage = '';
  }

  changePassword(): void {
    this.backendError = '';
    this.successMessage = '';
    this.loading = true;

    const email = localStorage.getItem('email');
    const auth_token = localStorage.getItem('auth_token');

    if (!email || !auth_token) {
      this.backendError = 'Missing email or auth_token in local storage';
      this.loading = false;
      return;
    }

    const payload = {
      email,
      auth_token,
      password: this.password,
      new_password: this.newPassword
    };

    this.apiService.post('change-password', payload).subscribe({
      next: (response) => {
        console.log('Password changed successfully', response);
        this.successMessage = 'Password changed successfully';
        this.password = '';
        this.newPassword = '';
        this.confirmNewPassword = '';
        this.loading = false;
      },
      error: (error) => {
        if (error.status === 401) {
          this.backendError = 'Invalid password';
        } else if (error.status === 400) {
          this.backendError = error?.error?.message || 'Invalid input';
        } else {
          this.backendError = 'An unexpected error occurred';
        }
        console.error('Error changing password', error);
        this.loading = false;
      }
    });
  }
}
