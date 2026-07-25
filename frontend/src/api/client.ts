const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '')
  || 'http://localhost:5091';

export const AUTH_EXPIRED_EVENT = 'taskmanager:auth-expired';

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  auth?: boolean;
};

function getToken(): string | null {
  return localStorage.getItem('authToken');
}

/** Returns true when JWT `exp` is missing or still in the future. */
export function isTokenValid(token: string | null | undefined): boolean {
  if (!token) return false;
  try {
    const payload = token.split('.')[1];
    if (!payload) return false;
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))) as {
      exp?: number;
    };
    if (typeof json.exp !== 'number') return true;
    return json.exp * 1000 > Date.now() + 5_000;
  } catch {
    return false;
  }
}

function clearAuthStorage() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('taskManagerUser');
}

function notifyAuthExpired() {
  clearAuthStorage();
  window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, auth = false, headers, ...rest } = options;
  const requestHeaders = new Headers(headers);

  if (!requestHeaders.has('Content-Type') && body !== undefined) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  if (auth) {
    const token = getToken();
    if (!isTokenValid(token)) {
      notifyAuthExpired();
      throw new ApiError(401, 'Session expired. Please sign in again.');
    }
    requestHeaders.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: requestHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    if (response.status === 401 && auth) {
      notifyAuthExpired();
    }
    let errorBody: unknown = undefined;
    const text = await response.text();
    try {
      errorBody = text ? JSON.parse(text) : undefined;
    } catch {
      errorBody = text;
    }
    const message =
      typeof errorBody === 'object' && errorBody && 'error' in errorBody
        ? String((errorBody as { error: unknown }).error)
        : typeof errorBody === 'object' && errorBody && 'Error' in errorBody
          ? String((errorBody as { Error: unknown }).Error)
          : text || response.statusText;
    throw new ApiError(response.status, message || (response.status === 401 ? 'Session expired. Please sign in again.' : response.statusText), errorBody);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return (await response.json()) as T;
  }

  return (await response.text()) as T;
}

export { API_BASE_URL, getToken };
