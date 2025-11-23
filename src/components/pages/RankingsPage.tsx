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

  const fetchData = useCallback(async () => {
    setLoading(true);
    
    try {
      // Fetch domain and rankings from API
      const rankingsResponse = await fetch(`/api/rankings/${domainSlug}`);
      
      // Check if response is ok before trying to parse JSON
      if (!rankingsResponse.ok) {
        let errorMessage = 'Failed to fetch rankings';
        try {
          const errorData = await rankingsResponse.json();
          errorMessage = errorData.error || errorMessage;
          console.error('Rankings API error:', errorData);
        } catch {
          // If JSON parsing fails, use the status text
          errorMessage = rankingsResponse.statusText || errorMessage;
          console.error('Rankings API error (non-JSON):', rankingsResponse.status, rankingsResponse.statusText);
        }
        throw new Error(errorMessage);
      }
      
      const rankingsResult = await rankingsResponse.json();
      
      if (!rankingsResult.domain || !rankingsResult.data) {
        console.error('Invalid rankings response:', rankingsResult);
        throw new Error('Invalid response from rankings API');
      }
      
      const domainData = rankingsResult.domain;
      const rankingsData = rankingsResult.data || [];
      
      // Transform domain
      const transformedDomain: Domain = {
        id: domainData.id,
        name: domainData.name,
        slug: domainData.slug,
        description: domainData.description || '',
        icon: domainData.icon || '📄',
        modelCount: domainData.modelCount || 0,
        battleCount: domainData.battleCount || 0,
        color: '#64748b',
        isActive: domainData.isActive,
        confidenceScore: 85,
        createdAt: new Date(domainData.createdAt),
        updatedAt: new Date(domainData.updatedAt),
      };
      
      setDomain(transformedDomain);
      setRankings(rankingsData);
      setTotalPages(1);
      setLoading(false);
      return;
    } catch (error) {
      console.error('Error fetching rankings:', error);
      setDomain(null);
      setRankings([]);
      setLoading(false);
    }
  }, [domainSlug]);

  useEffect(() => {
    if (domainSlug) {
      fetchData();
    }
  }, [domainSlug, fetchData]);

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
                const similarity = domain.transferDomainSimilarities?.[transferDomain] || 85;
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

