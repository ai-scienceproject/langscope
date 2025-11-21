import RankingsPage from '@/components/pages/RankingsPage'

export default async function Page({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params
  return <RankingsPage domainSlug={domain} />
}

