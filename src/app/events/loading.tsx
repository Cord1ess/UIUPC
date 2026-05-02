import React from 'react';
import EventsSkeleton from '@/features/events/components/EventsSkeleton';

/**
 * loading.tsx — The Next.js native loading state.
 * This ensures that navigation to /events is INSTANT on the client-side,
 * showing the skeleton the moment the user clicks the link.
 */
export default function Loading() {
  return <EventsSkeleton />;
}
