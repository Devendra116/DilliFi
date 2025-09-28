export class ApiError extends Error {
  status: number;
  data: any;
  constructor(message: string, status: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

// Always use same-origin '/api' so Next.js route handlers proxy cross-origin
// requests on the server side. This eliminates browser CORS entirely.
export const API_BASE = "/api";

type FetchOptions = RequestInit & { json?: any };

export async function apiFetch<T = any>(path: string, opts: FetchOptions = {}) {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    ...(opts.headers as Record<string, string> | undefined),
  };
  // Normalize incoming path: allow '/api/strategies' or 'strategies'
  const trimmed = (path || '').trim();
  const withoutApi = trimmed.replace(/^\/?api\//, '');
  const normalized = withoutApi.replace(/^\/+/, '');
  const url = `${API_BASE}/${normalized}`;
  const init: RequestInit = {
    ...opts,
    headers,
    body: opts.json !== undefined ? JSON.stringify(opts.json) : opts.body,
  };
  const res = await fetch(url, init);
  const text = await res.text();
  let data: any;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const message = (data && (data.message || data.error)) || `API ${res.status}`;
    throw new ApiError(message, res.status, data);
  }
  return data as T;
}
