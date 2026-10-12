from datetime import datetime
from app import db


class EnvironmentalData(db.Model):
    """Daily meteorological/hydrological records. Thesis section 4.3.1."""

    __tablename__ = "environmental_data"
    __table_args__ = (
        db.UniqueConstraint("station_id", "date", name="uq_station_date"),
    )

    record_id = db.Column(db.Integer, primary_key=True)
    station_id = db.Column(db.Integer, db.ForeignKey("stations.station_id"), nullable=False)
    date = db.Column(db.Date, nullable=False)

    daily_rainfall_mm = db.Column(db.Float)
    temp_max_c = db.Column(db.Float)
    relative_humidity_pct = db.Column(db.Float)
    river_level_m = db.Column(db.Float)
    flow_rate_m3s = db.Column(db.Float)
    ndvi = db.Column(db.Float)

    # Derived features (section 4.2.2 / 3.5.2)
    antecedent_3day_rain_mm = db.Column(db.Float)
    antecedent_7day_rain_mm = db.Column(db.Float)
    river_level_change_m = db.Column(db.Float)
    month = db.Column(db.Integer)

    # Label used for supervised training (0=Low,1=Moderate,2=High,3=Extreme)
    flood_risk_class = db.Column(db.Integer)

    source = db.Column(db.String(40), default="manual")  # manual | nimet_api | nihsa_api | chirps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "record_id": self.record_id,
            "station_id": self.station_id,
            "date": self.date.isoformat() if self.date else None,
            "daily_rainfall_mm": self.daily_rainfall_mm,
            "temp_max_c": self.temp_max_c,
            "relative_humidity_pct": self.relative_humidity_pct,
            "river_level_m": self.river_level_m,
            "flow_rate_m3s": self.flow_rate_m3s,
            "ndvi": self.ndvi,
            "antecedent_3day_rain_mm": self.antecedent_3day_rain_mm,
            "antecedent_7day_rain_mm": self.antecedent_7day_rain_mm,
            "river_level_change_m": self.river_level_change_m,
            "flood_risk_class": self.flood_risk_class,
            "source": self.source,
        }
