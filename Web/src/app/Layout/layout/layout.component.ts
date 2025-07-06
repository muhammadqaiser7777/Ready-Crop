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

  constructor(private apiService: ApiService) {}

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

  if (this.loggedIn) {
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
otpStatus: 'valid' | 'expired' | '' = '';
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
      const status = response?.message?.toLowerCase(); 
      const otpExpiry = new Date(response?.otp_expiry);
    
      if (status === 'valid' && otpExpiry) {
        this.otpStatus = 'valid';  // ✅ Set status optimistically
    
        const timeDifference = otpExpiry.getTime() - new Date().getTime();
        if (timeDifference > 0) {
          this.otpDialogOpen = true;
          this.startOtpTimer(otpExpiry);
          this.errorMessage = '';
        } else {
          this.otpStatus = 'expired';  // ❗ Only mark expired if timer is already dead
          this.otpDialogOpen = true;
          this.errorMessage = '';
        }
    
      } else if (status === 'expired') {
        this.otpStatus = 'expired';
        this.otpDialogOpen = true;
        this.errorMessage = '';
      } else {
        this.errorMessage = "Unexpected response from server.";
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

  if (timeDifference <= 0) {
    this.otpStatus = 'expired';
    this.otpTimer = 0;
    return;
  }

  this.otpTimer = Math.floor(timeDifference / 1000);
  clearInterval(this.otpInterval);

  this.otpInterval = setInterval(() => {
    this.otpTimer--;
    if (this.otpTimer <= 0) {
      clearInterval(this.otpInterval);
      this.otpStatus = 'expired';
    }
  }, 100);
}

// Generate New OTP
refreshOtp() {
  const email = localStorage.getItem('email');
  if (!email) return;

  this.isLoading = true;
  this.apiService.post('otp-refresh', { email }).subscribe({
    next: (response) => {
      this.isLoading = false;
      const otpExpiry = new Date(response?.otp_expiry);
      const timeDifference = otpExpiry.getTime() - new Date().getTime();

      if (otpExpiry && timeDifference > 0) {
        this.otpStatus = 'valid';
        this.otpDialogOpen = true;
        this.startOtpTimer(otpExpiry);
        this.errorMessage = '';
      } else {
        this.otpStatus = 'expired';
        this.errorMessage = "New OTP is already expired.";
      }
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
  if (!email || !this.enteredOtp) return;

  this.isLoading = true;
  this.apiService.post('verify-otp', {
    email,
    otp: this.enteredOtp
  }).subscribe({
    next: (response) => {
      this.isLoading = false;
      if (response?.status?.toLowerCase() === 'verified') {
        localStorage.setItem('status', 'Verified');
        this.closeOtpDialog();
      } else {
        this.errorMessage = "Incorrect OTP. Please try again.";
      }
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
  if (!authToken) {
    this.newNotifications = false;
    return;
  }

  const body = { auth_token: authToken };

  this.apiService.post('check-unread-notifications', body, { observe: 'response' }).subscribe({
    next: (httpResponse) => {

      if (httpResponse.body && httpResponse.body.unread_notifications === true) {
        this.newNotifications = true;
      } else {
        this.newNotifications = false;
      }

    },
    error: (err) => {
      console.error("API error:", err);
      this.newNotifications = false;
    }
  });
}


}
