# UIUPC Administrative Dashboard

A high-performance administrative and public-facing portal for the UIU Photography Club. This system facilitates photo submissions, member management, and event exhibitions through a secure, modular architecture.

## Core Features

- Photo Submission Engine: Streamlined multi-file upload with progress tracking and submission windows.
- Dynamic Gallery: Real-time photo exhibitions with automated state-driven filtering and pagination.
- Admin Central: Secure management hub for membership applications, blog posts, and exhibition results.
- Automated Results Publishing: Direct integration between Google Sheets and the public-facing results portal.

## Technical Architecture

- Frontend: React 18 with modern functional hooks and Context API for global state management.
- Backend Integration: Google Apps Script (GAS) acting as a serverless middleware between the frontend and Google-based data storage (Sheets/Drive).
- Database & Auth: Firebase Authentication and Cloud Firestore for high-speed administrative data access.
- Styling: Centralized vanilla CSS design tokens for consistent brand identity across all pages.

## Performance Optimization

- Route-Based Lazy Loading: Comprehensive implementation of React.lazy for all primary pages to minimize initial bundle size.
- Resource Management: Deferral of off-screen images using native browser lazy loading for high-bandwidth galleries.
- Bundle Reduction: Removal of hardcoded mock data in favor of dynamic API-driven state.
- CSS Normalization: Elimination of redundant design tokens and variable blocks to ensure efficient style inheritance.

## Security Standards

- Environment Isolation: Critical API endpoints and service credentials are managed strictly through environment variables.
- Log Auditing: All production debug logs and sensitive data footprints have been stripped from the client-side bundle.
- Access Control: Multi-level administrative protection via Firebase Auth and protected route wrappers.

## Getting Started

### Prerequisites

- Node.js (v16.x or higher)
- npm or yarn

### Installation

1. Install dependencies:
   npm install

2. Start the development server:
   npm start

3. Build for production:
   npm run build

## Deployment

The application is optimized for deployment on Vercel or Netlify. Ensure all environment variables listed in .env.local are configured in your hosting provider's dashboard.

---
Copyright (c) 2026 UIU Photography Club. All rights reserved.
