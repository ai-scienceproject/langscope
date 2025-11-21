'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import type { FilterState, ModelStanding } from '@/types';

interface SidebarProps {
  type: 'filter' | 'leaderboard';
  filters?: FilterState;
  onFilterChange?: (filters: FilterState) => void;
  standings?: ModelStanding[];
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  type,
  filters,
  onFilterChange,
  standings,
  className,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  if (type === 'filter' && filters && onFilterChange) {
    return (
      <FilterSidebar
        filters={filters}
        onFilterChange={onFilterChange}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        className={className}
      />
    );
  }

  if (type === 'leaderboard' && standings) {
    return (
      <LeaderboardSidebar
        standings={standings}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        className={className}
      />
    );
  }

  return null;
};

// Filter Sidebar Component
const FilterSidebar: React.FC<{
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  className?: string;
}> = ({ filters, onFilterChange, collapsed, onToggleCollapse, className }) => {
  const handleReset = () => {
    onFilterChange({
      costRange: [0, 100],
      modelTypes: [],
      providers: [],
      contextLength: [0, 200000],
      verified: null,
      costFilter: [],
      contextFilter: [],
      sortBy: 'elo',
    } as any);
  };

  return (
    <aside
      className={cn(
        'bg-white border-l border-gray-200 transition-all duration-300',
        collapsed ? 'w-0' : 'w-80',
        className
      )}
    >
      {!collapsed && (
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            <button
              onClick={handleReset}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              Reset
            </button>
          </div>

          {/* Cost Filter - Buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cost</label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'free', label: 'Free' },
                { id: 'low', label: 'Low' },
                { id: 'medium', label: 'Medium' },
                { id: 'high', label: 'High' },
              ].map((option) => {
                const current = (filters as any).costFilter || [];
                const isSelected = current.includes(option.id);
                return (
                  <button
                    key={option.id}
                    onClick={() => {
                      const newFilter = isSelected
                        ? current.filter((f: string) => f !== option.id)
                        : [...current, option.id];
                      onFilterChange({ ...filters, costFilter: newFilter } as any);
                    }}
                    className={cn(
                      'px-3 py-1.5 text-sm rounded-lg border transition-colors',
                      isSelected
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-primary-300'
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Type Filter - Buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'open-source', label: 'Open-source' },
                { id: 'proprietary', label: 'Proprietary' },
              ].map((option) => {
                const isSelected = filters.modelTypes.includes(option.id);
                return (
                  <button
                    key={option.id}
                    onClick={() => {
                      const newTypes = isSelected
                        ? filters.modelTypes.filter((t) => t !== option.id)
                        : [...filters.modelTypes, option.id];
                      onFilterChange({ ...filters, modelTypes: newTypes });
                    }}
                    className={cn(
                      'px-3 py-1.5 text-sm rounded-lg border transition-colors',
                      isSelected
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-primary-300'
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Context Filter - Buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Context</label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: '<8k', label: '<8K' },
                { id: '8k-32k', label: '8K-32K' },
                { id: '32k+', label: '32K+' },
              ].map((option) => {
                const current = (filters as any).contextFilter || [];
                const isSelected = current.includes(option.id);
                return (
                  <button
                    key={option.id}
                    onClick={() => {
                      const newFilter = isSelected
                        ? current.filter((f: string) => f !== option.id)
                        : [...current, option.id];
                      onFilterChange({ ...filters, contextFilter: newFilter } as any);
                    }}
                    className={cn(
                      'px-3 py-1.5 text-sm rounded-lg border transition-colors',
                      isSelected
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-primary-300'
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sort By - Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
            <select
              value={(filters as any).sortBy || 'elo'}
              onChange={(e) =>
                onFilterChange({ ...filters, sortBy: e.target.value as any } as any)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="elo">Elo</option>
              <option value="cost-effectiveness">Cost-Effectiveness</option>
              <option value="speed">Speed</option>
            </select>
          </div>

          {/* Verified Only */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.verified === true}
                onChange={(e) =>
                  onFilterChange({ ...filters, verified: e.target.checked ? true : null })
                }
                className="rounded text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-gray-700">Verified models only</span>
            </label>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={onToggleCollapse}
        className="absolute top-4 -left-4 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50"
      >
        <svg
          className={cn('w-4 h-4 text-gray-600 transition-transform', collapsed && 'rotate-180')}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    </aside>
  );
};

// Leaderboard Sidebar Component
const LeaderboardSidebar: React.FC<{
  standings: ModelStanding[];
  collapsed: boolean;
  onToggleCollapse: () => void;
  className?: string;
}> = ({ standings, collapsed, onToggleCollapse, className }) => {
  return (
    <aside
      className={cn(
        'bg-white border-l border-gray-200 transition-all duration-300 sticky top-20',
        collapsed ? 'w-0' : 'w-80',
        className
      )}
    >
      {!collapsed && (
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Standings</h3>
          <div className="space-y-3">
            {standings.map((standing) => (
              <div
                key={standing.modelId}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-semibold text-sm">
                  #{standing.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {standing.model.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {standing.battles} battles • {standing.score.toFixed(0)} pts
                  </p>
                </div>
                {standing.change !== 0 && (
                  <div
                    className={cn(
                      'flex-shrink-0 text-xs font-medium',
                      standing.change > 0 ? 'text-green-600' : 'text-red-600'
                    )}
                  >
                    {standing.change > 0 ? '↑' : '↓'} {Math.abs(standing.change)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={onToggleCollapse}
        className="absolute top-4 -left-4 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50"
      >
        <svg
          className={cn('w-4 h-4 text-gray-600 transition-transform', collapsed && 'rotate-180')}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    </aside>
  );
};

export default Sidebar;

