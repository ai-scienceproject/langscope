import { NextRequest, NextResponse } from 'next/server';
import { getRankingsByDomain } from '@/lib/db/services/rankingService';
import { getDomainBySlug } from '@/lib/db/services/domainService';
import { getModels } from '@/lib/db/services/modelService';
import { getOrganizationLogo } from '@/lib/utils/modelIcons';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ domain: string }> }
) {
  try {
    const { domain: domainSlug } = await params;
    
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
    
    const rankings = await getRankingsByDomain(domainId);
    
    // If there are rankings, return them as standings
    if (rankings.length > 0) {
      const standings = rankings
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
            modelId,
            model: {
              id: modelId,
              name: modelName,
              slug: modelSlug,
              provider: organizationName,
              logo: organizationLogo,
              description: model.description || '',
              type: 'api-only' as const,
              contextLength: 128000,
              costPer1MTokens: 0,
              verified: true,
              releaseDate: model.createdAt || new Date(),
              createdAt: model.createdAt || new Date(),
              updatedAt: model.updatedAt || new Date(),
            },
            rank: ranking.rank || 0,
            score: ranking.eloScore || 0,
            battles: ranking.totalBattles || 0,
            change: 0, // You can add rank change tracking later
          };
        });
      
      return NextResponse.json({ data: standings });
    }
    
    // If no rankings exist (0 battles), return all available models as standings
    // This allows battles to start even when there are no previous battles
    const allModels = await getModels({ isActive: true });
    
    const standings = allModels
      .filter((model: any) => model) // Filter out null/undefined models
      .map((model: any, index: number) => {
        const modelId = model._id?.toString() || model.id?.toString() || '';
        const organization = (model.organizationId as any) || {};
        const organizationName = organization.name || 'Unknown';
        const modelName = model.name || 'Unknown Model';
        const modelSlug = model.slug || '';
        
        // Get organization logo
        const organizationLogo = getOrganizationLogo(organizationName);
        
        return {
          modelId,
          model: {
            id: modelId,
            name: modelName,
            slug: modelSlug,
            provider: organizationName,
            logo: organizationLogo,
            description: model.description || '',
            type: 'api-only' as const,
            contextLength: 128000,
            costPer1MTokens: 0,
            verified: true,
            releaseDate: model.createdAt || new Date(),
            createdAt: model.createdAt || new Date(),
            updatedAt: model.updatedAt || new Date(),
          },
          rank: index + 1,
          score: 1000, // Default starting ELO score
          battles: 0,
          change: 0,
        };
      });
    
    return NextResponse.json({ data: standings });
  } catch (error) {
    console.error('Error fetching standings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch standings' },
      { status: 500 }
    );
  }
}

