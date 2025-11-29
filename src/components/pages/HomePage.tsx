'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import SearchBar from '@/components/ui/SearchBar';
import Button from '@/components/ui/Button';
import HeroImage from '@/components/ui/HeroImage';
import DomainIdentificationModal from '@/components/ui/DomainIdentificationModal';
import JudgeSelectionModal from '@/components/battle/JudgeSelectionModal';
import { useAuth } from '@/contexts/AuthContext';
import type { Domain } from '@/types';

interface HomePageProps {
  initialDomains?: Domain[];
}

const HomePage: React.FC<HomePageProps> = ({ initialDomains = [] }) => {
  const { user, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [domains, setDomains] = useState<Domain[]>(initialDomains);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [identifiedDomain, setIdentifiedDomain] = useState<{
    name: string;
    exists: boolean;
    slug?: string;
  } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showJudgeModal, setShowJudgeModal] = useState(false);
  const [selectedDomainSlug, setSelectedDomainSlug] = useState<string | null>(null);
  const isInitialMount = useRef(true);
  const lastPathnameRef = useRef(pathname);

  const fetchDomains = useCallback(async () => {
    try {
      // Fetch domains from API
      const response = await fetch('/api/domains');
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch domains');
      }
      
      // Transform MongoDB data to match Domain type
      const domainsData: Domain[] = result.data.map((domain: any) => ({
        id: domain._id || domain.id,
        name: domain.name,
        slug: domain.slug,
        description: domain.description || '',
        icon: domain.icon || '📄',
        battleCount: domain.battleCount || 0,
        modelCount: domain.modelCount || 0,
        featured: false,
        color: '#64748b',
        isActive: domain.isActive,
        createdAt: new Date(domain.createdAt),
        updatedAt: new Date(domain.updatedAt),
      }));
      
      // Sort domains by battle count in descending order
      const sortedDomains = domainsData.sort((a, b) => (b.battleCount || 0) - (a.battleCount || 0));
      
      setDomains(sortedDomains);
      return;
    } catch (error) {
      console.error('Error fetching domains:', error);
      // Don't clear domains on error, keep existing data
    }
  }, []);

  // Always refresh domains on mount to get latest battle counts
  // This ensures we have fresh data even after page refresh
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      
      // Clear battleCompleted flag if it exists
      const battleCompleted = sessionStorage.getItem('battleCompleted');
      if (battleCompleted === 'true') {
        sessionStorage.removeItem('battleCompleted');
        // Only fetch if battle was completed, otherwise use initial data
        fetchDomains();
      }
      // If no battle was completed, use initialDomains without fetching
      
      return;
    }
  }, [fetchDomains]);

  // Refresh domains when navigating to homepage if battle was completed
  useEffect(() => {
    // Only refresh if pathname changed to '/' (not on initial mount)
    if (pathname === '/' && lastPathnameRef.current !== pathname) {
      const battleCompleted = sessionStorage.getItem('battleCompleted');
      if (battleCompleted === 'true') {
        fetchDomains();
        sessionStorage.removeItem('battleCompleted');
    }
    }
    lastPathnameRef.current = pathname;
  }, [pathname, fetchDomains]);

  const handleSearch = async (query: string) => {
    // Text is mandatory
    if (!query.trim()) {
      alert('Please enter a description of your use case to search for a domain.');
      return;
    }

    setIsIdentifying(true);
    try {
      // Prepare form data (text is mandatory)
      const formData = new FormData();
      formData.append('text', query.trim());
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      // Call domain identification API
      const identifyResponse = await fetch('/api/identify-domain', {
        method: 'POST',
        body: formData,
      });

      if (!identifyResponse.ok) {
        const error = await identifyResponse.json();
        throw new Error(error.error || 'Failed to identify domain');
      }

      const identifyResult = await identifyResponse.json();
      const domainName = identifyResult.domainName;

      // Check if domain exists or create it
      const checkResponse = await fetch('/api/domains/check-or-create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ domainName }),
      });

      if (!checkResponse.ok) {
        throw new Error('Failed to check or create domain');
      }

      const checkResult = await checkResponse.json();
      
      setIdentifiedDomain({
        name: domainName,
        exists: checkResult.exists,
        slug: checkResult.domain.slug,
      });
      setShowModal(true);
    } catch (error: any) {
      console.error('Error identifying domain:', error);
      alert(error.message || 'Failed to identify domain. Please try again.');
    } finally {
      setIsIdentifying(false);
    }
  };

  const handleStartBattle = () => {
    if (!identifiedDomain || !identifiedDomain.slug) return;
    
    // Show judge selection modal (same as arena page)
    setSelectedDomainSlug(identifiedDomain.slug);
    setShowJudgeModal(true);
  };

  const handleJudgeSelection = (judgeType: 'human' | 'llm', selectedModels?: string[]) => {
    if (!selectedDomainSlug) return;
    
    const params = new URLSearchParams();
    if (judgeType === 'human' && selectedModels && selectedModels.length > 0) {
      params.set('judge', 'human');
      params.set('models', selectedModels.join(','));
    } else if (judgeType === 'llm') {
      params.set('judge', 'llm');
    }
    
    router.push(`/arena/${selectedDomainSlug}?${params.toString()}`);
  };

  const handleRetryIdentification = async () => {
    // This function is called by the modal for retry
    // It doesn't affect the search button state
    try {
      // Prepare form data (text is mandatory)
      const formData = new FormData();
      formData.append('text', searchQuery.trim());
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      // Call domain identification API
      const identifyResponse = await fetch('/api/identify-domain', {
        method: 'POST',
        body: formData,
      });

      if (!identifyResponse.ok) {
        const error = await identifyResponse.json();
        throw new Error(error.error || 'Failed to identify domain');
      }

      const identifyResult = await identifyResponse.json();
      const domainName = identifyResult.domainName;

      // Check if domain exists or create it
      const checkResponse = await fetch('/api/domains/check-or-create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ domainName }),
      });

      if (!checkResponse.ok) {
        throw new Error('Failed to check or create domain');
      }

      const checkResult = await checkResponse.json();
      
      setIdentifiedDomain({
        name: domainName,
        exists: checkResult.exists,
        slug: checkResult.domain.slug,
      });
      // Keep modal open, just update the domain
      return { success: true, domain: { name: domainName, exists: checkResult.exists, slug: checkResult.domain.slug } };
    } catch (error: any) {
      console.error('Error identifying domain:', error);
      throw error;
    }
  };

  // Prepare domains for sidebar with icons - always show all domains, not filtered
  // Add "#" prefix to domain names for homepage display only
  const domainsForSidebar = domains.map(domain => ({
    id: domain.id,
    name: `#${domain.name}`,
    slug: domain.slug,
    icon: domain.icon,
    battleCount: domain.battleCount,
    modelCount: domain.modelCount,
  }));

  return (
    <Layout 
      user={user} 
      isAuthenticated={isAuthenticated}
      showSidebar={true}
      sidebarType="domains"
      domains={domainsForSidebar}
    >
      {/* Hero Section */}
      <section className="text-center pt-0 pb-4 sm:pb-6 md:pb-8 lg:pb-10 relative overflow-hidden -mt-3 sm:-mt-4 md:-mt-6 lg:-mt-8 -mx-3 sm:-mx-4 md:-mx-6 lg:-mx-8">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 bg-dark-gray/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 bg-dark-gray/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-4xl mx-auto relative z-10 px-3 sm:px-4 md:px-6">
          {/* Hero Image */}
          <div className="mb-1">
            <HeroImage />
          </div>
          
          <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-light text-gray-800 mb-2 sm:mb-3 leading-tight" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
            Find the Perfect <span className="px-0.5 rounded-[8px] font-light inline-block mr-1" style={{ backgroundColor: 'rgb(187, 196, 196)', color: 'rgb(29, 61, 60)' }}>LLM</span> for Your <span className="px-0.5 rounded-[8px] font-light inline-block ml-1" style={{ backgroundColor: 'rgb(235, 232, 254)', color: 'rgb(29, 61, 60)' }}>Use Case</span>
          </h1>

          {/* Large Search Bar */}
          <div className="max-w-3xl mx-auto mb-2">
            <div className="relative">
              <SearchBar
                placeholder="Describe your use case..."
                onFileChange={setSelectedFile}
                value={searchQuery}
                onChange={(value) => setSearchQuery(value)}
                onSearch={(query) => {
                  if (query.trim()) {
                    handleSearch(query);
                  }
                }}
                size="lg"
                allowFileUpload={true}
              />
            </div>
            {/* Search Button */}
            <div className="mt-3 sm:mt-4 flex justify-center">
              <Button
                onClick={() => handleSearch(searchQuery)}
                variant="outline"
                size="lg"
                className="flex items-center gap-[10px] bg-gradient-to-r from-purple-500 via-blue-500 to-teal-400 text-white px-7 py-[10px] rounded-[50px] border-0 hover:opacity-90 transition-all duration-200 shadow-lg"
                loading={isIdentifying}
                disabled={isIdentifying}
              >
                Search Domain
              </Button>
            </div>
          </div>

          {/* Example Text */}
          <p className="text-xs sm:text-sm text-dark-gray mb-2 sm:mb-4 font-normal px-2">
            Example: Medical diagnosis assistant in Hindi — Legal contract analysis — Customer support chatbot
          </p>
        </div>
      </section>

      {/* Mobile Domain Showcase - Show below hero search on mobile only */}
      <section className="lg:hidden bg-white rounded-2xl border border-gray-200 p-4 mb-4 mx-3 sm:mx-4">
        <h3 className="text-lg font-bold text-black mb-3">Trending Domains</h3>
        <div className="space-y-2">
          {domains.slice(0, 5).map((domain) => (
            <div
              key={domain.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-white to-light-gray/30 border border-gray-100 hover:border-dark-gray/20 hover:shadow-md transition-all duration-300 cursor-pointer group"
              onClick={() => {
                window.location.href = `/rankings/${domain.slug}`;
              }}
            >
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
                <span aria-hidden="true">
                  {domain.icon || '📄'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-black truncate group-hover:text-dark-gray transition-colors">
                  #{domain.name}
                </p>
                <p className="text-xs text-dark-gray mt-0.5">
                  {domain.battleCount?.toLocaleString() || 0} battles — {domain.modelCount || 0} models ranked
                </p>
              </div>
              <svg 
                className="w-5 h-5 text-dark-gray/40 group-hover:text-dark-gray group-hover:translate-x-0.5 transition-all duration-300 flex-shrink-0" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          ))}
        </div>
        <button
          onClick={() => {
            window.location.href = '/rankings';
          }}
          className="w-full mt-4 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 rounded-lg transition-all duration-300 border border-gray-200 shadow-sm"
        >
          View All Domains →
        </button>
      </section>

      {/* Features Section */}
      <section className="py-2 sm:py-3 md:py-4 bg-white rounded-2xl sm:rounded-3xl border border-gray-200 mb-1 sm:mb-2 shadow-lg">
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 pl-3 sm:pl-3 md:pl-4 pr-2 sm:pr-2 md:pr-3">
          <div className="flex flex-col sm:flex-row items-start gap-1.5 p-2.5 rounded-xl bg-light-gray border border-gray-200 hover:bg-white hover:border-dark-gray hover:shadow-lg transition-all duration-300 group">
            <div className="flex-shrink-0 text-2xl group-hover:scale-110 transition-all duration-300">
              📊
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-black mb-0.5 text-sm leading-snug">Data-Driven Rankings</h3>
              <p className="text-xs text-dark-gray leading-normal">from 10,000+ LLM Battles</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start gap-1.5 p-2.5 rounded-xl bg-light-gray border border-gray-200 hover:bg-white hover:border-dark-gray hover:shadow-lg transition-all duration-300 group">
            <div className="flex-shrink-0 text-2xl group-hover:scale-110 transition-all duration-300">
              🌐
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-black mb-0.5 text-sm leading-snug">Multi-Domain Support</h3>
              <p className="text-xs text-dark-gray leading-normal">Medical, Legal, Finance, +12 more</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start gap-1.5 p-2.5 rounded-xl bg-light-gray border border-gray-200 hover:bg-white hover:border-dark-gray hover:shadow-lg transition-all duration-300 group">
            <div className="flex-shrink-0 text-2xl group-hover:scale-110 transition-all duration-300">
              🔒
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-black mb-0.5 text-sm leading-snug">Immutable Public Ledger</h3>
              <p className="text-xs text-dark-gray leading-normal">No Gaming, No Collusion</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start gap-1.5 p-2.5 rounded-xl bg-light-gray border border-gray-200 hover:bg-white hover:border-dark-gray hover:shadow-lg transition-all duration-300 group">
            <div className="flex-shrink-0 text-2xl group-hover:scale-110 transition-all duration-300">
              ⚔️
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-black mb-0.5 text-sm leading-snug">Test Top Models Yourself</h3>
              <p className="text-xs text-dark-gray leading-normal">Manual Arena Mode</p>
            </div>
          </div>
        </div>
      </section>


      {/* How It Works Section */}
      <section className="py-4 sm:py-6 md:py-8 mt-2 sm:mt-3 md:mt-4">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-black text-center mb-4 sm:mb-6">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {[
            {
              step: '1',
              title: 'Select Domain',
              description: 'Choose the domain you want to evaluate models in',
              icon: '🎯',
            },
            {
              step: '2',
              title: 'Battle Arena',
              description: 'Models compete in head-to-head battles with blind judging',
              icon: '⚔️',
            },
            {
              step: '3',
              title: 'Verified Rankings',
              description: 'Results are cryptographically verified for data integrity',
              icon: '🔒',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="text-center p-3 sm:p-4 bg-white rounded-xl sm:rounded-2xl border-2 border-gray-200 shadow-lg hover:shadow-xl hover:border-dark-gray hover:scale-[1.02] transition-all duration-300 group relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="text-3xl sm:text-4xl mb-2 sm:mb-3 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">{item.icon}</div>
                <div className="inline-block px-2 sm:px-3 py-0.5 sm:py-1 bg-[#E8E3FF] text-[rgb(29,61,60)] rounded-full text-xs font-bold mb-2 sm:mb-3 shadow-lg shadow-purple-200/30">
                  Step {item.step}
                </div>
                <h3 className="text-sm sm:text-base font-bold text-black mb-1.5">{item.title}</h3>
                <p className="text-xs text-dark-gray leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Domain Identification Modal */}
      {identifiedDomain && (
        <DomainIdentificationModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          domainName={identifiedDomain.name}
          onRetry={handleRetryIdentification}
          domainExists={identifiedDomain.exists}
          domainSlug={identifiedDomain.slug}
          onStartBattle={handleStartBattle}
          onDomainUpdate={(domain) => {
            setIdentifiedDomain(domain);
          }}
        />
      )}

      {/* Judge Selection Modal */}
      {selectedDomainSlug && (
        <JudgeSelectionModal
          isOpen={showJudgeModal}
          onClose={() => {
            setShowJudgeModal(false);
            setSelectedDomainSlug(null);
          }}
          onSelectJudge={handleJudgeSelection}
          domainSlug={selectedDomainSlug}
        />
      )}
    </Layout>
  );
};

export default HomePage;

