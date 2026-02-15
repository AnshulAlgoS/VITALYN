import cv2
import mediapipe as mp
import numpy as np
import torch
import torch.nn as nn
import os
from torchvision import transforms

# Define CNN Model Structure (Must match training)
class SimpleCNN(nn.Module):
    def __init__(self):
        super(SimpleCNN, self).__init__()
        self.conv1 = nn.Conv2d(1, 32, kernel_size=3, padding=1)
        self.conv2 = nn.Conv2d(32, 64, kernel_size=3, padding=1)
        self.pool = nn.MaxPool2d(2, 2)
        self.dropout = nn.Dropout(0.25)
        self.fc1 = nn.Linear(64 * 12 * 12, 128)
        self.fc2 = nn.Linear(128, 7)  # 7 Emotions
        self.relu = nn.ReLU()

    def forward(self, x):
        x = self.pool(self.relu(self.conv1(x)))
        x = self.pool(self.relu(self.conv2(x)))
        x = x.view(-1, 64 * 12 * 12)
        x = self.dropout(x)
        x = self.relu(self.fc1(x))
        x = self.fc2(x)
        return x

class FaceAnalyzer:
    def __init__(self):
        self.face_mesh = None

        if getattr(mp, "solutions", None) is not None:
            self.mp_face_mesh = mp.solutions.face_mesh
            self.face_mesh = self.mp_face_mesh.FaceMesh(
                static_image_mode=False,
                max_num_faces=1,
                refine_landmarks=True,
                min_detection_confidence=0.5
            )
        
        # Indices for eyes
        self.LEFT_EYE = [362, 385, 387, 263, 373, 380]
        self.RIGHT_EYE = [33, 160, 158, 133, 153, 144]

        # Load PyTorch Model
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = SimpleCNN().to(self.device)
        
        BASE_DIR = os.path.dirname(os.path.abspath(__file__))
        MODEL_PATH = os.path.join(BASE_DIR, "../models/face_model.pth")
        
        try:
            self.model.load_state_dict(torch.load(MODEL_PATH, map_location=self.device))
            self.model.eval()
            print(f"Face Model loaded from {MODEL_PATH}")
            self.model_loaded = True
        except Exception as e:
            print(f"Error loading face model: {e}")
            self.model_loaded = False

        self.emotions = {0: "Angry", 1: "Disgust", 2: "Fear", 3: "Happy", 4: "Sad", 5: "Surprise", 6: "Neutral"}

    def _calculate_ear(self, landmarks, eye_indices):
        """Calculate Eye Aspect Ratio"""
        A = np.linalg.norm(landmarks[eye_indices[1]] - landmarks[eye_indices[5]])
        B = np.linalg.norm(landmarks[eye_indices[2]] - landmarks[eye_indices[4]])
        C = np.linalg.norm(landmarks[eye_indices[0]] - landmarks[eye_indices[3]])
        return (A + B) / (2.0 * C)

    def analyze_frame(self, frame_bytes):
        """
        Analyzes a single video frame for signs of fatigue/pain.
        """
        try:
            if self.face_mesh is None:
                return {
                    "detected": False,
                    "fatigue_level": 0,
                    "emotion": "Unknown",
                    "risk_score": 0,
                }
            nparr = np.frombuffer(frame_bytes, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if frame is None:
                return {"error": "Invalid image data"}

            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = self.face_mesh.process(rgb_frame)

            if not results.multi_face_landmarks:
                return {"detected": False, "fatigue_level": 0, "emotion": "Unknown"}

            landmarks = results.multi_face_landmarks[0].landmark
            h, w, _ = frame.shape
            
            # 1. Calculate EAR (Fatigue)
            points = np.array([[int(l.x * w), int(l.y * h)] for l in landmarks])
            left_ear = self._calculate_ear(points, self.LEFT_EYE)
            right_ear = self._calculate_ear(points, self.RIGHT_EYE)
            avg_ear = (left_ear + right_ear) / 2.0

            fatigue_score = 0
            if avg_ear < 0.20:
                fatigue_score = 90
            elif avg_ear < 0.25:
                fatigue_score = 50
            else:
                fatigue_score = 10

            # 2. Predict Emotion (Pain/Distress)
            emotion = "Unknown"
            emotion_risk = 0
            
            if self.model_loaded:
                # Get bounding box
                x_min = min(points[:, 0])
                x_max = max(points[:, 0])
                y_min = min(points[:, 1])
                y_max = max(points[:, 1])
                
                # Padding
                pad = 20
                x_min = max(0, x_min - pad)
                y_min = max(0, y_min - pad)
                x_max = min(w, x_max + pad)
                y_max = min(h, y_max + pad)
                
                face_roi = cv2.cvtColor(frame[y_min:y_max, x_min:x_max], cv2.COLOR_BGR2GRAY)
                if face_roi.size > 0:
                    face_roi = cv2.resize(face_roi, (48, 48))
                    face_roi = face_roi / 255.0
                    face_tensor = torch.tensor(face_roi, dtype=torch.float32).unsqueeze(0).unsqueeze(0).to(self.device)
                    
                    with torch.no_grad():
                        outputs = self.model(face_tensor)
                        _, predicted = torch.max(outputs, 1)
                        emotion_idx = predicted.item()
                        emotion = self.emotions.get(emotion_idx, "Unknown")
                        
                        # Map Emotion to Risk
                        # High Risk: Pain (Angry?), Fear, Sad, Disgust
                        if emotion in ["Fear", "Sad", "Angry", "Disgust"]:
                            emotion_risk = 80
                        elif emotion == "Neutral":
                            emotion_risk = 10
                        elif emotion == "Happy":
                            emotion_risk = 0
                        elif emotion == "Surprise":
                            emotion_risk = 30

            # Final Risk Score (Max of Fatigue or Emotion)
            final_risk = max(fatigue_score, emotion_risk)

            return {
                "detected": True,
                "ear": float(avg_ear),
                "fatigue_level": fatigue_score,
                "emotion": emotion,
                "risk_score": final_risk
            }
            
        except Exception as e:
            return {"error": str(e)}

# Singleton instance
face_analyzer = FaceAnalyzer()

def analyze_face(image_bytes):
    return face_analyzer.analyze_frame(image_bytes)
