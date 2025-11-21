import ResultsDashboardPage from '@/components/pages/ResultsDashboardPage'

export default function Page({ params }: { params: { id: string } }) {
  return <ResultsDashboardPage evaluationId={params.id} />
}

