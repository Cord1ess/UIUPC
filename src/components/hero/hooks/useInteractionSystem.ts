/**
 * useInteractionSystem.ts — Drag-only interaction (no hover effects).
 *
 * Mouse hover does NOT influence the timeline.
 * Only explicit pointer drag affects velocity.
 * Momentum decays smoothly after release.
 */

import { useCallback, useRef, useEffect } from "react";
import { DRAG_SENSITIVITY, MOMENTUM_DECAY } from "../utils/constants";

interface InteractionCallbacks {
  setDragVelocity: (v: number) => void;
}

interface InteractionResult {
  onPointerDown: (e: React.PointerEvent) => void;
  gridOffset: React.MutableRefObject<{ x: number; y: number }>;
}

export function useInteractionSystem(
  callbacks: InteractionCallbacks
): InteractionResult {
  const isDraggingRef = useRef(false);
  const lastXRef = useRef(0);
  const momentumRef = useRef(0);
  const gridOffsetRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);

  // Momentum decay loop — runs continuously
  useEffect(() => {
    const decay = () => {
      if (!isDraggingRef.current) {
        if (Math.abs(momentumRef.current) > 0.0000005) {
          momentumRef.current *= MOMENTUM_DECAY;
          callbacks.setDragVelocity(momentumRef.current);
        } else {
          momentumRef.current = 0;
          callbacks.setDragVelocity(0);
        }
      }
      rafRef.current = requestAnimationFrame(decay);
    };
    rafRef.current = requestAnimationFrame(decay);
    return () => cancelAnimationFrame(rafRef.current);
  }, [callbacks]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Only respond to primary button
      if (e.button !== 0) return;

      isDraggingRef.current = true;
      lastXRef.current = e.clientX;

      const onPointerMove = (ev: PointerEvent) => {
        if (!isDraggingRef.current) return;
        const deltaX = ev.clientX - lastXRef.current;
        lastXRef.current = ev.clientX;

        const velocityDelta = deltaX * DRAG_SENSITIVITY;
        momentumRef.current = velocityDelta;
        callbacks.setDragVelocity(velocityDelta);

        // Grid micro-parallax
        gridOffsetRef.current = {
          x: gridOffsetRef.current.x + deltaX * 0.1,
          y: gridOffsetRef.current.y,
        };
      };

      const onPointerUp = () => {
        isDraggingRef.current = false;
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
      };

      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
    },
    [callbacks]
  );

  return { onPointerDown, gridOffset: gridOffsetRef };
}
