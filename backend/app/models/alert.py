from datetime import datetime
from app import db


class Alert(db.Model):
    """Alert delivery log. Thesis section 4.3.1 / 4.6."""

    __tablename__ = "alerts"

    alert_id = db.Column(db.Integer, primary_key=True)
    prediction_id = db.Column(db.Integer, db.ForeignKey("predictions.prediction_id"), nullable=False)
    sent_time = db.Column(db.DateTime, default=datetime.utcnow)
    medium = db.Column(db.String(20))  # SMS | Email | Dashboard
    recipient = db.Column(db.String(120))
    message = db.Column(db.Text)
    delivery_status = db.Column(db.String(20), default="pending")  # pending | delivered | failed

    def to_dict(self):
        return {
            "alert_id": self.alert_id,
            "prediction_id": self.prediction_id,
            "sent_time": self.sent_time.isoformat(),
            "medium": self.medium,
            "recipient": self.recipient,
            "message": self.message,
            "delivery_status": self.delivery_status,
        }
