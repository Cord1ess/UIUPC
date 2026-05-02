"use client";

import React, { Suspense } from 'react';
import { usePageStore } from '@/store/usePageStore';
import EventsSkeleton from './EventsSkeleton';

/**
 * EventSuspense — A client-side wrapper that intelligently chooses 
 * the loading fallback based on user navigation history.
 */
export default function EventSuspense({ children }: { children: React.ReactNode }) {
  const alreadyVisited = usePageStore((state) => state.visitedPaths.has('/events'));

  return (
    <Suspense fallback={alreadyVisited ? null : <EventsSkeleton />}>
      {children}
    </Suspense>
  );
}
