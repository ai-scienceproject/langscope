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
  // Get icon background color based on domain color or use default
  const iconBgColor = domain.color || '#475569'; // Default to slate-600
  
  // Card is not clickable - only the button navigates
  return (
    <div
      className={cn(
        'group relative bg-white rounded-lg sm:rounded-xl border border-gray-200 p-4 sm:p-5',
        'transition-all duration-300 hover:shadow-lg hover:border-dark-gray',
        'h-full flex flex-col', // Ensure all cards have same height
        featured && 'ring-1 ring-dark-gray',
        className
      )}
    >
      {featured && (
        <div className="absolute -top-2 -right-2 bg-[#E8E3FF] text-[rgb(29,61,60)] px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-semibold shadow-md shadow-purple-200/30 flex items-center gap-1">
          <span>⭐</span>
          <span className="hidden xs:inline">Featured</span>
        </div>
      )}

      <div className="flex flex-col h-full">
        {/* Icon and Title in line */}
        <div className="flex items-center gap-3 mb-2 sm:mb-3">
          <div 
            className="flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0"
          >
            {domain.icon}
          </div>
          <h3 className="text-sm sm:text-base font-bold text-black group-hover:text-dark-gray transition-colors">
            {domain.name}
          </h3>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-between">
          <p className="text-xs sm:text-sm text-dark-gray line-clamp-2 leading-relaxed mb-3 sm:mb-4">{domain.description}</p>
          
          {/* Battle and model count */}
          <div className="mb-3 sm:mb-4 text-xs text-dark-gray">
            <span className="font-semibold text-black">{formatNumber(domain.battleCount)}</span>
            <span> battles • </span>
            <span className="font-semibold text-black">{domain.modelCount || 0}</span>
            <span> models</span>
          </div>

          {/* Explore Rankings Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              window.location.href = `/rankings/${domain.slug}`;
            }}
            className="w-full rounded-lg font-medium hover:bg-light-gray hover:border-black text-xs sm:text-sm mt-auto"
            iconPosition="right"
            icon={
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            }
          >
            Explore Rankings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DomainCard;

