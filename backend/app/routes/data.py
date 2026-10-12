import os
from datetime import datetime
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from flask_jwt_extended import jwt_required
from sqlalchemy.exc import IntegrityError
from app import db
from app.models import EnvironmentalData, Station
from app.utils.validators import (
    normalize_environmental_payload,
    validate_environmental_record,
)

data_bp = Blueprint("data", __name__)


@data_bp.post("/entry")
@jwt_required()
def manual_entry():
    """Manual daily observation entry by a data manager (thesis section 4.5.2)."""
    raw = request.get_json() or {}
    if not raw.get("station_id") or not raw.get("date"):
        return jsonify({"error": "station_id and date are required"}), 400

    try:
        payload = normalize_environmental_payload(raw)
    except (TypeError, ValueError):
        return jsonify({"error": "station_id and numeric fields must be numbers"}), 400

    Station.query.get_or_404(payload["station_id"])

    errors = validate_environmental_record(payload)
    if errors:
        return jsonify({"error": "Validation failed", "details": errors}), 422

    try:
        observed_on = datetime.fromisoformat(str(payload["date"])).date()
    except ValueError:
        return jsonify({"error": "date must be ISO format (YYYY-MM-DD)"}), 400

    record = EnvironmentalData(
        station_id=payload["station_id"],
        date=observed_on,
        daily_rainfall_mm=payload.get("daily_rainfall_mm"),
        temp_max_c=payload.get("temp_max_c"),
        relative_humidity_pct=payload.get("relative_humidity_pct"),
        river_level_m=payload.get("river_level_m"),
        flow_rate_m3s=payload.get("flow_rate_m3s"),
        ndvi=payload.get("ndvi"),
        source="manual",
    )
    db.session.add(record)
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "An observation for this station and date already exists"}), 409

    # TODO: trigger app.ml.inference.run_prediction(record.station_id) once real
    # data + trained model artifacts are available.
    return jsonify(record.to_dict()), 201


@data_bp.post("/upload")
@jwt_required()
def upload_csv():
    """Bulk CSV upload from field data collectors (thesis section 3.6.1)."""
    if "file" not in request.files:
        return jsonify({"error": "No file part named 'file' in the request"}), 400

    file = request.files["file"]
    if not file.filename or not file.filename.lower().endswith(".csv"):
        return jsonify({"error": "Only .csv files are accepted"}), 400

    filename = secure_filename(file.filename)
    dest = os.path.join(current_app.config["RAW_DATA_DIR"], filename)
    os.makedirs(current_app.config["RAW_DATA_DIR"], exist_ok=True)
    file.save(dest)

    return jsonify({
        "message": f"{filename} uploaded. Run the preprocessing pipeline "
                   f"(app/ml/preprocessing.py) to ingest it into the database.",
        "path": dest,
    }), 202


@data_bp.get("/history/<int:station_id>")
def history(station_id):
    """Recent observations for a station, used for the 7-day trend chart."""
    days = request.args.get("days", 7, type=int)
    records = (
        EnvironmentalData.query.filter_by(station_id=station_id)
        .order_by(EnvironmentalData.date.desc())
        .limit(days)
        .all()
    )
    return jsonify([r.to_dict() for r in reversed(records)])
