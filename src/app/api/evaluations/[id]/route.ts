import { NextRequest, NextResponse } from 'next/server';
import { getEvaluationStats } from '@/lib/db/services/evaluationService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if this is a demo/evaluation ID (not a MongoDB ObjectId)
    if (id === 'demo' || id.startsWith('eval-')) {
      return NextResponse.json({ 
        error: 'Invalid evaluation ID. Please use a valid evaluation ID from the database.',
        message: 'The provided ID is not a valid MongoDB ObjectId. Evaluation IDs must be 24-character hex strings.'
      }, { status: 400 });
    }
    
    const stats = await getEvaluationStats(id);
    
    if (!stats) {
      return NextResponse.json({ error: 'Evaluation not found' }, { status: 404 });
    }

    // Transform to match frontend expectations
    const evaluation = (Array.isArray(stats.evaluation) ? stats.evaluation[0] : stats.evaluation) as any;
    const domain = evaluation.domainId as any;
    const domainName = domain.name || 
      (domain.slug ? domain.slug.split('-').map((w: string) => 
        w.charAt(0).toUpperCase() + w.slice(1)
      ).join(' ') : 'Unknown Domain');

    return NextResponse.json({
      data: {
        id: evaluation._id?.toString() || evaluation.id?.toString() || id,
        status: evaluation.status,
        totalBattles: stats.totalBattles,
        completedBattles: stats.completedBattles,
        modelsTested: stats.modelsTested,
        domain: {
          id: domain._id?.toString() || domain.id?.toString() || '',
          name: domainName,
          slug: domain.slug,
          description: domain.description,
          icon: domain.icon,
        },
        stats: {
          rankings: stats.rankings,
          totalBattles: stats.totalBattles,
          winLossMatrix: stats.winLossMatrix,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching evaluation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch evaluation' },
      { status: 500 }
    );
  }
}
