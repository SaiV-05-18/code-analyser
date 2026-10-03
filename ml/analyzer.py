"""Formal Code Analyzer module for Python source code using AST, Radon, Bandit, and Flake8.

Features:
  - In-memory AST structural extraction (functions, branches, loops, variables, nesting depth).
  - Formal complexity & maintainability indexing via Radon.
  - Programmatic in-memory security scanning via Bandit.
  - Safe in-memory PEP 8 and lint analysis via Flake8 (pycodestyle & pyflakes).
"""

import ast
import io
import os
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Set

from radon.complexity import average_complexity, cc_rank, cc_visit
from radon.metrics import mi_rank, mi_visit
from radon.raw import analyze as radon_raw_analyze

from bandit.core import config as b_config
from bandit.core import manager as b_manager
import pycodestyle
import pyflakes.api
import pyflakes.reporter


class CodeAnalysisError(Exception):
    """Raised when source code analysis fails due to syntax or parsing errors."""

    def __init__(self, message: str, line: Optional[int] = None, offset: Optional[int] = None):
        super().__init__(message)
        self.message = message
        self.line = line
        self.offset = offset


# Global in-memory cache for the serialized Machine Learning defect model
_DEFECT_MODEL: Optional[Any] = None
MODEL_PATH = Path(__file__).resolve().parent / "defect_model.joblib"


def get_defect_model() -> Optional[Any]:
    """Returns the cached RandomForest model, loading it into memory on demand."""
    global _DEFECT_MODEL
    if _DEFECT_MODEL is not None:
        return _DEFECT_MODEL

    if MODEL_PATH.is_file():
        try:
            import joblib
            loaded = joblib.load(MODEL_PATH)
            if isinstance(loaded, dict) and "model" in loaded:
                _DEFECT_MODEL = loaded["model"]
            else:
                _DEFECT_MODEL = loaded
        except Exception:
            _DEFECT_MODEL = None

    return _DEFECT_MODEL


def predict_defect_risk(
    loc: int,
    cyclomatic_complexity: int,
    maintainability_index: float,
    branch_count: int,
    max_nesting_depth: int,
    security_issue_count: int,
) -> Dict[str, Any]:
    """Predicts defect probability and risk tier using the trained ML model or baseline fallback."""
    model = get_defect_model()

    if model is not None:
        try:
            features = [[
                float(loc),
                float(cyclomatic_complexity),
                float(maintainability_index),
                float(branch_count),
                float(max_nesting_depth),
                float(security_issue_count),
            ]]
            probabilities = model.predict_proba(features)[0]

            if hasattr(model, "classes_") and 1 in model.classes_:
                idx = list(model.classes_).index(1)
                defect_prob = float(probabilities[idx])
            else:
                defect_prob = float(probabilities[-1])

            prob_percent = int(round(defect_prob * 100))
            prob_percent = max(1, min(99, prob_percent))
            risk_level = "High" if prob_percent > 60 else ("Medium" if prob_percent > 30 else "Low")

            return {
                "probability": prob_percent,
                "class": f"Defect Risk ({risk_level})",
                "risk": risk_level,
                "model": "RandomForestClassifier",
            }
        except Exception:
            # Fall back cleanly to baseline heuristic on inference error
            pass

    # Pipeline Fallback: Baseline heuristic formula
    risk_score = 5
    if cyclomatic_complexity > 10:
        risk_score += min(35, (cyclomatic_complexity - 10) * 4)
    if maintainability_index < 65:
        risk_score += min(35, (65 - maintainability_index))
    if max_nesting_depth > 3:
        risk_score += min(10, (max_nesting_depth - 3) * 3)
    if security_issue_count > 0:
        risk_score += min(30, security_issue_count * 15)

    risk_score = min(95, int(risk_score))
    risk_level = "High" if risk_score > 60 else ("Medium" if risk_score > 30 else "Low")

    return {
        "probability": risk_score,
        "class": f"Defect Risk ({risk_level})",
        "risk": risk_level,
        "model": "Heuristic Baseline (Fallback)",
    }


