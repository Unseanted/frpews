from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app import db
from app.models import Station

stations_bp = Blueprint("stations", __name__)


@stations_bp.get("/")
def list_stations():
    stations = Station.query.filter_by(is_active=True).all()
    return jsonify([s.to_dict() for s in stations])


@stations_bp.get("/<int:station_id>")
def get_station(station_id):
    station = Station.query.get_or_404(station_id)
    return jsonify(station.to_dict())


@stations_bp.post("/")
@jwt_required()
def create_station():
    payload = request.get_json() or {}
    required = ["name", "latitude", "longitude"]
    if not all(payload.get(f) is not None for f in required):
        return jsonify({"error": "name, latitude and longitude are required"}), 400

    station = Station(
        name=payload["name"],
        state=payload.get("state"),
        river_basin=payload.get("river_basin"),
        latitude=payload["latitude"],
        longitude=payload["longitude"],
    )
    db.session.add(station)
    db.session.commit()
    return jsonify(station.to_dict()), 201
