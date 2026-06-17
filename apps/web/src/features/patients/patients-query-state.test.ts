import { describe, expect, it } from 'vitest';

import {
  DEFAULT_PATIENTS_QUERY,
  createPatientsQueryString,
  parsePatientsQuery,
} from './patients-query-state';

describe('patients query state', () => {
  it('returns defaults for empty search params', () => {
    expect(parsePatientsQuery(new URLSearchParams())).toEqual(DEFAULT_PATIENTS_QUERY);
  });

  it('falls back for invalid page values', () => {
    expect(parsePatientsQuery(new URLSearchParams('page=0')).page).toBe(
      DEFAULT_PATIENTS_QUERY.page,
    );
    expect(parsePatientsQuery(new URLSearchParams('page=abc')).page).toBe(
      DEFAULT_PATIENTS_QUERY.page,
    );
  });

  it('falls back for invalid limit values', () => {
    expect(parsePatientsQuery(new URLSearchParams('limit=100')).limit).toBe(
      DEFAULT_PATIENTS_QUERY.limit,
    );
    expect(parsePatientsQuery(new URLSearchParams('limit=-1')).limit).toBe(
      DEFAULT_PATIENTS_QUERY.limit,
    );
  });

  it('falls back for invalid sort values', () => {
    const query = parsePatientsQuery(new URLSearchParams('sortBy=email&sortOrder=random'));

    expect(query.sortBy).toBe(DEFAULT_PATIENTS_QUERY.sortBy);
    expect(query.sortOrder).toBe(DEFAULT_PATIENTS_QUERY.sortOrder);
  });

  it('parses and serializes valid query values', () => {
    const query = parsePatientsQuery(
      new URLSearchParams('page=2&limit=20&search=smith&sortBy=lastName&sortOrder=asc'),
    );

    expect(query).toEqual({
      page: 2,
      limit: 20,
      search: 'smith',
      sortBy: 'lastName',
      sortOrder: 'asc',
    });
    expect(createPatientsQueryString(query)).toBe(
      'page=2&limit=20&search=smith&sortBy=lastName&sortOrder=asc',
    );
  });
});
