from datetime import datetime
from app import db


class Station(db.Model):
    """Monitoring locations. Thesis section 3.4.3 / data dictionary: Station_Data."""

    __tablename__ = "stations"

    station_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    state = db.Column(db.String(80))
    river_basin = db.Column(db.String(120))
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    environmental_records = db.relationship(
        "EnvironmentalData", backref="station", lazy="dynamic",
        cascade="all, delete-orphan",
    )
    predictions = db.relationship(
        "Prediction", backref="station", lazy="dynamic",
        cascade="all, delete-orphan",
    )
    flood_events = db.relationship(
        "FloodEvent", backref="station", lazy="dynamic",
        cascade="all, delete-orphan",
    )

    def to_dict(self):
        return {
            "station_id": self.station_id,
            "name": self.name,
            "state": self.state,
            "river_basin": self.river_basin,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "is_active": self.is_active,
        }
