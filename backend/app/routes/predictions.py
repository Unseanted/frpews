from flask import Blueprint, jsonify, current_app
from app.models import Prediction

predictions_bp = Blueprint("predictions", __name__)


@predictions_bp.get("/latest/<int:station_id>")
def latest(station_id):
    prediction = (
        Prediction.query.filter_by(station_id=station_id)
        .order_by(Prediction.prediction_timestamp.desc())
        .first()
    )
    if not prediction:
        return jsonify({"error": "No predictions yet for this station"}), 404
    return jsonify(prediction.to_dict())


@predictions_bp.get("/history/<int:station_id>")
def history(station_id):
    predictions = (
        Prediction.query.filter_by(station_id=station_id)
        .order_by(Prediction.prediction_timestamp.desc())
        .limit(30)
        .all()
    )
    return jsonify([p.to_dict() for p in reversed(predictions)])


@predictions_bp.post("/run/<int:station_id>")
def run(station_id):
    """Trigger an on-demand prediction. Wired to app.ml.inference once models are trained."""
    try:
        from app.ml.inference import run_prediction
        result = run_prediction(station_id)
        return jsonify(result)
    except FileNotFoundError:
        return jsonify({
            "error": "Model artifacts not found. Train the RF and LSTM models first "
                     "(see backend/app/ml/train_rf.py and train_lstm.py)."
        }), 503
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 422
