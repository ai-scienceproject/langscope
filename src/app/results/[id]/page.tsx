import ResultsDashboardPage from '@/components/pages/ResultsDashboardPage'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <ResultsDashboardPage evaluationId={id} />
}

