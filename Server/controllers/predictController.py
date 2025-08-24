from flask import request, jsonify  # type: ignore
from PIL import Image  # type: ignore
import numpy as np  # type: ignore
import cv2  # type: ignore
import os
import torch # type: ignore
import torch.nn.functional as F # type: ignore
from torchvision import models, transforms # type: ignore
from ultralytics import YOLO  # type: ignore

BACKEND_URL = os.getenv("Backend_URL")

# ============================
# Load YOLO model (harvest)
# ============================
harvest_model_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "ML-models", "green_chilli.pt"))
harvest_model = YOLO(harvest_model_path)
harvest_class_names = harvest_model.names

# ============================
# Load PyTorch classification model (disease)
# ============================
disease_model_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "ML-models", "green_chilli_disease.pt"))
disease_classes = ["Bacterial Spot", "Anthracnose", "Healthy", "Mozaic", "Trips", "Dotted"]

num_classes = len(disease_classes)
disease_model = models.resnet18(weights=None)
disease_model.fc = torch.nn.Linear(disease_model.fc.in_features, num_classes)
disease_model.load_state_dict(torch.load(disease_model_path, map_location="cpu"))
disease_model.eval()

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])

# ============================
# Output folder for predictions
# ============================
output_dir = os.path.join(os.path.dirname(__file__), "..", "static", "Public", "green-chilli-predictions")
os.makedirs(output_dir, exist_ok=True)

def predict_green_chilli():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    selected_plant = request.form.get('plant')
    if selected_plant != 'green-chilli':
        return jsonify({"error": "Invalid plant selection"}), 400

    file = request.files['file']
    image = Image.open(file.stream).convert("RGB")
    image_np = np.array(image)

    try:
        harvest_results = harvest_model(image_np)
        annotated_image = image_np.copy()
        detections = []

        h, w, _ = annotated_image.shape  # image dimensions
        edge_offset_x = int(0.05 * w)  # 5% inside edges
        edge_offset_y = int(0.05 * h)

        font_scale = 0.8  # slightly bigger
        font_thickness = 2

        for box in harvest_results[0].boxes:
            class_id = int(box.cls[0])
            class_name = harvest_class_names[class_id]
            confidence = float(box.conf[0])
            bbox = box.xyxy[0].tolist()
            x1, y1, x2, y2 = map(int, bbox)

            # Clamp box coordinates with edge offset
            x1 = max(edge_offset_x, x1)
            y1 = max(edge_offset_y, y1)
            x2 = min(w - edge_offset_x, x2)
            y2 = min(h - edge_offset_y, y2)

            # Draw harvest box (green)
            cv2.rectangle(annotated_image, (x1, y1), (x2, y2), (0, 128, 0), 2)

            # Draw class label above the box
            text = f"{class_name} {confidence:.2f}"
            (tw, th), _ = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, font_scale, font_thickness)
            text_x = x1
            text_y = max(y1, edge_offset_y + th)  # ensure at least 5% inside
            cv2.rectangle(annotated_image, (text_x, text_y - th - 4), (text_x + tw + 8, text_y), (0, 255, 0), -1)
            cv2.putText(annotated_image, text, (text_x + 4, text_y - 2), cv2.FONT_HERSHEY_SIMPLEX, font_scale, (0, 0, 0), font_thickness)

            # Crop detected chilli for disease classification
            crop_x1, crop_y1, crop_x2, crop_y2 = max(0, x1), max(0, y1), min(w, x2), min(h, y2)
            crop = image.crop((crop_x1, crop_y1, crop_x2, crop_y2))
            input_tensor = transform(crop).unsqueeze(0)

            # Disease classification
            with torch.no_grad():
                outputs = disease_model(input_tensor)
                probs = F.softmax(outputs, dim=1)[0]
                pred_class = disease_classes[probs.argmax().item()]
                confidence_disease = probs.max().item()

            # Draw disease prediction below box, adjust if near bottom
            dtext = f"{pred_class} {confidence_disease:.2f}"
            (dtw, dth), _ = cv2.getTextSize(dtext, cv2.FONT_HERSHEY_SIMPLEX, font_scale, font_thickness)
            dtext_x = x1
            if y2 + dth + 8 < h - edge_offset_y:
                dtext_y = y2 + dth + 8
            else:
                dtext_y = y2 - 4  # move inside if bottom edge reached
            cv2.rectangle(annotated_image, (dtext_x, dtext_y - dth - 4), (dtext_x + dtw + 8, dtext_y), (255, 255, 0), -1)
            cv2.putText(annotated_image, dtext, (dtext_x + 4, dtext_y - 2), cv2.FONT_HERSHEY_SIMPLEX, font_scale, (0, 0, 0), font_thickness)

            detections.append({
                "class_name": class_name,
                "confidence": confidence,
                "disease_class": pred_class,
                "disease_confidence": round(confidence_disease, 4),
                "all_disease_probabilities": {disease_classes[i]: round(probs[i].item(), 4) for i in range(len(disease_classes))},
                "bbox": [x1, y1, x2, y2]
            })

        # Save annotated image
        _, buffer = cv2.imencode('.jpg', cv2.cvtColor(annotated_image, cv2.COLOR_RGB2BGR))
        image_filename = f"predicted_{len(os.listdir(output_dir)) + 1}.jpg"
        image_path = os.path.join(output_dir, image_filename)
        with open(image_path, "wb") as f:
            f.write(buffer)

        return jsonify({
            "image_path": f"{BACKEND_URL}static/Public/green-chilli-predictions/{image_filename}",
            "detections": detections
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
