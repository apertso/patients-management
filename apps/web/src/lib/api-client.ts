const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api').replace(
  /\/$/,
  '',
);

export type ApiErrorBody = {
  statusCode?: number;
  message?: string;
  error?: string;
  path?: string;
  timestamp?: string;
};

export class ApiError extends Error {
  statusCode: number;
  body: ApiErrorBody | null;

  constructor(message: string, statusCode: number, body: ApiErrorBody | null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.body = body;
  }
}

type ApiRequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string | null;
  signal?: AbortSignal;
};

function parseJson(value: string): unknown | null {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function toApiErrorBody(value: unknown): ApiErrorBody | null {
  if (!isRecord(value)) {
    return null;
  }

  const body: ApiErrorBody = {};

  if (typeof value.statusCode === 'number') {
    body.statusCode = value.statusCode;
  }

  if (typeof value.message === 'string') {
    body.message = value.message;
  } else if (Array.isArray(value.message)) {
    const messages = value.message.filter((message): message is string => typeof message === 'string');

    if (messages.length > 0) {
      body.message = messages.join(' ');
    }
  }

  if (typeof value.error === 'string') {
    body.error = value.error;
  }

  if (typeof value.path === 'string') {
    body.path = value.path;
  }

  if (typeof value.timestamp === 'string') {
    body.timestamp = value.timestamp;
  }

  return Object.keys(body).length > 0 ? body : null;
}

export async function apiRequest<TResponse>(
  path: string,
  options?: ApiRequestOptions,
): Promise<TResponse> {
  const headers = new Headers();
  const hasBody = options?.body !== undefined;

  if (hasBody) {
    headers.set('Content-Type', 'application/json');
  }

  if (options?.token) {
    headers.set('Authorization', `Bearer ${options.token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options?.method ?? 'GET',
    headers,
    body: hasBody ? JSON.stringify(options.body) : undefined,
    signal: options?.signal,
  });

  const responseText = await response.text();

  if (!response.ok) {
    const errorBody = toApiErrorBody(responseText ? parseJson(responseText) : null);
    const message = errorBody?.message ?? response.statusText ?? 'Request failed.';

    throw new ApiError(message, response.status, errorBody);
  }

  if (!responseText) {
    return undefined as TResponse;
  }

  const parsedBody = parseJson(responseText);

  if (parsedBody === null && responseText.trim() !== 'null') {
    throw new ApiError('Invalid API response.', response.status, null);
  }

  return parsedBody as TResponse;
}
