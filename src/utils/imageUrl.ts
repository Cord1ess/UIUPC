/**
 * imageUrl.ts — Universal image URL builder for wsrv.nl CDN.
 *
 * Accepts any image source (Google Drive file ID, Drive URL, Cloudinary URL,
 * Imgur, or any direct URL) and returns an optimized wsrv.nl URL with
 * WebP conversion + resizing + global CDN caching.
 *
 * This is the ONLY function the codebase should use to display images.
 * If the image backend changes in the future, only this file needs updating.
 */

const WSRV_BASE = "https://wsrv.nl/";

/**
 * Build an optimized image URL via wsrv.nl CDN.
 *
 * @param src - Google Drive file ID, Drive URL, or any image URL
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

  // Case 1: Google Drive file ID (20+ alphanumeric chars, no dots or slashes)
  if (/^[a-zA-Z0-9_-]{20,}$/.test(src) && !src.includes(".")) {
    sourceUrl = `https://lh3.googleusercontent.com/d/${src}`;
  }
  // Case 2: Google Drive share/view URL → extract file ID
  else if (src.includes("drive.google.com")) {
    const match = src.match(/[-\w]{25,}/);
    sourceUrl = match
      ? `https://lh3.googleusercontent.com/d/${match[0]}`
      : src;
  }
  // Case 3: Already a Cloudinary URL — strip old transforms, let wsrv.nl handle it
  else if (src.includes("res.cloudinary.com") && src.includes("/upload/")) {
    const parts = src.split("/upload/");
    const segments = parts[1].split("/");
    // Find the actual filename (last segment that doesn't look like a transform)
    const filename = segments.filter(
      (s) => !s.match(/^(c_|w_|h_|q_|f_|e_|dpr_|ar_|g_|fl_|l_|t_|a_)/)
    ).join("/");
    sourceUrl = `${parts[0]}/upload/${filename}`;
  }
  // Case 4: Any other URL — pass through as-is
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
  /** 100px — table thumbnails, avatars */
  THUMB: (src: string) => getImageUrl(src, 100, 60),
  /** 320px — preloader, small cards */
  SMALL: (src: string) => getImageUrl(src, 320, 70),
  /** 800px — gallery grid, content images */
  MEDIUM: (src: string) => getImageUrl(src, 800, 80),
  /** 1200px — hero detail, large previews */
  LARGE: (src: string) => getImageUrl(src, 1200, 85),
  /** 1600px — lightbox, full-screen modals */
  FULL: (src: string) => getImageUrl(src, 1600, 90),
  /** 1920px — hero backgrounds, cover images */
  HERO: (src: string) => getImageUrl(src, 1920, 85),
} as const;
