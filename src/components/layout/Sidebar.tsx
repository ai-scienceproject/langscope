'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import type { FilterState, ModelStanding } from '@/types';

interface SidebarProps {
  type: 'filter' | 'leaderboard' | 'domains';
  filters?: FilterState;
  onFilterChange?: (filters: FilterState) => void;
  standings?: ModelStanding[];
  domains?: Array<{ id: string; name: string; slug: string; battleCount?: number; modelCount?: number }>;
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  type,
  filters,
  onFilterChange,
  standings,
  domains,
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

  if (type === 'domains' && domains) {
    return (
      <DomainsSidebar
        domains={domains}
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

// Domains Sidebar Component (styled like "What's trending")
const DomainsSidebar: React.FC<{
  domains: Array<{ id: string; name: string; slug: string; icon?: string; battleCount?: number; modelCount?: number }>;
  collapsed: boolean;
  onToggleCollapse: () => void;
  className?: string;
}> = ({ domains, collapsed, onToggleCollapse, className }) => {
  const formatNumber = (num: number = 0) => {
    // Format with commas for thousands
    return num.toLocaleString('en-US');
  };

  // Icon mapping for domains (fallback if icon not provided)
  const getDomainIcon = (domain: { name: string; slug: string; icon?: string }) => {
    if (domain.icon) {
      return domain.icon;
    }
    
    // Fallback icon mapping based on domain name/slug
    const iconMap: Record<string, string> = {
      'code-generation': '💻',
      'mathematical-reasoning': '🔢',
      'creative-writing': '✍️',
      'data-analysis': '📊',
      'language-translation': '🌍',
      'question-answering': '❓',
      'medical-assistance': '🏥',
      'legal-analysis': '⚖️',
      'finance': '💰',
      'education': '📚',
      'customer-support': '💬',
      'content-moderation': '🛡️',
    };
    
    return iconMap[domain.slug] || '📄';
  };


  return (
    <aside
      className={cn(
        'bg-white border-l border-gray-200 transition-all duration-300 sticky top-0 h-fit',
        collapsed ? 'w-0' : 'w-80',
        className
      )}
    >
      {!collapsed && (
        <div className="px-4 sm:px-6 pt-0 pb-4 sm:pb-6">
          <h3 className="text-base sm:text-lg font-bold text-black mb-2 sm:mb-3 pt-0">Domain Showcase</h3>
          <div className="space-y-1 sm:space-y-1.5">
            {domains.slice(0, 10).map((domain) => (
              <div
                key={domain.id}
                className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-gradient-to-r from-white to-light-gray/30 border border-gray-100 hover:border-dark-gray/20 hover:shadow-md hover:shadow-dark-gray/10 transition-all duration-300 cursor-pointer group hover:scale-[1.02] hover:bg-gradient-to-r hover:from-light-gray/50 hover:to-light-gray"
                onClick={() => {
                  window.location.href = `/rankings/${domain.slug}`;
                }}
              >
                <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-dark-gray/10 to-dark-gray/5 flex items-center justify-center text-base sm:text-lg group-hover:scale-110 transition-transform duration-300">
                    <span aria-hidden="true">
                      {getDomainIcon(domain)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-base font-bold text-black truncate group-hover:text-dark-gray transition-colors">
                      {domain.name}
                    </p>
                    <p className="text-xs sm:text-sm text-dark-gray mt-0.5">
                      {formatNumber(domain.battleCount || 0)} battles — {formatNumber(domain.modelCount || 0)} models ranked
                    </p>
                  </div>
                </div>
                
                {/* Arrow indicator */}
                <svg 
                  className="w-4 h-4 sm:w-5 sm:h-5 text-dark-gray/40 group-hover:text-dark-gray group-hover:translate-x-0.5 transition-all duration-300 flex-shrink-0" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            ))}
          </div>
          <button
            onClick={() => {
              window.location.href = '/rankings';
            }}
            className="w-full mt-4 sm:mt-6 px-4 py-2.5 text-sm font-semibold text-white bg-black hover:bg-dark-gray rounded-lg transition-all duration-300 hover:shadow-md hover:scale-[1.02]"
          >
            View All Domains →
          </button>
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

