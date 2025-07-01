import { Component } from '@angular/core';
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
export class AgePredictorComponent {
  image: string | null = null;  // Image display in base64 format
  loading: boolean = false;
  status: string = '';
  selectedPlant: string = '';
  detections: any[] = [];  // Store the detections (class names, confidence, etc.)
  private fileBlob: File | null = null;

  constructor(private apiService: ApiService) {}

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
    }
  }

  handleSubmit() {
    if (!this.fileBlob || !this.selectedPlant) {
      alert("Please select a plant and upload an image.");
      return;
    }
  
    this.loading = true;
    this.status = "Analyzing image...";
    this.detections = [];  // Reset detections each time
  
    const formData = new FormData();
    formData.append('file', this.fileBlob);
    formData.append('plant', this.selectedPlant);
  
    // Define the backend URL (you can change this to match your production or dev server)
    const backendUrl = 'http://localhost:5000';
  
    this.apiService.post('predict-green-chilli', formData).subscribe({
      next: (response) => {
        const imagePath = response?.image_path;  // Image path returned by backend
        this.detections = response?.detections || [];  // Capture the detections (class names, confidence, etc.)
  
        if (imagePath) {
          this.image = `${backendUrl}/${imagePath}`;  // Prepend backend URL to the image path
          this.status = `Prediction complete! ${this.detections.length} detections found.`;  // Show status with detections count
        } else {
          this.status = "No image returned from server.";
        }
  
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.status = "Error during prediction.";
        this.loading = false;
      }
    });
  }
  
}
