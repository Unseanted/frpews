from datetime import datetime
from app import db


class Prediction(db.Model):
    """Model output records. Thesis section 4.3.1: Predictions table."""

    __tablename__ = "predictions"

    prediction_id = db.Column(db.Integer, primary_key=True)
    station_id = db.Column(db.Integer, db.ForeignKey("stations.station_id"), nullable=False)
    prediction_timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    input_data_json = db.Column(db.JSON)
    rf_probabilities_json = db.Column(db.JSON)
    lstm_probabilities_json = db.Column(db.JSON)
    ensemble_probabilities_json = db.Column(db.JSON)

    predicted_risk_class = db.Column(db.String(20))  # Low | Moderate | High | Extreme
    risk_trend = db.Column(db.String(20))  # increasing | stable | decreasing
    alert_triggered = db.Column(db.Boolean, default=False)

    alerts = db.relationship(
        "Alert", backref="prediction", lazy="dynamic", cascade="all, delete-orphan"
    )

    def to_dict(self):
        return {
            "prediction_id": self.prediction_id,
            "station_id": self.station_id,
            "prediction_timestamp": self.prediction_timestamp.isoformat(),
            "rf_probabilities": self.rf_probabilities_json,
            "lstm_probabilities": self.lstm_probabilities_json,
            "ensemble_probabilities": self.ensemble_probabilities_json,
            "predicted_risk_class": self.predicted_risk_class,
            "risk_trend": self.risk_trend,
            "alert_triggered": self.alert_triggered,
        }
