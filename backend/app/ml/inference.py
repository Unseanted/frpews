"""
Real-time inference (thesis section 3.8.3: prediction endpoint / scheduled
6-hourly refresh). Loads the trained RF + LSTM artifacts, builds the current
feature vector / 30-day sequence for a station, and writes a Prediction row.
"""
import os
from datetime import datetime, timedelta

import joblib
import numpy as np

from app import db
from app.models import EnvironmentalData, Prediction
from app.ml.preprocessing import FEATURE_COLUMNS
from app.ml.ensemble import ensemble_probabilities, classify, RISK_CLASSES

MODEL_DIR = os.path.join(os.path.dirname(__file__), "artifacts")
RF_MODEL_PATH = os.path.join(MODEL_DIR, "rf_model.joblib")
LSTM_MODEL_PATH = os.path.join(MODEL_DIR, "lstm_model.keras")

LOOKBACK_DAYS = 30


def _require_artifacts():
    missing = [p for p in (RF_MODEL_PATH, LSTM_MODEL_PATH) if not os.path.exists(p)]
    if missing:
        raise FileNotFoundError(
            f"Missing trained model artifact(s): {missing}. Run train_rf.py and "
            f"train_lstm.py first."
        )


def _recent_feature_matrix(station_id, days):
    records = (
        EnvironmentalData.query.filter_by(station_id=station_id)
        .order_by(EnvironmentalData.date.desc())
        .limit(days)
        .all()
    )
    records = list(reversed(records))
    if len(records) < days:
        raise ValueError(
            f"Need {days} days of history for station {station_id}, only have {len(records)}."
        )
    matrix = np.array([[getattr(r, col) or 0.0 for col in FEATURE_COLUMNS] for r in records])
    return matrix, records[-1]


def run_prediction(station_id):
    _require_artifacts()
    import tensorflow as tf

    rf_model = joblib.load(RF_MODEL_PATH)
    lstm_model = tf.keras.models.load_model(LSTM_MODEL_PATH)

    sequence, latest_record = _recent_feature_matrix(station_id, LOOKBACK_DAYS)

    rf_probs = rf_model.predict_proba(sequence[-1:].reshape(1, -1))[0]
    lstm_probs = lstm_model.predict(sequence.reshape(1, LOOKBACK_DAYS, -1), verbose=0)[0]

    combined = ensemble_probabilities(rf_probs, lstm_probs)
    risk_class, confidence = classify(combined)

    prediction = Prediction(
        station_id=station_id,
        prediction_timestamp=datetime.utcnow(),
        input_data_json={"as_of_date": latest_record.date.isoformat()},
        rf_probabilities_json=dict(zip(RISK_CLASSES, rf_probs.tolist())),
        lstm_probabilities_json=dict(zip(RISK_CLASSES, lstm_probs.tolist())),
        ensemble_probabilities_json=dict(zip(RISK_CLASSES, combined.tolist())),
        predicted_risk_class=risk_class,
        alert_triggered=risk_class in {"High", "Extreme"},
    )
    db.session.add(prediction)
    db.session.commit()

    return prediction.to_dict()
