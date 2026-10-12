"""
LSTM training (thesis section 3.3.2.2 / 4.4.2).

Usage (from backend/):
    python -m app.ml.train_lstm

Builds 30-day lookback sequences per station and trains a stacked
LSTM(128) -> LSTM(64) -> Dropout(0.3) -> Dense(32, relu) -> Dense(4, softmax)
network for 4-class flood risk classification.
"""
import os

import joblib
import numpy as np
import pandas as pd
import tensorflow as tf
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras import layers, models, callbacks

from app.ml.preprocessing import FEATURE_COLUMNS, TARGET_COLUMN, PROCESSED_DIR

MODEL_DIR = os.path.join(os.path.dirname(__file__), "artifacts")
LSTM_MODEL_PATH = os.path.join(MODEL_DIR, "lstm_model.keras")
SCALER_PATH = os.path.join(MODEL_DIR, "scaler.joblib")

LOOKBACK_DAYS = 30
NUM_CLASSES = 4


def load_dataset():
    path = os.path.join(PROCESSED_DIR, "processed_dataset.csv")
    if not os.path.exists(path):
        raise FileNotFoundError(
            f"{path} not found. Run `python -m app.ml.preprocessing` first."
        )
    df = pd.read_csv(path, parse_dates=["date"])
    return df.sort_values(["station_name", "date"])


def build_sequences(df, lookback=LOOKBACK_DAYS):
    """Slide a `lookback`-day window per station, stride 1, many-to-one label
    taken from the day after the window (section 3.3.2.2 / 4.4.2)."""
    X, y = [], []
    for _, group in df.groupby("station_name"):
        features = group[FEATURE_COLUMNS].values
        labels = group[TARGET_COLUMN].values
        for i in range(len(group) - lookback):
            X.append(features[i:i + lookback])
            y.append(labels[i + lookback])
    return np.array(X), np.array(y)


def time_split_sequences(X, y, val_frac=0.15, test_frac=0.13):
    n = len(X)
    test_start = int(n * (1 - test_frac))
    val_start = int(test_start * (1 - val_frac))
    return (
        X[:val_start], y[:val_start],
        X[val_start:test_start], y[val_start:test_start],
        X[test_start:], y[test_start:],
    )


def build_model(n_features):
    model = models.Sequential([
        layers.Input(shape=(LOOKBACK_DAYS, n_features)),
        layers.LSTM(128, return_sequences=True),
        layers.LSTM(64),
        layers.Dropout(0.3),
        layers.Dense(32, activation="relu"),
        layers.Dense(NUM_CLASSES, activation="softmax"),
    ])
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )
    return model


def train():
    df = load_dataset()
    X, y = build_sequences(df)
    if len(X) == 0:
        raise ValueError("Not enough rows per station to build a 30-day sequence.")

    X_train, y_train, X_val, y_val, X_test, y_test = time_split_sequences(X, y)

    model = build_model(n_features=len(FEATURE_COLUMNS))
    early_stop = callbacks.EarlyStopping(
        monitor="val_loss", patience=10, restore_best_weights=True
    )

    model.fit(
        X_train, y_train,
        validation_data=(X_val, y_val),
        epochs=100,
        batch_size=64,
        callbacks=[early_stop],
        verbose=2,
    )

    test_loss, test_acc = model.evaluate(X_test, y_test, verbose=0)
    print(f"Test accuracy: {test_acc:.4f}  |  Test loss: {test_loss:.4f}")

    os.makedirs(MODEL_DIR, exist_ok=True)
    model.save(LSTM_MODEL_PATH)
    print(f"Saved LSTM model to {LSTM_MODEL_PATH}")
    return model


if __name__ == "__main__":
    train()
