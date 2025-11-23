import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className, onClick, hover = false }) => {
  return (
    <div
      className={cn(
        'bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm',
        hover && 'transition-all duration-200 hover:shadow-md hover:border-dark-gray cursor-pointer',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return <div className={cn('px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200', className)}>{children}</div>;
};

const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return <h3 className={cn('text-base sm:text-lg font-semibold text-black', className)}>{children}</h3>;
};

const CardDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return <p className={cn('mt-1 text-xs sm:text-sm text-dark-gray', className)}>{children}</p>;
};

const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return <div className={cn('px-4 sm:px-6 py-3 sm:py-4', className)}>{children}</div>;
};

const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return (
    <div className={cn('px-4 sm:px-6 py-3 sm:py-4 bg-light-gray border-t border-gray-200 rounded-b-lg sm:rounded-b-xl', className)}>
      {children}
    </div>
  );
};

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };

