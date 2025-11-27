'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import SearchBar from '@/components/ui/SearchBar';
import Button from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import type { Domain } from '@/types';

const HomePage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDomains();
  }, []);

  const fetchDomains = async () => {
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
      setDomains([]);
    }
  };

  const handleSearch = (query: string) => {
    // This is called by the debounced onSearch callback
    // The searchQuery state is already updated by onChange
    // So we don't need to update it here again
    // Only perform search action if there's a non-empty term
    if (query.trim()) {
      // Redirect to rankings with search or show filtered domains
      // For now, just filter domains. In future, could redirect to search results page
    }
  };

  // Prepare domains for sidebar with icons - always show all domains, not filtered
  const domainsForSidebar = domains.map(domain => ({
    id: domain.id,
    name: domain.name,
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
      <section className="text-center py-4 sm:py-6 md:py-8 lg:py-10 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 bg-dark-gray/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-96 bg-dark-gray/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-4xl mx-auto relative z-10 px-3 sm:px-4 md:px-6">
          <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-black mb-4 sm:mb-5 leading-tight text-3d">
            Find the Perfect <span className="font-extrabold" style={{ color: '#A95C68', textShadow: '3px 3px 0px rgba(169,92,104,0.2), 6px 6px 0px rgba(169,92,104,0.15), 9px 9px 0px rgba(169,92,104,0.1)' }}>LLM</span> for Your Use Case
          </h1>

          {/* Large Search Bar */}
          <div className="max-w-3xl mx-auto mb-3 sm:mb-4">
            <div className="relative">
              <SearchBar
                placeholder="Describe your use case..."
                onSearch={handleSearch}
                value={searchQuery}
                onChange={(value) => setSearchQuery(value)}
                size="lg"
              />
            </div>
            {/* Search Button */}
            <div className="mt-3 sm:mt-4 flex justify-center">
              <Button
                onClick={() => handleSearch(searchQuery)}
                variant="primary"
                size="lg"
                className="w-full sm:w-auto px-6 sm:px-8"
              >
                Search
              </Button>
            </div>
          </div>

          {/* Example Text */}
          <p className="text-xs sm:text-sm text-dark-gray mb-2 sm:mb-4 font-normal px-2">
            Example: Medical diagnosis assistant in Hindi — Legal contract analysis — Customer support chatbot
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-3 sm:py-4 md:py-6 bg-white rounded-2xl sm:rounded-3xl border-2 border-gray-200 mb-4 sm:mb-6 shadow-lg">
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 px-3 sm:px-4 md:px-6">
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-light-gray border border-gray-200 hover:bg-white hover:border-dark-gray hover:shadow-lg transition-all duration-300 group">
            <div className="flex-shrink-0 w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white text-xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              📊
            </div>
            <div>
              <h3 className="font-bold text-black mb-1.5 text-sm">Data-Driven Rankings</h3>
              <p className="text-xs text-dark-gray leading-relaxed">from 10,000+ LLM Battles</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-light-gray border border-gray-200 hover:bg-white hover:border-dark-gray hover:shadow-lg transition-all duration-300 group">
            <div className="flex-shrink-0 w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white text-xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              🌐
            </div>
            <div>
              <h3 className="font-bold text-black mb-1.5 text-sm">Multi-Domain Support</h3>
              <p className="text-xs text-dark-gray leading-relaxed">Medical, Legal, Finance, +12 more</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-light-gray border border-gray-200 hover:bg-white hover:border-dark-gray hover:shadow-lg transition-all duration-300 group">
            <div className="flex-shrink-0 w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white text-xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              🔒
            </div>
            <div>
              <h3 className="font-bold text-black mb-1.5 text-sm">Immutable Public Ledger</h3>
              <p className="text-xs text-dark-gray leading-relaxed">No Gaming, No Collusion</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-light-gray border border-gray-200 hover:bg-white hover:border-dark-gray hover:shadow-lg transition-all duration-300 group">
            <div className="flex-shrink-0 w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white text-xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              ⚔️
            </div>
            <div>
              <h3 className="font-bold text-black mb-1.5 text-sm">Test Top Models Yourself</h3>
              <p className="text-xs text-dark-gray leading-relaxed">Manual Arena Mode</p>
            </div>
          </div>
        </div>
      </section>


      {/* How It Works Section */}
      <section className="py-8 sm:py-10 md:py-12 mt-8 sm:mt-10 md:mt-12">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-black text-center mb-6 sm:mb-8">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
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
              className="text-center p-4 sm:p-6 bg-white rounded-2xl sm:rounded-3xl border-2 border-gray-200 shadow-lg hover:shadow-xl hover:border-dark-gray hover:scale-[1.02] transition-all duration-300 group relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="text-4xl sm:text-5xl mb-3 sm:mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">{item.icon}</div>
                <div className="inline-block px-3 sm:px-4 py-1 sm:py-1.5 bg-black text-white rounded-full text-xs font-bold mb-3 sm:mb-4 shadow-lg">
                  Step {item.step}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-black mb-2">{item.title}</h3>
                <p className="text-xs sm:text-sm text-dark-gray leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;

