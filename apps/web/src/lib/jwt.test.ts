import { describe, expect, it } from 'vitest';

import { isTokenExpired } from './jwt';

function createToken(payload: Record<string, unknown>): string {
  const encodedPayload = window
    .btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return `header.${encodedPayload}.signature`;
}

describe('isTokenExpired', () => {
  it('treats invalid tokens as expired', () => {
    expect(isTokenExpired('not-a-token')).toBe(true);
  });

  it('treats tokens without exp as expired', () => {
    expect(isTokenExpired(createToken({ sub: 'user-id' }))).toBe(true);
  });

  it('returns false for a future exp', () => {
    const futureExp = Math.floor(Date.now() / 1000) + 60;

    expect(isTokenExpired(createToken({ exp: futureExp }))).toBe(false);
  });

  it('returns true for a past exp', () => {
    const pastExp = Math.floor(Date.now() / 1000) - 60;

    expect(isTokenExpired(createToken({ exp: pastExp }))).toBe(true);
  });
});
