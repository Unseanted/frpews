"""
Data preprocessing pipeline (thesis sections 3.3.1 / 4.2.2).

Run as a script once real NiMet/NIHSA/NEMA CSVs are dropped into
backend/data/raw/. Produces a single cleaned, feature-engineered dataset in
backend/data/processed/ ready for RF and LSTM training.

Expected raw CSV columns per station file (one file per study area):
    date, daily_rainfall_mm, temp_max_c, relative_humidity_pct,
    river_level_m, flow_rate_m3s, ndvi, flood_risk_class

flood_risk_class is optional in raw files; if absent it can be derived from
NIHSA gauge thresholds or NEMA event records (see `label_flood_risk`).
"""
import glob
import os

import numpy as np
import pandas as pd

RAW_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "raw")
PROCESSED_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "processed")

FEATURE_COLUMNS = [
    "daily_rainfall_mm",
    "antecedent_3day_rain_mm",
    "antecedent_7day_rain_mm",
    "temp_max_c",
    "relative_humidity_pct",
    "river_level_m",
    "river_level_change_m",
    "ndvi",
    "month",
]
TARGET_COLUMN = "flood_risk_class"


def load_raw_files(raw_dir=RAW_DIR):
    """Load every *.csv in raw_dir, tagging each with its inferred station name."""
    frames = []
    for path in glob.glob(os.path.join(raw_dir, "*.csv")):
        df = pd.read_csv(path, parse_dates=["date"])
        df["station_name"] = os.path.splitext(os.path.basename(path))[0]
        frames.append(df)
    if not frames:
        raise FileNotFoundError(
            f"No CSV files found in {raw_dir}. Add per-station files (e.g. "
            f"makurdi.csv, onitsha.csv, lokoja.csv) with the columns documented "
            f"in this module's docstring."
        )
    return pd.concat(frames, ignore_index=True)


def impute_missing(df):
    """Linear interpolation for short gaps (<5 days), per station (section 3.5.3)."""
    df = df.sort_values(["station_name", "date"])
    numeric_cols = ["daily_rainfall_mm", "temp_max_c", "relative_humidity_pct",
                     "river_level_m", "flow_rate_m3s", "ndvi"]
    for col in numeric_cols:
        if col in df.columns:
            df[col] = df.groupby("station_name")[col].transform(
                lambda s: s.interpolate(limit=4, limit_direction="both")
            )
    return df


def remove_outliers_iqr(df, column="river_level_m"):
    """IQR-based outlier flagging on river level records (section 3.5.3)."""
    if column not in df.columns:
        return df
    q1, q3 = df[column].quantile([0.25, 0.75])
    iqr = q3 - q1
    lower, upper = q1 - 1.5 * iqr, q3 + 1.5 * iqr
    df[f"{column}_is_outlier"] = ~df[column].between(lower, upper)
    return df


def engineer_features(df):
    """3-day/7-day antecedent rainfall, river-level delta, month (section 4.2.2)."""
    df = df.sort_values(["station_name", "date"])
    grouped = df.groupby("station_name")

    df["antecedent_3day_rain_mm"] = grouped["daily_rainfall_mm"].transform(
        lambda s: s.rolling(3, min_periods=1).sum()
    )
    df["antecedent_7day_rain_mm"] = grouped["daily_rainfall_mm"].transform(
        lambda s: s.rolling(7, min_periods=1).sum()
    )
    df["river_level_change_m"] = grouped["river_level_m"].diff().fillna(0)
    df["month"] = df["date"].dt.month
    return df


def normalize(df, columns=None):
    """Min-max scale to [0, 1] (section 3.5.3). Returns df and the fitted ranges
    so the same scaling can be applied at inference time."""
    columns = columns or [c for c in FEATURE_COLUMNS if c != "month"]
    ranges = {}
    for col in columns:
        lo, hi = df[col].min(), df[col].max()
        ranges[col] = (lo, hi)
        df[col] = (df[col] - lo) / (hi - lo) if hi > lo else 0.0
    return df, ranges


def label_flood_risk(df, low_thresh, moderate_thresh, high_thresh):
    """Derive a 4-class label from river_level_m if flood_risk_class isn't
    already present in the raw data. Thresholds should be calibrated per
    station from NIHSA gauge alert levels."""
    if TARGET_COLUMN in df.columns and df[TARGET_COLUMN].notna().any():
        return df

    def classify(level):
        if level < low_thresh:
            return 0
        if level < moderate_thresh:
            return 1
        if level < high_thresh:
            return 2
        return 3

    df[TARGET_COLUMN] = df["river_level_m"].apply(classify)
    return df


def run_pipeline():
    os.makedirs(PROCESSED_DIR, exist_ok=True)
    df = load_raw_files()
    df = impute_missing(df)
    df = remove_outliers_iqr(df)
    df = engineer_features(df)
    df = label_flood_risk(df, low_thresh=3.0, moderate_thresh=6.0, high_thresh=10.0)
    df, ranges = normalize(df)

    out_path = os.path.join(PROCESSED_DIR, "processed_dataset.csv")
    df.to_csv(out_path, index=False)
    print(f"Wrote {len(df)} processed records to {out_path}")
    return df, ranges


if __name__ == "__main__":
    run_pipeline()
