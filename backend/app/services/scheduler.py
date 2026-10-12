"""
Background scheduler (thesis section 3.8.3): re-run predictions for every
active station on a fixed interval (default 6 hours) using APScheduler.
"""
from apscheduler.schedulers.background import BackgroundScheduler


def start_scheduler(app):
    scheduler = BackgroundScheduler(daemon=True)

    def refresh_predictions():
        with app.app_context():
            from app.models import Station
            from app.ml.inference import run_prediction

            for station in Station.query.filter_by(is_active=True).all():
                try:
                    run_prediction(station.station_id)
                except (FileNotFoundError, ValueError) as e:
                    app.logger.warning(f"Skipped prediction for station {station.station_id}: {e}")

    interval_hours = app.config.get("PREDICTION_INTERVAL_HOURS", 6)
    scheduler.add_job(refresh_predictions, "interval", hours=interval_hours)
    scheduler.start()
    return scheduler
