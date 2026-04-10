/**
 * GridCanvas.tsx — Subtle design-canvas grid background.
 *
 * Renders a pure white background with light gray grid lines (40px spacing).
 * Supports a center "bulge" effect that activates during the transition phase.
 */

"use client";

import React from "react";
import { GRID_SPACING, GRID_COLOR } from "./utils/constants";
import type { AnimationPhase } from "./hooks/useTimelineEngine";

interface GridCanvasProps {
  phase: AnimationPhase;
  gridOffset?: { x: number; y: number }; // For micro-parallax during drag
}

const GridCanvas: React.FC<GridCanvasProps> = ({ phase, gridOffset = { x: 0, y: 0 } }) => {
  // Bulge opacity: fades in during transition, 1 during normal
  const bulgeOpacity = phase === "transition" ? 0.5 : 1;

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {/* Primary grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: "#ffffff",
          backgroundImage: `
            linear-gradient(to right, ${GRID_COLOR} 1px, transparent 1px),
            linear-gradient(to bottom, ${GRID_COLOR} 1px, transparent 1px)
          `,
          backgroundSize: `${GRID_SPACING}px ${GRID_SPACING}px`,
          backgroundPosition: `${gridOffset.x}px ${gridOffset.y}px`,
          willChange: "background-position",
        }}
      />

      {/* Center bulge — a slightly scaled region in the center */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 h-full pointer-events-none transition-opacity duration-1000"
        style={{
          width: "40%",
          opacity: bulgeOpacity * 0.4,
          backgroundImage: `
            linear-gradient(to right, ${GRID_COLOR} 1px, transparent 1px),
            linear-gradient(to bottom, ${GRID_COLOR} 1px, transparent 1px)
          `,
          backgroundSize: `${GRID_SPACING * 1.08}px ${GRID_SPACING * 1.08}px`,
          backgroundPosition: `${gridOffset.x}px ${gridOffset.y}px`,
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 70%)",
        }}
      />
    </div>
  );
};

export default GridCanvas;
