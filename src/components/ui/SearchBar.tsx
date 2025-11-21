import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

export interface SearchSuggestion {
  id: string;
  label: string;
  type?: string;
  icon?: React.ReactNode;
}

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (query: string) => void;
  onSearch?: (query: string) => void;
  suggestions?: SearchSuggestion[];
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  autoFocus?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search...',
  value: controlledValue,
  onChange,
  onSearch,
  suggestions = [],
  size = 'md',
  className,
  autoFocus = false,
}) => {
  const [internalQuery, setInternalQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Use controlled value if provided, otherwise use internal state
  const query = controlledValue !== undefined ? controlledValue : internalQuery;

  // Debounced search function using useCallback and ref
  const debouncedSearch = useCallback((value: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      if (onSearch) {
        onSearch(value);
      }
    }, 300);
  }, [onSearch]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Update internal state if not controlled (for uncontrolled mode)
    if (controlledValue === undefined) {
      setInternalQuery(value);
    }
    
    // Call onChange immediately and synchronously - this updates the controlled value
    // This must happen before any async operations
    if (onChange) {
      onChange(value);
    }
    
    // Reset selection and update suggestions
    setSelectedIndex(-1);
    setShowSuggestions(value.length > 0 && suggestions.length > 0);
    
    // Debounce the search callback (doesn't affect the input value)
    debouncedSearch(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else if (onSearch) {
          onSearch(query);
          setShowSuggestions(false);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    const newValue = suggestion.label;
    
    // Update internal state if not controlled
    if (controlledValue === undefined) {
      setInternalQuery(newValue);
    }
    
    // Call onChange if provided
    if (onChange) {
      onChange(newValue);
    }
    
    // Call onSearch if provided
    if (onSearch) {
      onSearch(newValue);
    }
    
    setShowSuggestions(false);
  };

  const handleClear = () => {
    const newValue = '';
    
    // Update internal state if not controlled
    if (controlledValue === undefined) {
      setInternalQuery(newValue);
    }
    
    // Call onChange if provided
    if (onChange) {
      onChange(newValue);
    }
    
    // Call onSearch if provided
    if (onSearch) {
      onSearch(newValue);
    }
    
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const sizes = {
    sm: 'h-9 text-sm',
    md: 'h-10 text-base',
    lg: 'h-12 text-lg',
  };

  return (
    <div className={cn('relative w-full', className)}>
      <div className="relative">
        {/* Search icon */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={query ?? ''}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length > 0 && suggestions.length > 0 && setShowSuggestions(true)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={cn(
            'w-full pl-10 pr-10 py-2 border-2 border-gray-200 rounded-xl',
            'focus:outline-none focus:ring-2 focus:ring-slate-500/50 focus:border-slate-500',
            'placeholder:text-gray-400',
            'text-gray-900 bg-white/90 backdrop-blur-sm',
            'shadow-sm hover:shadow-md focus:shadow-lg transition-all duration-200',
            sizes[size]
          )}
        />

        {/* Clear button */}
        {query && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 max-h-80 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.id}
              onClick={() => handleSuggestionClick(suggestion)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-2 text-left transition-colors',
                selectedIndex === index ? 'bg-slate-50 text-slate-700' : 'hover:bg-gray-50'
              )}
            >
              {suggestion.icon && <span className="flex-shrink-0">{suggestion.icon}</span>}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{suggestion.label}</p>
                {suggestion.type && <p className="text-xs text-gray-500">{suggestion.type}</p>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;

