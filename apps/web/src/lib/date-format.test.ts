import { describe, expect, it } from 'vitest';

import { formatDate } from './date-format';

describe('formatDate', () => {
  it('formats valid dates', () => {
    expect(formatDate('2026-06-17T00:00:00.000Z')).toBe('Jun 17, 2026');
  });

  it('returns a fallback for invalid dates', () => {
    expect(formatDate('not-a-date')).toBe('—');
  });
});
