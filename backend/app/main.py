from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn
import json

# Import our ML modules
from app.models.vitals import analyze_vitals
from app.models.face import analyze_face
from app.models.voice import analyze_voice
from app.models.fusion import calculate_risk
from app.models.reasoning import reasoning_agent

app = FastAPI(title="Vitalyn API", description="Multimodal Healthcare Intelligence Engine")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import uuid
from datetime import datetime

# In-memory database
patients_db = []

class VitalsInput(BaseModel):
    heart_rate: float
    bp_systolic: float
    bp_diastolic: float
    spo2: float
    temperature: float
    pain_level: int
    fatigue_level: int

@app.get("/")
def health_check():
    return {"status": "active", "system": "WAITLESS AI+ Core"}

@app.get("/patients")
def get_patients():
    """
    Get the list of patients in the queue (sorted by risk desc).
    """
    # Sort by risk (descending)
    sorted_patients = sorted(patients_db, key=lambda x: x['risk'], reverse=True)
    return sorted_patients

@app.post("/analyze/vitals")
def analyze_patient_vitals(data: VitalsInput):
    """
    Endpoint for continuous wearable data + manual symptom entry.
    """
    result = analyze_vitals(data)
    return {
        "module": "vitals",
        "data": result,
        "status": "success"
    }

@app.post("/analyze/multimodal")
async def analyze_multimodal(
    vitals: str = Form(...),  # JSON string of vitals
    face_video: Optional[UploadFile] = File(None),
    voice_sample: Optional[UploadFile] = File(None)
):
    """
    The core WAITLESS AI+ endpoint.
    Accepts Vitals (JSON), Face Video (Blob), and Voice (Blob) simultaneously.
    """
    try:
        vitals_dict = json.loads(vitals)
        # Convert dict to Pydantic model for consistency
        vitals_obj = VitalsInput(**vitals_dict)
    except Exception as e:
        return {"error": f"Invalid vitals JSON: {str(e)}"}
    
    results = {
        "vitals_risk": {},
        "face_fatigue_index": {},
        "voice_stress_score": {},
        "overall_risk_score": 0
    }
    
    # 1. Process Vitals
    results["vitals_risk"] = analyze_vitals(vitals_obj)
    
    # 2. Process Video (if provided)
    if face_video:
        video_bytes = await face_video.read()
        results["face_fatigue_index"] = analyze_face(video_bytes)
        
    # 3. Process Voice (if provided)
    if voice_sample:
        audio_bytes = await voice_sample.read()
        results["voice_stress_score"] = analyze_voice(audio_bytes)
    
    # 4. Fusion Logic
    final_risk = calculate_risk(results)
    results["overall_risk_score"] = final_risk
    
    # 5. Advanced Medical Reasoning (Ambient Provider Agent)
    # Generates a SOAP note and clinical explanation
    try:
        clinical_insight = reasoning_agent.generate_soap_note(
            patient_data={"vitals": vitals_dict, "id": "TEMP_ID"},
            vitals_analysis=results["vitals_risk"],
            face_analysis=results["face_fatigue_index"],
            voice_analysis=results["voice_stress_score"],
            transcript="Patient explicitly mentioned feeling dizzy and nauseous." # Placeholder for ASR
        )
        results["clinical_analysis"] = clinical_insight
    except Exception as e:
        print(f"Reasoning Error: {e}")
        results["clinical_analysis"] = {"error": "Reasoning agent unavailable"}
    
    # 6. Save to DB
    patient_id = f"P{len(patients_db) + 1:03d}"
    
    # Determine urgency and TTR based on risk
    if final_risk > 80:
        urgency = "high"
        ttr_level = "critical"
        time_to_risk = "15 min"
        time_minutes = 15
        condition = "Critical Decompensation"
    elif final_risk > 50:
        urgency = "medium" 
        ttr_level = "watch"
        time_to_risk = "45 min"
        time_minutes = 45
        condition = "Observation Required"
    else:
        urgency = "low"
        ttr_level = "safe"
        time_to_risk = "4 hours"
        time_minutes = 240
        condition = "Stable"
        
    patient_entry = {
        "id": patient_id,
        "risk": final_risk,
        "timeToRisk": time_to_risk,
        "timeMinutes": time_minutes,
        "urgency": urgency,
        "ttrLevel": ttr_level,
        "condition": condition,
        "waitTime": "Just now",
        "timestamp": datetime.now().isoformat(),
        "details": results
    }
    
    patients_db.append(patient_entry)

    return {
        "status": "analyzed",
        "data": results,
        "recommendation": "Immediate attention required" if final_risk > 80 else "Continue monitoring",
        "patient_id": patient_id
    }

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
