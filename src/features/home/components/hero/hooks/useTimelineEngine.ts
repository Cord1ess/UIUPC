/**
 * useTimelineEngine.ts — Core animation engine using direct DOM manipulation.
 *
 * KEY PERFORMANCE CHANGE: No React state updates per frame.
 * All positions, velocities, and transforms are computed in refs.
 * The hook exposes a `tick()` function that the parent calls inside
 * its own rAF loop and applies the results directly to DOM elements.
 *
 * Fixes:
 *  - No blur (removed entirely)
 *  - No overlap outside focus zone (train-like spacing)
 *  - Spread out inside focus zone (images expand apart)
 *  - Smooth, non-jittery movement
 *  - Mouse hover does NOT affect velocity
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  IMAGE_COUNT,
  ROTATION_RANGE,
  BASE_VELOCITY,
  FOCUS_ZONE_WIDTH,
  SCALE_MIN,
  SCALE_MAX,
  FOCUS_LIFT_PX,
  FOCUS_SPREAD_FACTOR,
  CHAOTIC_SPREAD_X,
  CHAOTIC_SPREAD_Y,
  CHAOTIC_ROTATION_SPREAD,
  IMAGE_WIDTH,
  buildImagePool,
  type HeroImage,
} from "../utils/constants";
import { useCurvePath } from "./useCurvePath";

// ─── Types ────────────────────────────────────────────────────

export type AnimationPhase = "transition" | "normal";

export interface ComputedEntry {
  imageIndex: number;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
  zIndex: number;
  focusFactor: number;
  isVisible: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────

function smoothstep(x: number): number {
  const t = Math.max(0, Math.min(1, x));
  return t * t * (3 - 2 * t);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// ─── Hook ─────────────────────────────────────────────────────

export function useTimelineEngine(isPaused: boolean = false) {
  const [phase, setPhase] = useState<AnimationPhase>("transition");
  const phaseRef = useRef<AnimationPhase>("transition");
  const phaseStartRef = useRef(0);
  const positionsRef = useRef<number[]>([]);
  const baseRotationsRef = useRef<number[]>([]);
  const chaosXRef = useRef<number[]>([]);
  const chaosYRef = useRef<number[]>([]);
  const chaosRotRef = useRef<number[]>([]);
  const dragVelocityRef = useRef(0);
  const lastTickRef = useRef(0);
  const startedRef = useRef(false);
  const hoveredIndexRef = useRef<number | null>(null);
  const hoverScalesRef = useRef<number[]>([]);
  const targetShiftRef = useRef(0);

  const curvePath = useCurvePath();

  const [activeImageCount, setActiveImageCount] = useState(IMAGE_COUNT);

  // Set count dynamically and listen for resizes (important for Chrome DevTools toggling)
  useEffect(() => {
    const handleResize = () => {
      setActiveImageCount(window.innerWidth < 768 ? Math.floor(IMAGE_COUNT * 0.7) : IMAGE_COUNT);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const imagePool = useMemo(() => buildImagePool(activeImageCount), [activeImageCount]);

  // ─── Initialization Logic ──────────────────────────────────
  useEffect(() => {
    const positions: number[] = [];
    const rotations: number[] = [];
    const cx: number[] = [];
    const cy: number[] = [];
    const cr: number[] = [];
    // Structured Distribution: Assign images to non-overlapping slots
    for (let i = 0; i < activeImageCount; i++) {
      positions.push(i / activeImageCount);
      rotations.push((Math.random() - 0.5) * 2 * ROTATION_RANGE);
      
      // Deterministic staggered grid offsets
      // Use alternating patterns to ensure no two neighbors share the same cloud space
      const laneY = (i % 4); // 4 vertical lanes
      const laneX = (i % 2 === 0) ? 1 : -1; // alternate left/right chaos
      
      cx.push(laneX * (0.5 + Math.random() * 0.5)); 
      cy.push((laneY - 1.5) / 1.5); // Spread across [-1, 1] range in 4 bands
      cr.push((Math.random() - 0.5) * 2);
    }
    positionsRef.current = positions;
    baseRotationsRef.current = rotations;
    chaosXRef.current = cx;
    chaosYRef.current = cy;
    chaosRotRef.current = cr;
    hoverScalesRef.current = new Array(activeImageCount).fill(1);
  }, [activeImageCount]);

  const setDragVelocity = useCallback((v: number) => {
    dragVelocityRef.current = v;
  }, []);

  const setHoveredIndex = useCallback((index: number | null) => {
    hoveredIndexRef.current = index;
  }, []);

  const seekToImage = useCallback((index: number) => {
    if (index < 0 || index >= positionsRef.current.length) return;
    const currentPos = positionsRef.current[index];
    const targetPos = 0.5;
    
    let delta = targetPos - currentPos;
    if (delta > 0.5) delta -= 1;
    if (delta < -0.5) delta += 1;

    targetShiftRef.current += delta;
  }, []);

  /**
   * tick() — Called every frame from the parent's rAF loop.
   * Returns an array of computed transforms to apply to DOM elements.
   * DOES NOT trigger React re-renders.
   */
  const tick = useCallback(
    (now: number, vw: number, vh: number): ComputedEntry[] => {
      if (positionsRef.current.length === 0) return []; // Wait for initialization

      // Initialize timing on first tick
      if (!startedRef.current) {
        startedRef.current = true;
        phaseStartRef.current = now;
        lastTickRef.current = now;
      }

      const dt = isPaused ? 0 : Math.min(now - lastTickRef.current, 50);
      lastTickRef.current = now;

      // ── Smooth Seeking Offset ──
      const shiftStep = targetShiftRef.current * 0.12; 
      targetShiftRef.current -= shiftStep;

      const elapsed = now - phaseStartRef.current;
      const lerpFactor = Math.min(dt / 100, 1); // For smooth hover transitions

      // ── Phase management (only triggers re-render on phase change) ──
      // Transition from reveal (transition) to normal state after 2 seconds
      if (phaseRef.current === "transition" && elapsed > 2000) {
        phaseRef.current = "normal";
        setPhase("normal");
      }

      // ── Responsive Adjustments ──
      const isMobile = vw < 768;
      const mobMult = isMobile ? 0.6 : 1.0;
      
      // On mobile, moderate both axes — the centered curve gives enough room
      const adaptiveChaosX = isMobile ? CHAOTIC_SPREAD_X * 0.5 : CHAOTIC_SPREAD_X * mobMult;
      const adaptiveChaosY = isMobile ? CHAOTIC_SPREAD_Y * 0.8 : CHAOTIC_SPREAD_Y * mobMult;
      
      // Space out images dramatically inside the focus zone on mobile to avoid crowding
      const adaptiveSpread = isMobile ? 1 + (FOCUS_SPREAD_FACTOR * 1.4) : 1 + (FOCUS_SPREAD_FACTOR - 1);
      // Allow the center image to grow slightly less on mobile compared to before (0.75x) 
      const adaptiveScaleMax = isMobile ? SCALE_MAX * 0.75 : SCALE_MAX;

      // ── Velocity ──
      // Constant velocity now, no rush
      let velocity = BASE_VELOCITY;

      // Add drag velocity (only when explicitly dragging)
      velocity += dragVelocityRef.current;

      // ── Focus multiplier ──
      // Center zone effects only "pop up" after a delay (1.8s)
      const focusDelay = 1800;
      let focusMult = 0;
      if (elapsed > focusDelay) {
        const t = Math.min((elapsed - focusDelay) / 400, 1);
        // Swift burst ease-out (exponential)
        focusMult = 1 - Math.pow(1 - t, 4);
      }


      // ── Entrance Reveal ──
      // Total duration for all images to reveal sequentially
      const totalRevealTime = 800; // Snappier reveal
      const revealProgress = Math.min(elapsed / totalRevealTime, 1);


      // ── Advance positions ──
      const positions = positionsRef.current;
      for (let i = 0; i < positions.length; i++) {
        let nextPos = (positions[i] + velocity * dt + shiftStep) % 1;
        if (nextPos < 0) nextPos += 1;
        positions[i] = nextPos;
      }

      // ── Sort by position for proper train ordering ──
      const sortedIndices = positions
        .map((pos, idx) => ({ pos, idx }))
        .sort((a, b) => a.pos - b.pos)
        .map((item) => item.idx);

      // ── Compute screen positions with focus spread ──
      const centerX = vw / 2;
      const halfZone = (FOCUS_ZONE_WIDTH * vw) / 2;

      const entries: ComputedEntry[] = [];

      for (let i = 0; i < imagePool.length; i++) {
        // Use the updated position from positionsRef
        const pos = positions[i];
        const point = curvePath.getPointAtT(pos, vw, vh);

        // Focus factor: Apply a 'feathered' falloff
        // By squaring the raw input, we create a much more gradual ramp-up at the edges
        const distFromCenter = Math.abs(point.x - centerX);
        const rawFocus = Math.max(0, 1 - distFromCenter / halfZone);
        const featheredFocus = Math.pow(rawFocus, 2); // Feather logic
        const focusFactor = smoothstep(featheredFocus) * focusMult;

        // ── Spacing adjustment: SPREAD OUT inside focus zone ──
        const dirFromCenter = point.x - centerX;
        const spreadOffset = dirFromCenter * focusFactor * (adaptiveSpread - 1);
        
        // ── Interaction: Hover scale effect ──
        const targetHoverScale = i === hoveredIndexRef.current ? 1.15 : 1.0;
        hoverScalesRef.current[i] = lerp(
          hoverScalesRef.current[i] || 1,
          targetHoverScale,
          lerpFactor
        );

        // Final Scale: base * adaptive * hover
        const scale = lerp(SCALE_MIN, adaptiveScaleMax, focusFactor) * hoverScalesRef.current[i];

        // ── Deterministic Layering (Anti-Overlap Slots) ──
        // The core path is maintained, but we apply the pre-calculated
        // staggered bands to ensure images flow in distinct "lanes"
        const chaoticX = chaosXRef.current[i] * adaptiveChaosX * focusFactor;
        const chaoticY = chaosYRef.current[i] * adaptiveChaosY * focusFactor;
        const chaoticRot = chaosRotRef.current[i] * CHAOTIC_ROTATION_SPREAD * focusFactor;

        // No more %3 lanes in tick, we rely on the init bands
        const liftY = lerp(0, -FOCUS_LIFT_PX, focusFactor) + chaoticY;
        const adjustedX = point.x + spreadOffset + chaoticX;

        // Rotation
        const rotation = lerp(baseRotationsRef.current[i], chaoticRot, focusFactor);

        // Opacity: True domino effect sequential reveal
        const threshold = i / imagePool.length;
        const individualReveal = Math.max(0, Math.min(1, (revealProgress - threshold) * imagePool.length * 2));
        const opacity = individualReveal;

        // Clamp Y within hero boundaries
        const finalY = Math.max(20, Math.min(vh - 20, point.y + liftY));

        // Z-Index: Proximity-Based Layering
        // This solves "phasing" by making the image closest to the literal 
        // center of the lens always on top of others.
        const distZFactor = 1 - Math.min(distFromCenter / (vw * 0.5), 1);
        let zIndex = Math.floor(distZFactor * 1000); // 0 -> 1000 range
        
        // Minor scenic depth based on Y
        zIndex += Math.floor((finalY / vh) * 20);
        
        // Removed hover boost to keep layering natural

        // Performance: Culling check (is it even on or near the screen?)
        // Margins for scale and chaotic spread
        const isVisible = adjustedX > -IMAGE_WIDTH * 2 && adjustedX < vw + IMAGE_WIDTH * 2;

        entries.push({
          imageIndex: i,
          x: adjustedX,
          y: finalY,
          scale, 
          rotation,
          opacity,
          zIndex,
          focusFactor,
          isVisible,
        });
      }

      return entries;
    },
    [curvePath]
  );

  return { 
    tick, 
    phase, 
    imagePool, 
    setDragVelocity, 
    setHoveredIndex,
    seekToImage 
  };
}
