import ArenaBattlePage from '@/components/pages/ArenaBattlePage'

export default async function Page({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params
  return <ArenaBattlePage domainSlug={domain} />
}

