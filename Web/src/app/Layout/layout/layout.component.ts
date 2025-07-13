import {
  Component,
  ViewChild,
  ViewContainerRef,
  ComponentRef,
  AfterViewInit,
  OnDestroy,
  OnInit,
  HostListener,
  ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../Services/back-end-service.service';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-layout',
  standalone: true,
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
  imports: [CommonModule, FormsModule]
})
export class LayoutComponent implements AfterViewInit, OnDestroy, OnInit {
  selectedComponent: string = '';
  componentRef!: ComponentRef<any>;
  loggedIn: boolean = false;
  profileDropdownOpen: boolean = false;
  private storageCheckInterval: any;
  newNotifications: boolean = false;
  notificationInterval: any;


  userData: { [key: string]: string | null } = {};

  @ViewChild('content', { read: ViewContainerRef }) content!: ViewContainerRef;
  @ViewChild('profileDropdown') profileDropdownRef!: ElementRef<HTMLElement>;
  @ViewChild('profileButton') profileButtonRef!: ElementRef<HTMLElement>;

  constructor(private apiService: ApiService, private cdRef: ChangeDetectorRef) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const clickedInsideDropdown = this.profileDropdownRef?.nativeElement.contains(event.target as Node);
    const clickedProfileButton = this.profileButtonRef?.nativeElement.contains(event.target as Node);

    if (!clickedInsideDropdown && !clickedProfileButton) {
      this.profileDropdownOpen = false;
    }
  }

ngOnInit() {
  this.checkAuthStatus();
  this.loadComponent('agePredictor');

  const status = localStorage.getItem('status');
  
  if (this.loggedIn && status === 'Verified') {
    this.notificationInterval = setInterval(() => {
      this.checkUnreadNotifications();
    }, 2000);
  }
}




ngAfterViewInit() {
  setTimeout(() => {
    const isLoggedIn = this.checkAuthStatus();
    this.loadComponent('agePredictor');
    this.checkUnreadNotifications();
  });
}


  toggleProfileDropdown() {
    this.profileDropdownOpen = !this.profileDropdownOpen;
  }

  async logout() {
    if (!this.userData['email'] || !this.userData['auth_token']) {
      console.error("No email or auth token found.");
      return;
    }
  
    const body = {
      email: this.userData['email'],
      auth_token: this.userData['auth_token']
    };
  
    this.apiService.post('logout', body).subscribe({
      next: async (response) => {
        localStorage.clear();
        this.checkAuthStatus();
        this.profileDropdownOpen = false;
        this.loggedIn = false;
        
        // ✅ Load the age predictor component after logout
        this.selectedComponent = ''; // reset to allow reloading
        await this.loadComponent('agePredictor');
        if (this.notificationInterval) {
          clearInterval(this.notificationInterval);
        }
      },
      error: (error) => {
        localStorage.clear();
        this.loggedIn = false;
        if (this.notificationInterval) {
          clearInterval(this.notificationInterval);
        }
      }
    });
  }
  

checkAuthStatus(): boolean {
  const requiredKeys = ['auth_token', 'email', 'full_name', 'profile_pic', 'status'];
  this.userData = {};
  requiredKeys.forEach(key => {
    this.userData[key] = localStorage.getItem(key);
  });

  const isLoggedIn = requiredKeys.every(key =>
    this.userData[key] && this.userData[key] !== 'null' && this.userData[key]?.trim() !== ''
  );

  this.loggedIn = isLoggedIn;
  return isLoggedIn;
}


  async loadComponent(componentName: string) {
    if (this.selectedComponent === componentName || !this.content) return;

    if (this.componentRef) {
      this.componentRef.destroy();
    }

    this.selectedComponent = componentName;
    this.content.clear();

    try {
      switch (componentName) {
        case 'login':
          const { LoginComponent } = await import('../login/login.component');
          this.componentRef = this.content.createComponent(LoginComponent);
          this.componentRef.instance.signupClicked?.subscribe(() => this.loadComponent('signup'));
          this.componentRef.instance.forgotPasswordClicked?.subscribe(() => this.loadComponent('forgot-password'));
          this.componentRef.instance.loginSuccess?.subscribe(() => {
            this.checkAuthStatus();
            this.loadComponent('agePredictor');
          });
          break;

        case 'signup':
          const { SignupComponent } = await import('../signup/signup.component');
          this.componentRef = this.content.createComponent(SignupComponent);
          this.componentRef.instance.loginClicked?.subscribe(() => this.loadComponent('login'));
          this.componentRef.instance.signupSuccess?.subscribe(() => {
            this.checkAuthStatus();
            this.loadComponent('agePredictor');
            this.loggedIn = true;
          });
          break;

        case 'forgot-password':
          const { PasswordForgetComponent } = await import('../password-forget/password-forget.component');
          this.componentRef = this.content.createComponent(PasswordForgetComponent);
          this.componentRef.instance.backToLoginClicked?.subscribe(() => this.loadComponent('login'));
          this.componentRef.instance.passwordResetSuccess?.subscribe(() => this.loadComponent('login'));
          break;

        case 'notifications':
          const { NotificationsComponent } = await import('../notifications/notifications.component');
          this.componentRef = this.content.createComponent(NotificationsComponent);
          break;

        case 'guide':
          const { GuideComponent } = await import('../guide/guide.component');
          this.componentRef = this.content.createComponent(GuideComponent);
          break;

        case 'plantRecords':
          const { PlantRecordsComponent } = await import('../plant-records/plant-records.component');
          this.componentRef = this.content.createComponent(PlantRecordsComponent);
          this.profileDropdownOpen = false;
          break;

        case 'changePassword':
          const { ChangePasswordComponent } = await import('../change-password/change-password.component');
          this.componentRef = this.content.createComponent(ChangePasswordComponent);
          this.profileDropdownOpen = false;
          break;

        default:
          const { AgePredictorComponent } = await import('../age-predictor/age-predictor.component');
          this.componentRef = this.content.createComponent(AgePredictorComponent);
      }
    } catch (error) {
      console.error('Error loading component:', error);
    }
  }

