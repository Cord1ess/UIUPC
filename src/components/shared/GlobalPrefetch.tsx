"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/**
 * GlobalPrefetch — Automatically prefetches Next.js routes on hover.
 * Maintains a 3-page "recent" queue to avoid network bloat.
 */
export default function GlobalPrefetch() {
  const router = useRouter();
  const prefetchQueue = useRef<string[]>([]);
  const MAX_QUEUE_SIZE = 3;

  useEffect(() => {
    const handleMouseOver = (e: MouseEvent) => {
      // Find the nearest link element
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");

      if (anchor) {
        const href = anchor.getAttribute("href");

        // 1. Filter out external links, hashes, and non-Next.js paths
        if (
          !href || 
          href.startsWith("http") || 
          href.startsWith("mailto:") || 
          href.startsWith("tel:") || 
          href === "#" ||
          href.startsWith("#")
        ) {
          return;
        }

        // 2. Prevent duplicate prefetching in the same session queue
        if (prefetchQueue.current.includes(href)) return;

        // 3. Add to FIFO queue
        prefetchQueue.current.push(href);
        if (prefetchQueue.current.length > MAX_QUEUE_SIZE) {
          prefetchQueue.current.shift();
        }

        // 4. Trigger Next.js prefetch
        router.prefetch(href);

        // 5. Elite Optimization: Speculation Rules API (Chrome 108+)
        // This performs a FULL pre-render of the next page.
        if (HTMLScriptElement.supports && HTMLScriptElement.supports('speculationrules')) {
          const specScriptId = 'speculation-rules-engine';
          let specScript = document.getElementById(specScriptId) as HTMLScriptElement;
          
          if (!specScript) {
            specScript = document.createElement('script');
            specScript.id = specScriptId;
            specScript.type = 'speculationrules';
            document.head.appendChild(specScript);
          }

          // Update speculation rules to match our recent queue
          specScript.textContent = JSON.stringify({
            prerender: [{
              source: 'list',
              urls: prefetchQueue.current
            }]
          });
        }
      }
    };

    document.addEventListener("mouseover", handleMouseOver);
    return () => document.removeEventListener("mouseover", handleMouseOver);
  }, [router]);

  return null; // Invisible utility component
}
