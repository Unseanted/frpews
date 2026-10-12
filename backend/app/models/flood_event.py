from datetime import datetime
from app import db


class FloodEvent(db.Model):
    """Historical flood events from NEMA records. Thesis section 3.5.1."""

    __tablename__ = "flood_events"

    event_id = db.Column(db.Integer, primary_key=True)
    station_id = db.Column(db.Integer, db.ForeignKey("stations.station_id"), nullable=False)
    event_date = db.Column(db.Date, nullable=False)
    severity = db.Column(db.String(20))  # Low | Moderate | High | Extreme
    affected_population = db.Column(db.Integer)
    property_loss_estimate = db.Column(db.Float)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "event_id": self.event_id,
            "station_id": self.station_id,
            "event_date": self.event_date.isoformat() if self.event_date else None,
            "severity": self.severity,
            "affected_population": self.affected_population,
            "property_loss_estimate": self.property_loss_estimate,
            "notes": self.notes,
        }
