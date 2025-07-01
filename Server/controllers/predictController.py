from flask import request, jsonify
from PIL import Image
import numpy as np
import cv2
import io
import os
import base64  # Import the base64 module
from ultralytics import YOLO

# Load YOLOv9 model
model_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "ML-models", "green_chilli.pt"))
model = YOLO(model_path)
class_names = model.names

# Folder path for saving predictions
output_dir = os.path.join(os.path.dirname(__file__), "..", "static", "Public", "green-chilli-predictions")

# Create the folder if it doesn't exist
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
        results = model(image_np)
        annotated_image = image_np.copy()

        detections = []

        for box in results[0].boxes:
            class_id = int(box.cls[0])
            class_name = class_names[class_id]
            confidence = float(box.conf[0])
            bbox = box.xyxy[0].tolist()

            x1, y1, x2, y2 = map(int, bbox)
            cv2.rectangle(annotated_image, (x1, y1), (x2, y2), (0, 128, 0), 2)

            # Calculate text size for the label
            text = f"{class_name} {confidence:.2f}"
            (text_width, text_height), _ = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)

            # Place the text inside the bounding box at the bottom-right
            text_x = x2 - text_width - 5  # Add a small padding from the right edge
            text_y = y2 - 5  # Add a small padding from the bottom edge

            # Add background for text (green rectangle)
            background_rect = (text_x - 5, text_y - text_height - 5, text_x + text_width + 5, text_y + 5)
            cv2.rectangle(annotated_image, (background_rect[0], background_rect[1]), 
                          (background_rect[2], background_rect[3]), (0, 255, 0), -1)  # Green background

            # Place the text (black color)
            cv2.putText(annotated_image, text, (text_x, text_y), cv2.FONT_HERSHEY_SIMPLEX,
                        0.6, (0, 0, 0), 2)  # Black text

            detections.append({
                'class_name': class_name,
                'confidence': confidence,
                'bbox': bbox
            })

        # Encode the annotated image to JPEG
        _, buffer = cv2.imencode('.jpg', cv2.cvtColor(annotated_image, cv2.COLOR_RGB2BGR))
        byte_io = io.BytesIO(buffer)
        base64_image = base64.b64encode(byte_io.getvalue()).decode('utf-8')  # Base64 encode the image

        # Save the image to disk in the static/Public/green-chilli-predictions folder
        image_data = base64.b64decode(base64_image)
        image_filename = f"predicted_{len(os.listdir(output_dir)) + 1}.jpg"
        image_path = os.path.join(output_dir, image_filename)

        with open(image_path, "wb") as f:
            f.write(image_data)

        # Return the path of the saved image and the detections
        return jsonify({
            'image_path': f'static/Public/green-chilli-predictions/{image_filename}',
            'detections': detections
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500