ngOnDestroy() {
  if (this.componentRef) {
    this.componentRef.destroy();
  }
  if (this.storageCheckInterval) {
    clearInterval(this.storageCheckInterval);
  }
  if (this.notificationInterval) {
    clearInterval(this.notificationInterval);
  }
}


// Properties
otpDialogOpen = false;
otpStatus: 'Valid' | 'Expired' | '' = '';
enteredOtp = '';
otpTimer = 0;
otpInterval: any;
isLoading: boolean = false;
errorMessage: string = '';

// Verify Button Click
handleVerificationClick() {
  const storedEmail = localStorage.getItem('email');
  if (!storedEmail) {
    this.errorMessage = "Email not found in local storage.";
    return;
  }
  const email = storedEmail.toLowerCase().trim();
  this.isLoading = true;

  this.apiService.post('validate-otp', { email }).subscribe({
    next: (response) => {
      this.isLoading = false;

      const status = response?.message; // Expected: "Valid" or "Expired"
      const expiryString = response?.otp_expiry;
      const otpExpiry = expiryString ? new Date(expiryString + 'Z') : null;

      if (status === 'Valid' && otpExpiry && otpExpiry.getTime() > Date.now()) {
        // ✅ OTP is valid
        this.otpStatus = 'Valid';
        this.otpDialogOpen = true;
        this.errorMessage = '';
        this.cdRef.detectChanges();
        this.startOtpTimer(otpExpiry);
      } else if (status === 'Expired') {
        // ❌ OTP is expired (as confirmed by backend)
        this.otpStatus = 'Expired';
        this.otpDialogOpen = true;
        this.errorMessage = '';
      } else {
        // ❗ Unexpected fallback
        this.errorMessage = "Unexpected response from server.";
        this.otpStatus = '';
        this.otpDialogOpen = false;
      }
    },
    error: (err) => {
      this.isLoading = false;
      this.errorMessage = "Verification failed. Please try again.";
      console.error("OTP validation failed", err);
    }
  });
}


// Start Timer Based on Expiry
startOtpTimer(otpExpiry: Date) {
  const currentTime = new Date();
  const timeDifference = otpExpiry.getTime() - currentTime.getTime();

  clearInterval(this.otpInterval); // ✅ Always clear previous

  if (timeDifference <= 0) {
    this.otpStatus = 'Expired';
    this.otpTimer = 0;
    return;
  }

  this.otpTimer = Math.floor(timeDifference / 1000);

  this.otpInterval = setInterval(() => {
    this.otpTimer--;
    if (this.otpTimer <= 0) {
      clearInterval(this.otpInterval); // ✅ Avoid leaks
      this.otpStatus = 'Expired';
    }
  }, 1000); // ✅ Use 1000ms (not 100ms) for actual 1-second countdown
}


refreshOtp() {
  const email = localStorage.getItem('email');
  if (!email) return;

  this.isLoading = true;

  this.apiService.post('otp-refresh', { email }).subscribe({
    next: (response) => {
      this.isLoading = false;

      const now = new Date();
      const otpExpiry = new Date(now.getTime() + 175 * 1000); // 175 seconds from now

      this.otpStatus = 'Valid';
      this.otpDialogOpen = true;
      this.startOtpTimer(otpExpiry);
      this.cdRef.detectChanges();
      this.errorMessage = '';
    },
    error: (err) => {
      this.isLoading = false;
      this.errorMessage = "OTP refresh failed. Please try again.";
      console.error("OTP refresh failed", err);
    }
  });
}

// Submit OTP
submitOtp() {
  const email = localStorage.getItem('email');
  const authToken = localStorage.getItem('auth_token');

  if (!email || !authToken || !this.enteredOtp) return;

  this.isLoading = true;

  const body = {
    email,
    auth_token: authToken,
    otp: this.enteredOtp
  };

  this.apiService.post('verify', body).subscribe({
    next: () => {
      this.isLoading = false;

      // ✅ Update localStorage
      localStorage.setItem('status', 'Verified');

      // ✅ Close OTP Dialog
      this.closeOtpDialog();

      // ✅ Refresh the entire page to reload layout/component state
      window.location.reload();
    },
    error: (err) => {
      this.isLoading = false;
      this.errorMessage = "OTP verification failed. Please try again.";
      console.error("OTP submit failed", err);
    }
  });
}


// Close Dialog
closeOtpDialog() {
  this.otpDialogOpen = false;
  this.otpStatus = '';
  this.enteredOtp = '';
  clearInterval(this.otpInterval);
}

checkUnreadNotifications() {
  const authToken = localStorage.getItem('auth_token');
  const status = localStorage.getItem('status');

  // Check if the user is verified and has a token
  if (!authToken || status !== 'Verified') {
    this.newNotifications = false;
    return;
  }

  const body = { auth_token: authToken };

  this.apiService.post('check-unread-notifications', body, { observe: 'response' }).subscribe({
    next: (httpResponse) => {
      this.newNotifications = !!(httpResponse.body && httpResponse.body.unread_notifications === true);
    },
    error: (err) => {
      console.error("API error:", err);
      this.newNotifications = false;
    }
  });
}
}