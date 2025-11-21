import React from 'react';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/lib/utils';
import Button from '@/components/ui/Button';
import type { Domain } from '@/types';

interface DomainCardProps {
  domain: Domain;
  featured?: boolean;
  className?: string;
}

const DomainCard: React.FC<DomainCardProps> = ({
  domain,
  featured = false,
  className,
}) => {
  // Card is not clickable - only the button navigates
  return (
    <div
      className={cn(
        'group relative bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-gray-200/50 p-6',
        'transition-all duration-300 hover:shadow-xl hover:shadow-slate-500/10 hover:border-slate-300 hover:scale-[1.02]',
        featured && 'ring-2 ring-slate-500/50 ring-offset-2 bg-gradient-to-br from-white to-slate-50/30',
        className
      )}
    >
      {featured && (
        <div className="absolute -top-2 -right-2 bg-slate-700 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
          ⭐ Featured
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 w-14 h-14 bg-slate-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
          {domain.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-slate-700 transition-colors">
            {domain.name}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed mb-3">{domain.description}</p>
          
          {/* Battle and model count */}
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 bg-gray-50/50 rounded-lg px-3 py-1.5 inline-flex">
            <span className="font-semibold text-slate-700">{formatNumber(domain.battleCount)}</span>
            <span>battles</span>
            <span>•</span>
            <span className="font-semibold text-slate-700">{domain.modelCount || 0}</span>
            <span>models</span>
          </div>

          {/* Confidence score (if available) */}
          {domain.confidenceScore && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Confidence</span>
                <span>{domain.confidenceScore}%</span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-600 rounded-full transition-all"
                  style={{ width: `${domain.confidenceScore}%` }}
                />
              </div>
            </div>
          )}

          {/* Explore Rankings Button */}
          <div className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                window.location.href = `/rankings/${domain.slug}`;
              }}
              className="w-full rounded-xl font-semibold hover:bg-slate-50 hover:border-slate-400"
            >
              Explore Rankings →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DomainCard;

