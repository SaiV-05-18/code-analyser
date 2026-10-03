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

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(
      `Server returned HTTP ${response.status} (${response.statusText || 'Unable to parse server response'}). Ensure backend is running at http://127.0.0.1:8000.`
    );
  }

  if (!response.ok) {
    let errorMessage = data?.detail || 'Analysis request failed.';
    if (Array.isArray(errorMessage)) {
      errorMessage = errorMessage.map((e) => e.msg || e.message || JSON.stringify(e)).join('; ');
    } else if (typeof errorMessage === 'object' && errorMessage !== null) {
      errorMessage = errorMessage.message
        ? `${errorMessage.message}${errorMessage.line ? ` (Line ${errorMessage.line})` : ''}`
        : JSON.stringify(errorMessage);
    }
    throw new Error(errorMessage);
  }

  return data;
}

export default analyzeCode;
