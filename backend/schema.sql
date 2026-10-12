-- FRPEWS MySQL schema, matching thesis section 3.4.3 data dictionary.
-- Flask-Migrate manages this automatically, but this file is provided for
-- direct reference / manual provisioning.

CREATE DATABASE IF NOT EXISTS frpews CHARACTER SET utf8mb4;
USE frpews;

CREATE TABLE IF NOT EXISTS stations (
    station_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    state VARCHAR(80),
    river_basin VARCHAR(120),
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS environmental_data (
    record_id INT AUTO_INCREMENT PRIMARY KEY,
    station_id INT NOT NULL,
    date DATE NOT NULL,
    daily_rainfall_mm FLOAT,
    temp_max_c FLOAT,
    relative_humidity_pct FLOAT,
    river_level_m FLOAT,
    flow_rate_m3s FLOAT,
    ndvi FLOAT,
    antecedent_3day_rain_mm FLOAT,
    antecedent_7day_rain_mm FLOAT,
    river_level_change_m FLOAT,
    month INT,
    flood_risk_class INT,
    source VARCHAR(40) DEFAULT 'manual',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_station_date (station_id, date),
    FOREIGN KEY (station_id) REFERENCES stations(station_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS flood_events (
    event_id INT AUTO_INCREMENT PRIMARY KEY,
    station_id INT NOT NULL,
    event_date DATE NOT NULL,
    severity VARCHAR(20),
    affected_population INT,
    property_loss_estimate FLOAT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (station_id) REFERENCES stations(station_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS predictions (
    prediction_id INT AUTO_INCREMENT PRIMARY KEY,
    station_id INT NOT NULL,
    prediction_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    input_data_json JSON,
    rf_probabilities_json JSON,
    lstm_probabilities_json JSON,
    ensemble_probabilities_json JSON,
    predicted_risk_class VARCHAR(20),
    risk_trend VARCHAR(20),
    alert_triggered BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (station_id) REFERENCES stations(station_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS alerts (
    alert_id INT AUTO_INCREMENT PRIMARY KEY,
    prediction_id INT NOT NULL,
    sent_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    medium VARCHAR(20),
    recipient VARCHAR(120),
    message TEXT,
    delivery_status VARCHAR(20) DEFAULT 'pending',
    FOREIGN KEY (prediction_id) REFERENCES predictions(prediction_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    password_hash VARCHAR(200) NOT NULL,
    role VARCHAR(20) DEFAULT 'community_user',
    subscribed_station_ids JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed the three study-area stations (thesis section 3.3)
INSERT INTO stations (name, state, river_basin, latitude, longitude) VALUES
    ('Makurdi', 'Benue', 'Benue River', 7.73, 8.52),
    ('Onitsha', 'Anambra', 'Niger River', 6.17, 6.78),
    ('Lokoja', 'Kogi', 'Niger-Benue Confluence', 7.80, 6.74)
ON DUPLICATE KEY UPDATE name = name;
