# Cloudinary → Google Drive Migration Plan

## Current State

### What Cloudinary does right now
- **8 hardcoded hero images** in [constants.ts](file:///d:/Jonayed/UIUPC/src/features/home/components/hero/utils/constants.ts) as `res.cloudinary.com` URLs
- **On-the-fly transformation** via `getCloudinaryUrl()` — appends `/c_scale,w_{width},q_{quality},f_auto/` to URLs for resizing + WebP conversion
- Used in **6 files**: ModernHero, PhotoShowcase, GalleryView, MemberCard, Events pages, Archive pages, GlobalLoader
- **No Cloudinary account/API key** in `.env` — it's purely URL-based (free tier public URLs)

### What Google Drive already does
- **Photo submissions** upload to Google Drive via Google Apps Script (`NEXT_PUBLIC_GAS_PHOTOS`)
- **Image proxy API** exists at [/api/image/[fileId]](file:///d:/Jonayed/UIUPC/src/app/api/image/%5BfileId%5D/route.ts) — fetches from Drive, returns with 30-day cache headers

---

## The Honest Assessment

> [!IMPORTANT]
> **Google Drive is NOT a CDN.** It's a file storage service. Using it as your primary image host for a public website introduces real problems:
> - **Rate limiting** — Google throttles automated requests; heavy traffic = broken images
> - **No on-the-fly transforms** — No resize, no WebP conversion, no quality control
> - **Slow** — Drive URLs go through redirects before serving the file
> - **Fragile** — URLs can break if sharing settings change

Your current Cloudinary setup is actually **free** (you're using public URLs, no API key needed) and gives you on-the-fly WebP + resize. The smart move isn't to replace Cloudinary — it's to **keep Google Drive for storage** (originals) and use something else as the delivery layer.

---

## Recommended Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────┐
│  Google Drive    │     │  Next.js Image   │     │   Vercel     │
│  (Storage)       │────▶│  Optimization    │────▶│   Edge CDN   │────▶ User
│  Original Hi-Res │     │  (WebP + Resize) │     │  (Cached)    │
└─────────────────┘     └──────────────────┘     └──────────────┘
```

### How it works:
1. **Google Drive** = your archive. High-res originals live here (you already do this for submissions)
2. **Next.js `<Image />`** = your transformer. It fetches via your `/api/image/[fileId]` proxy, converts to WebP, and resizes automatically
3. **Vercel Edge CDN** = your delivery. Caches the optimized images globally (already built into Vercel)

**This gives you everything you wanted:**
- ✅ Original high-res stored in Google Drive
- ✅ Automatic WebP conversion
- ✅ Automatic resizing to fit the display context
- ✅ CDN caching for fast global delivery
- ✅ No Cloudinary dependency
- ✅ No monthly costs (within Vercel's free tier image optimization limits)

---

## Implementation Plan

### Phase 1: Upload Hero Images to Google Drive
**Effort: 15 min**

1. Create a Google Drive folder: `UIUPC/Website/Hero`
2. Upload the 8 hero images there
3. Set sharing to "Anyone with the link can view"
4. Collect the file IDs from the share URLs

### Phase 2: Build the Image Utility
**Effort: 30 min**

Replace `getCloudinaryUrl()` with a new `getImageUrl()` that works with both Drive IDs and legacy Cloudinary URLs (for a safe transition):

```typescript
// src/utils/imageUrl.ts

/**
 * Universal image URL builder.
 * - Google Drive file IDs → proxied through /api/image/[fileId]
 * - Legacy Cloudinary URLs → passed through as-is (temporary)
 * - Regular URLs → passed through as-is
 */
export function getImageUrl(src: string): string {
  // Google Drive file ID (not a URL)
  if (/^[a-zA-Z0-9_-]{25,}$/.test(src)) {
    return `/api/image/${src}`;
  }
  // Already a full URL — pass through
  return src;
}
```

> [!NOTE]
> The real WebP conversion + resizing happens via Next.js `<Image />` component, not in the URL builder. The URL builder just resolves where the original lives.

### Phase 3: Update the Image Proxy
**Effort: 20 min**

Enhance the existing `/api/image/[fileId]/route.ts` with:
- Better error handling for Drive rate limits
- Fallback behavior
- Content-type sniffing

### Phase 4: Replace Cloudinary URLs
**Effort: 45 min**

Update these files to use Google Drive file IDs instead of Cloudinary URLs:

| File | What to change |
|------|---------------|
| `constants.ts` | Replace 8 hardcoded `res.cloudinary.com` URLs with Drive file IDs |
| `ModernHero.tsx` | Replace `getCloudinaryUrl()` calls with `getImageUrl()` |
| `PhotoShowcase.tsx` | Same |
| `GalleryView.tsx` | Same |
| `MemberCard.tsx` | Same |
| `ImagePreviewModal.tsx` | Same |
| `GlobalLoader.tsx` | Same |
| `Admin_Archive.tsx` | Same |
| `events/page.tsx` | Replace hardcoded Cloudinary URLs + utility calls |
| `events/[eventId]/page.tsx` | Same |
| `archive/page.tsx` | Same |
| `layout.tsx` | Remove Cloudinary preconnect hints, add your domain |

### Phase 5: Use Next.js `<Image />` Where Possible
**Effort: 1 hour**

For maximum performance, convert critical `<img>` tags to Next.js `<Image />`:
- Hero images (highest impact)
- Gallery thumbnails
- Event cover images

This gives you **automatic WebP, lazy loading, responsive srcset, and blur placeholders** — all cached by Vercel's CDN.

### Phase 6: Cleanup
**Effort: 10 min**

- Delete the `getCloudinaryUrl()` function
- Remove `failedUrls` set if no longer needed
- Update `next.config.ts` to add your domain to `images.remotePatterns`

---

## What NOT to Do

> [!CAUTION]
> - **Don't serve gallery/submission images from Drive directly** — those are user-uploaded high-res files. Use Supabase Storage or keep Cloudinary for user content.
> - **Don't put Drive file IDs in the database** — store the full proxy URL (`/api/image/FILE_ID`) so it's self-contained.
> - **Don't remove Cloudinary support immediately** — keep the fallback for a transition period in case anything breaks.

---

## Cost Analysis

| Service | Current Cost | After Migration |
|---------|-------------|----------------|
| Cloudinary | $0 (free public URLs) | $0 (removed) |
| Google Drive | $0 (15 GB free) | $0 (same) |
| Vercel Image Optimization | $0 (1000/mo free tier) | $0 (within limits) |
| **Total** | **$0** | **$0** |

> [!TIP]
> If you exceed Vercel's 1000 image optimization/month on the free tier, consider keeping Cloudinary for the hero images only (it's free and fast) and using Drive + proxy for everything else.

---

## Decision Needed

Before I start building, I need you to confirm:

1. **Do you want me to proceed with this plan?** (Drive for storage → Next.js Image for transforms → Vercel CDN for delivery)
2. **Have you already uploaded the hero images to Google Drive?** If not, I'll need the file IDs once you do.
3. **Gallery/submission photos** — should these stay on Google Drive (current) or move to Supabase Storage?
