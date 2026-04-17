/**
 * useCurvePath.ts — Hand-crafted gentle curve matching the user's drawing.
 *
 * The path enters from the left at ~25% height, curves gently downward
 * through the center zone at ~45% height, and exits right at ~50% height.
 * This is NOT random — it's a fixed, deliberately shaped path.
 *
 * Uses cubic Bezier interpolation between hand-placed control points.
 */

import { useMemo } from "react";

interface Point {
  x: number;
  y: number;
}

/**
 * Cubic Bezier interpolation for smooth curve segments.
 */
function cubicBezier(
  p0: Point,
  p1: Point,
  p2: Point,
  p3: Point,
  t: number
): Point {
  const u = 1 - t;
  const u2 = u * u;
  const u3 = u2 * u;
  const t2 = t * t;
  const t3 = t2 * t;

  return {
    x: u3 * p0.x + 3 * u2 * t * p1.x + 3 * u * t2 * p2.x + t3 * p3.x,
    y: u3 * p0.y + 3 * u2 * t * p1.y + 3 * u * t2 * p2.y + t3 * p3.y,
  };
}

export interface CurvePath {
  /** Map normalized t (0 → 1) to pixel coordinates */
  getPointAtT: (t: number, vw: number, vh: number) => Point;
}

export function useCurvePath(): CurvePath {
  const getPointAtT = useMemo(() => {
    return (t: number, vw: number, vh: number): Point => {
      // Fixed control points (normalized 0–1 for both axes)
      // Matching the user's drawing:
      //   - Enters from left at ~25% height
      //   - Dips down gently through center (~45%)
      //   - Exits right at ~48% height

      // Extend beyond viewport for smooth entry/exit
      const extendedT = -0.05 + t * 1.1; // maps 0→1 to -0.05→1.05

      // Segment 1: Entry → Center approach (left half)
      // Segment 2: Center → Exit (right half)

      let point: Point;
      const isMobile = vw < 768;

      if (extendedT < 0.5) {
        // Left segment
        const segT = extendedT / 0.5;
        
        // On mobile, center the curve at y: 0.50 with a very gentle wave
        const pts = isMobile 
          ? [ { x: -0.15, y: 0.45 }, { x: 0.10, y: 0.47 }, { x: 0.25, y: 0.50 }, { x: 0.50, y: 0.50 } ]
          : [ { x: -0.15, y: 0.15 }, { x: 0.10, y: 0.18 }, { x: 0.25, y: 0.45 }, { x: 0.50, y: 0.48 } ];
          
        point = cubicBezier(pts[0], pts[1], pts[2], pts[3], segT);
      } else {
        // Right segment
        const segT = (extendedT - 0.5) / 0.5;
        
        // On mobile, center the curve at y: 0.50 with a very gentle wave
        const pts = isMobile
          ? [ { x: 0.50, y: 0.50 }, { x: 0.70, y: 0.53 }, { x: 0.90, y: 0.48 }, { x: 1.15, y: 0.45 } ]
          : [ { x: 0.50, y: 0.48 }, { x: 0.70, y: 0.55 }, { x: 0.90, y: 0.40 }, { x: 1.15, y: 0.35 } ];
          
        point = cubicBezier(pts[0], pts[1], pts[2], pts[3], segT);
      }

      return {
        x: point.x * vw,
        y: point.y * vh,
      };
    };
  }, []);

  return { getPointAtT };
}
