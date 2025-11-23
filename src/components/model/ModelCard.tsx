import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import type { Model } from '@/types';

interface ModelCardProps {
  model: Model;
  showStats?: boolean;
  variant?: 'compact' | 'detailed';
  className?: string;
}

const ModelCard: React.FC<ModelCardProps> = ({
  model,
  showStats = false,
  variant = 'compact',
  className,
}) => {
  return (
    <Link
      href={`/models/${model.slug}`}
      className={cn(
        'group block bg-white rounded-lg border border-gray-200 p-4',
        'transition-all duration-200 hover:shadow-md hover:border-primary-300',
        className
      )}
    >
      <div className="flex items-start gap-3">
        {/* Organization Logo */}
        <Avatar
          src={model.logo}
          alt={model.provider}
          size={variant === 'compact' ? 'md' : 'lg'}
          shape="square"
          fallback={model.provider.charAt(0)}
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className="text-base font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                {model.name}
              </h4>
              <p className="text-sm text-gray-500 truncate">{model.provider}</p>
            </div>

            {model.verified && (
              <Badge
                label="Verified"
                variant="success"
                size="sm"
                icon={
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                }
              />
            )}
          </div>

          {variant === 'detailed' && (
            <>
              <p className="mt-2 text-sm text-gray-600 line-clamp-2">{model.description}</p>

              {showStats && (
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Context Length</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {(model.contextLength / 1000).toFixed(0)}K tokens
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Cost</p>
                    <p className="text-sm font-semibold text-gray-900">
                      ${model.costPer1MTokens.toFixed(2)}/1M
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Type badge */}
          <div className="mt-2">
            <Badge
              label={model.type}
              variant="default"
              size="sm"
            />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ModelCard;

