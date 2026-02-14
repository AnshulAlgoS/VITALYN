import librosa
import numpy as np
import io
import os
import joblib

# Define path to the trained model
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "voice_model.pkl")

# Load model globally
try:
    model = joblib.load(MODEL_PATH)
    print(f"Voice Model loaded from {MODEL_PATH}")
except Exception as e:
    print(f"Error loading voice model: {e}")
    model = None

def extract_features(y, sr):
    """
    Extracts MFCC features from an audio time series.
    Must match the training logic.
    """
    try:
        # Use same parameters as training: n_mfcc=40
        mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=40)
        mfcc_mean = np.mean(mfcc.T, axis=0)
        return mfcc_mean
    except Exception as e:
        print(f"Feature extraction error: {e}")
        return None

def analyze_voice(audio_bytes):
    """
    Analyzes audio for stress markers using a trained Random Forest model.
    Input: Audio bytes (WAV/MP3/WebM)
    Output: Risk Score (0-100) and metadata.
    """
    try:
        # Load audio from bytes
        with io.BytesIO(audio_bytes) as audio_file:
            # Load audio (y=waveform, sr=sample_rate)
            # Limit duration to 3s to match training clip length roughly, or process full
            y, sr = librosa.load(audio_file, sr=None)
            
        if len(y) == 0:
            return {"error": "Empty audio"}

        # Extract Features
        features = extract_features(y, sr)
        
        if features is None:
             return {"error": "Could not extract features", "stress_score": 0}
        
        # Predict using Model
        if model:
            # Reshape for single sample: (1, 40)
            features_reshaped = features.reshape(1, -1)
            
            # Predict Class (0=Low, 1=Medium, 2=High)
            risk_class = int(model.predict(features_reshaped)[0])
            
            # Predict Probabilities
            probs = model.predict_proba(features_reshaped)[0]
            
            # Calculate continuous score (0-100)
            # Weighted sum: P(Low)*0 + P(Med)*50 + P(High)*100
            # Ensure probs has 3 classes. If model trained on fewer (e.g. only low/high), handle gracefully.
            if len(probs) == 3:
                stress_score = (probs[1] * 50) + (probs[2] * 100)
            elif len(probs) == 2:
                # Fallback if only 2 classes found during training
                stress_score = probs[1] * 100
            else:
                stress_score = 0
                
            stress_score = float(stress_score)
            
            # Get acoustic metrics for display (optional, but good for UI)
            f0, _, _ = librosa.pyin(y, fmin=librosa.note_to_hz('C2'), fmax=librosa.note_to_hz('C7'))
            f0_clean = f0[~np.isnan(f0)]
            avg_pitch = float(np.mean(f0_clean)) if len(f0_clean) > 0 else 0
            
            return {
                "stress_score": round(stress_score, 1),
                "risk_class": risk_class,  # 0, 1, 2
                "probabilities": {
                    "low": float(probs[0]) if len(probs) > 0 else 0,
                    "medium": float(probs[1]) if len(probs) > 1 else 0,
                    "high": float(probs[2]) if len(probs) > 2 else 0
                },
                "pitch_avg": round(avg_pitch, 1)
            }
            
        else:
            return {"error": "Voice Model not loaded", "stress_score": 0}

    except Exception as e:
        return {"error": str(e), "stress_score": 0}
