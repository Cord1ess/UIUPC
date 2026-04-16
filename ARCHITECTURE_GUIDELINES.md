# UIUPC Architecture & Optimization Guidelines

This document serves as the absolute baseline blueprint for extending the UIUPC Next.js 16 application. Whenever introducing new routes, modifying elements, or creating dense UI structures, strictly adhere to the following principles derived from the optimized Homepage architecture.

---

## 1. The Rendering Pipeline

To prevent massive Javascript payloads blocking render paths, we rely heavily on the **Server Component Pattern**.

### Rule 1: Default to Server Components
Never use `"use client"` unless a component explicitly requires:
- `useState`, `useEffect`, `useRef`, or other React hooks.
- Access to browser-api functions (`window`, `localStorage`, `IntersectionObserver`).
- Client-bound event listeners (`onClick`, `onChange`).

### Rule 2: Server-Side Data Fetching Bypasses Loading Spinners
We no longer fetch initialization sets via `useSWR` in pure Client components if we can avoid it.
- Before rendering data-dense cards (like `FeaturedGallery` or `UpcomingEvents`), execute `async/await` Firebase functions directly inside a Server Component wrapper.
- Export your raw fetchers inside `/lib/fetchers.ts` strictly keeping them detached from `useSWR` modules.
- Feed the pre-fetched objects natively into the purely-visual Client UI (`<EventList events={preloadedData} />`). This mathematically eliminates the Firebase Client SDK cost, streaming populated HTML to the device on frame 1.

---

## 2. Advanced Typography Handling (Zero-CLS)

We bypassed standard web fonts in favor of Next.js heavily cached `next/font`.

### Rule 1: No Native Import
Do **not** import `@import url('GoogleFonts')` directly into CSS documents. This introduces render-blocking cycles natively called Cumulative Layout Shifts (CLS).

### Rule 2: Accessing Fonts Structurally
Our fonts are attached structurally via Tailwind V4 Custom Variables assigned in `layout.tsx`.
- Apply `font-sans` to invoke `DM Sans` gracefully.
- Apply `font-serif` to invoke `Playfair Display`.
- Apply typographic classes specifically with `.tracking-tighter` tracking structures to mimic high-end corporate identity.

---

## 3. Dark Mode & Tailwind Variant Matrix

Tailwind V4 natively enforces Operating System themes, which conflicts with our explicit Context Switcher.

### Rule 1: Rely on `dark:` Prefix
In `index.css`, we successfully enforced a strict listener: `@variant dark (&:where(.dark, .dark *));`. 
Always write color variants explicitly:
```tsx
  {/* Correct Theme Handling */}
  <h2 className="text-zinc-900 dark:text-white">Title</h2>
```

### Rule 2: The `ScrollRevealText` Bug Fix Standard
If chaining `framer-motion` reveal sequences with Theme values, never rely on `key={theme}`. Standardize the component using the `hasAnimated` `useState` technique mapped onto `IntersectionObserver`, allowing framer motion to unlock static HTML structures after playing once. This prevents animation thrashing toggles.

---

## 4. DOM Asset Distribution

### Rule 1: Dynamic Import Fences
If you drop a heavy dependency (like `framer-motion`) below the user's initial screen scroll (the "Fold"), import it lazily in your `page.tsx` matrix:
```tsx
const ComplexInteractive = dynamic(() => import('@/com/ComplexInteractive'));
```
The browser will only download that chunk when the user hits the trigger, maintaining a perfect 100/100 initial PageSpeed Insights score.

### Rule 3: Cloudinary Dynamic Transcoding
For all Cloudinary-sourced images, **always** implement next-gen format transcoding. This slashed LCP from 11.1s to <2s on the homepage.
- **`f_auto`**: Automatically deliver AVIF or WebP based on user browser support.
- **`q_auto`**: Automatically optimize compression without visible quality loss.
- **`c_scale,w_XXX`**: Always request a specific width to prevent wasteful full-res downloads.

**Standard URL helper pattern:**
```tsx
const getCloudinaryUrl = (baseUrl, width) => {
  return baseUrl.replace('/upload/', `/upload/c_scale,w_${width},q_auto,f_auto/`);
};
```

*Note: Ensure any new image hostnames (like Unsplash or Drive) are whitelisted in `next.config.ts`.*
---

## 5. Curated Editorial Layouts & Media Standards

Derived from the Events feature overhaul, these rules ensure stylistic parity between the Homepage and all internal routes.

### Rule 1: Seamless Background Palette
Standardize `bg-[#f9f5ea]` (Biege) for light mode and `bg-[#121212]` (Deep Charcoal) for dark mode.
- Avoid nesting feature sections in secondary background colors (like `bg-white/40`) unless strictly required for depth.
- Aim for a "single-sheet" aesthetic across the entire route to eliminate visual fragmentation during the scroll.

### Rule 2: The Square Media Standard (1:1)
For photography-first content (Events, Gallery, Committee):
- Prioritize `aspect-square` (1:1) ratios for posters and spotlight media.
- This creates a modern, Instagram-adjacent visual rhythm that highlights the framing of the photograph.
- **Implementation**: Ensure 1:1 images scale to `w-full` on mobile while maintaining the ratio.

### Rule 3: Editorial Fluidity (Cards vs. Direct)
- **Primary Features**: Render content directly onto the background without "card" bounding boxes or borders.
- **Secondary Archives**: Use cards (with `rounded-2xl` or `rounded-3xl` corners) only for dense grid lists (like "The Vault") to differentiate between "current stories" and "historical data".

### Rule 4: Micro-Animation Consistency
- **Apply `ScrollRevealText`** to **ALL** <h1>, <h2>, and featured <h3> titles across the application.
- This ensures that as a user navigates from the Homepage, the brand's "voice" (the word-by-word reveal) remains consistent across every section.
- **Sync**: Always use `as="h1/h2/h3"` props to maintain proper SEO heading hierarchy within the animation component.
