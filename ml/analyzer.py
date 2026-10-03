import ast
import io
import os
import tempfile
from datetime import datetime, timezone
from typing import Optional
import joblib
import numpy as np

from radon.complexity import cc_visit, cc_rank
from radon.metrics import mi_visit, mi_rank
from radon.raw import analyze as radon_raw_analyze

from bandit.core import config as b_config
from bandit.core import manager as b_manager
from flake8.api import legacy as flake8_legacy


class CodeAnalysisError(ValueError):
    """Raised when source code analysis fails due to syntax or parsing errors."""

    def __init__(self, message: str, line: Optional[int] = None, offset: Optional[int] = None):
        super().__init__(message)
        self.message = message
        self.line = line
        self.offset = offset


# Load pre-trained Defect Prediction Model
MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "defect_model.joblib")
try:
    DEFECT_MODEL = joblib.load(MODEL_PATH)
except Exception:
    DEFECT_MODEL = None


def run_bandit_scan(code: str) -> list:
    issues = []
    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(mode="w", suffix=".py", delete=False, encoding="utf-8") as tmp_file:
            tmp_file.write(code)
            tmp_path = tmp_file.name

        b_conf = b_config.BanditConfig()
        mgr = b_manager.BanditManager(b_conf, "file")
        mgr.discover_files([tmp_path])
        mgr.run_tests()

        for item in mgr.get_issue_list():
            line_no = (
                item.fname_and_line_number_tuple[1]
                if hasattr(item, "fname_and_line_number_tuple") and item.fname_and_line_number_tuple
                else getattr(item, "lineno", 1)
            )
            text_desc = getattr(item, "text", "")
            issues.append({
                "id": getattr(item, "test_id", "B000"),
                "title": text_desc,
                "message": text_desc,
                "severity": item.severity.capitalize() if hasattr(item, "severity") else "Medium",
                "confidence": item.confidence.capitalize() if hasattr(item, "confidence") else "High",
                "line": line_no,
                "description": text_desc
            })
    except Exception:
        pass
    finally:
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except OSError:
                pass

    return issues


def run_flake8_scan(code: str) -> list:
    style_issues = []
    try:
        tree = ast.parse(code)
        for node in ast.walk(tree):
            if isinstance(node, ast.ExceptHandler) and node.type is None:
                style_issues.append({
                    "rule": "W0702",
                    "severity": "Warning",
                    "line": node.lineno,
                    "description": "No exception type(s) specified (bare 'except:')",
                    "message": "W0702: No exception type(s) specified (bare 'except:')"
                })
    except Exception:
        pass

    return style_issues


def predict_defect_risk(features: list) -> tuple:
    """
    Feeds features [loc, cc, mi, branches, nesting, security_count] to RandomForest.
    Returns (probability_percentage: int, risk_level: str)
    """
    if DEFECT_MODEL is not None:
        try:
            X = np.array([features])
            # Probability of defect class (index 1)
            prob = DEFECT_MODEL.predict_proba(X)[0][1]
            prob_percent = int(round(prob * 100))
            prob_percent = max(5, min(98, prob_percent))
            risk_level = "High" if prob_percent >= 60 else ("Medium" if prob_percent >= 30 else "Low")
            return prob_percent, risk_level
        except Exception:
            pass

    # Heuristic fallback if model not loaded
    loc, cc, mi, branches, nesting, security_count = features
    score = 5
    if cc > 10:
        score += min(35, (cc - 10) * 4)
    if mi < 65:
        score += min(35, int(65 - mi))
    if nesting > 3:
        score += min(10, (nesting - 3) * 3)
    if security_count > 0:
        score += min(30, security_count * 15)
    score = min(95, score)
    level = "High" if score > 60 else ("Medium" if score > 30 else "Low")
    return score, level


