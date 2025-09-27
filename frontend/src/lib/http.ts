export class ApiError extends Error {
  status: number;
  data: any;
  constructor(message: string, status: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export const API_BASE =
  (process.env.NEXT_PUBLIC_API_BASE_URL || "https://ethglobal-delhi.onrender.com").replace(/\/$/, "");

type FetchOptions = RequestInit & { json?: any };

export async function apiFetch<T = any>(path: string, opts: FetchOptions = {}) {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    ...(opts.headers as Record<string, string> | undefined),
  };
  const url = `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
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

