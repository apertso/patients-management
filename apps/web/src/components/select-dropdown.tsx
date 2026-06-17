'use client';

import { useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/ui';

type SelectDropdownOption<TValue extends string> = {
  label: string;
  value: TValue;
};

type SelectDropdownProps<TValue extends string> = {
  id: string;
  value: TValue;
  options: SelectDropdownOption<TValue>[];
  onChange: (value: TValue) => void;
};

export function SelectDropdown<TValue extends string>({
  id,
  value,
  options,
  onChange,
}: SelectDropdownProps<TValue>) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        id={id}
        className="flex w-full items-center justify-between gap-3 rounded-md border border-border bg-card px-3 py-2 text-left text-sm text-foreground outline-none transition hover:bg-muted/40 focus:border-primary focus:ring-2 focus:ring-ring/30"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className="truncate">{selectedOption?.label ?? value}</span>
        <svg
          className={cn(
            'h-4 w-4 flex-shrink-0 text-muted-foreground transition',
            isOpen && 'rotate-180',
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen ? (
        <div className="absolute left-0 top-full z-30 mt-2 w-full overflow-hidden rounded-xl border border-border bg-card py-1 text-sm text-foreground shadow-md">
          <div role="listbox" aria-labelledby={id}>
            {options.map((option) => {
              const isSelected = option.value === value;

              return (
                <button
                  key={option.value}
                  className={cn(
                    'flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-muted-foreground transition hover:bg-muted hover:text-foreground focus:bg-muted focus:text-foreground focus:outline-none',
                    isSelected && 'bg-muted/60 font-medium text-foreground',
                  )}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected ? (
                    <svg
                      className="h-4 w-4 flex-shrink-0 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
