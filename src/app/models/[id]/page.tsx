'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams } from 'next/navigation';
import ModelDetailsModal from '@/components/model/ModelDetailsModal';
import Layout from '@/components/layout/Layout';
import { Skeleton } from '@/components/ui/Skeleton';

function ModelPageContent() {
  const params = useParams();
  const modelId = params.id as string;
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    // Open modal automatically when page loads
    setModalOpen(true);
  }, [modelId]);

  const handleClose = () => {
    setModalOpen(false);
    // Redirect back to rankings after closing
    window.history.back();
  };

  return (
    <>
      <Layout>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <Skeleton variant="rectangular" className="h-12 w-64 mx-auto mb-4" />
            <Skeleton variant="rectangular" className="h-6 w-48 mx-auto" />
          </div>
        </div>
      </Layout>
      <ModelDetailsModal
        isOpen={modalOpen}
        onClose={handleClose}
        modelId={modelId}
      />
    </>
  );
}

export default function ModelPage() {
  return (
    <Suspense fallback={
      <Layout>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading model...</p>
          </div>
        </div>
      </Layout>
    }>
      <ModelPageContent />
    </Suspense>
  );
}

