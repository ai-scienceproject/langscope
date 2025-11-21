'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import RankingsTable from '@/components/rankings/RankingsTable';
import ModelDetailsModal from '@/components/model/ModelDetailsModal';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import { SkeletonTable } from '@/components/ui/Skeleton';
import type { Domain, ModelRanking, FilterState } from '@/types';

interface RankingsPageProps {
  domainSlug: string;
}

const RankingsPage: React.FC<RankingsPageProps> = ({ domainSlug }) => {
  const [domain, setDomain] = useState<Domain | null>(null);
  const [rankings, setRankings] = useState<ModelRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('rank');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [compareMode, setCompareMode] = useState(false);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<FilterState>({
    costRange: [0, 100],
    modelTypes: [],
    providers: [],
    contextLength: [0, 200000],
    verified: null,
    costFilter: [],
    contextFilter: [],
    sortBy: 'elo',
  });

  const fetchMockData = useCallback(async () => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock domain data
    const mockDomain: Domain = {
      id: '1',
      name: domainSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      slug: domainSlug,
      description: `Evaluate models on their ${domainSlug.replace('-', ' ')} capabilities`,
      icon: domainSlug.includes('code') ? '💻' : domainSlug.includes('math') ? '🔢' : 
            domainSlug.includes('creative') ? '✍️' : domainSlug.includes('instruction') ? '📋' :
            domainSlug.includes('question') ? '❓' : '📄',
      modelCount: 45,
      battleCount: 15234,
      color: '#3B82F6',
      isActive: true,
      confidenceScore: 94,
      transferDomains: ['instruction-following', 'question-answering'],
      transferDomainSimilarities: {
        'instruction-following': 92,
        'question-answering': 78,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Mock model data
    const mockModels = [
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI', logo: '🤖', cost: 10.0 },
      { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic', logo: '🤖', cost: 15.0 },
      { id: 'gemini-pro', name: 'Gemini Pro', provider: 'Google', logo: '🤖', cost: 7.0 },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI', logo: '🤖', cost: 0.5 },
      { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'Anthropic', logo: '🤖', cost: 3.0 },
      { id: 'mistral-large', name: 'Mistral Large', provider: 'Mistral AI', logo: '🤖', cost: 8.0 },
      { id: 'llama-3-70b', name: 'Llama 3 70B', provider: 'Meta', logo: '🤖', cost: 0.0 },
      { id: 'claude-3-haiku', name: 'Claude 3 Haiku', provider: 'Anthropic', logo: '🤖', cost: 0.25 },
      { id: 'gemini-flash', name: 'Gemini Flash', provider: 'Google', logo: '🤖', cost: 0.35 },
      { id: 'llama-3-8b', name: 'Llama 3 8B', provider: 'Meta', logo: '🤖', cost: 0.0 },
    ];
    
    // Mock rankings data with proper structure
    const mockRankings: ModelRanking[] = mockModels.map((modelData, index) => ({
      rank: index + 1,
      previousRank: index + 1 + (Math.random() > 0.5 ? 1 : -1),
      model: {
        id: modelData.id,
        name: modelData.name,
        slug: modelData.id,
        provider: modelData.provider,
        logo: modelData.logo,
        description: `${modelData.name} by ${modelData.provider}`,
        type: modelData.cost === 0 ? 'open-source' : 'proprietary' as 'open-source' | 'proprietary' | 'api-only',
        contextLength: 128000,
        costPer1MTokens: modelData.cost,
        verified: true,
        releaseDate: new Date('2024-01-01'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
      },
      score: 1400 - (index * 30) - Math.floor(Math.random() * 20),
      uncertainty: 15 + Math.floor(Math.random() * 10),
      battleCount: 1500 - (index * 100) + Math.floor(Math.random() * 200),
      winRate: 70 - (index * 2) + Math.random() * 5,
      domain: mockDomain,
      lastUpdated: new Date(Date.now() - index * 3600000),
    }));
    
    setDomain(mockDomain);
    setRankings(mockRankings);
    setTotalPages(1);
    setLoading(false);
  }, [domainSlug]);

  useEffect(() => {
    if (domainSlug) {
      fetchMockData();
    }
  }, [domainSlug, fetchMockData]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleCompareSelect = (modelId: string) => {
    setSelectedModels((prev) =>
      prev.includes(modelId)
        ? prev.filter((id) => id !== modelId)
        : [...prev, modelId]
    );
  };

  const handleStartArena = () => {
    window.location.href = `/arena/${domainSlug}`;
  };

  const handleCompare = () => {
    if (selectedModels.length >= 2) {
      window.location.href = `/compare?models=${selectedModels.join(',')}`;
    }
  };

  const handleModelDetails = (modelId: string) => {
    setSelectedModelId(modelId);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedModelId(null);
  };

    return (
    <Layout
      showSidebar={true}
      sidebarType="filter"
      filters={filters}
      onFilterChange={setFilters}
    >
      {/* Top Bar: Breadcrumb, Confidence, Transfer Domains */}
      {domain && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Link href="/" className="hover:text-primary-600">Home</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium capitalize">
              {domainSlug.split('-').join(' ')}
            </span>
          </nav>

          {/* Confidence Indicator */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Badge
                label={`High Confidence (${domain.battleCount.toLocaleString()} battles)`}
                variant="success"
                size="md"
              />
            </div>
          </div>

          {/* Transfer Domains */}
          {domain.transferDomains && domain.transferDomains.length > 0 && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Using data from: </span>
              {domain.transferDomains.map((transferDomain, idx) => {
                const similarity = (domain as any).transferDomainSimilarities?.[transferDomain] || 85;
                const domainName = transferDomain.split('-').map(w => 
                  w.charAt(0).toUpperCase() + w.slice(1)
                ).join(' ');
                return (
                  <span key={transferDomain}>
                    {idx > 0 && ', '}
                    <span className="font-medium">{domainName}</span>
                    <span className="text-gray-500"> ({similarity}% similar)</span>
                  </span>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Rankings Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Model Rankings</h2>
          <p className="text-gray-600 mt-1">
            Battle-tested rankings based on {domain?.battleCount.toLocaleString()} evaluations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant={compareMode ? 'primary' : 'outline'}
            onClick={() => {
              setCompareMode(!compareMode);
              setSelectedModels([]);
            }}
          >
            {compareMode ? 'Cancel Compare' : 'Compare Models'}
          </Button>

          {compareMode && selectedModels.length >= 2 && (
            <Button variant="primary" onClick={handleCompare}>
              Compare ({selectedModels.length})
            </Button>
          )}
        </div>
      </div>

      {/* Rankings Table */}
      {loading ? (
        <SkeletonTable rows={10} />
      ) : (
        <>
          <RankingsTable
            rankings={rankings}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            onModelClick={handleModelDetails}
            onModelDetails={handleModelDetails}
            compareMode={compareMode}
            selectedModels={selectedModels}
            onCompareSelect={handleCompareSelect}
          />

          {/* Pagination */}
          <div className="mt-6">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              pageSize={pageSize}
              onPageSizeChange={setPageSize}
            />
          </div>
        </>
      )}

      {/* Call-to-Action Panel */}
      <div className="mt-12 bg-white rounded-lg border-2 border-primary-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              Not satisfied with ranking?
            </h3>
            <p className="text-gray-600 mb-2">
              Test Top 5 Models Manually
            </p>
            <p className="text-sm text-gray-500">
              Free tier: <span className="font-semibold text-primary-600">5 battles remaining this month</span>
            </p>
          </div>
          <Button
            variant="primary"
            size="lg"
            onClick={() => {
              // Get top 5 models
              const top5Models = rankings.slice(0, 5).map(r => r.model.id);
              window.location.href = `/arena/${domainSlug}?models=${top5Models.join(',')}`;
            }}
          >
            Test Top 5 Models
          </Button>
        </div>
      </div>

      {/* Model Details Modal */}
      {selectedModelId && (
        <ModelDetailsModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          modelId={selectedModelId}
          domainSlug={domainSlug}
        />
      )}
    </Layout>
  );
};

export default RankingsPage;

