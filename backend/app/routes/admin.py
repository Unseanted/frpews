from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from app.models import EnvironmentalData, Prediction, Alert, Station

admin_bp = Blueprint("admin", __name__)


def require_admin(claims):
    return claims.get("role") == "administrator"


@admin_bp.get("/status")
@jwt_required()
def status():
    claims = get_jwt()
    if not require_admin(claims):
        return jsonify({"error": "Administrator role required"}), 403

    return jsonify({
        "stations": Station.query.count(),
        "environmental_records": EnvironmentalData.query.count(),
        "predictions": Prediction.query.count(),
        "alerts_sent": Alert.query.count(),
    })


@admin_bp.post("/retrain")
@jwt_required()
def retrain():
    """Kick off model retraining. In production this should enqueue a background job
    (e.g. Celery/RQ) rather than block the request thread."""
    claims = get_jwt()
    if not require_admin(claims):
        return jsonify({"error": "Administrator role required"}), 403

    return jsonify({
        "message": "Retraining is not wired to a job queue yet. Run "
                   "`python -m app.ml.train_rf` and `python -m app.ml.train_lstm` "
                   "from the backend directory once real data is available."
    }), 202
