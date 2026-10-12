from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from app import db
from app.models import Alert, User
from app.services.sms_service import send_sms
from app.utils.validators import current_user_id

alerts_bp = Blueprint("alerts", __name__)


@alerts_bp.get("/")
@jwt_required()
def list_alerts():
    alerts = Alert.query.order_by(Alert.sent_time.desc()).limit(100).all()
    return jsonify([a.to_dict() for a in alerts])


@alerts_bp.post("/send-manual")
@jwt_required()
def send_manual():
    """Admin sends a manual alert (thesis section 4.5.3)."""
    claims = get_jwt()
    if claims.get("role") != "administrator":
        return jsonify({"error": "Administrator role required"}), 403

    payload = request.get_json() or {}
    try:
        prediction_id = int(payload.get("prediction_id"))
    except (TypeError, ValueError):
        prediction_id = None
    message = payload.get("message")
    recipients = payload.get("recipients", [])

    if not prediction_id or not message or not recipients:
        return jsonify({"error": "prediction_id, message and recipients are required"}), 400

    created = []
    for recipient in recipients:
        status = send_sms(recipient, message)
        alert = Alert(
            prediction_id=prediction_id,
            medium="SMS",
            recipient=recipient,
            message=message,
            delivery_status=status,
        )
        db.session.add(alert)
        created.append(alert)
    db.session.commit()

    return jsonify([a.to_dict() for a in created]), 201


@alerts_bp.post("/subscribe")
@jwt_required()
def subscribe():
    payload = request.get_json() or {}
    try:
        station_id = int(payload.get("station_id"))
    except (TypeError, ValueError):
        return jsonify({"error": "station_id is required"}), 400

    user = User.query.get_or_404(current_user_id())
    subscriptions = {int(s) for s in (user.subscribed_station_ids or [])}
    subscriptions.add(station_id)
    user.subscribed_station_ids = list(subscriptions)
    db.session.commit()
    return jsonify(user.to_dict())
