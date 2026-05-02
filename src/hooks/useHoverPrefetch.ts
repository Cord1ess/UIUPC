"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef } from "react";

/**
 * Custom hook for hover-based prefetching with a 3-page queue limit.
 * This helps maintain high performance without spamming the network.
 */
export function useHoverPrefetch() {
  const router = useRouter();
  const prefetchQueue = useRef<string[]>([]);
  const MAX_QUEUE_SIZE = 3;

  const prefetch = useCallback((path: string) => {
    // 1. Basic checks
    if (!path || path.startsWith("http") || path === "#") return;
    
    // 2. If already in queue, don't re-prefetch
    if (prefetchQueue.current.includes(path)) return;

    // 3. Add to queue
    prefetchQueue.current.push(path);

    // 4. Enforce limit by removing oldest (FIFO)
    if (prefetchQueue.current.length > MAX_QUEUE_SIZE) {
      prefetchQueue.current.shift();
    }

    // 5. Trigger the actual prefetch
    // Note: Next.js router.prefetch() is extremely efficient and low-priority.
    router.prefetch(path);
  }, [router]);

  return { prefetch };
}
