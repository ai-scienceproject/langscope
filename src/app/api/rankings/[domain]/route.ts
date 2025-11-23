import { NextRequest, NextResponse } from 'next/server';
import { getRankingsByDomain } from '@/lib/db/services/rankingService';
import { getDomainBySlug } from '@/lib/db/services/domainService';
import { getOrganizationLogo } from '@/lib/utils/modelIcons';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ domain: string }> }
) {
  try {
    const { domain: domainSlug } = await params;
    
    // Get domain by slug
    const domainResult = await getDomainBySlug(domainSlug);
    if (!domainResult) {
      return NextResponse.json({ error: 'Domain not found' }, { status: 404 });
    }
    
    // Handle case where result might be an array
    const domain = Array.isArray(domainResult) ? domainResult[0] : domainResult;
    const domainId = (domain as any)._id?.toString() || (domain as any).id?.toString();
    if (!domainId) {
      return NextResponse.json({ error: 'Invalid domain ID' }, { status: 500 });
    }
    
    // Get rankings for this domain
    const rankings = await getRankingsByDomain(domainId);
    
    // Transform to match frontend expectations
    const transformedRankings = rankings
      .filter((ranking: any) => ranking.modelId) // Filter out rankings without populated modelId
      .map((ranking: any) => {
        const modelId = ranking.modelId?._id?.toString() || ranking.modelId?.toString() || '';
        const model = ranking.modelId || {};
        const organization = (model.organizationId as any) || {};
        const organizationName = organization.name || 'Unknown';
        const modelName = model.name || 'Unknown Model';
        const modelSlug = model.slug || '';
        
        // Get organization logo
        const organizationLogo = getOrganizationLogo(organizationName);
        
        return {
          rank: ranking.rank || 0,
          previousRank: ranking.rank || 0, // You can add previous rank tracking later
          model: {
            id: modelId,
            name: modelName,
            slug: modelSlug,
            provider: organizationName,
            logo: organizationLogo, // Use organization logo
            description: model.description || '',
            type: 'api-only' as const,
            contextLength: 128000,
            costPer1MTokens: 0,
            verified: true,
            releaseDate: model.createdAt || new Date(),
            createdAt: model.createdAt || new Date(),
            updatedAt: model.updatedAt || new Date(),
          },
          score: ranking.eloScore || 0,
          uncertainty: 15,
          battleCount: ranking.totalBattles || 0,
          winRate: ranking.totalBattles > 0 
            ? ((ranking.wins || 0) / ranking.totalBattles) * 100 
            : 0,
          domain: {
            id: domainId,
            name: (domain as any).name || '',
            slug: (domain as any).slug || '',
            description: (domain as any).description || '',
            icon: (domain as any).icon || '📄',
            isActive: (domain as any).isActive !== false,
            createdAt: (domain as any).createdAt || new Date(),
            updatedAt: (domain as any).updatedAt || new Date(),
          },
          lastUpdated: ranking.updatedAt || new Date(),
        };
      });
    
    return NextResponse.json({ 
      data: transformedRankings,
      domain: {
        id: domainId,
        name: (domain as any).name,
        slug: (domain as any).slug,
        description: (domain as any).description,
        icon: (domain as any).icon,
        modelCount: transformedRankings.length,
        battleCount: transformedRankings.reduce((sum, r) => sum + r.battleCount, 0),
        isActive: (domain as any).isActive,
        createdAt: (domain as any).createdAt,
        updatedAt: (domain as any).updatedAt,
      }
    });
  } catch (error: any) {
    console.error('Error fetching rankings:', error);
    const errorMessage = error?.message || 'Failed to fetch rankings';
    const errorStack = error?.stack || '';
    console.error('Error details:', { message: errorMessage, stack: errorStack });
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? errorStack : undefined
      },
      { status: 500 }
    );
  }
}

