import os
from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from app.config import config_by_name

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()


def create_app(env=None):
    env = env or os.environ.get("FLASK_ENV", "development")
    app = Flask(__name__)
    app.config.from_object(config_by_name[env])
    app.url_map.strict_slashes = False

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(
        app,
        origins=app.config.get("CORS_ORIGINS") or "*",
        supports_credentials=True,
        allow_headers=["Authorization", "Content-Type"],
        expose_headers=["Content-Type"],
    )

    @jwt.expired_token_loader
    def _expired_token(_jwt_header, _jwt_payload):
        return jsonify({"error": "Token has expired. Please sign in again."}), 401

    @jwt.invalid_token_loader
    def _invalid_token(_reason):
        return jsonify({"error": "Invalid authentication token."}), 401

    @jwt.unauthorized_loader
    def _missing_token(_reason):
        return jsonify({"error": "Authentication required."}), 401

    from app.routes.auth import auth_bp
    from app.routes.stations import stations_bp
    from app.routes.data import data_bp
    from app.routes.predictions import predictions_bp
    from app.routes.alerts import alerts_bp
    from app.routes.admin import admin_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(stations_bp, url_prefix="/api/stations")
    app.register_blueprint(data_bp, url_prefix="/api/data")
    app.register_blueprint(predictions_bp, url_prefix="/api/predictions")
    app.register_blueprint(alerts_bp, url_prefix="/api/alerts")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")

    @app.get("/api/health")
    def health():
        return {"status": "ok", "service": "FRPEWS API"}

    # Background scheduler (section 3.8.3): re-run predictions every N hours.
    # Disabled by default in dev/testing to avoid duplicate jobs on the reloader.
    if env == "production":
        from app.services.scheduler import start_scheduler
        start_scheduler(app)

    return app
