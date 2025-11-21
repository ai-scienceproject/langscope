'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import DomainCard from '@/components/domain/DomainCard';
import SearchBar from '@/components/ui/SearchBar';
import Skeleton from '@/components/ui/Skeleton';
import Button from '@/components/ui/Button';
import { Domain } from '@/types';

export default function ArenaIndexPage() {
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
        description: 'Compare how different models generate, complete, and understand code.',
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
        description: 'Battle models on complex mathematical problems and quantitative reasoning.',
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
        description: 'Compare creative storytelling, poetry, and narrative generation.',
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
        description: 'Test how well models understand and execute complex instructions.',
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
        description: 'Battle models on factual accuracy and reasoning across knowledge domains.',
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
        description: 'Compare how models condense long documents into concise summaries.',
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

  const handleStartBattle = (slug: string) => {
    router.push(`/arena/${slug}`);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-full mb-6">
                <span className="text-5xl">⚔️</span>
              </div>
              <h1 className="text-5xl font-bold mb-4">
                Battle Arena
              </h1>
              <p className="text-xl text-primary-100 mb-8">
                Watch LLMs compete head-to-head! Compare responses and vote for the winner.
                Your votes help improve the rankings and make evaluations more accurate.
              </p>
              
              {/* Search Bar */}
              <div className="max-w-2xl mx-auto">
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search battle domains..."
                  suggestions={[]}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">How Arena Battles Work</h3>
                <p className="text-blue-800 text-sm">
                  Two anonymous models compete by responding to the same prompt. You judge which response is better.
                  After voting, model identities are revealed and rankings are updated based on the results.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Domains Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
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
                  Choose Your Battle Domain
                </h2>
                <p className="text-gray-600 mt-2">
                  {filteredDomains.length} {filteredDomains.length === 1 ? 'domain' : 'domains'} available for battles
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDomains.map((domain) => (
                  <div key={domain.id} className="group">
                    <DomainCard domain={domain} />
                    <Button
                      variant="primary"
                      className="w-full mt-3"
                      onClick={() => handleStartBattle(domain.slug)}
                    >
                      Start Battle ⚔️
                    </Button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No battle domains found matching "{searchQuery}"
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

