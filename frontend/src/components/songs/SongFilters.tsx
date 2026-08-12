'use client';

import React, { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { cn, debounce } from '@/lib/utils';
import type { SongFilters as SongFiltersType } from '@/hooks/useSongs';

export interface SongFiltersProps {
  filters: SongFiltersType;
  onChange: (filters: SongFiltersType) => void;
}

const STATUS_OPTIONS = [
  { value: 'practiced', label: 'Practiced' },
  { value: 'recorded', label: 'Recorded' },
  { value: 'posted', label: 'Posted' },
  { value: 'need_improvement', label: 'Needs Work' },
  { value: 'favourite', label: 'Favourite' },
];

const DIFFICULTY_OPTIONS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const SORT_OPTIONS = [
  { value: 'created_at', label: 'Recently Added' },
  { value: 'title', label: 'Title (A-Z)' },
  { value: 'practice_count', label: 'Most Practiced' },
];

export default function SongFilters({ filters, onChange }: SongFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const debouncedSearch = React.useMemo(
    () =>
      debounce((value: string) => {
        onChange({ ...filters, search: value || undefined, page: 1 });
      }, 400),
    [filters, onChange]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
    debouncedSearch(e.target.value);
  };

  const toggleStatus = (status: string) => {
    onChange({ ...filters, status: filters.status === status ? undefined : status, page: 1 });
  };

  const toggleDifficulty = (difficulty: string) => {
    onChange({
      ...filters,
      difficulty: filters.difficulty === difficulty ? undefined : difficulty,
      page: 1,
    });
  };

  const clearAll = () => {
    setSearchInput('');
    onChange({ page: 1, limit: filters.limit });
  };

  const activeFilterCount = [filters.status, filters.mood, filters.language, filters.difficulty].filter(
    Boolean
  ).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Input
          placeholder="Search songs by title..."
          value={searchInput}
          onChange={handleSearchChange}
          leftIcon={<Search className="h-4 w-4" />}
          className="flex-1"
        />
        <button
          onClick={() => setShowAdvanced((prev) => !prev)}
          className={cn(
            'flex h-11 items-center gap-2 rounded-2xl border px-4 text-sm font-medium transition-colors',
            showAdvanced || activeFilterCount > 0
              ? 'border-gold-400 bg-gold-50 text-gold-600'
              : 'border-beige-200 text-walnut-400 hover:bg-beige-100'
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-gold-500 text-[10px] text-cream-50">
              {activeFilterCount}
            </span>
          )}
        </button>

        <select
          value={filters.sortBy || 'created_at'}
          onChange={(e) => onChange({ ...filters, sortBy: e.target.value, page: 1 })}
          className="h-11 rounded-2xl border border-beige-200 bg-cream-50 px-3 text-sm text-walnut-500 focus:border-gold-400 focus:outline-none"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {showAdvanced && (
        <div className="rounded-2xl border border-beige-200 bg-beige-50 p-4 space-y-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-walnut-300">
              Status
            </p>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button key={opt.value} onClick={() => toggleStatus(opt.value)}>
                  <Badge
                    variant={filters.status === opt.value ? 'gold' : 'outline'}
                    className="cursor-pointer"
                  >
                    {opt.label}
                  </Badge>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-walnut-300">
              Difficulty
            </p>
            <div className="flex flex-wrap gap-2">
              {DIFFICULTY_OPTIONS.map((opt) => (
                <button key={opt.value} onClick={() => toggleDifficulty(opt.value)}>
                  <Badge
                    variant={filters.difficulty === opt.value ? 'gold' : 'outline'}
                    className="cursor-pointer"
                  >
                    {opt.label}
                  </Badge>
                </button>
              ))}
            </div>
          </div>

          {activeFilterCount > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1 text-xs font-medium text-walnut-400 hover:text-red-500"
            >
              <X className="h-3.5 w-3.5" />
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
