# UIUPC Website Technical Improvement Plan

Based on the architectural analysis of the current UIUPC (United International University Photography Club) React application, we have identified several critical areas for improvement regarding security, code maintainability, and application performance. 

Below is a proposed 5-phase implementation plan to fix critical issues and modernize the web application.

> [!IMPORTANT]
> **User Review Required** 
> Please review the 5 phases below and let me know if you approve this roadmap or if there are specific sections you'd like to prioritize/change.

---

## The Current File Structure (Analyzed Baseline)
Before proceeding with improvements, here is the summarized map of the structure we analyzed to formulate this plan:
```text
uiupc-website/
├── src/
│   ├── firebase.js              <- Core Firebase Auth/Firestore config
│   ├── App.js                   <- Main routing and prop-drilling
│   ├── index.js                 <- React Entry point
│   ├── contexts/
│   │   └── AuthContext.js       <- User session management
│   ├── pages/                   <- 22 files (Page-level Routes)
│   │   ├── Admin.js             <- 1300+ line Monolithic Admin Dashboard
│   │   ├── Home.js, Gallery.js, etc.
│   ├── components/              <- 40 files (Reusable UI & Admin chunks)
│   │   ├── Navbar.js, HeroSlider.js
│   │   └── ResultsManagement.js, PhotoSubmissions.js
│   └── styles/                  <- Global styles
```

---

## 5-Phase Improvement Plan

### Phase 1: Security & Environment Variables
**Goal:** Prevent sensitive keys and Google Apps Script endpoints from leaking into source control and the public bundle.
- **[MODIFY]** Extract the Firebase config object in `src/firebase.js` into `.env` (e.g., `REACT_APP_FIREBASE_API_KEY`).
- **[MODIFY]** Extract all 6 Google Apps Script URLs from the monolithic `Admin.js` into `.env` variables to obscure them from plain text.
- **[NEW]** Update `.gitignore` to ensure `.env.local` or `.env` files are not checked into the repository (if not already strictly enforced).

### Phase 2: Refactoring & Component Splitting (Technical Debt)
**Goal:** Break down monolithic files to make the codebase manageable. `Admin.js` is nearly 1,300 lines long, which makes fixing bugs highly prone to regressions.
- **[MODIFY]** Refactor `src/pages/Admin.js`. Extract its massive internal helper functions (CSV exporters, Email Senders, API fetchers) into a new directory: `src/utils/adminServices.js`.
- **[MODIFY]** Move the embedded modals (Email Modal, Result Details Modal) inside `Admin.js` into their own dedicated child components (e.g., `src/components/admin/EmailModal.js`).
- **[MODIFY]** Centralize the Google Apps Script fetch logic into a reusable custom hook (e.g., `useGoogleSheetData.js`) to remove redundant `fetch()` blocks.

### Phase 3: State Management & Data Fetching Performance
**Goal:** Stop prop-drilling from `App.js` and remove raw `useEffect` API calls which lack built-in caching.
- **[NEW]** Introduce **React Query (TanStack Query)** or **SWR**.
- **[MODIFY]** Replace the raw `useEffect` fetches in `App.js` (for featured photos and events) with React Query. This caches the data so users don't see a loading spinner every time they switch pages.
- **[MODIFY]** Apply React Query to the Admin panel to automatically handle loading states, success handlers, and data invalidation when an admin updates a student's status.

### Phase 4: Bundle Optimization & Code Splitting
**Goal:** Speed up the initial page load for regular visitors. The public bundle shouldn't load hefty admin tools if the user isn't an admin.
- **[MODIFY]** Update `src/App.js` routing to implement `React.lazy()` and `Suspense`.
- Wrap the `<Admin />` route and all its heavy nested components (`ResultsManagement`, `PhotoSubmissions`) in a lazy load wrapper.
- **[MODIFY]** Optimize `@cloudinary/react` and `framer-motion` imports to ensure they are treeshaken effectively.

### Phase 5: Backend Unification (Long-Term Strategy)
**Goal:** Phase out Google Apps Script. While GAS connecting to Google Sheets is a great free MVP, it suffers from CORS issues, slow response times, and difficult error tracing.
- **[PLAN]** Migrate the data currently stored in Google Sheets (Membership forms, Photo contest registrations, Gallery links) natively into **Firebase Firestore**, which is already configured for the app.
- **[PLAN]** Replace GAS Email triggers with a dedicated Node.js service (like Firebase Cloud Functions + SendGrid) to dispatch confirmation and rejection emails instantly and securely.

---

## Open Questions for the User
> [!WARNING]  
> 1. Are there immediate bugs in production you want resolved as part of Phase 1 or 2?
> 2. Do you agree with phasing out Google Apps Script in favor of Firebase Firestore (Phase 5), or is sticking to the free Google Sheets approach a strict requirement for the club?
> 3. Should we proceed with **Phase 1** and **Phase 2** right away?