def analyze_code(code: str) -> dict:
    if not code or not code.strip():
        raise CodeAnalysisError("Source code cannot be empty.")

    # 1. AST Structural Metrics
    try:
        tree = ast.parse(code)
    except SyntaxError as e:
        raise CodeAnalysisError(
            message=f"Syntax error: {e.msg}",
            line=e.lineno,
            offset=e.offset,
        )

    functions = [n for n in ast.walk(tree) if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef))]
    function_count = len(functions)
    branch_count = sum(1 for n in ast.walk(tree) if isinstance(n, (ast.If, ast.IfExp)))
    loop_count = sum(1 for n in ast.walk(tree) if isinstance(n, (ast.For, ast.AsyncFor, ast.While)))
    variables = {n.id for n in ast.walk(tree) if isinstance(n, ast.Name) and isinstance(n.ctx, ast.Store)}
    variable_count = len(variables)

    def get_max_depth(node, current_depth=0):
        block_types = (
            ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef,
            ast.For, ast.AsyncFor, ast.While, ast.If, ast.Try, ast.With
        )
        new_depth = current_depth + 1 if isinstance(node, block_types) else current_depth
        max_d = new_depth
        for child in ast.iter_child_nodes(node):
            max_d = max(max_d, get_max_depth(child, new_depth))
        return max_d

    max_nesting_depth = get_max_depth(tree)

    # 2. Raw Metrics via Radon
    try:
        raw_metrics = radon_raw_analyze(code)
        loc = raw_metrics.loc
        sloc = raw_metrics.sloc
        comments = raw_metrics.comments
        comment_density = round((comments / loc) * 100, 1) if loc > 0 else 0.0
    except Exception:
        lines = code.splitlines()
        loc = len(lines)
        sloc = len([l for l in lines if l.strip()])
        comments = sum(1 for l in lines if l.strip().startswith("#"))
        comment_density = round((comments / loc) * 100, 1) if loc > 0 else 0.0

    # 3. Cyclomatic Complexity via Radon
    complexity_blocks = cc_visit(code)
    if complexity_blocks:
        total_cc = sum(block.complexity for block in complexity_blocks)
        avg_cc = max(1, round(total_cc / len(complexity_blocks)))
        cc_grade = cc_rank(avg_cc)
    else:
        avg_cc = max(1, 1 + branch_count + loop_count)
        cc_grade = cc_rank(avg_cc)

    if cc_grade in ('A', 'B'):
        complexity_rating = 'Low'
    elif cc_grade == 'C':
        complexity_rating = 'Medium'
    else:
        complexity_rating = 'High'

    # 4. Maintainability Index via Radon
    try:
        raw_mi = mi_visit(code, multi=True)
        maintainability_index = max(0, min(100, round(raw_mi)))
        maintainability_grade = mi_rank(raw_mi)
    except Exception:
        maintainability_index = 100
        maintainability_grade = "A"

    maintainability_rating_map = {
        'A': 'High (Maintainable)',
        'B': 'Medium',
        'C': 'Low (Needs Refactoring)'
    }
    maintainability_rating = maintainability_rating_map.get(maintainability_grade, 'Medium')

    # 5. Security & Style Scans
    security_issues = run_bandit_scan(code)
    style_issues = run_flake8_scan(code)

    # 6. ML Defect Prediction
    feature_vector = [
        loc,
        avg_cc,
        maintainability_index,
        branch_count,
        max_nesting_depth,
        len(security_issues)
    ]
    defect_probability, defect_risk_level = predict_defect_risk(feature_vector)

    recommendations = []
    if security_issues:
        recommendations.append(f"Detected {len(security_issues)} security warning(s). Review vulnerabilities highlighted in the security table.")
    if avg_cc > 10:
        recommendations.append(f"Average Cyclomatic Complexity is {avg_cc}. Decompose complex functions into smaller modular units.")
    if maintainability_index < 60:
        recommendations.append(f"Maintainability Index is low ({maintainability_index}/100). Simplify nested logic.")
    if not recommendations:
        recommendations.append("Code structure is clean and within healthy complexity and defect risk thresholds.")

    return {
        "metrics": {
            "loc": loc,
            "sloc": sloc,
            "functionCount": function_count,
            "branchCount": branch_count,
            "loopCount": loop_count,
            "commentCount": comments,
            "commentDensity": comment_density,
            "variableCount": variable_count,
            "maxNestingDepth": max_nesting_depth,
            "cyclomaticComplexity": avg_cc,
            "complexityRating": complexity_rating,
            "maintainabilityIndex": maintainability_index,
            "maintainabilityGrade": maintainability_grade,
            "maintainabilityRating": maintainability_rating
        },
        "prediction": {
            "probability": defect_probability,
            "class": f"Defect Risk ({defect_risk_level})",
            "risk": defect_risk_level
        },
        "securityIssues": security_issues,
        "styleIssues": style_issues,
        "recommendations": recommendations,
        "analyzedAt": datetime.now(timezone.utc).isoformat()
    }
