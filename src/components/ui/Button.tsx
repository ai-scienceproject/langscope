import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      icon,
      iconPosition = 'left',
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 rounded-xl';
    
    const variants = {
      primary: 'bg-[#E8E3FF] text-[rgb(29,61,60)] hover:bg-[#D8D0FF] focus-visible:ring-[#E8E3FF] shadow-lg shadow-purple-200/30 hover:shadow-xl hover:shadow-purple-300/40 transition-all duration-300',
      secondary: 'bg-dark-gray text-white hover:bg-black focus-visible:ring-dark-gray shadow-md shadow-dark-gray/20 hover:shadow-lg',
      outline: 'border-2 border-dark-gray bg-white text-black hover:bg-light-gray hover:border-black focus-visible:ring-black transition-all duration-200',
      ghost: 'text-dark-gray hover:bg-light-gray hover:text-black focus-visible:ring-black transition-all duration-200',
      danger: 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 focus-visible:ring-red-600 shadow-lg shadow-red-500/30',
    };
    
    const sizes = {
      xs: 'h-7 px-2 text-xs gap-1',
      sm: 'h-9 px-3 text-sm gap-1.5',
      md: 'h-10 px-4 text-sm gap-2',
      lg: 'h-11 px-6 text-base gap-2',
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {icon && iconPosition === 'left' && !loading && icon}
        {children}
        {icon && iconPosition === 'right' && !loading && icon}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;

