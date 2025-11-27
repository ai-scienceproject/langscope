'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import DomainCard from '@/components/domain/DomainCard';
import SearchBar from '@/components/ui/SearchBar';
import Skeleton from '@/components/ui/Skeleton';
import { Domain } from '@/types';

export default function RankingsIndexPage() {
  const router = useRouter();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/domains');
        const result = await response.json();
        
        if (response.ok && result.data) {
          const domainsData: Domain[] = result.data.map((domain: any) => ({
            id: domain._id || domain.id,
            name: domain.name,
            slug: domain.slug,
            description: domain.description || '',
            icon: domain.icon || '📄',
            modelCount: domain.modelCount || 0,
            battleCount: domain.battleCount || 0,
            color: '#64748b',
            isActive: domain.isActive,
            createdAt: new Date(domain.createdAt),
            updatedAt: new Date(domain.updatedAt),
          }));
          // Sort domains by battle count in descending order
          const sortedDomains = domainsData.sort((a, b) => (b.battleCount || 0) - (a.battleCount || 0));
          setDomains(sortedDomains);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error('Error fetching domains:', error);
        setDomains([]);
        setLoading(false);
      }
    };
    
    fetchDomains();
  }, []);

  const filteredDomains = domains.filter(domain =>
    domain.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    domain.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDomainClick = (slug: string) => {
    router.push(`/rankings/${slug}`);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Model Rankings
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Choose a domain to see how different LLMs rank based on battle results and performance metrics.
              </p>
              
              {/* Search Bar */}
              <div className="max-w-2xl mx-auto">
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search domains..."
                  suggestions={[]}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Domains Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} variant="rectangular" />
              ))}
            </div>
          ) : filteredDomains.length > 0 ? (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Select a Domain
                </h2>
                <p className="text-gray-600 mt-2">
                  {filteredDomains.length} {filteredDomains.length === 1 ? 'domain' : 'domains'} available
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDomains.map((domain) => (
                  <div
                    key={domain.id}
                    onClick={() => handleDomainClick(domain.slug)}
                    className="cursor-pointer transform transition-transform hover:scale-105"
                  >
                    <DomainCard domain={domain} />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No domains found matching "{searchQuery}"
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

