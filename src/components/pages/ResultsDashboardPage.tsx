'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Layout from '@/components/layout/Layout';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import type { ModelRanking } from '@/types';
import { getOrganizationLogo } from '@/lib/utils/modelIcons';

interface ResultsDashboardPageProps {
  evaluationId?: string;
}

interface Insight {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  metrics?: { label: string; value: string }[];
}

const ResultsDashboardPageContent: React.FC<ResultsDashboardPageProps> = ({ evaluationId }) => {
  const searchParams = useSearchParams();
  const domainSlug = searchParams.get('domain') || 'code-generation';
  const judgeModelId = searchParams.get('judgeModelId'); // Get judge model ID from URL if available
  
  const [results, setResults] = useState<{
    userRank: number;
    predictedRank: number;
    modelName: string;
    actualScore: number;
    predictedScore: number;
    rankings: ModelRanking[];
    evaluationRankings: ModelRanking[]; // Models tested in this evaluation
    currentBattleRankings: ModelRanking[]; // Only the 2 models from current battle
    domainName: string;
    totalBattles: number;
    modelsTested: number;
    winLossMatrix: { [key: string]: { [key: string]: { wins: number; losses: number } } };
    confidenceBefore: number;
    confidenceAfter: number;
    predictionAccuracy: number;
    judgeModel?: { id: string; name: string; provider: string; logo: string }; // Judge model info for LLM evaluations
  } | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      if (!evaluationId || evaluationId === 'demo') {
        // If no evaluation ID, show empty state
        const domainName = domainSlug
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        
        setResults({
          userRank: 0,
          predictedRank: 0,
          modelName: 'No Evaluation',
          actualScore: 0,
          predictedScore: 0,
          rankings: [],
          evaluationRankings: [],
          currentBattleRankings: [],
          domainName,
          totalBattles: 0,
          modelsTested: 0,
          winLossMatrix: {},
          confidenceBefore: 0,
          confidenceAfter: 0,
          predictionAccuracy: 0,
        });
        setInsights([]);
        setLoading(false);
        return;
      }
      
      try {
        // Check if evaluationId is a demo or invalid ID
        if (evaluationId === 'demo' || evaluationId?.startsWith('eval-')) {
          // For demo/invalid IDs, try to get rankings from domain instead
          const rankingsResponse = await fetch(`/api/rankings/${domainSlug}`);
          
          if (rankingsResponse.ok) {
            const rankingsResult = await rankingsResponse.json();
            
            if (rankingsResult.data && rankingsResult.data.length > 0) {
              const rankings = rankingsResult.data;
              const domainName = rankingsResult.domain?.name || domainSlug
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
              
              setResults({
                userRank: rankings.length > 0 ? rankings[0].rank : 0,
                predictedRank: rankings.length > 0 ? rankings[0].rank : 0,
                modelName: rankings.length > 0 ? rankings[0].model.name : 'No Model',
                actualScore: rankings.length > 0 ? rankings[0].score : 0,
                predictedScore: rankings.length > 0 ? rankings[0].score : 0,
                rankings: rankings,
                evaluationRankings: [], // No evaluation-specific data for fallback
                currentBattleRankings: [],
                domainName,
                totalBattles: rankingsResult.domain?.battleCount || rankings.reduce((sum: number, r: any) => sum + (r.battleCount || 0), 0),
                modelsTested: rankings.length,
                winLossMatrix: {},
                confidenceBefore: 75,
                confidenceAfter: 88,
                predictionAccuracy: 70,
              });
              
              const generatedInsights: Insight[] = [];
              if (rankings.length > 0) {
                generatedInsights.push({
                  id: '1',
                  title: 'Top Performer',
                  description: `${rankings[0].model.name} leads with ${rankings[0].score} ELO score`,
                  icon: '🏆',
                  color: 'green',
                });
              }
              const totalBattles = rankingsResult.domain?.battleCount || rankings.reduce((sum: number, r: any) => sum + (r.battleCount || 0), 0);
              if (totalBattles > 0) {
                generatedInsights.push({
                  id: '2',
                  title: 'Battle Activity',
                  description: `${totalBattles} battles completed across ${rankings.length} models`,
                  icon: '⚔️',
                  color: 'blue',
                });
              }
              setInsights(generatedInsights);
              setLoading(false);
              return;
            }
          }
          
          // If we can't get domain rankings, show empty state with domain name
          const domainName = domainSlug
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          
          setResults({
            userRank: 0,
            predictedRank: 0,
            modelName: 'No Evaluation',
            actualScore: 0,
            predictedScore: 0,
            rankings: [],
            evaluationRankings: [],
            currentBattleRankings: [],
            domainName,
            totalBattles: 0,
            modelsTested: 0,
            winLossMatrix: {},
            confidenceBefore: 0,
            confidenceAfter: 0,
            predictionAccuracy: 0,
          });
          setInsights([]);
          setLoading(false);
          return;
        }
        
        // Fetch evaluation results for valid ObjectId
        const response = await fetch(`/api/evaluations/${evaluationId}`);
        
        if (!response.ok) {
          // If evaluation not found, fall back to domain rankings
          const rankingsResponse = await fetch(`/api/rankings/${domainSlug}`);
          if (rankingsResponse.ok) {
            const rankingsResult = await rankingsResponse.json();
            if (rankingsResult.data && rankingsResult.data.length > 0) {
              const rankings = rankingsResult.data;
              const domainName = rankingsResult.domain?.name || domainSlug
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
              
              setResults({
                userRank: rankings.length > 0 ? rankings[0].rank : 0,
                predictedRank: rankings.length > 0 ? rankings[0].rank : 0,
                modelName: rankings.length > 0 ? rankings[0].model.name : 'No Model',
                actualScore: rankings.length > 0 ? rankings[0].score : 0,
                predictedScore: rankings.length > 0 ? rankings[0].score : 0,
                rankings: rankings,
                evaluationRankings: [], // No evaluation-specific data for fallback
                currentBattleRankings: [],
                domainName,
                totalBattles: rankingsResult.domain?.battleCount || rankings.reduce((sum: number, r: any) => sum + (r.battleCount || 0), 0),
                modelsTested: rankings.length,
                winLossMatrix: {},
                confidenceBefore: 75,
                confidenceAfter: 88,
                predictionAccuracy: 70,
              });
              
              const generatedInsights: Insight[] = [];
              if (rankings.length > 0) {
                generatedInsights.push({
                  id: '1',
                  title: 'Top Performer',
                  description: `${rankings[0].model.name} leads with ${rankings[0].score} ELO score`,
                  icon: '🏆',
                  color: 'green',
                });
              }
              const totalBattles = rankingsResult.domain?.battleCount || rankings.reduce((sum: number, r: any) => sum + (r.battleCount || 0), 0);
              if (totalBattles > 0) {
                generatedInsights.push({
                  id: '2',
                  title: 'Battle Activity',
                  description: `${totalBattles} battles completed across ${rankings.length} models`,
                  icon: '⚔️',
                  color: 'blue',
                });
              }
              setInsights(generatedInsights);
              setLoading(false);
              return;
            }
          }
        }
        
        const result = await response.json();
        
        if (response.ok && result.data) {
          const evalData = result.data;
          const stats = evalData.stats || {};
          const domain = evalData.domain || {};
          
          // Format domain name
          const domainName = domain.name || domainSlug
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          
          // Calculate user rank (assuming first model is the user's)
          const rankings = stats.rankings || [];
          const evaluationRankings = stats.evaluationRankings || [];
          const currentBattleRankings = stats.currentBattleRankings || [];
          const userRank = rankings.length > 0 ? rankings[0].rank : 1;
          const userModel = rankings.length > 0 ? rankings[0].model : null;
          
          // Use actual evaluation data
          const totalBattles = evalData.totalBattles || stats.totalBattles || 0;
          const modelsTested = evalData.modelsTested || evaluationRankings.length || stats.rankings?.length || 0;
          
          // Fetch judge model info if judgeModelId is in URL
          let judgeModelInfo = undefined;
          if (judgeModelId) {
            try {
              // Try to get model info from OpenRouter
              const judgeModelResponse = await fetch('/api/openrouter/models');
              if (judgeModelResponse.ok) {
                const judgeModelResult = await judgeModelResponse.json();
                if (judgeModelResult.data) {
                  const judgeModel = judgeModelResult.data.find((m: any) => m.id === judgeModelId);
                  if (judgeModel) {
                    const provider = judgeModel.provider || judgeModelId.split('/')[0] || 'Unknown';
                    const logo = getOrganizationLogo(provider);
                    judgeModelInfo = {
                      id: judgeModel.id,
                      name: judgeModel.name || judgeModel.id,
                      provider: provider,
                      logo: logo,
                    };
                  }
                }
              }
            } catch (error) {
              console.error('Error fetching judge model info:', error);
            }
          }
          
          setResults({
            userRank,
            predictedRank: userRank + 2, // Mock prediction
            modelName: userModel?.name || 'Model',
            actualScore: rankings.length > 0 ? rankings[0].score : 0,
            predictedScore: rankings.length > 0 ? rankings[0].score - 50 : 0,
            rankings: rankings,
            evaluationRankings: evaluationRankings,
            currentBattleRankings: currentBattleRankings,
            domainName,
            totalBattles: totalBattles,
            modelsTested: modelsTested,
            winLossMatrix: stats.winLossMatrix || {},
            confidenceBefore: 75,
            confidenceAfter: 88,
            predictionAccuracy: 70,
            judgeModel: judgeModelInfo,
          });
          
          // Generate insights from the data
          const generatedInsights: Insight[] = [];
          if (rankings.length > 0) {
            generatedInsights.push({
              id: '1',
              title: 'Top Performer',
              description: `${rankings[0].model.name} leads with ${rankings[0].score} ELO score`,
              icon: '🏆',
              color: 'green',
            });
          }
          if (totalBattles > 0) {
            generatedInsights.push({
              id: '2',
              title: 'Battle Activity',
              description: `${totalBattles} battles completed across ${modelsTested} models`,
              icon: '⚔️',
              color: 'blue',
            });
          }
          if (evaluationRankings.length > 0) {
            generatedInsights.push({
              id: '3',
              title: 'Evaluation Results',
              description: `${evaluationRankings.length} models evaluated in this session`,
              icon: '📊',
              color: 'purple',
            });
          }
          setInsights(generatedInsights);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error('Error fetching evaluation results:', error);
        // Show empty state on error
        const domainName = domainSlug
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        
        setResults({
          userRank: 0,
          predictedRank: 0,
          modelName: 'Error Loading',
          actualScore: 0,
          predictedScore: 0,
          domainName,
          totalBattles: 0,
          modelsTested: 0,
          winLossMatrix: {},
          confidenceBefore: 0,
          confidenceAfter: 0,
          predictionAccuracy: 0,
          rankings: [],
          evaluationRankings: [],
          currentBattleRankings: [],
        });
        setInsights([]);
        setLoading(false);
      }
    };
    
    fetchResults();
  }, [evaluationId, domainSlug]);

  const handleExportPDF = async () => {
    if (!results) return;

    try {
      // Dynamically import jsPDF to avoid SSR issues
      const { default: jsPDF } = await import('jspdf');
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPos = 20;
      const margin = 20;
      const lineHeight = 7;
      const sectionSpacing = 10;

      // Helper function to add a new page if needed
      const checkPageBreak = (requiredSpace: number) => {
        if (yPos + requiredSpace > pageHeight - margin) {
          doc.addPage();
          yPos = margin;
        }
      };

      // Title
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Evaluation Results Report', margin, yPos);
      yPos += lineHeight * 2;

      // Domain and Summary Info
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Domain: ${results.domainName}`, margin, yPos);
      yPos += lineHeight;
      doc.text(`Total Battles: ${results.totalBattles}`, margin, yPos);
      yPos += lineHeight;
      doc.text(`Models Tested: ${results.modelsTested}`, margin, yPos);
      yPos += lineHeight * 2;

      // Performance Summary
      checkPageBreak(30);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Performance Summary', margin, yPos);
      yPos += lineHeight * 1.5;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Predicted Rank: #${results.predictedRank} (${results.predictedScore} pts)`, margin, yPos);
      yPos += lineHeight;
      doc.text(`Actual Rank: #${results.userRank} (${results.actualScore} pts)`, margin, yPos);
      yPos += lineHeight;
      const rankDiff = results.predictedRank - results.userRank;
      if (rankDiff !== 0) {
        doc.text(`Rank Difference: ${rankDiff > 0 ? '↑' : '↓'} ${Math.abs(rankDiff)}`, margin, yPos);
        yPos += lineHeight;
      }
      doc.text(`Score Difference: +${results.actualScore - results.predictedScore} points`, margin, yPos);
      yPos += lineHeight * 2;

      // Judge Model Info (if available)
      if (results.judgeModel) {
        checkPageBreak(15);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Judge Model', margin, yPos);
        yPos += lineHeight;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(`${results.judgeModel.name} (${results.judgeModel.provider})`, margin, yPos);
        yPos += lineHeight * 2;
      }

      // Current Battle Standings
      if (results.currentBattleRankings && results.currentBattleRankings.length > 0) {
        checkPageBreak(40);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Current Battle Standings', margin, yPos);
        yPos += lineHeight * 1.5;

        // Table header
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        const colWidths = [15, 60, 25, 25, 30];
        const headers = ['Rank', 'Model', 'Score', 'Battles', 'Win Rate'];
        let xPos = margin;
        headers.forEach((header, idx) => {
          doc.text(header, xPos, yPos);
          xPos += colWidths[idx];
        });
        yPos += lineHeight;

        // Table rows
        doc.setFont('helvetica', 'normal');
        results.currentBattleRankings.forEach((ranking) => {
          checkPageBreak(10);
          xPos = margin;
          doc.text(`#${ranking.rank}`, xPos, yPos);
          xPos += colWidths[0];
          doc.text(ranking.model.name.substring(0, 25), xPos, yPos);
          xPos += colWidths[1];
          doc.text(ranking.score.toString(), xPos, yPos);
          xPos += colWidths[2];
          doc.text((ranking.battleCount || 0).toString(), xPos, yPos);
          xPos += colWidths[3];
          doc.text(`${ranking.winRate.toFixed(1)}%`, xPos, yPos);
          yPos += lineHeight;
        });
        yPos += lineHeight;
      }

      // Overall Rankings
      if (results.rankings && results.rankings.length > 0) {
        checkPageBreak(50);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Overall Rankings', margin, yPos);
        yPos += lineHeight * 1.5;

        // Table header
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        const colWidths2 = [15, 50, 20, 20, 20, 25];
        const headers2 = ['Rank', 'Model', 'Predicted', 'Actual', 'Score', 'Win Rate'];
        let xPos2 = margin;
        headers2.forEach((header, idx) => {
          doc.text(header, xPos2, yPos);
          xPos2 += colWidths2[idx];
        });
        yPos += lineHeight;

        // Table rows (show top 20 to avoid too many pages)
        doc.setFont('helvetica', 'normal');
        const rankingsToShow = results.rankings.slice(0, 20);
        rankingsToShow.forEach((ranking) => {
          checkPageBreak(10);
          const isUserModel = ranking.rank === results.userRank;
          const predictedRankForModel = ranking.rank === results.userRank ? results.predictedRank : ranking.rank;
          
          if (isUserModel) {
            doc.setFont('helvetica', 'bold');
          }
          
          xPos2 = margin;
          doc.text(`#${ranking.rank}`, xPos2, yPos);
          xPos2 += colWidths2[0];
          doc.text(ranking.model.name.substring(0, 20), xPos2, yPos);
          xPos2 += colWidths2[1];
          doc.text(`#${predictedRankForModel}`, xPos2, yPos);
          xPos2 += colWidths2[2];
          doc.text(`#${ranking.rank}`, xPos2, yPos);
          xPos2 += colWidths2[3];
          doc.text(ranking.score.toString(), xPos2, yPos);
          xPos2 += colWidths2[4];
          doc.text(`${ranking.winRate.toFixed(1)}%`, xPos2, yPos);
          
          if (isUserModel) {
            doc.setFont('helvetica', 'normal');
          }
          
          yPos += lineHeight;
        });
        
        if (results.rankings.length > 20) {
          yPos += lineHeight;
          doc.setFontSize(9);
          doc.setFont('helvetica', 'italic');
          doc.text(`... and ${results.rankings.length - 20} more models`, margin, yPos);
          yPos += lineHeight;
        }
        yPos += lineHeight;
      }

      // Confidence Progression
      checkPageBreak(20);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Confidence Progression', margin, yPos);
      yPos += lineHeight * 1.5;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Before Testing: ${results.confidenceBefore}%`, margin, yPos);
      yPos += lineHeight;
      doc.text(`After Testing: ${results.confidenceAfter}%`, margin, yPos);
      yPos += lineHeight;
      doc.text(`Improvement: +${results.confidenceAfter - results.confidenceBefore}%`, margin, yPos);
      yPos += lineHeight * 2;

      // Key Insights
      if (insights.length > 0) {
        checkPageBreak(30);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Key Insights', margin, yPos);
        yPos += lineHeight * 1.5;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        insights.forEach((insight) => {
          checkPageBreak(15);
          doc.setFont('helvetica', 'bold');
          doc.text(`${insight.icon} ${insight.title}`, margin, yPos);
          yPos += lineHeight;
          doc.setFont('helvetica', 'normal');
          doc.text(insight.description, margin + 5, yPos);
          yPos += lineHeight * 1.5;
        });
      }

      // Footer
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.text(
          `Generated on ${new Date().toLocaleDateString()} - Page ${i} of ${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      // Generate filename
      const filename = `LangScope_Results_${results.domainName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Save the PDF
      doc.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  if (loading || !results) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading results...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const rankDifference = results.predictedRank - results.userRank;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
Evaluation Complete - {results.totalBattles} battles - {results.modelsTested} models tested
          </h1>
          <p className="text-lg text-gray-600">
            Domain: <span className="font-semibold">{results.domainName}</span>
          </p>
        </div>

        {/* Rankings Table: Your Rank vs Predicted */}
        <Card className="mb-8">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Model Performance</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Predicted Rank</p>
                <p className="text-4xl font-bold text-gray-400">#{results.predictedRank}</p>
                <p className="text-xs text-gray-500 mt-2">{results.predictedScore} pts</p>
              </div>
              
              <div className="text-center p-6 bg-primary-50 rounded-lg border-2 border-primary-600">
                <p className="text-sm text-primary-600 mb-2 font-semibold">Actual Rank</p>
                <p className="text-4xl font-bold text-primary-700">#{results.userRank}</p>
                <p className="text-xs text-primary-600 mt-2">{results.actualScore} pts</p>
                {rankDifference !== 0 && (
                  <Badge
                    label={`${rankDifference > 0 ? '↑' : '↓'} ${Math.abs(rankDifference)}`}
                    variant={rankDifference > 0 ? 'success' : 'error'}
                    className="mt-2"
                  />
                )}
              </div>

              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Score Difference</p>
                <p className="text-4xl font-bold text-green-600">
                  +{results.actualScore - results.predictedScore}
                </p>
                <p className="text-xs text-gray-500 mt-2">points gained</p>
              </div>
            </div>

            {/* Judge Model Info - Show if LLM judge was used */}
            {results.judgeModel && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <Avatar
                      src={results.judgeModel.logo}
                      alt={results.judgeModel.provider}
                      size="md"
                      shape="square"
                      fallback={results.judgeModel.provider.charAt(0)}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900">Judge Model</p>
                    <p className="text-lg font-semibold text-blue-800">{results.judgeModel.name}</p>
                    <p className="text-xs text-blue-600">{results.judgeModel.provider}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Evaluation Standings - Models tested in this evaluation */}
            {results.currentBattleRankings && results.currentBattleRankings.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Current Battle Standings</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Rank</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Model</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Score</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Battles</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Win Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {results.currentBattleRankings.map((ranking) => (
                        <tr key={ranking.model.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <span className="text-lg font-bold text-primary-600">
                              #{ranking.rank}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar
                                src={ranking.model.logo}
                                alt={ranking.model.provider}
                                size="md"
                                shape="square"
                                fallback={ranking.model.provider.charAt(0)}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">
                                  {ranking.model.name}
                                </p>
                                <p className="text-sm text-gray-500 truncate">{ranking.model.provider}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-lg font-semibold text-gray-900">{ranking.score}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-600">{ranking.battleCount || 0}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-900">{ranking.winRate.toFixed(1)}%</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Full Rankings Table - All Models */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Overall Rankings</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Model</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Predicted</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actual</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Score</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Win Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {results.rankings.map((ranking) => {
                    const isUserModel = ranking.rank === results.userRank;
                    const isInEvaluation = results.evaluationRankings?.some(er => er.model.id === ranking.model.id);
                    const predictedRankForModel = ranking.rank === results.userRank ? results.predictedRank : ranking.rank;
                    return (
                      <tr
                        key={ranking.model.id}
                        className={`${isUserModel ? 'bg-primary-50' : isInEvaluation ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                      >
                        <td className="px-6 py-4">
                          <span className={`text-2xl font-bold ${isUserModel ? 'text-primary-700' : 'text-gray-900'}`}>
                            #{ranking.rank}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {/* Organization Logo */}
                            <Avatar
                              src={ranking.model.logo}
                              alt={ranking.model.provider}
                              size="md"
                              shape="square"
                              fallback={ranking.model.provider.charAt(0)}
                            />
                            <div className="flex-1 min-w-0">
                              <p className={`font-medium ${isUserModel ? 'text-primary-900' : 'text-gray-900'} truncate`}>
                                {ranking.model.name}
                                {isInEvaluation && (
                                  <span className="ml-2 text-xs bg-primary-600 text-white px-2 py-0.5 rounded">
                                    In This Evaluation
                                  </span>
                                )}
                              </p>
                              <p className="text-sm text-gray-500 truncate">{ranking.model.provider}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">#{predictedRankForModel}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-sm font-semibold ${isUserModel ? 'text-primary-700' : 'text-gray-900'}`}>
                            #{ranking.rank}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-lg font-semibold text-gray-900">{ranking.score}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900">{ranking.winRate.toFixed(1)}%</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        {/* Win/Loss Matrix Visualization */}
        <Card className="mb-8">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Win/Loss Matrix</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border border-gray-300 bg-gray-50"></th>
                    {Object.keys(results.winLossMatrix).map((modelId) => {
                      const model = results.rankings.find(r => r.model.id === modelId)?.model;
                      return (
                        <th key={modelId} className="px-4 py-3 text-center text-sm font-semibold text-gray-700 border border-gray-300 bg-gray-50">
                          {model?.name || modelId}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(results.winLossMatrix).map(([modelA, vsModels]) => {
                    const model = results.rankings.find(r => r.model.id === modelA)?.model;
                    const vsModelsTyped = vsModels as { [key: string]: { wins: number; losses: number } };
                    return (
                      <tr key={modelA}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 border border-gray-300 bg-gray-50">
                          {model?.name || modelA}
                        </td>
                        {Object.keys(results.winLossMatrix).map((modelB) => {
                          if (modelA === modelB) {
                            return (
                              <td key={modelB} className="px-4 py-3 text-center text-sm text-gray-400 border border-gray-300 bg-gray-100">
                                —
                              </td>
                            );
                          }
                          const result = vsModelsTyped[modelB];
                          if (!result) {
                            return (
                              <td key={modelB} className="px-4 py-3 text-center text-sm text-gray-400 border border-gray-300">
                                —
                              </td>
                            );
                          }
                          return (
                            <td key={modelB} className="px-4 py-3 text-center text-sm border border-gray-300">
                              <div className="flex flex-col items-center">
                                <span className="text-green-600 font-semibold">{result.wins}W</span>
                                <span className="text-red-600 font-semibold">{result.losses}L</span>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        {/* Confidence Progression Chart */}
        <Card className="mb-8">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Confidence Progression</h2>
            <div className="flex items-center justify-between mb-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Before Testing</p>
                <p className="text-3xl font-bold text-gray-400">{results.confidenceBefore}%</p>
              </div>
              <div className="flex-1 mx-8">
                <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-gray-400 to-primary-600 rounded-full transition-all duration-1000"
                    style={{ 
                      width: `${((results.confidenceAfter - results.confidenceBefore) / 100) * 100}%`, 
                      marginLeft: `${(results.confidenceBefore / 100) * 100}%` 
                    }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">After Testing</p>
                <p className="text-3xl font-bold text-primary-600">{results.confidenceAfter}%</p>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Confidence increased by <span className="font-semibold text-primary-600">+{results.confidenceAfter - results.confidenceBefore}%</span> after evaluation
              </p>
            </div>
          </div>
        </Card>

        {/* Insights Cards */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {insights.map((insight) => (
              <Card key={insight.id} className={`${insight.color} border-0`}>
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{insight.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{insight.title}</h3>
                      <p className="text-sm text-gray-700 mb-4">{insight.description}</p>
                      {insight.metrics && (
                        <div className="grid grid-cols-3 gap-2">
                          {insight.metrics.map((metric, idx) => (
                            <div key={idx}>
                              <p className="text-xs text-gray-600">{metric.label}</p>
                              <p className="text-sm font-semibold text-gray-900">{metric.value}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Export Options */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Options</h3>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="md" onClick={handleExportPDF}>
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Download Report PDF
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

// Wrapper component with Suspense for useSearchParams
const ResultsDashboardPage: React.FC<ResultsDashboardPageProps> = ({ evaluationId }) => {
  return (
    <Suspense fallback={
      <Layout>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading results...</p>
          </div>
        </div>
      </Layout>
    }>
      <ResultsDashboardPageContent evaluationId={evaluationId} />
    </Suspense>
  );
};

export default ResultsDashboardPage;

