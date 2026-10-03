"""AST-based Code Analyzer module for Python source code.

Extracts structural code metrics using Python's built-in `ast` and `tokenize` modules.
No regular expressions are used for structural code parsing.
"""

import ast
import io
import tokenize
from datetime import datetime, timezone
from typing import Any, Dict, Set


class CodeAnalysisError(Exception):
    """Raised when source code analysis fails due to syntax or parsing errors."""
    def __init__(self, message: str, line: int = None, offset: int = None):
        super().__init__(message)
        self.message = message
        self.line = line
        self.offset = offset


def _calculate_max_nesting_depth(node: ast.AST, current_depth: int = 0) -> int:
    """Recursively computes the maximum nesting depth of code blocks.
    
    Nesting constructs include functions, classes, conditionals, loops,
    exception handlers, and context managers.
    """
    NESTING_NODES = (
        ast.FunctionDef,
        ast.AsyncFunctionDef,
        ast.ClassDef,
        ast.If,
        ast.For,
        ast.AsyncFor,
        ast.While,
        ast.With,
        ast.AsyncWith,
        ast.Try,
        ast.ExceptHandler,
    )

    max_depth = current_depth
    for child in ast.iter_child_nodes(node):
        child_depth = current_depth + (1 if isinstance(child, NESTING_NODES) else 0)
        max_depth = max(max_depth, _calculate_max_nesting_depth(child, child_depth))

    return max_depth


def _count_comments(code: str) -> int:
    """Counts comment occurrences using Python's standard tokenizer.
    
    Falls back to safe line-by-line inspection if tokenization fails
    (e.g., incomplete code snippet or unclosed string literal).
    """
    comment_count = 0
    try:
        tokens = tokenize.generate_tokens(io.StringIO(code).readline)
        for tok in tokens:
            if tok.type == tokenize.COMMENT:
                comment_count += 1
        return comment_count
    except Exception:
        # Fallback: line-by-line check without regex
        for line in code.splitlines():
            stripped = line.strip()
            if stripped.startswith("#"):
                comment_count += 1
        return comment_count


def analyze_code(code: str) -> Dict[str, Any]:
    """Analyzes Python source code using Python's built-in AST.

    Extracts:
      - LOC (total lines and non-blank lines)
      - Function count
      - Branch / If count
      - Loop count
      - Comment count & comment density
      - Variable count (unique assigned identifiers)
      - Maximum nesting depth
      - Basic cyclomatic complexity

    Returns a structured dictionary conforming to the API contract.
    """
    if code is None:
        code = ""

    lines = code.splitlines()
    loc = len(lines)
    non_empty_lines = [l for l in lines if l.strip()]
    sloc = len(non_empty_lines)

    # 1. Parse AST
    try:
        tree = ast.parse(code)
    except SyntaxError as e:
        raise CodeAnalysisError(
            message=f"Syntax error: {e.msg}",
            line=e.lineno,
            offset=e.offset,
        )

    # 2. Extract comments and documentation density
    comment_count = _count_comments(code)
    comment_density = round((comment_count / max(1, sloc)) * 100) if sloc > 0 else 0

    # 3. Walk AST to collect structural components
    function_count = 0
    branch_count = 0
    loop_count = 0
    assigned_variables: Set[str] = set()
    decision_points = 0

    for node in ast.walk(tree):
        # Functions
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            function_count += 1

        # Branches / Conditionals
        if isinstance(node, (ast.If, ast.IfExp)):
            branch_count += 1
            decision_points += 1

        # Loops
        if isinstance(node, (ast.For, ast.AsyncFor, ast.While)):
            loop_count += 1
            decision_points += 1

        # Exception handling decision paths
        if isinstance(node, ast.ExceptHandler):
            decision_points += 1

        # Boolean operators (e.g. `a and b and c` has 2 extra decision branches)
        if isinstance(node, ast.BoolOp):
            decision_points += max(0, len(node.values) - 1)

        # Variables: identifiers stored or assigned
        if isinstance(node, ast.Name) and isinstance(node.ctx, ast.Store):
            assigned_variables.add(node.id)

    variable_count = len(assigned_variables)

    # 4. Maximum nesting depth
    max_nesting_depth = _calculate_max_nesting_depth(tree)

    # 5. Basic cyclomatic complexity (McCabe: 1 + decision points)
    cyclomatic_complexity = 1 + decision_points

    complexity_rating = "Low"
    if cyclomatic_complexity > 10:
        complexity_rating = "High"
    elif cyclomatic_complexity > 5:
        complexity_rating = "Medium"

    # 6. Maintainability approximation (index 0 - 100, grade, rating)
    raw_mi = 100 - (cyclomatic_complexity * 3) - (loc * 0.3) + (comment_density * 0.2)
    maintainability_index = max(10, min(100, round(raw_mi)))

    maintainability_grade = "A"
    if maintainability_index < 45:
        maintainability_grade = "D"
    elif maintainability_index < 65:
        maintainability_grade = "C"
    elif maintainability_index < 80:
        maintainability_grade = "B"

    maintainability_rating = "High"
    if maintainability_index < 50:
        maintainability_rating = "Low"
    elif maintainability_index < 75:
        maintainability_rating = "Moderate"

    # 7. Code structure recommendations based on extracted metrics
    recommendations = []
    if cyclomatic_complexity > 10:
        recommendations.append(
            f"High cyclomatic complexity ({cyclomatic_complexity}). Consider breaking down large decision trees into smaller functions."
        )
    if max_nesting_depth >= 4:
        recommendations.append(
            f"Deep nesting detected (maximum depth: {max_nesting_depth}). Refactor nested loops and conditionals using guard clauses or early returns."
        )
    if comment_density < 10 and sloc > 10:
        recommendations.append(
            f"Low comment density ({comment_density}%). Consider adding docstrings or comments explaining function logic and edge cases."
        )
    if function_count > 0 and (loc / function_count) > 35:
        recommendations.append(
            "Average function length exceeds 35 lines. Consider modularizing functions for better readability."
        )
    if not recommendations:
        recommendations.append("Code structure is clean with acceptable complexity and nesting depth.")

    # 8. Baseline defect risk estimation (pending ML model integration)
    defect_risk = "Low"
    defect_prob = min(90, max(5, int(cyclomatic_complexity * 4 + max(0, 100 - maintainability_index) * 0.3)))
    if defect_prob >= 65:
        defect_risk = "High"
    elif defect_prob >= 35:
        defect_risk = "Medium"

    return {
        "metrics": {
            "loc": loc,
            "functionCount": function_count,
            "function_count": function_count,
            "branchCount": branch_count,
            "branch_count": branch_count,
            "loopCount": loop_count,
            "loop_count": loop_count,
            "commentCount": comment_count,
            "comment_count": comment_count,
            "commentDensity": comment_density,
            "comment_density": comment_density,
            "variableCount": variable_count,
            "variable_count": variable_count,
            "maxNestingDepth": max_nesting_depth,
            "max_nesting_depth": max_nesting_depth,
            "cyclomaticComplexity": cyclomatic_complexity,
            "cyclomatic_complexity": cyclomatic_complexity,
            "complexityRating": complexity_rating,
            "maintainabilityIndex": maintainability_index,
            "maintainabilityGrade": maintainability_grade,
            "maintainabilityRating": maintainability_rating,
        },
        "prediction": {
            "probability": defect_prob,
            "class": f"Defect Risk ({defect_risk})",
            "risk": defect_risk,
        },
        "securityIssues": [],
        "styleIssues": [],
        "recommendations": recommendations,
        "analyzedAt": datetime.now(timezone.utc).isoformat(),
    }
