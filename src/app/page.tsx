import { getDomains } from '@/lib/db/services/domainService';
import HomePage from '@/components/pages/HomePage';
import type { Domain } from '@/types';

// Disable caching to ensure fresh data on every page load
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Page() {
  // Fetch domains on the server for faster initial load
  let domains: Domain[] = [];
  try {
    const domainsData = await getDomains();
    domains = domainsData.map((domain: any): Domain => ({
      id: domain._id?.toString() || domain.id,
      name: domain.name,
      slug: domain.slug,
      description: domain.description || '',
      icon: domain.icon || '📄',
      battleCount: domain.battleCount || 0,
      modelCount: domain.modelCount || 0,
      featured: false,
      color: '#64748b',
      isActive: domain.isActive,
      createdAt: new Date(domain.createdAt),
      updatedAt: new Date(domain.updatedAt),
    }));
    // Sort domains by battle count in descending order
    domains.sort((a, b) => (b.battleCount || 0) - (a.battleCount || 0));
  } catch (error) {
    console.error('Error fetching domains on server:', error);
  }

  return <HomePage initialDomains={domains} />
}