def run_bandit_scan(code: str) -> list:
    """Runs Bandit security analysis on a temporary source file and returns structured issues."""
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
            line_no = getattr(item, "lineno", None)
            if line_no is None and hasattr(item, "fname_and_line_number_tuple"):
                line_no = item.fname_and_line_number_tuple[1]
            line_no = line_no or 1

            severity = item.severity.capitalize() if hasattr(item, "severity") else "Medium"
            confidence = item.confidence.capitalize() if hasattr(item, "confidence") else "High"

            issues.append({
                "id": getattr(item, "test_id", "B000"),
                "title": item.text,
                "severity": severity,
                "confidence": confidence,
                "line": line_no,
                "description": item.text,
                "message": item.text,
            })
    except Exception:
        # Fallback to prevent crash if security scanner encounters unexpected error
        pass
    finally:
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except OSError:
                pass

    return issues


def run_flake8_scan(code: str) -> list:
    """Runs in-memory Flake8 style & linting checks (pyflakes + pycodestyle) safely without stdout hijacking."""
    style_issues = []

    # 1. Pyflakes (logical linting: unused imports, undefined variables, unused locals)
    out_buf = io.StringIO()
    err_buf = io.StringIO()
    reporter = pyflakes.reporter.Reporter(out_buf, err_buf)
    try:
        pyflakes.api.check(code, "source.py", reporter)
        for raw_line in out_buf.getvalue().splitlines():
            raw_line = raw_line.strip()
            if not raw_line:
                continue
            parts = raw_line.split(":", 3)
            if len(parts) >= 3:
                try:
                    line_no = int(parts[1])
                except (ValueError, IndexError):
                    line_no = 1
                msg = parts[-1].strip()
                rule = "F401" if "imported but unused" in msg else ("F841" if "assigned to but never used" in msg else "F")
                style_issues.append({
                    "rule": rule,
                    "severity": "Warning",
                    "line": line_no,
                    "description": msg,
                    "message": f"{rule}: {msg}",
                })
    except Exception:
        pass

    # 2. Pycodestyle (PEP 8 style: whitespace, blank lines, bare excepts, formatting)
    class CustomIssueCollector(pycodestyle.BaseReport):
        def __init__(self, options):
            super().__init__(options)
            self.errors = []

        def error(self, line_number, offset, text, check):
            code_id = super().error(line_number, offset, text, check)
            if code_id:
                desc = text[len(code_id):].strip() if text.startswith(code_id) else text
                self.errors.append({
                    "rule": code_id,
                    "severity": "Warning" if code_id.startswith("W") else "Low",
                    "line": line_number,
                    "description": desc,
                    "message": f"{code_id}: {desc}",
                })
            return code_id

    try:
        style_guide = pycodestyle.StyleGuide(
            reporter=CustomIssueCollector,
            ignore=["E501"],  # Line length optional
            quiet=True,
        )
        lines = code.splitlines(True)
        style_guide.input_file("source.py", lines=lines)
        if hasattr(style_guide.options, "report") and hasattr(style_guide.options.report, "errors"):
            style_issues.extend(style_guide.options.report.errors)
    except Exception:
        pass

    # 3. Fallback AST inspection for bare excepts if no issues collected
    if not style_issues:
        try:
            tree = ast.parse(code)
            for node in ast.walk(tree):
                if isinstance(node, ast.ExceptHandler) and node.type is None:
                    style_issues.append({
                        "rule": "E722",
                        "severity": "Warning",
                        "line": node.lineno,
                        "description": "No exception type specified (bare 'except:')",
                        "message": "E722: No exception type specified (bare 'except:')",
                    })
        except Exception:
            pass

    return style_issues


