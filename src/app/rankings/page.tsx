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
    // Mock domains data
    const mockDomains: Domain[] = [
      {
        id: '1',
        name: 'Code Generation',
        slug: 'code-generation',
        description: 'Evaluate LLMs on their ability to generate, complete, and understand code across multiple programming languages.',
        icon: '💻',
        modelCount: 45,
        battleCount: 15234,
        color: '#3B82F6',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        name: 'Mathematical Reasoning',
        slug: 'math-reasoning',
        description: 'Test models on complex mathematical problems, proofs, and quantitative reasoning tasks.',
        icon: '🔢',
        modelCount: 38,
        battleCount: 12456,
        color: '#10B981',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '3',
        name: 'Creative Writing',
        slug: 'creative-writing',
        description: 'Assess creative storytelling, poetry, dialogue, and narrative generation capabilities.',
        icon: '✍️',
        modelCount: 52,
        battleCount: 18901,
        color: '#8B5CF6',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '4',
        name: 'Instruction Following',
        slug: 'instruction-following',
        description: 'Evaluate how well models understand and execute complex multi-step instructions.',
        icon: '📋',
        modelCount: 41,
        battleCount: 14567,
        color: '#F59E0B',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '5',
        name: 'Question Answering',
        slug: 'question-answering',
        description: 'Test factual accuracy and reasoning across diverse knowledge domains.',
        icon: '❓',
        modelCount: 47,
        battleCount: 16789,
        color: '#EF4444',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '6',
        name: 'Summarization',
        slug: 'summarization',
        description: 'Assess the ability to condense long documents into accurate, concise summaries.',
        icon: '📄',
        modelCount: 35,
        battleCount: 11234,
        color: '#06B6D4',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    setTimeout(() => {
      setDomains(mockDomains);
      setLoading(false);
    }, 500);
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

