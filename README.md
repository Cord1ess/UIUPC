# UIU Photography Club (Next.js 15)

A high-performance administrative and public-facing portal for the UIU Photography Club, recently migrated to **Next.js 15 (App Router)** for enhanced performance, SEO, and developer experience.

## Recent Migration (Next.js 15)

We have successfully migrated the legacy Create React App (CRA) codebase to Next.js 15. Key improvements include:
- **App Router Architecture**: Leverages modern React Server Components and nested layouts for efficient routing.
- **Improved SEO**: Dynamic metadata implementation for all public routes (Gallery, Blog, Events, etc.).
- **Enhanced Performance**: Native Next.js image optimization and Turbopack for lightning-fast development.
- **Standardized Configuration**: Environment variables have been unified under the `NEXT_PUBLIC_` prefix for unified client/server access.
- **Robust Image Handling**: Implemented custom error-handling and fallback logic across the entire platform to handle Cloudinary asset availability gracefully.

## Technical Stack

- **Framework**: Next.js 15 (App Router), TypeScript
- **Authentication**: Firebase Auth (with AuthContext provider)
- **Database**: Cloud Firestore
- **Backend Middleware**: Google Apps Script (GAS) integration for Sheets/Drive management.
- **Media**: Cloudinary
- **Animations**: Framer Motion
- **Styling**: Vanilla CSS (modular design tokens)

## Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm / yarn / pnpm

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure Environment Variables:
   Create a `.env.local` file based on the provided template and ensure all `NEXT_PUBLIC_` variables are set.

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Admin Panel
Authorized administrators can access the management hub at `/admin` after logging in via `/login`. The panel provides controls for:
- Membership Application Management
- Shutter Stories (Photo) Submissions
- Gallery & Blog publishing
- Results & Payments tracking

---
© 2026 UIU Photography Club. All rights reserved.
