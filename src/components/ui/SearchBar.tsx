import React, { useState, useRef, useEffect } from 'react';
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
  onFileChange?: (file: File | null) => void;
  suggestions?: SearchSuggestion[];
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  autoFocus?: boolean;
  allowFileUpload?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search...',
  value: controlledValue,
  onChange,
  onSearch,
  onFileChange,
  suggestions = [],
  size = 'md',
  className,
  autoFocus = false,
  allowFileUpload = false,
}) => {
  const [internalQuery, setInternalQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Use controlled value if provided, otherwise use internal state
  const query = controlledValue !== undefined ? controlledValue : internalQuery;

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
    
    // Note: Removed automatic debounced search - search should only trigger on Enter key or button click
    // If you need automatic search, call debouncedSearch(value) here
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        if (!showSuggestions) return;
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
        break;
      case 'ArrowUp':
        if (!showSuggestions) return;
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (showSuggestions && selectedIndex >= 0) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else if (onSearch && query.trim()) {
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (file) {
      // Validate file type - only allow images and PDFs
      const isImage = file.type.startsWith('image/');
      const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      
      if (!isImage && !isPDF) {
        alert('Please upload only image files (JPG, PNG, GIF, etc.) or PDF files.');
        e.target.value = ''; // Clear the input
        return;
      }
      
      setSelectedFile(file);
      
      // Create preview for images
      if (isImage) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        // For PDFs, show file name instead of preview
        setFilePreview(null);
      }
      
      if (onFileChange) {
        onFileChange(file);
      }
    } else {
      setSelectedFile(null);
      setFilePreview(null);
      if (onFileChange) {
        onFileChange(null);
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onFileChange) {
      onFileChange(null);
    }
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
            'w-full pl-10 py-2 border-2 border-gray-200 rounded-xl',
            allowFileUpload ? 'pr-24' : 'pr-10',
            'focus:outline-none focus:ring-2 focus:ring-slate-500/50 focus:border-slate-500',
            'placeholder:text-gray-400',
            'text-gray-900 bg-white/90 backdrop-blur-sm',
            'shadow-sm hover:shadow-md focus:shadow-lg transition-all duration-200',
            sizes[size]
          )}
        />

        {/* File upload button */}
        {allowFileUpload && (
          <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,application/pdf"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 cursor-pointer transition-colors"
              title="Upload image or file"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
            </label>
            {selectedFile && (
              <button
                onClick={handleRemoveFile}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                title="Remove file"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        )}

        {/* Clear button */}
        {query && !allowFileUpload && (
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
        
        {/* File preview */}
        {selectedFile && filePreview && (
          <div className="absolute top-full left-0 mt-2 p-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <img src={filePreview} alt="Preview" className="max-w-xs max-h-32 object-contain rounded" />
            <p className="text-xs text-gray-500 mt-1 truncate">{selectedFile.name}</p>
          </div>
        )}
        {selectedFile && !filePreview && (
          <div className="absolute top-full left-0 mt-2 p-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <p className="text-xs text-gray-500">{selectedFile.name}</p>
          </div>
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

