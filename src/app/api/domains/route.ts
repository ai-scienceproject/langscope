import { NextRequest, NextResponse } from 'next/server';
import { getDomains, getDomainBySlug } from '@/lib/db/services/domainService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (slug) {
      const domain = await getDomainBySlug(slug);
      if (!domain) {
        return NextResponse.json({ error: 'Domain not found' }, { status: 404 });
      }
      return NextResponse.json({ data: domain });
    }

    const domains = await getDomains();
    return NextResponse.json({ data: domains });
  } catch (error) {
    console.error('Error fetching domains:', error);
    return NextResponse.json(
      { error: 'Failed to fetch domains' },
      { status: 500 }
    );
  }
}

