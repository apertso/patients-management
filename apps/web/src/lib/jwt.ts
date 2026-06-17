type JwtPayload = {
  exp?: number;
  sub?: string;
  email?: string;
  role?: string;
};

const EXPIRY_BUFFER_MS = 5_000;

function isJwtPayload(value: unknown): value is JwtPayload {
  return typeof value === 'object' && value !== null;
}

function decodeBase64Url(value: string): string {
  const normalizedValue = value.replace(/-/g, '+').replace(/_/g, '/');
  const paddingLength = (4 - (normalizedValue.length % 4)) % 4;
  const paddedValue = `${normalizedValue}${'='.repeat(paddingLength)}`;

  return window.atob(paddedValue);
}

export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const [, payload] = token.split('.');

    if (!payload) {
      return null;
    }

    const decodedPayload = decodeBase64Url(payload);
    const parsedPayload: unknown = JSON.parse(decodedPayload);

    return isJwtPayload(parsedPayload) ? parsedPayload : null;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);

  if (!payload || typeof payload.exp !== 'number') {
    return true;
  }

  return payload.exp * 1000 <= Date.now() + EXPIRY_BUFFER_MS;
}
