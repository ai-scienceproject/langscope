import React from 'react';
import { cn, formatNumber } from '@/lib/utils';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import type { ModelRanking } from '@/types';

interface RankingsTableProps {
  rankings: ModelRanking[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (column: string) => void;
  onModelClick?: (modelId: string) => void;
  onModelDetails?: (modelId: string) => void;
  compareMode?: boolean;
  selectedModels?: string[];
  onCompareSelect?: (modelId: string) => void;
  className?: string;
}

const RankingsTable: React.FC<RankingsTableProps> = ({
  rankings,
  sortBy,
  sortOrder,
  onSort,
  onModelClick,
  onModelDetails,
  compareMode = false,
  selectedModels = [],
  onCompareSelect,
  className,
}) => {
  const handleSort = (column: string) => {
    onSort?.(column);
  };

  const getRankChange = (rank: number, previousRank: number) => {
    const change = previousRank - rank;
    if (change === 0) return null;
    return change;
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortBy !== column) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
          />
        </svg>
      );
    }

    return sortOrder === 'asc' ? (
      <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  return (
    <div className={cn('bg-white rounded-lg border border-gray-200 overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {compareMode && (
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    className="rounded text-primary-600 focus:ring-primary-500"
                    onChange={(e) => {
                      if (e.target.checked) {
                        rankings.forEach((r) => onCompareSelect?.(r.model.id));
                      } else {
                        rankings.forEach((r) => onCompareSelect?.(r.model.id));
                      }
                    }}
                  />
                </th>
              )}
              
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort('rank')}
                  className="flex items-center gap-2 text-xs font-semibold text-gray-700 uppercase tracking-wider hover:text-primary-600"
                >
                  Rank
                  <SortIcon column="rank" />
                </button>
              </th>

              <th className="px-6 py-3 text-left">
                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Model
                </span>
              </th>

              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort('score')}
                  className="flex items-center gap-2 text-xs font-semibold text-gray-700 uppercase tracking-wider hover:text-primary-600"
                >
                  Score
                  <SortIcon column="score" />
                </button>
              </th>

              <th className="px-6 py-3 text-left">
                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Uncertainty
                </span>
              </th>

              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort('battles')}
                  className="flex items-center gap-2 text-xs font-semibold text-gray-700 uppercase tracking-wider hover:text-primary-600"
                >
                  Battles
                  <SortIcon column="battles" />
                </button>
              </th>

              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => handleSort('cost')}
                  className="flex items-center gap-2 text-xs font-semibold text-gray-700 uppercase tracking-wider hover:text-primary-600"
                >
                  Cost
                  <SortIcon column="cost" />
                </button>
              </th>

              <th className="px-6 py-3 text-right">
                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </span>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {rankings.map((ranking) => {
              const rankChange = getRankChange(ranking.rank, ranking.previousRank);
              const isSelected = selectedModels.includes(ranking.model.id);

              return (
                <tr
                  key={ranking.model.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {compareMode && (
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onCompareSelect?.(ranking.model.id)}
                        className="rounded text-primary-600 focus:ring-primary-500"
                      />
                    </td>
                  )}

                  {/* Rank */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-gray-900">
                        #{ranking.rank}
                      </span>
                      {rankChange !== null && (
                        <Badge
                          label={`${rankChange > 0 ? '↑' : '↓'} ${Math.abs(rankChange)}`}
                          variant={rankChange > 0 ? 'success' : 'error'}
                          size="sm"
                        />
                      )}
                    </div>
                  </td>

                  {/* Model */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {/* Organization Logo */}
                      <Avatar
                        src={ranking.model.logo}
                        alt={ranking.model.provider}
                        size="md"
                        shape="square"
                        fallback={ranking.model.provider.charAt(0)}
                      />
                      <div className="flex-1 min-w-0">
                        <button
                          onClick={() => onModelClick?.(ranking.model.id)}
                          className="font-medium text-gray-900 hover:text-primary-600 truncate block"
                        >
                          {ranking.model.name}
                        </button>
                        <p className="text-sm text-gray-500 truncate">{ranking.model.provider}</p>
                      </div>
                    </div>
                  </td>

                  {/* Score */}
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-lg font-semibold text-gray-900">
                        {ranking.score.toFixed(0)}
                      </p>
                      <div className="mt-1 w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-600 rounded-full"
                          style={{ width: `${(ranking.score / 2000) * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Uncertainty */}
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">±{ranking.uncertainty.toFixed(0)}</span>
                  </td>

                  {/* Battles */}
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">{formatNumber(ranking.battleCount)}</span>
                  </td>

                  {/* Cost */}
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">
                      ${ranking.model.costPer1MTokens.toFixed(2)}
                    </span>
                    <p className="text-xs text-gray-500">per 1M tokens</p>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onModelDetails?.(ranking.model.id) || onModelClick?.(ranking.model.id)}
                      >
                        Details
                      </Button>
                      <Button variant="outline" size="sm">
                        Test
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RankingsTable;

