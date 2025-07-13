import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../Services/back-end-service.service';

@Component({
  selector: 'app-plant-records',
  templateUrl: './plant-records.component.html',
  styleUrls: ['./plant-records.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class PlantRecordsComponent implements OnInit {
  plantRecords: any[] = [];
  plantTypeNames = ['Green Chilli', 'Onion','Garlic'];
  plantClasses = ['1 month', '2 month', '3 month', '4 month', '5 month'];
  selectedPlantType = 'green_chilli';
  selectedPlantClass = '1 month';
  confidence = 0.85;
  loading = false;
  showAddForm = false;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.viewPlantRecords();
  }

  convertToKey(name: string): string {
    return name.toLowerCase().replace(/ /g, '_');
  }

  convertToName(key: string): string {
    return key.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  }

  viewPlantRecords() {
    const authToken = localStorage.getItem('auth_token');
    if (!authToken) {
      alert('Auth token not found!');
      return;
    }

    this.loading = true;
    const payload = { auth_token: authToken };
    this.apiService.post('view-plant-records', payload).subscribe({
      next: (response: any) => {
        this.plantRecords = response.plant_records
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .map((record: any) => ({
            ...record,
            id: record.plant_id,
            plant_type_name: this.convertToName(record.plant_type),
            savedOn: this.formatDate(record.created_at)
          }));

        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching plant records:', error);
        alert('Failed to fetch plant records');
        this.loading = false;
      }
    });
  }

  saveManualPlant() {
    const authToken = localStorage.getItem('auth_token');
    if (!authToken) {
      alert('Auth token not found!');
      return;
    }

    const payload = {
      auth_token: authToken,
      plant_type: this.selectedPlantType,
      class: this.selectedPlantClass,
      confidence: 1
    };

    this.loading = true;
    this.apiService.post('save-plant-record', payload).subscribe({
      next: (_) => {
        this.viewPlantRecords();
        this.showAddForm = false;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error saving manual plant record:', error);
        alert('Failed to save plant record');
        this.loading = false;
      }
    });
  }

  deletePlantRecord(plantId: number) {
    const authToken = localStorage.getItem('auth_token');
    if (!authToken) {
      alert('Auth token not found!');
      return;
    }

    const payload = { auth_token: authToken, plant_id: plantId };

    this.loading = true;
    this.apiService.post('delete-plant-record', payload).subscribe({
      next: (_) => {
        this.plantRecords = this.plantRecords.filter(record => record.id !== plantId);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error deleting plant record:', error);
        this.loading = false;
      }
    });
  }

  formatDate(utcDate: string): string {
    const localDate = new Date(utcDate);
    return localDate.toLocaleString();
  }
}
