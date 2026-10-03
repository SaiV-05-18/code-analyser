import os
import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_auc_score

# Feature Vector:
# [loc, cyclomatic_complexity, maintainability_index, branch_count, max_nesting_depth, security_issues_count]

def generate_synthetic_nasa_metrics(n_samples=2500, random_state=42):
    """
    Generates synthetic software engineering defect metrics aligned with 
    historical empirical distributions (NASA MDP / PROMISE repository patterns).
    """
    np.random.seed(random_state)
    
    # 1. Physical Lines of Code (log-normal distribution)
    loc = np.random.lognormal(mean=3.0, sigma=0.8, size=n_samples).astype(int) + 2
    
    # 2. Cyclomatic Complexity (strongly correlated with LOC)
    cc = np.clip((loc * np.random.uniform(0.08, 0.25, size=n_samples)).astype(int), 1, 60)
    
    # 3. Maintainability Index (inversely correlated with CC and LOC)
    mi = np.clip(100 - (cc * 1.5) - (np.log1p(loc) * 5) + np.random.normal(0, 4, size=n_samples), 10, 100)
    
    # 4. Branch Count
    branches = np.clip((cc * np.random.uniform(0.7, 1.2, size=n_samples)).astype(int), 0, 50)
    
    # 5. Nesting Depth
    nesting = np.clip((np.log2(cc + 1) + np.random.choice([0, 1, 2], p=[0.5, 0.35, 0.15], size=n_samples)).astype(int), 1, 8)
    
    # 6. Security Findings
    security_count = np.random.choice([0, 1, 2, 3], p=[0.75, 0.18, 0.05, 0.02], size=n_samples)

    X = np.column_stack([loc, cc, mi, branches, nesting, security_count])

    # Empirical Defect Probability Function (Logistic boundary)
    logit = (
        0.02 * loc +
        0.18 * cc -
        0.06 * mi +
        0.08 * branches +
        0.25 * nesting +
        0.90 * security_count -
        1.5
    )
    prob = 1 / (1 + np.exp(-logit))
    y = (np.random.rand(n_samples) < prob).astype(int)
    
    return X, y

def train_and_export_model():
    print("Generating training dataset calibrated on code defect metrics...")
    X, y = generate_synthetic_nasa_metrics()

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    print(f"Training RandomForestClassifier on {len(X_train)} samples...")
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=6,
        random_state=42,
        class_weight="balanced"
    )
    model.fit(X_train, y_train)

    # Evaluation
    preds = model.predict(X_test)
    probs = np.asarray(model.predict_proba(X_test))[:, 1]
    print("\n--- Model Evaluation ---")
    print(classification_report(y_test, preds))
    print(f"ROC-AUC Score: {roc_auc_score(y_test, probs):.4f}")

    # Export Model Artifact
    current_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(current_dir, "defect_model.joblib")
    joblib.dump(model, model_path)
    print(f"\nModel successfully saved to: {model_path}")

if __name__ == "__main__":
    train_and_export_model()
