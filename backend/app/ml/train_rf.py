"""
Random Forest training (thesis section 3.3.2.1 / 4.4.1).

Usage (from backend/):
    python -m app.ml.train_rf

Expects backend/data/processed/processed_dataset.csv to exist
(run preprocessing.py first).
"""
import os

import joblib
import pandas as pd
from imblearn.over_sampling import SMOTE
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, roc_auc_score
from sklearn.model_selection import GridSearchCV
from sklearn.preprocessing import label_binarize

from app.ml.preprocessing import FEATURE_COLUMNS, TARGET_COLUMN, PROCESSED_DIR

MODEL_DIR = os.path.join(os.path.dirname(__file__), "artifacts")
RF_MODEL_PATH = os.path.join(MODEL_DIR, "rf_model.joblib")

PARAM_GRID = {
    "n_estimators": [100, 200, 300],
    "max_depth": [10, 15, 20, None],
    "min_samples_split": [2, 5, 10],
}


def load_dataset():
    path = os.path.join(PROCESSED_DIR, "processed_dataset.csv")
    if not os.path.exists(path):
        raise FileNotFoundError(
            f"{path} not found. Run `python -m app.ml.preprocessing` first."
        )
    return pd.read_csv(path)


def time_split(df, train_end_year, val_end_year, date_col="date"):
    """Chronological split mirroring thesis section 3.9.1 (2000-2019 / 2020-2021 / 2022-2023)."""
    df[date_col] = pd.to_datetime(df[date_col])
    train = df[df[date_col].dt.year <= train_end_year]
    val = df[(df[date_col].dt.year > train_end_year) & (df[date_col].dt.year <= val_end_year)]
    test = df[df[date_col].dt.year > val_end_year]
    return train, val, test


def train():
    df = load_dataset()
    train_df, val_df, test_df = time_split(df, train_end_year=2019, val_end_year=2021)

    X_train, y_train = train_df[FEATURE_COLUMNS], train_df[TARGET_COLUMN]
    X_test, y_test = test_df[FEATURE_COLUMNS], test_df[TARGET_COLUMN]

    # SMOTE oversampling for class imbalance (section 4.3.2)
    X_train_res, y_train_res = SMOTE(random_state=42).fit_resample(X_train, y_train)

    grid = GridSearchCV(
        RandomForestClassifier(criterion="gini", random_state=42),
        PARAM_GRID,
        cv=5,
        scoring="f1_weighted",
        n_jobs=-1,
    )
    grid.fit(X_train_res, y_train_res)
    model = grid.best_estimator_
    print("Best RF params:", grid.best_params_)

    y_pred = model.predict(X_test)
    print(classification_report(y_test, y_pred, target_names=["Low", "Moderate", "High", "Extreme"]))

    try:
        y_proba = model.predict_proba(X_test)
        y_test_bin = label_binarize(y_test, classes=[0, 1, 2, 3])
        auc = roc_auc_score(y_test_bin, y_proba, average=None, multi_class="ovr")
        print("Per-class AUC-ROC:", dict(zip(["Low", "Moderate", "High", "Extreme"], auc)))
    except ValueError as e:
        print("AUC-ROC skipped:", e)

    # Feature importance (section 4.4.1)
    importances = sorted(
        zip(FEATURE_COLUMNS, model.feature_importances_), key=lambda x: -x[1]
    )
    print("Feature importances:", importances)

    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(model, RF_MODEL_PATH)
    print(f"Saved RF model to {RF_MODEL_PATH}")
    return model


if __name__ == "__main__":
    train()
