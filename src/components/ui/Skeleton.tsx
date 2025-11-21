import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave';
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  animation = 'pulse',
  className,
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full';
      case 'rectangular':
        return 'rounded';
      case 'text':
      default:
        return 'rounded';
    }
  };

  const getDefaultSize = () => {
    switch (variant) {
      case 'circular':
        return { width: '40px', height: '40px' };
      case 'text':
        return { width: '100%', height: '1em' };
      default:
        return {};
    }
  };

  const defaultSize = getDefaultSize();
  const style = {
    width: width ?? defaultSize.width,
    height: height ?? defaultSize.height,
  };

  return (
    <div
      className={cn(
        'bg-gray-200 dark:bg-gray-700',
        animation === 'pulse' ? 'animate-pulse' : 'skeleton',
        getVariantClass(),
        className
      )}
      style={style}
    />
  );
};

// Compound components for common patterns
export const SkeletonCard: React.FC = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
    <div className="flex items-center gap-4">
      <Skeleton variant="circular" width={48} height={48} />
      <div className="flex-1 space-y-2">
        <Skeleton width="60%" height={16} />
        <Skeleton width="40%" height={14} />
      </div>
    </div>
    <Skeleton width="100%" height={100} variant="rectangular" />
    <div className="flex gap-2">
      <Skeleton width="80px" height={32} variant="rectangular" />
      <Skeleton width="80px" height={32} variant="rectangular" />
    </div>
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-4">
        <Skeleton width={40} height={40} variant="circular" />
        <Skeleton width="20%" height={16} />
        <Skeleton width="15%" height={16} />
        <Skeleton width="15%" height={16} />
        <Skeleton width="10%" height={16} />
      </div>
    ))}
  </div>
);

export default Skeleton;

