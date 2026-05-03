/**
 * constants.ts — Image pool and tuning parameters for the ModernHero timeline.
 */

// ─── Image Pool ───────────────────────────────────────────────
import { HeroImage, getImageUrl, ImageSize, getRawImageUrl } from "@/types";

export { getImageUrl, ImageSize, getRawImageUrl };
export type { HeroImage };

/** Global registry of URLs that failed to load — never retry these */
export const failedUrls = new Set<string>();

const FALLBACK_IMAGE: Omit<HeroImage, "id"> = { 
  url: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4", 
  title: "UIUPC Campus", 
  photographer: "UIUPC", 
  isHorizontal: true 
};

export function buildImagePool(count: number): HeroImage[] {
  const pool: HeroImage[] = [];
  for (let i = 0; i < count; i++) {
    pool.push({
      id: i,
      ...FALLBACK_IMAGE
    });
  }
  return pool;
}

// ─── Tuning Parameters ───────────────────────────────────────

/** Total number of images in the timeline loop */
export const IMAGE_COUNT = 50;

/** Base dimensions of each image card (px) */
export const IMAGE_WIDTH = 110;
export const IMAGE_HEIGHT = 150;

/** Dimensions for horizontal images */
export const IMAGE_WIDTH_H = 180;
export const IMAGE_HEIGHT_H = 130;

/** Scale range: outside focus zone vs peak inside */
export const SCALE_MIN = 0.35; // Small enough to not overlap even with 50 images
export const SCALE_MAX = 1.6;

/** Rotation jitter (degrees) - applies outside focus zone */
export const ROTATION_RANGE = 2;

/** Base velocity — smooth and steady */
export const BASE_VELOCITY = 0.000009;

/** Focus zone — fraction of viewport width, centered (green circle in drawing) */
export const FOCUS_ZONE_WIDTH = 0.6;

/** Vertical lift for focused images (px) */
export const FOCUS_LIFT_PX = 20;

/** Spacing between images along the path (normalized) */
export const IMAGE_SPACING = 1 / IMAGE_COUNT;

/**
 * How much extra spacing to ADD inside the focus zone.
 */
export const FOCUS_SPREAD_FACTOR = 2.4;

/** Chaotic spread inside focus zone (px) */
export const CHAOTIC_SPREAD_X = 280;
export const CHAOTIC_SPREAD_Y = 240;
export const CHAOTIC_ROTATION_SPREAD = 15;

/** Grid line spacing (px) */
export const GRID_SPACING = 40;
export const GRID_COLOR = "#eaeaea";

/** Drag sensitivity multiplier */
export const DRAG_SENSITIVITY = 0.000015;

/** Momentum decay per frame */
export const MOMENTUM_DECAY = 0.96;
