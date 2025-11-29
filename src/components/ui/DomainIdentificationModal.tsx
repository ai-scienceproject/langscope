'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface DomainIdentificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  domainName: string;
  onRetry: () => void | Promise<{ success: boolean; domain: { name: string; exists: boolean; slug: string } }>;
  domainExists: boolean;
  domainSlug?: string;
  onStartBattle?: () => void;
  isRetrying?: boolean;
  onDomainUpdate?: (domain: { name: string; exists: boolean; slug: string }) => void;
}

const DomainIdentificationModal: React.FC<DomainIdentificationModalProps> = ({
  isOpen,
  onClose,
  domainName,
  onRetry,
  domainExists,
  domainSlug,
  onStartBattle,
  isRetrying = false,
  onDomainUpdate,
}) => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [currentDomain, setCurrentDomain] = useState({ name: domainName, exists: domainExists, slug: domainSlug });
  const [isRetryingState, setIsRetryingState] = useState(false);
  
  // Update local state when props change
  useEffect(() => {
    setCurrentDomain({ name: domainName, exists: domainExists, slug: domainSlug });
  }, [domainName, domainExists, domainSlug]);

  if (!isOpen) return null;

  const handleShowRankings = () => {
    if (currentDomain.slug) {
      router.push(`/rankings/${currentDomain.slug}`);
      onClose();
    }
  };

  const handleRetry = async () => {
    setIsRetryingState(true);
    try {
      const result = await onRetry();
      if (result && typeof result === 'object' && 'success' in result && result.success) {
        setCurrentDomain(result.domain);
        if (onDomainUpdate) {
          onDomainUpdate(result.domain);
        }
      }
    } catch (error: any) {
      alert(error.message || 'Failed to identify domain. Please try again.');
    } finally {
      setIsRetryingState(false);
    }
  };

  const handleStartBattle = async () => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      // Redirect to login with redirect parameter to come back here
      router.push(`/login?redirect=/`);
      return;
    }

    if (onStartBattle) {
      setIsLoading(true);
      try {
        await onStartBattle();
        onClose();
      } catch (error) {
        console.error('Error starting battle:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleClose = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (!isLoading && !isRetrying) {
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isLoading && !isRetrying) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-purple-50/80 via-blue-50/80 to-purple-50/80 backdrop-blur-md p-3 sm:p-4"
      onClick={handleBackdropClick}
    >
      {/* Futuristic animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-200/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-200/40 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      
      <div 
        className="relative bg-gradient-to-br from-white via-purple-50/50 to-blue-50/50 rounded-3xl shadow-2xl max-w-lg w-full mx-auto border border-purple-200/50" 
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: '0 0 40px rgba(139, 92, 246, 0.2), inset 0 0 60px rgba(139, 92, 246, 0.05)',
          maxHeight: 'calc(100vh - 2rem)'
        }}
      >
        {/* Animated border glow */}
        <div 
          className="absolute inset-0 rounded-3xl opacity-50 pointer-events-none"
          style={{ 
            background: 'linear-gradient(90deg, rgba(139, 92, 246, 0) 0%, rgba(139, 92, 246, 0.5) 50%, rgba(139, 92, 246, 0) 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 3s ease-in-out infinite'
          }}
        ></div>
        
        {/* Close X button at top right */}
        <button
          onClick={handleClose}
          disabled={isLoading || isRetrying}
          className="absolute top-3 right-3 p-2 rounded-lg bg-gray-100/80 hover:bg-gray-200/80 text-gray-700 hover:text-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed z-20 backdrop-blur-sm border border-gray-300/50"
          aria-label="Close"
          type="button"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="p-4 sm:p-6 relative z-10">
          <div className="text-center mb-4 sm:mb-5">
            {/* Futuristic holographic icon */}
            <div className="mx-auto mb-3 sm:mb-4 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
              <div className="relative mx-auto flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br from-purple-600 via-blue-600 to-purple-800 border-2 border-purple-400/50 shadow-lg" style={{
                boxShadow: '0 0 30px rgba(139, 92, 246, 0.6), inset 0 0 20px rgba(59, 130, 246, 0.3)'
              }}>
                <span className="text-3xl sm:text-4xl">🎯</span>
              </div>
            </div>
            
            {/* Futuristic title */}
            <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              Domain Identified
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
              Neural network analysis complete
            </p>
            
            {/* Futuristic domain display */}
            <div className="relative mb-4 sm:mb-5">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-200/40 via-blue-200/40 to-purple-200/40 rounded-2xl blur-xl"></div>
              <div className="relative bg-gradient-to-br from-white/90 to-purple-50/90 rounded-2xl p-4 sm:p-6 border border-purple-200/50 backdrop-blur-sm" style={{
                boxShadow: 'inset 0 0 30px rgba(139, 92, 246, 0.1), 0 0 20px rgba(139, 92, 246, 0.08)'
              }}>
                <div className="flex flex-col items-center gap-2">
                  <div className="text-2xl sm:text-3xl mb-1">📋</div>
                  <div className="h-px w-20 bg-gradient-to-r from-transparent via-purple-500 to-transparent mb-1"></div>
                  <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent break-words text-center">
                    {currentDomain.name}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Futuristic action grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
            {currentDomain.exists && currentDomain.slug && (
              <button
                onClick={handleShowRankings}
                className="group relative overflow-hidden bg-gradient-to-br from-white to-purple-50/50 border border-purple-200/50 rounded-xl p-3 sm:p-4 hover:border-purple-300/70 transition-all duration-300 hover:shadow-lg hover:shadow-purple-200/40"
                style={{
                  boxShadow: 'inset 0 0 20px rgba(139, 92, 246, 0.05)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-100/0 via-purple-100/30 to-purple-100/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex flex-col items-center gap-1.5">
                  <div className="text-xl sm:text-2xl">📊</div>
                  <span className="text-[10px] sm:text-xs font-semibold text-purple-600 uppercase tracking-wider">Rankings</span>
                </div>
              </button>
            )}
            
            <button
              onClick={handleStartBattle}
              disabled={isLoading}
              className="group relative overflow-hidden bg-gradient-to-br from-white to-purple-50/50 border border-purple-200/50 rounded-xl p-3 sm:p-4 hover:border-purple-300/70 transition-all duration-300 hover:shadow-lg hover:shadow-purple-200/40 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                boxShadow: 'inset 0 0 20px rgba(139, 92, 246, 0.05)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-100/0 via-purple-100/30 to-purple-100/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex flex-col items-center gap-1.5">
                {isLoading ? (
                  <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <>
                    <div className="text-xl sm:text-2xl">⚔️</div>
                    <span className="text-[10px] sm:text-xs font-semibold text-purple-600 uppercase tracking-wider">Battle</span>
                  </>
                )}
              </div>
            </button>

            <button
              onClick={handleRetry}
              disabled={isLoading || isRetryingState || isRetrying}
              className="group relative overflow-hidden bg-gradient-to-br from-white to-blue-50/50 border border-blue-200/50 rounded-xl p-3 sm:p-4 hover:border-blue-300/70 transition-all duration-300 hover:shadow-lg hover:shadow-blue-200/40 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                boxShadow: 'inset 0 0 20px rgba(59, 130, 246, 0.05)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100/0 via-blue-100/30 to-blue-100/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex flex-col items-center gap-1.5">
                {(isRetryingState || isRetrying) ? (
                  <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <>
                    <div className="text-xl sm:text-2xl">🔄</div>
                    <span className="text-[10px] sm:text-xs font-semibold text-blue-600 uppercase tracking-wider">Retry</span>
                  </>
                )}
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DomainIdentificationModal;

