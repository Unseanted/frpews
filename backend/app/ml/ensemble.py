"""
Ensemble strategy (thesis section 3.3.2.3): simple weighted average of the RF
and LSTM class-probability outputs, weights 0.5/0.5 by default (tune against
validation performance as described in the thesis).
"""
import numpy as np

RISK_CLASSES = ["Low", "Moderate", "High", "Extreme"]


def ensemble_probabilities(rf_probs, lstm_probs, rf_weight=0.5, lstm_weight=0.5):
    """rf_probs, lstm_probs: array-like of shape (4,) — probability per risk class."""
    rf_probs = np.asarray(rf_probs)
    lstm_probs = np.asarray(lstm_probs)
    combined = rf_weight * rf_probs + lstm_weight * lstm_probs
    combined = combined / combined.sum()
    return combined


def classify(probabilities):
    idx = int(np.argmax(probabilities))
    return RISK_CLASSES[idx], float(probabilities[idx])
