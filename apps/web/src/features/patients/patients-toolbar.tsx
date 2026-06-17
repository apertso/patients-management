'use client';

import { useEffect, useId, useState } from 'react';

import type { PatientsQuery, PatientSortBy, SortOrder } from './patients.types';

const LIMIT_OPTIONS = [5, 10, 20, 50];

function isPatientSortBy(value: string): value is PatientSortBy {
  return value === 'lastName' || value === 'dob' || value === 'createdAt';
}

function isSortOrder(value: string): value is SortOrder {
  return value === 'asc' || value === 'desc';
}

type PatientsToolbarProps = {
  query: PatientsQuery;
  isFetching: boolean;
  onSearchChange: (search: string) => void;
  onSortChange: (sortBy: PatientSortBy) => void;
  onSortOrderChange: (sortOrder: SortOrder) => void;
  onLimitChange: (limit: number) => void;
};

export function PatientsToolbar({
  query,
  isFetching,
  onSearchChange,
  onSortChange,
  onSortOrderChange,
  onLimitChange,
}: PatientsToolbarProps) {
  const searchId = useId();
  const sortById = useId();
  const sortOrderId = useId();
  const limitId = useId();
  const [searchValue, setSearchValue] = useState(query.search);
  const [lastQuerySearch, setLastQuerySearch] = useState(query.search);

  if (query.search !== lastQuerySearch) {
    setLastQuerySearch(query.search);
    setSearchValue(query.search);
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (searchValue !== query.search) {
        onSearchChange(searchValue);
      }
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [onSearchChange, query.search, searchValue]);

  const hasSearch = searchValue.trim().length > 0;

  function clearSearch() {
    setSearchValue('');

    if (query.search) {
      onSearchChange('');
    }
  }

  return (
    <section className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_180px_160px_120px] lg:items-end">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground" htmlFor={searchId}>
            Search
          </label>
          <div className="relative">
            <input
              id={searchId}
              className="w-full rounded-md border border-border bg-card px-3 py-2 pr-20 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/30"
              type="search"
              placeholder="Search by name, email, or phone"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
            />
            {hasSearch ? (
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                type="button"
                onClick={clearSearch}
              >
                Clear
              </button>
            ) : null}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground" htmlFor={sortById}>
            Sort by
          </label>
          <select
            id={sortById}
            className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
            value={query.sortBy}
            onChange={(event) => {
              if (isPatientSortBy(event.target.value)) {
                onSortChange(event.target.value);
              }
            }}
          >
            <option value="createdAt">Newest</option>
            <option value="lastName">Last name</option>
            <option value="dob">Date of birth</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground" htmlFor={sortOrderId}>
            Sort order
          </label>
          <select
            id={sortOrderId}
            className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
            value={query.sortOrder}
            onChange={(event) => {
              if (isSortOrder(event.target.value)) {
                onSortOrderChange(event.target.value);
              }
            }}
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground" htmlFor={limitId}>
            Page size
          </label>
          <select
            id={limitId}
            className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
            value={query.limit}
            onChange={(event) => onLimitChange(Number(event.target.value))}
          >
            {LIMIT_OPTIONS.map((limit) => (
              <option key={limit} value={limit}>
                {limit}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isFetching ? (
        <p className="mt-3 text-sm text-muted-foreground" aria-live="polite">
          Updating results...
        </p>
      ) : null}
    </section>
  );
}
