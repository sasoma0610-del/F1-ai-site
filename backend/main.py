from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import joblib
import pandas as pd

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = joblib.load("f1_ai_model.pkl")
features = joblib.load("features.pkl")

@app.get("/")
def home():
    return {
        "status": "F1 AI API is running"
    }

@app.get("/predict")
def predict(
    grid: int = 5,
    qualifying_position: int = 5,
    driver_recent_avg: float = 8,
    team_recent_avg: float = 8,
    circuit_driver_avg: float = 8
):
    data = pd.DataFrame([{
        "grid": grid,
        "qualifying_position": qualifying_position,
        "grid_score": 21 - grid,
        "qualifying_score": 21 - qualifying_position,
        "driver_recent_avg": driver_recent_avg,
        "team_recent_avg": team_recent_avg,
        "circuit_driver_avg": circuit_driver_avg
    }])

    data = data[features]

    prediction = model.predict(data)[0]

    return {
        "predicted_position": float(prediction)
    }