def analyze_code(code: str) -> dict:
    if not code or not code.strip():
        raise CodeAnalysisError("Source code cannot be empty.")

    # 1. AST Validation & Structural Extraction
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
            ast.FunctionDef,
            ast.AsyncFunctionDef,
            ast.ClassDef,
            ast.For,
            ast.AsyncFor,
            ast.While,
            ast.If,
            ast.Try,
            ast.With,
            ast.AsyncWith,
            ast.ExceptHandler,
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
        comments = raw_metrics.comments + getattr(raw_metrics, "multi", 0)
        comment_density = round((comments / max(1, loc)) * 100, 1) if loc > 0 else 0.0
    except Exception:
        lines = code.splitlines()
        loc = len(lines)
        sloc = len([l for l in lines if l.strip()])
        comments = sum(1 for l in lines if l.strip().startswith("#"))
        comment_density = round((comments / max(1, loc)) * 100, 1) if loc > 0 else 0.0

    # 3. Cyclomatic Complexity via Radon
    complexity_blocks = cc_visit(code)
    formatted_blocks = []
    if complexity_blocks:
        total_cc = sum(block.complexity for block in complexity_blocks)
        avg_cc = max(1, round(total_cc / len(complexity_blocks)))
        peak_cc = max(block.complexity for block in complexity_blocks)
        cyclomatic_complexity = peak_cc
        cc_grade = cc_rank(cyclomatic_complexity)

        for b in complexity_blocks:
            formatted_blocks.append({
                "name": b.name,
                "complexity": b.complexity,
                "rank": cc_rank(b.complexity),
                "line": b.lineno,
                "type": getattr(b, "letter", "F"),
            })
    else:
        cyclomatic_complexity = max(1, 1 + branch_count + loop_count)
        avg_cc = cyclomatic_complexity
        cc_grade = cc_rank(cyclomatic_complexity)

    # Map Radon rank to frontend ratings: Low (A/B), Medium (C), High (D/E/F)
    if cyclomatic_complexity <= 5:
        complexity_rating = "Low"
    elif cyclomatic_complexity <= 10:
        complexity_rating = "Medium"
    else:
        complexity_rating = "High"

    # 4. Formal Maintainability Index via Radon (Halstead volume calculation)
    try:
        raw_mi = mi_visit(code, multi=True)
        maintainability_index = max(0, min(100, round(raw_mi)))
        maintainability_grade = mi_rank(raw_mi)
    except Exception:
        maintainability_index = 100
        maintainability_grade = "A"

    if maintainability_index >= 70:
        maintainability_rating = "High"
    elif maintainability_index >= 50:
        maintainability_rating = "Moderate"
    else:
        maintainability_rating = "Low"

    # 5. Security & Style Scans
    security_issues = run_bandit_scan(code)
    style_issues = run_flake8_scan(code)

    # 6. Defect Risk Prediction (Machine Learning with Heuristic Fallback)
    prediction_result = predict_defect_risk(
        loc=loc,
        cyclomatic_complexity=cyclomatic_complexity,
        maintainability_index=maintainability_index,
        branch_count=branch_count,
        max_nesting_depth=max_nesting_depth,
        security_issue_count=len(security_issues),
    )

    recommendations = []
    if security_issues:
        recommendations.append(f"Found {len(security_issues)} security warning(s). Review vulnerabilities highlighted in the security table.")
    if cyclomatic_complexity > 10:
        recommendations.append(f"Peak Cyclomatic Complexity is {cyclomatic_complexity} (Radon Rank '{cc_grade}'). Decompose complex functions into smaller modular units.")
    if maintainability_index < 60:
        recommendations.append(f"Maintainability Index is low ({maintainability_index}/100, Grade '{maintainability_grade}'). Simplify nested logic and reduce expressions.")
    if not recommendations:
        recommendations.append("Code structure is clean and within healthy complexity and security thresholds.")

    return {
        "metrics": {
            "loc": loc,
            "sloc": sloc,
            "functionCount": function_count,
            "function_count": function_count,
            "branchCount": branch_count,
            "branch_count": branch_count,
            "loopCount": loop_count,
            "loop_count": loop_count,
            "commentCount": comments,
            "comment_count": comments,
            "commentDensity": comment_density,
            "comment_density": comment_density,
            "variableCount": variable_count,
            "variable_count": variable_count,
            "maxNestingDepth": max_nesting_depth,
            "max_nesting_depth": max_nesting_depth,
            "cyclomaticComplexity": cyclomatic_complexity,
            "cyclomatic_complexity": cyclomatic_complexity,
            "averageComplexity": avg_cc,
            "radonRank": cc_grade,
            "complexityRating": complexity_rating,
            "maintainabilityIndex": maintainability_index,
            "maintainabilityGrade": maintainability_grade,
            "maintainabilityRating": maintainability_rating,
            "complexityBlocks": formatted_blocks,
        },
        "prediction": prediction_result,
        "securityIssues": security_issues,
        "styleIssues": style_issues,
        "recommendations": recommendations,
        "analyzedAt": datetime.now(timezone.utc).isoformat(),
    }
