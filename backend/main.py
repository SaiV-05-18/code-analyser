import sys
from pathlib import Path
from typing import Any, Dict

# Ensure project root is in sys.path so 'ml' package can be imported
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from ml.analyzer import CodeAnalysisError, analyze_code

app = FastAPI(
    title="Code Analyzer API",
    description="Backend API for code metric extraction, static analysis, and defect risk prediction.",
    version="1.0.0",
)

# Enable CORS for frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    code: str = Field(..., description="Source code string to analyze")
    language: str = Field("Python", description="Programming language (e.g., 'Python')")


@app.get("/")
def home():
    return {
        "status": "healthy",
        "message": "Code Analyzer API is running",
        "docs_url": "/docs",
    }


@app.post("/api/v1/analyze")
def analyze(request: AnalyzeRequest) -> Dict[str, Any]:
    """Analyzes source code and extracts structural metrics, complexity, and nesting depth."""
    if request.language.strip().lower() != "python":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Language '{request.language}' is not yet supported. Only 'Python' is currently supported.",
        )

    try:
        result = analyze_code(request.code)
        return result
    except CodeAnalysisError as err:
        error_type = "SyntaxError" if err.line is not None else "ValidationError"
        raise HTTPException(
            status_code=getattr(status, "HTTP_422_UNPROCESSABLE_CONTENT", 422),
            detail={
                "error": error_type,
                "message": err.message,
                "line": err.line,
                "offset": err.offset,
            },
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error during analysis: {str(exc)}",
        )