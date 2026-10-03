/**
 * Analysis Service for communicating with the FastAPI backend.
 * Dispatches code analysis requests to POST /api/v1/analyze.
 */

export async function analyzeCode(code, language) {
  if (!code || !code.trim()) {
    throw new Error('Please enter some code to analyze.');
  }

  const response = await fetch('/api/v1/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code, language }),
  });

  const data = await response.json();

  if (!response.ok) {
    let errorMessage = data?.detail || 'Analysis request failed.';
    if (typeof errorMessage === 'object') {
      errorMessage = errorMessage.message
        ? `${errorMessage.message}${errorMessage.line ? ` (Line ${errorMessage.line})` : ''}`
        : JSON.stringify(errorMessage);
    }
    throw new Error(errorMessage);
  }

  return data;
}

export default analyzeCode;
