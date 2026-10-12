import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))


class Config:
    """Base configuration. Mirrors thesis section 3.6.2 / 3.8.1 stack choices."""

    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-change-me")
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "dev-jwt-secret-change-me")
    # Flask-JWT-Extended defaults to 15 minutes; the SPA stores the token in
    # localStorage and has no refresh flow, so keep sessions dashboard-length.
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(
        hours=int(os.environ.get("JWT_ACCESS_HOURS", 12))
    )
    JWT_TOKEN_LOCATION = ["headers"]
    JWT_HEADER_TYPE = "Bearer"

    CORS_ORIGINS = [
        origin.strip()
        for origin in os.environ.get(
            "CORS_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173",
        ).split(",")
        if origin.strip()
    ]

    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL",
        "mysql+pymysql://frpews_user:password@localhost:3306/frpews",
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Twilio (section 4.6.1)
    TWILIO_ACCOUNT_SID = os.environ.get("TWILIO_ACCOUNT_SID")
    TWILIO_AUTH_TOKEN = os.environ.get("TWILIO_AUTH_TOKEN")
    TWILIO_FROM_NUMBER = os.environ.get("TWILIO_FROM_NUMBER")

    # Alert thresholds (section 4.5.3): auto-SMS on High/Extreme by default
    AUTO_ALERT_RISK_LEVELS = {"High", "Extreme"}

    # Scheduler (section 3.8.3): predictions refresh every 6 hours
    PREDICTION_INTERVAL_HOURS = int(os.environ.get("PREDICTION_INTERVAL_HOURS", 6))

    # Model artifact paths
    MODEL_DIR = os.path.join(BASE_DIR, "app", "ml", "artifacts")
    RF_MODEL_PATH = os.path.join(MODEL_DIR, "rf_model.joblib")
    LSTM_MODEL_PATH = os.path.join(MODEL_DIR, "lstm_model.keras")
    SCALER_PATH = os.path.join(MODEL_DIR, "scaler.joblib")

    RAW_DATA_DIR = os.path.join(BASE_DIR, "data", "raw")
    PROCESSED_DATA_DIR = os.path.join(BASE_DIR, "data", "processed")

    RISK_CLASSES = ["Low", "Moderate", "High", "Extreme"]

    # 30-day lookback window per thesis section 3.3.2.2
    LSTM_LOOKBACK_DAYS = 30


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False


class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"


config_by_name = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "testing": TestingConfig,
}
