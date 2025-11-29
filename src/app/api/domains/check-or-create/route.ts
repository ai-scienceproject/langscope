import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import { getDomainBySlug, createDomain } from '@/lib/db/services/domainService';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { domainName } = body;

    if (!domainName) {
      return NextResponse.json(
        { error: 'Domain name is required' },
        { status: 400 }
      );
    }

    // Create slug from domain name
    const slug = slugify(domainName);

    // Check if domain exists
    const existingDomain = await getDomainBySlug(slug);

    if (existingDomain) {
      return NextResponse.json({
        exists: true,
        domain: {
          id: (existingDomain as any)._id?.toString() || (existingDomain as any).id?.toString(),
          name: (existingDomain as any).name,
          slug: (existingDomain as any).slug,
        },
      });
    }

    // Domain doesn't exist, create it
    const newDomain = await createDomain({
      name: domainName,
      slug: slug,
      description: `Domain for ${domainName}`,
      icon: '📄', // Default icon
      isActive: true,
    });

    return NextResponse.json({
      exists: false,
      domain: {
        id: (newDomain as any)._id?.toString() || (newDomain as any).id?.toString(),
        name: (newDomain as any).name,
        slug: (newDomain as any).slug,
      },
    });
  } catch (error: any) {
    console.error('Error checking/creating domain:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check or create domain' },
      { status: 500 }
    );
  }
}

