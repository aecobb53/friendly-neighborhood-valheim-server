const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api';

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${path}`;

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      ...options,
    });
  } catch (networkError) {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Unable to reach the server. Check your connection.',
      },
    };
  }

  if (!response.ok) {
    let errorBody: { code?: string; message?: string; detail?: string } = {};
    try {
      errorBody = await response.json();
    } catch {
      // ignore parse failures
    }
    return {
      success: false,
      error: {
        code: errorBody.code ?? `HTTP_${response.status}`,
        message:
          errorBody.message ??
          errorBody.detail ??
          `Request failed with status ${response.status}.`,
      },
    };
  }

  if (response.status === 204) {
    return { success: true, data: undefined as unknown as T };
  }

  const json = await response.json();

  // If the backend already wraps in { success, data } pass through, otherwise wrap.
  if (typeof json === 'object' && json !== null && 'success' in json) {
    return json as ApiResponse<T>;
  }
  return { success: true, data: json as T };
}

export const api = {
  get<T>(path: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return request<T>(path, { method: 'GET', ...options });
  },
  post<T>(path: string, body: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
    return request<T>(path, {
      method: 'POST',
      body: JSON.stringify(body),
      ...options,
    });
  },
  put<T>(path: string, body: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
    return request<T>(path, {
      method: 'PUT',
      body: JSON.stringify(body),
      ...options,
    });
  },
  delete<T>(path: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return request<T>(path, { method: 'DELETE', ...options });
  },
};
