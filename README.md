# FRPEWS — Flood Risk Prediction & Early Warning System

Scaffold matching the architecture in Chapters 3–4 of the thesis: a three-tier
system (data acquisition → RF+LSTM ensemble prediction → web dashboard/SMS
alerts) for Makurdi, Onitsha, and Lokoja.

```
frpews/
├── backend/            Flask API, MySQL models, ML pipeline
│   ├── app/
│   │   ├── models/     stations, environmental_data, flood_events, predictions, alerts, users
│   │   ├── routes/     auth, stations, data, predictions, alerts, admin
│   │   ├── ml/         preprocessing.py, train_rf.py, train_lstm.py, ensemble.py, inference.py
│   │   └── services/   sms_service.py (Twilio), scheduler.py (APScheduler)
│   ├── data/raw/       drop per-station CSVs here (e.g. makurdi.csv)
│   ├── data/processed/ output of preprocessing.py
│   ├── schema.sql      MySQL schema, matches thesis section 3.4.3 data dictionary
│   └── run.py
├── frontend/            React 19 + Vite dashboard
│   └── src/
│       ├── pages/       Dashboard, LocationDetail, DataEntry, Alerts, Admin, Login
│       ├── components/  Sidebar, RiskCard, Waterline (signature hydrograph motif), Sparkline
│       └── api/         axios clients per resource
└── docker-compose.yml
```

## Quick start (local, no Docker)

**Backend**
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # fill in DB + Twilio credentials
mysql -u root -p < schema.sql   # or let Flask-Migrate manage it instead
flask --app run db upgrade      # if you set up migrations
python run.py                   # http://localhost:5000
```

**Frontend**
```bash
cd frontend
npm install
cp .env.example .env
npm run dev                     # http://localhost:5173, proxies /api to :5000
```

## Quick start (Docker)
```bash
docker compose up --build
```

## Wiring in your real data

1. Drop per-station CSVs (`makurdi.csv`, `onitsha.csv`, `lokoja.csv`) into
   `backend/data/raw/`, with the columns documented in
   `backend/app/ml/preprocessing.py`.
2. `python -m app.ml.preprocessing` — cleans, imputes, engineers antecedent
   rainfall / river-level-change features, writes `data/processed/processed_dataset.csv`.
3. `python -m app.ml.train_rf` — grid-searched Random Forest, matches thesis section 3.3.2.1.
4. `python -m app.ml.train_lstm` — 30-day lookback stacked LSTM, matches section 3.3.2.2.
5. Both save artifacts to `backend/app/ml/artifacts/`. Once present, the
   `/api/predictions/run/<station_id>` endpoint and the APScheduler job
   (every `PREDICTION_INTERVAL_HOURS`) will start producing real ensemble
   predictions instead of 503s.
6. Load real historical records into `environmental_data` (via `/api/data/entry`,
   `/api/data/upload`, or a bulk SQL import) so the dashboard's 7-day trend
   charts and inference lookback window have data to read.

## Notes

- Twilio SMS falls back to a console-log stub (`sms_service.py`) until
  `TWILIO_*` env vars are set, so the alert flow is testable without a live
  account.
- RBAC roles: `administrator`, `data_manager`, `community_user` — enforced via
  JWT claims in the Flask routes and mirrored in the React `ProtectedRoute`.
- This is a scaffold: authentication, error handling, and the ML pipeline are
  functional but intentionally minimal. Harden validation, add a job queue for
  retraining, and add tests before any production deployment.
