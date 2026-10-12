from datetime import datetime
import bcrypt
from app import db


class User(db.Model):
    """Registered users with RBAC. Thesis section 3.6.3."""

    __tablename__ = "users"

    user_id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone_number = db.Column(db.String(20))
    password_hash = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), default="community_user")  # administrator | data_manager | community_user
    subscribed_station_ids = db.Column(db.JSON, default=list)  # for SMS alert subscriptions
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, plaintext):
        self.password_hash = bcrypt.hashpw(plaintext.encode(), bcrypt.gensalt()).decode()

    def check_password(self, plaintext):
        return bcrypt.checkpw(plaintext.encode(), self.password_hash.encode())

    def to_dict(self):
        return {
            "user_id": self.user_id,
            "full_name": self.full_name,
            "email": self.email,
            "phone_number": self.phone_number,
            "role": self.role,
            "subscribed_station_ids": self.subscribed_station_ids or [],
            "is_active": self.is_active,
        }
