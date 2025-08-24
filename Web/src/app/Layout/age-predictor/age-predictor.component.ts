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

  // Track visible suggestions
  visibleSuggestions: Set<number> = new Set();

  // Disease suggestions with medications
  private DISEASE_SUGGESTIONS: { [key: string]: { advice: string, medications: string[] } } = {
    "Healthy": {
      advice: "✅ Your plant is healthy! Keep providing adequate water, nutrients, and monitor regularly for early signs of disease.",
      medications: []
    },
    "Anthracnose": {
      advice: "⚠️ Apply copper-based fungicides, prune infected areas, and avoid overhead irrigation.",
      medications: ["Copper fungicide", "Mancozeb"]
    },
    "Bacterial Spot": {
      advice: "⚠️ Use disease-free seeds, apply copper sprays, and remove infected leaves.",
      medications: ["Copper spray", "Streptomycin"]
    },
    "Dotted": {
      advice: "⚠️ Ensure balanced fertilization, improve air circulation, and apply preventive fungicides.",
      medications: ["Neem oil", "Chlorothalonil"]
    },
    "Mozaic": {
      advice: "⚠️ Remove and destroy infected leaves, control insect vectors (like aphids), and use resistant varieties.",
      medications: ["Insecticidal soap", "Imidacloprid"]
    },
    "Trips": {
      advice: "⚠️ Use sticky traps, introduce natural predators, and apply recommended insecticides if infestation is severe.",
      medications: ["Spinosad", "Pyrethrin"]
    }
  };

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

        // Structured detections with advice, medications, healthy flag
        this.detections = (response?.detections || []).map((detection: any) => {
          const disease = detection.disease_class;
          const isHealthy = disease === 'Healthy';
          const suggestionObj = this.DISEASE_SUGGESTIONS[disease] || { advice: "ℹ️ No suggestion available.", medications: [] };

          return {
            class_name: detection.class_name,
            disease_class: disease,
            confidence: detection.confidence,
            suggestion: suggestionObj.advice,
            medications: suggestionObj.medications,
            healthy: isHealthy
          };
        });

        // Overall plant health summary
        const healthyCount = this.detections.filter(d => d.healthy).length;
        const overallHealth = healthyCount === this.detections.length ?
                              "✅ Plant is healthy" :
                              "⚠️ Plant has some issues";

        if (imagePath) {
          this.image = `${imagePath}`;
          this.status = `Prediction complete! ${this.detections.length} detections found. ${overallHealth}`;
          this.showToast('success', `${this.detections.length} detections found. ${overallHealth}`);
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

  toggleSuggestion(index: number) {
    if (this.visibleSuggestions.has(index)) {
      this.visibleSuggestions.delete(index);
    } else {
      this.visibleSuggestions.add(index);
    }
  }

  isSuggestionVisible(index: number): boolean {
    return this.visibleSuggestions.has(index);
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
        confidence: detection.confidence,
        disease: detection.disease_class,
        suggestion: detection.suggestion
      };

      this.apiService.post('save-plant-record', body).subscribe({
        next: () => {
          this.showToast('success', `Saved ${detection.class_name} with ${detection.disease_class} successfully!`);
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
