import React from 'react';
import { Search, Calendar, Clock, Filter } from 'lucide-react';
import { Button } from './Button';

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  category?: string;
  onCategoryChange?: (val: string) => void;
  categories?: string[];
  date?: string;
  onDateChange?: (val: string) => void;
  month?: string;
  onMonthChange?: (val: string) => void;
  time?: string;
  onTimeChange?: (val: string) => void;
  onApplyFilters?: () => void;
  onClearFilters?: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchTerm,
  onSearchChange,
  category,
  onCategoryChange,
  categories = [],
  date,
  onDateChange,
  month,
  onMonthChange,
  time,
  onTimeChange,
  onApplyFilters,
  onClearFilters
}) => {
  return (
    <div className="p-2">
      <div className="flex flex-col md:flex-row gap-2 items-end">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-1 text-sm bg-white/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-accent transition-all"
          />
        </div>

        {/* Category Select (optional) */}
        {categories.length > 0 && onCategoryChange && (
          <select
            value={category || ''}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="px-3 py-1 text-sm bg-white/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-accent transition-all"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        )}
        {onDateChange && (
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-600 mb-0.5">Date</label>
            <div className="relative">
              <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="date"
                value={date || ''}
                onChange={(e) => onDateChange(e.target.value)}
                className="w-full pl-8 pr-3 py-1 text-sm bg-white/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-accent"
              />
            </div>
          </div>
        )}

        {onMonthChange && (
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-600 mb-0.5">Month</label>
            <input
              type="month"
              value={month || ''}
              onChange={(e) => onMonthChange(e.target.value)}
              className="w-full px-3 py-1 text-sm bg-white/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-accent"
            />
          </div>
        )}

        {onTimeChange && (
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-600 mb-0.5">Time</label>
            <div className="relative">
              <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="time"
                value={time || ''}
                onChange={(e) => onTimeChange(e.target.value)}
                className="w-full pl-8 pr-3 py-1 text-sm bg-white/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-accent"
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {(onApplyFilters || onClearFilters) && (
          <div className="flex gap-2 w-full md:w-auto mt-1">
            {onApplyFilters && (
              <Button size="sm" onClick={onApplyFilters} className="flex-1 md:flex-none">
                <Filter className="w-3.5 h-3.5 mr-1.5" /> Apply
              </Button>
            )}
            {onClearFilters && (
              <Button size="sm" variant="outline" onClick={onClearFilters} className="flex-1 md:flex-none">
                Clear
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
