import {
  ComplexityAnalysisResult,
  ExampleAlgorithm,
  CompareResponse,
  AlgorithmSnippet,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export class ApiError extends Error {
  statusCode?: number;
  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

export async function checkHealth(): Promise<{ status: string; version: string; service: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) {
      throw new ApiError(`Health check failed with status: ${res.status}`, res.status);
    }
    return await res.json();
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError('Backend server is currently offline or unreachable at http://localhost:8000.');
  }
}

export async function getExamples(): Promise<ExampleAlgorithm[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/examples`);
    if (!res.ok) {
      throw new ApiError(`Failed to fetch algorithm examples: ${res.statusText}`, res.status);
    }
    return await res.json();
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError('Unable to connect to backend service. Please ensure the Python server is running.');
  }
}

export async function analyzeCode(
  code: string,
  functionName?: string,
  language?: string
): Promise<ComplexityAnalysisResult> {
  try {
    const res = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        function_name: functionName || undefined,
        language: language || 'auto',
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const detail = errorData.detail || `Analysis request failed with HTTP ${res.status}`;
      throw new ApiError(detail, res.status);
    }

    return await res.json();
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError('Network error: Unable to reach FastAPI backend on port 8000.');
  }
}

export async function compareAlgorithms(
  algorithms: AlgorithmSnippet[]
): Promise<CompareResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/compare`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ algorithms }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const detail = errorData.detail || `Comparison request failed with HTTP ${res.status}`;
      throw new ApiError(detail, res.status);
    }

    return await res.json();
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError('Network error: Unable to reach comparison endpoint on backend.');
  }
}
