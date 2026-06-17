'use client';

import { useEffect, useId, useState } from 'react';

import { SelectDropdown } from '@/components/select-dropdown';

import type { PatientsQuery, PatientSortBy, SortOrder } from './patients.types';

const SORT_BY_OPTIONS: Array<{ label: string; value: PatientSortBy }> = [
  { label: 'Newest', value: 'createdAt' },
  { label: 'Last name', value: 'lastName' },
  { label: 'Date of birth', value: 'dob' },
];
const SORT_ORDER_OPTIONS: Array<{ label: string; value: SortOrder }> = [
  { label: 'Descending', value: 'desc' },
  { label: 'Ascending', value: 'asc' },
];
const LIMIT_OPTIONS = [
  { label: '5', value: '5' },
  { label: '10', value: '10' },
  { label: '20', value: '20' },
  { label: '50', value: '50' },
];

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
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              id={searchId}
              className="w-full rounded-md border border-border bg-transparent py-2 pl-9 pr-10 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/30"
              type="search"
              placeholder="Search by name, email, or phone"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
            />
            {hasSearch ? (
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground focus:outline-none"
                type="button"
                onClick={clearSearch}
                aria-label="Clear search"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            ) : null}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground" htmlFor={sortById}>
            Sort by
          </label>
          <SelectDropdown
            id={sortById}
            value={query.sortBy}
            options={SORT_BY_OPTIONS}
            onChange={onSortChange}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground" htmlFor={sortOrderId}>
            Sort order
          </label>
          <SelectDropdown
            id={sortOrderId}
            value={query.sortOrder}
            options={SORT_ORDER_OPTIONS}
            onChange={onSortOrderChange}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground" htmlFor={limitId}>
            Page size
          </label>
          <SelectDropdown
            id={limitId}
            value={String(query.limit)}
            options={LIMIT_OPTIONS}
            onChange={(limit) => onLimitChange(Number(limit))}
          />
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
