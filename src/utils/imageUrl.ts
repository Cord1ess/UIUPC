/**
 * imageUrl.ts — Universal image URL builder for wsrv.nl CDN.
 *
 * Accepts any image source (Google Drive file ID, Drive URL, or any direct URL) 
 * and returns an optimized wsrv.nl URL with WebP conversion + resizing.
 *
 * This is the ONLY function the codebase should use to display images.
 */

const WSRV_BASE = "https://wsrv.nl/";

/**
 * Build an optimized image URL via wsrv.nl CDN.
 *
 * @param src - Google Drive file ID, Drive URL, or any direct image URL
 * @param width - Desired width in pixels (default: 800)
 * @param quality - WebP quality 1-100 (default: 80)
 * @returns Optimized wsrv.nl URL string
 */
export function getImageUrl(
  src: string,
  width: number = 800,
  quality: number = 80
): string {
  if (!src) return "";

  let sourceUrl: string;

  // Case 1: Google Drive file ID
  if (/^[a-zA-Z0-9_-]{20,}$/.test(src) && !src.includes(".")) {
    sourceUrl = `https://lh3.googleusercontent.com/d/${src}`;
  }
  // Case 2: Google Drive share/view URL
  else if (src.includes("drive.google.com")) {
    const match = src.match(/[-\w]{25,}/);
    sourceUrl = match
      ? `https://lh3.googleusercontent.com/d/${match[0]}`
      : src;
  }
  // Case 3: Any other direct URL
  else {
    sourceUrl = src;
  }

  const params = new URLSearchParams({
    url: sourceUrl,
    w: width.toString(),
    output: "webp",
    q: quality.toString(),
  });

  return `${WSRV_BASE}?${params.toString()}`;
}

/**
 * Get a raw/original image URL without any optimization.
 * Useful for download links and full-resolution previews.
 */
export function getRawImageUrl(src: string): string {
  if (!src) return "";

  // Google Drive file ID
  if (/^[a-zA-Z0-9_-]{20,}$/.test(src) && !src.includes(".")) {
    return `https://lh3.googleusercontent.com/d/${src}`;
  }
  // Google Drive URL without export param
  if (src.includes("drive.google.com") && !src.includes("export=view")) {
    const match = src.match(/[-\w]{25,}/);
    if (match)
      return `https://lh3.googleusercontent.com/d/${match[0]}`;
  }
  return src;
}

/**
 * Convenience presets for common sizes used across the site.
 * Usage: ImageSize.MEDIUM(driveFileId)
 */
export const ImageSize = {
  /** 100px — table thumbnails, avatars (Low quality for speed) */
  THUMB: (src: string) => getImageUrl(src, 100, 50),
  /** 320px — preloader, small cards (Optimized for mobile) */
  SMALL: (src: string) => getImageUrl(src, 400, 60),
  /** 800px — gallery grid, content images (Standard balance) */
  MEDIUM: (src: string) => getImageUrl(src, 800, 75),
  /** 1200px — hero detail, large previews (High fidelity) */
  LARGE: (src: string) => getImageUrl(src, 1200, 85),
  /** 1600px — lightbox, full-screen modals */
  FULL: (src: string) => getImageUrl(src, 1600, 85),
  /** 1920px — hero backgrounds, cover images */
  HERO: (src: string) => getImageUrl(src, 1920, 80),
} as const;
