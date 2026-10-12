"""Shared input validation helpers (thesis section 4.2.2 range constraints)."""

from flask_jwt_extended import get_jwt_identity

RANGE_CHECKS = {
    "daily_rainfall_mm": (0, 1000),
    "temp_max_c": (10, 50),
    "relative_humidity_pct": (0, 100),
}

NUMERIC_FIELDS = (
    "daily_rainfall_mm",
    "temp_max_c",
    "relative_humidity_pct",
    "river_level_m",
    "flow_rate_m3s",
    "ndvi",
)


def current_user_id():
    """JWT identities are strings (Flask-JWT-Extended 4.x); user_id is an int."""
    identity = get_jwt_identity()
    try:
        return int(identity)
    except (TypeError, ValueError):
        return None


def coerce_optional_float(value):
    if value is None or value == "":
        return None
    return float(value)


def normalize_environmental_payload(payload):
    """Coerce SPA form strings into the types the models/DB expect."""
    normalized = dict(payload or {})
    station_id = normalized.get("station_id")
    if station_id is not None and station_id != "":
        normalized["station_id"] = int(station_id)
    for field in NUMERIC_FIELDS:
        if field in normalized:
            value = normalized[field]
            if value is None or value == "":
                normalized[field] = None
            else:
                normalized[field] = float(value)
    return normalized


def validate_environmental_record(payload):
    errors = []
    for field, (lo, hi) in RANGE_CHECKS.items():
        value = payload.get(field)
        if value is None or value == "":
            continue
        try:
            value = float(value)
        except (TypeError, ValueError):
            errors.append(f"{field} must be numeric")
            continue
        if not (lo <= value <= hi):
            errors.append(f"{field}={value} is outside expected range [{lo}, {hi}]")
    return errors
