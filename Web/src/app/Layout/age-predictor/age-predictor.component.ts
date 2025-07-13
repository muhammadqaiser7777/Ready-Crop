import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { helix } from 'ldrs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ApiService } from '../../Services/back-end-service.service';

helix.register();

@Component({
  selector: 'app-age-predictor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './age-predictor.component.html',
  styleUrls: ['./age-predictor.component.css']
})
export class AgePredictorComponent implements OnInit {
  image: string | null = null;
  loading: boolean = false;
  status: string = '';
  selectedPlant: string = '';
  detections: any[] = [];
  private fileBlob: File | null = null;

  showSavePopup: boolean = false;
  currentIndex: number = 0;
  validClasses = ['1 month', '2 month', '3 month', '4 month', '5 month'];

  // Toasts
  toasts: { type: 'success' | 'error' | 'info' | 'warning', message: string }[] = [];

  // User status
  verified: boolean = false;
  loggedIn: boolean = false;

  // Checkbox logic
  selectedDetections: Set<number> = new Set();

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loggedIn = !!localStorage.getItem('auth_token');
    this.verified = localStorage.getItem('status') === 'Verified';
  }

  showToast(type: 'success' | 'error' | 'info' | 'warning', message: string) {
    const toast = { type, message };
    this.toasts.push(toast);
    setTimeout(() => {
      this.toasts = this.toasts.filter(t => t !== toast);
    }, 3000);
  }

  handleImageUploadClick() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    document.body.appendChild(input);

    input.onchange = (event: Event) => {
      this.handleFileSelect(event);
      document.body.removeChild(input);
    };

    input.click();
  }

  handleTakeNewPicture() {
    const captureInput = document.createElement('input');
    captureInput.type = 'file';
    captureInput.accept = 'image/*';
    captureInput.capture = 'environment';
    captureInput.style.display = 'none';
    document.body.appendChild(captureInput);

    captureInput.onchange = (event: Event) => {
      this.handleFileSelect(event);
      document.body.removeChild(captureInput);
    };

    captureInput.click();
  }

  handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.fileBlob = input.files[0];
      this.image = URL.createObjectURL(this.fileBlob);
      this.detections = [];
      this.status = '';
    }
  }

  handleSubmit() {
    if (!this.fileBlob || !this.selectedPlant) {
      this.showToast('error', "Please select a plant and upload an image.");
      return;
    }

    this.loading = true;
    this.status = "Analyzing image...";
    this.detections = [];

    const formData = new FormData();
    formData.append('file', this.fileBlob);
    formData.append('plant', this.selectedPlant);


    this.apiService.post('predict-green-chilli', formData).subscribe({
      next: (response) => {
        const imagePath = response?.image_path;
        this.detections = response?.detections || [];

        if (imagePath) {
          this.image = `${imagePath}`;
          this.showToast('success', `${this.detections.length} detections found.`);
          this.status = `Prediction complete! ${this.detections.length} detections found.`;
        } else {
          this.status = "No image returned from server.";
          this.showToast('warning', "No image returned from server.");
        }

        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.showToast('error', "Error during prediction.");
        this.status = "Error during prediction.";
        this.loading = false;
      }
    });
  }

  isValidClass(cls: string): boolean {
    return this.validClasses.includes(cls);
  }

  toggleSelection(index: number) {
    if (this.selectedDetections.has(index)) {
      this.selectedDetections.delete(index);
    } else {
      this.selectedDetections.add(index);
    }
  }

  selectAll() {
    this.selectedDetections.clear();
    this.detections.forEach((detection, index) => {
      if (this.isValidClass(detection.class_name)) {
        this.selectedDetections.add(index);
      }
    });
  }

  saveSelectedDetections() {
    if (!this.loggedIn || !this.verified || this.selectedDetections.size === 0) return;

    const formattedPlantType = this.selectedPlant.toLowerCase().replace(/[\s\-]+/g, '_');
    const token = localStorage.getItem('auth_token');
    const detectionArray = Array.from(this.selectedDetections);

    const saveNext = (i: number) => {
      if (i >= detectionArray.length) {
        this.showToast('success', "All selected plants saved successfully!");
        this.showSavePopup = false;
        this.selectedDetections.clear();
        return;
      }

      const index = detectionArray[i];
      const detection = this.detections[index];

      const body = {
        auth_token: token,
        plant_type: formattedPlantType,
        class: detection.class_name,
        confidence: detection.confidence
      };

      this.apiService.post('save-plant-record', body).subscribe({
        next: () => {
          this.showToast('success', `Saved ${detection.class_name} successfully!`);
          saveNext(i + 1);
        },
        error: (err) => {
          console.error(err);
          this.showToast('error', `Error saving ${detection.class_name}`);
          saveNext(i + 1); // continue regardless of failure
        }
      });
    };

    saveNext(0);
  }
}
