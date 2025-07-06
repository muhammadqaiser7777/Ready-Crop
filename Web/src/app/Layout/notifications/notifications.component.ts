import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../Services/back-end-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  imports: [CommonModule, FormsModule],
  standalone: true,
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
  unreadNotifications: any[] = [];
  readNotifications: any[] = [];
  isLoading: boolean = false;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    const authToken = localStorage.getItem('auth_token');
    if (!authToken) return;

    this.isLoading = true;

    this.apiService.post('get_user_notifications', { auth_token: authToken }).subscribe({
      next: (response) => {
        const unread = response.unread || [];
        const read = response.read || [];

        this.unreadNotifications = unread.map(this.formatNotification);
        this.readNotifications = read.map(this.formatNotification);

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to fetch notifications', err);
        this.isLoading = false;
      }
    });
  }

  formatNotification = (n: any): any => {
    const localTime = new Date(n.created_at).toLocaleString();
    const readableType = this.formatType(n.type);
    const plantType = this.formatPlant(n.plant_type);
    return {
      ...n,
      message: `Your ${plantType} plant is ${readableType} away from harvest (${localTime})`
    };
  };

  formatType(type: string): string {
    switch (type) {
      case 'three_week': return '3 weeks';
      case 'one_week': return '1 week';
      default: return type;
    }
  }

  formatPlant(plant_type: string): string {
    switch (plant_type) {
      case 'onion': return 'Onion';
      case 'garlic': return 'Garlic';
      case 'green_chilli': return 'Green Chilli';
      default: return plant_type;
    }
  }

  deleteNotification(notification: any): void {
    const authToken = localStorage.getItem('auth_token');
    if (!authToken) return;

    const payload = {
      auth_token: authToken,
      notification_id: notification.id,
      plant_id: notification.plant_id
    };

    this.apiService.post('delete_notification', payload).subscribe({
      next: () => {
        // Remove from unread or read arrays
        this.unreadNotifications = this.unreadNotifications.filter(n => n.id !== notification.id);
        this.readNotifications = this.readNotifications.filter(n => n.id !== notification.id);
      },
      error: (err) => {
        console.error('Failed to delete notification', err);
      }
    });
  }

  trackByNotification(index: number, item: any): string {
    return item.id;
  }
}
