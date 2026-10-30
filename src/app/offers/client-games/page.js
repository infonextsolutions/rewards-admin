'use client';

import { Suspense } from 'react';
import ClientGamesModule from '@/components/client-games/ClientGamesModule';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function ClientGamesPage() {
  // useSearchParams needs a Suspense boundary for the production build
  return (
    <Suspense fallback={<LoadingSpinner message="Loading..." />}>
      <ClientGamesModule />
    </Suspense>
  );
}
