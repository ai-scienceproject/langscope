import { NextRequest, NextResponse } from 'next/server';
import { getModelById, getModelBySlug } from '@/lib/db/services/modelService';
import { getModelRanking } from '@/lib/db/services/rankingService';
import { getDomainBySlug } from '@/lib/db/services/domainService';
import { getBattleHistory } from '@/lib/db/services/battleService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const domainSlug = searchParams.get('domain');
    
    // Try to get model by ID first, then by slug
    let modelResult = await getModelById(id);
    if (!modelResult) {
      modelResult = await getModelBySlug(id);
    }
    
    if (!modelResult) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }
    
    // Handle case where result might be an array
    const model = Array.isArray(modelResult) ? modelResult[0] : modelResult;
    
    // Get ranking if domain is provided
    let ranking = null;
    let domain = null;
    if (domainSlug) {
      domain = await getDomainBySlug(domainSlug);
      if (domain) {
        const domainId = (domain as any)._id?.toString() || (domain as any).id?.toString();
        const modelId = (model as any)._id?.toString() || (model as any).id?.toString();
        if (domainId && modelId) {
          ranking = await getModelRanking(domainId, modelId);
        }
      }
    }
    
    // Get battle history if domain is provided
    let battleHistory: any[] = [];
    if (domain) {
      try {
        const domainId = (domain as any)._id?.toString() || (domain as any).id?.toString();
        const battleModelId = (model as any)._id?.toString() || (model as any).id?.toString();
        if (battleModelId && domainId) {
          const battles = await getBattleHistory(battleModelId, domainId);
          battleHistory = battles.map((battle: any) => {
            const modelAId = battle.modelAId?._id?.toString() || battle.modelAId?.toString() || '';
            const modelBId = battle.modelBId?._id?.toString() || battle.modelBId?.toString() || '';
            const isModelA = modelAId === battleModelId;
            
            return {
              id: battle._id?.toString() || battle._id || '',
              opponent: {
                id: isModelA ? modelBId : modelAId,
                name: isModelA 
                  ? (battle.modelBId?.name || 'Unknown')
                  : (battle.modelAId?.name || 'Unknown'),
              },
              domain: {
                id: battle.domainId?._id?.toString() || battle.domainId?.toString() || '',
                name: (battle.domainId as any)?.name || 'Unknown',
                slug: (battle.domainId as any)?.slug || '',
              },
              winner: battle.winner,
              createdAt: battle.createdAt,
            };
          });
        }
      } catch (error) {
        console.error('Error fetching battle history:', error);
        battleHistory = [];
      }
    }
    
    // Calculate stats from ranking
    const rankingData = Array.isArray(ranking) ? ranking[0] : ranking;
    const totalBattles = (rankingData as any)?.totalBattles || 0;
    const wins = (rankingData as any)?.wins || 0;
    const losses = (rankingData as any)?.losses || 0;
    const ties = (rankingData as any)?.ties || 0;
    
    // Transform to match frontend expectations
    const modelId = (model as any)._id?.toString() || (model as any).id?.toString() || id;
    const modelData = model as any;
    const transformedModel = {
      id: modelId,
      name: model.name,
      slug: model.slug,
      provider: (model.organizationId as any)?.name || 'Unknown',
      logo: '🤖',
      description: model.description || '',
      type: 'api-only' as const,
      contextLength: 128000,
      costPer1MTokens: modelData.pricing?.inputCostPer1MTokens || 0,
      verified: true,
      version: model.version,
      releaseDate: model.createdAt,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      strengths: modelData.strengths || [],
      weaknesses: modelData.weaknesses || [],
      pricing: modelData.pricing || {
        inputCostPer1MTokens: 0,
        outputCostPer1MTokens: 0,
      },
      ranking: rankingData ? {
        rank: (rankingData as any).rank,
        eloScore: (rankingData as any).eloScore,
        wins: (rankingData as any).wins,
        losses: (rankingData as any).losses,
        ties: (rankingData as any).ties,
        totalBattles: (rankingData as any).totalBattles,
        winRate: (rankingData as any).totalBattles > 0 
          ? ((rankingData as any).wins / (rankingData as any).totalBattles) * 100 
          : 0,
      } : null,
      stats: {
        totalBattles,
        wins,
        losses,
        ties,
        winRate: totalBattles > 0 ? (wins / totalBattles) * 100 : 0,
        averageScore: (rankingData as any)?.eloScore || 1500,
        eloRating: (rankingData as any)?.eloScore || 1500,
      },
      battleHistory: battleHistory.slice(0, 20), // Limit to 20 most recent
    };
    
    return NextResponse.json({ data: transformedModel });
  } catch (error) {
    console.error('Error fetching model:', error);
    return NextResponse.json(
      { error: 'Failed to fetch model' },
      { status: 500 }
    );
  }
}

