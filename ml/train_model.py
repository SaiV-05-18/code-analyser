"""Machine Learning Defect Prediction Model Trainer.

Trains a RandomForestClassifier on code complexity and size features:
- LOC (Lines of Code)
- Cyclomatic Complexity
- Halstead Maintainability Index
- Branch Count
- Max Nesting Depth
- Security Issue Count

Saves the serialized model artifact to ml/defect_model.joblib.
"""

from datetime import datetime, timezone
import os
from pathlib import Path
from typing import Dict, Tuple

import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, roc_auc_score
from sklearn.model_selection import train_test_split

FEATURE_NAMES = [
    "loc",
    "cyclomatic_complexity",
    "maintainability_index",
    "branch_count",
    "max_nesting_depth",
    "security_issue_count",
]

DEFAULT_MODEL_PATH = Path(__file__).resolve().parent / "defect_model.joblib"


def generate_synthetic_dataset(
    n_samples: int = 4000,
    random_seed: int = 42,
) -> Tuple[np.ndarray, np.ndarray]:
    """Generates a statistically realistic software metrics dataset for defect prediction.

    Models code quality distributions inspired by empirical software defect benchmarks
    (e.g., NASA MDP / PROMISE defect datasets).
    """
    rng = np.random.default_rng(random_seed)

    # 1. Lines of code (LOC): right-skewed distribution (5 to 600+)
    loc = np.clip(np.exp(rng.normal(4.0, 0.9, size=n_samples)), 5, 800)

    # 2. Cyclomatic Complexity: correlated with LOC with variance
    cc_base = 1 + (loc * rng.uniform(0.04, 0.12, size=n_samples))
    cyclomatic_complexity = np.clip(np.round(cc_base + rng.normal(0, 1.5, size=n_samples)), 1, 60)

    # 3. Branch count: closely related to cyclomatic complexity (CC ~ branches + 1)
    branch_count = np.clip(np.round(cyclomatic_complexity - 1 + rng.normal(0, 1.0, size=n_samples)), 0, 55)

    # 4. Max Nesting Depth: integer values typically 1 to 8
    nesting_base = 1 + np.log2(np.clip(cyclomatic_complexity, 1, None)) * 0.8
    max_nesting_depth = np.clip(np.round(nesting_base + rng.normal(0, 0.8, size=n_samples)), 1, 9)

    # 5. Maintainability Index (0 to 100): inversely related to CC and LOC
    mi_raw = 110 - (0.45 * cyclomatic_complexity) - (8.0 * np.log(np.clip(loc, 1, None))) - (3.5 * max_nesting_depth)
    maintainability_index = np.clip(np.round(mi_raw + rng.normal(0, 6.0, size=n_samples)), 5, 100)

    # 6. Security Issue Count: Poisson-distributed, higher probability with larger/complex code
    sec_lambda = np.clip(0.05 + (loc * 0.003) + (cyclomatic_complexity * 0.02), 0.02, 3.0)
    security_issue_count = rng.poisson(lam=sec_lambda, size=n_samples)

    # Latent defect logit modeling defect propensity
    # Clean code has negative logit (low defect risk), complex/vulnerable code has high positive logit
    z = (
        -3.2
        + 0.012 * loc
        + 0.15 * cyclomatic_complexity
        - 0.045 * (maintainability_index - 50.0)
        + 0.09 * branch_count
        + 0.38 * (max_nesting_depth - 2.0)
        + 0.95 * security_issue_count
        + rng.normal(0, 0.6, size=n_samples)
    )

    # Convert latent logit to defect probability
    probabilities = 1.0 / (1.0 + np.exp(-z))

    # Binary classification label: 1 = defect-prone, 0 = clean/low-risk
    labels = (probabilities >= 0.50).astype(int)

    # Stack features into standard matrix
    x = np.column_stack([
        loc,
        cyclomatic_complexity,
        maintainability_index,
        branch_count,
        max_nesting_depth,
        security_issue_count,
    ])

    return x, labels


def train_defect_model(
    output_path: Path = DEFAULT_MODEL_PATH,
    n_samples: int = 4000,
    random_seed: int = 42,
) -> Dict[str, object]:
    """Trains a RandomForestClassifier and serializes the trained model to disk."""
    print(f"Generating synthetic training corpus ({n_samples} samples)...")
    x, y = generate_synthetic_dataset(n_samples=n_samples, random_seed=random_seed)

    x_train, x_test, y_train, y_test = train_test_split(
        x, y, test_size=0.25, random_state=random_seed, stratify=y
    )

    print("Training RandomForestClassifier...")
    clf = RandomForestClassifier(
        n_estimators=120,
        max_depth=7,
        min_samples_split=4,
        min_samples_leaf=2,
        class_weight="balanced",
        random_state=random_seed,
        n_jobs=-1,
    )
    clf.fit(x_train, y_train)

    y_pred = clf.predict(x_test)
    probs_array = np.asarray(clf.predict_proba(x_test))
    y_prob = probs_array[:, 1]

    acc = accuracy_score(y_test, y_pred)
    roc_auc = roc_auc_score(y_test, y_prob)

    print("\n--- Model Evaluation Results ---")
    print(f"Test Accuracy: {acc * 100:.2f}%")
    print(f"ROC-AUC Score: {roc_auc:.4f}")
    print("\nClassification Report:\n", classification_report(y_test, y_pred, target_names=["Clean (0)", "Defect (1)"]))

    print("Feature Importances:")
    importances = clf.feature_importances_
    for name, imp in sorted(zip(FEATURE_NAMES, importances), key=lambda t: t[1], reverse=True):
        print(f"  - {name:<25}: {imp * 100:.2f}%")

    metadata = {
        "model": clf,
        "feature_names": FEATURE_NAMES,
        "accuracy": float(acc),
        "roc_auc": float(roc_auc),
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "n_samples": n_samples,
    }

    # Ensure target directory exists
    output_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(clf, output_path)
    print(f"\nModel successfully serialized to: {output_path}")

    return metadata


if __name__ == "__main__":
    train_defect_model()
