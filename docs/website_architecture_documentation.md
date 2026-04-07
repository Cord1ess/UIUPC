# UIUPC Website Architecture & File Structure Documentation

This document provides a comprehensive overview of the UIUPC (United International University Photography Club) website. It breaks down the frontend architecture, backend services, data flow, and file structure phase by phase.

## 1. High-Level Architecture
The project is a Single Page Application (SPA) built using **React** (bootstrapped with Create React App).

### Tech Stack
- **Frontend Framework**: React.js (v19)
- **Routing**: `react-router-dom` 
- **Styling**: Vanilla CSS (Component-level scoped `.css` files)
- **Animations/Icons**: `framer-motion`, `react-icons`
- **Primary Backend/Auth**: Firebase (Authentication & Cloud Firestore)
- **Secondary Backend/Database**: Google Apps Script (used as a REST API to connect with Google Sheets for form submissions, memberships, and emails)
- **Media Hosting**: Cloudinary (integrated via `@cloudinary/react`) & Firebase Storage

---

## 2. Global Application Flow (`src/App.js` & `src/index.js`)

- `index.js` acts as the entry point, rendering the `<App />` wrapped in `<React.StrictMode>`.
- `App.js` is the core layout wrapper. It controls:
    1. **Routing Strategy**: Combines public routes (`/`, `/gallery`, `/events`) with protected routes (`/admin`) and authenticated-redirect routes (`/login`).
    2. **Global Contexts**: Wraps the entire application inside the `<AuthProvider>` to track user sessions.
    3. **Initial Data Fetching**: Retrieves `featuredPhotos` and upcoming `events` directly from Firebase Firestore upon mount so they are quickly available to the `Home` page.
    4. **Scroll Management**: Uses a custom `<ScrollToTop />` component to reset scroll position on route changes.

---

## 3. Backend Integrations

The website runs on a hybrid backend, split between Firebase and Google Apps Script endpoints.

### Firebase (`src/firebase.js`)
- **Authentication (`getAuth`)**: Manages the admin login system.
- **Firestore (`getFirestore`)**: Stores essential dynamic data like events and featured public photos.
- **Storage (`getStorage`)**: Handles unstructured media uploads.

### Google Apps Script (GAS) API
Discovered within `src/pages/Admin.js`, the platform relies heavily on Google Apps Script endpoints to act as lightweight serverless functions. These scripts connect the frontend to Google Sheets and automate email sending.

**Defined endpoints include:**
- `membership`: Handles club membership applications.
- `photos`: Processes photo submissions for contests or events.
- `email`: Automates email dispatching (e.g., submission confirmations or renaming requests).
- `gallery`, `blog`, `results`: Specific endpoints for managing secondary application data.

---

## 4. File Structure Breakdown

### A. Contexts (`src/contexts/`)
- **`AuthContext.js`**: React Context that listens to Firebase's `onAuthStateChanged`. It provides a globally accessible `user` object and a `loading` state to protect private routes like the Admin dashboard.

### B. Pages (`src/pages/`)
Each file directly maps to a route in the application:
- **`Home.js`**: Landing page containing Hero section, features, stats, and a preview of upcoming events. 
- **`Admin.js`**: The central dashboard for authenticated users. It is deeply complex, pulling data from the GAS APIs to allow club admins to manage submissions, send emails via templates, and export data to CSV.
- **`Events.js` & `EventDetail.js`**: Pages to list all club events and show specific details for a targeted event.
- **`Gallery.js`**, **`Blog.js`**: Standard archive pages showcasing photos and posts.
- **`Members.js`**, **`Committee2026.js`**: Dedicated pages displaying the current/past executive committees and general club members.
- **`Contact.js`**, **`Join.js`**: Outward-facing pages utilizing forms (EmailJS or GAS backend) for communication or joining the club.
- **`Login.js`**: Handles authentication for entering the admin zone.

### C. Components (`src/components/`)
A vast folder containing modular pieces of the UI, broken into sensible categories:
- **Core UI**: `Navbar.js`, `Footer.js`, `Loading.js`, `FilterBar.js`.
- **Layout & Visuals**: `HeroSlider.js`, `PhotoGrid.js`, `PhotoShowcase.js`, `Lightbox.js`, `Stats.js`.
- **Member Management**: `MemberCard.js`, `ExecutiveCommittee.js`, `PreviousCommittee.js`, `MemberOfTheMonth.js`.
- **Forms**: `PhotoSubmissionForm.js` (often bound to specific event IDs via routing).
- **Admin Dashboard Modules**: `Admin.js` heavily imports from this sub-group to render specific management tabs:
  - `ResultsManagement.js`
  - `BlogManagement.js`
  - `GalleryUpload.js`
  - `MembershipApplications.js`
  - `PhotoSubmissions.js`

### D. Styles (`src/styles/` & Component-Specific CSS)
- **`src/styles/App.css`**: Global style rules and variables (mostly colors and standardized fonts).
- Rather than using a utility framework like Tailwind, the application utilizes traditional CSS. Each corresponding `.js` file in `pages/` and `components/` generally has a sibling `.css` file (e.g., `Admin.css`, `HeroSlider.css`), keeping styles isolated to their respective components.

---

## 5. Typical Data Flow (Example: Photo Submission)
1. **User Action**: A user navigates to `/register/shutter-stories` (`PhotoSubmissionForm.js`).
2. **Form Submission**: The user fills out the form. The form sends a POST request containing the data to the **Google Apps Script** `photos` endpoint.
3. **Admin Monitoring**: Ad administrator logs in (`Login.js` -> Firebase Auth). They navigate to `/admin` (`Admin.js`).
4. **Data Retrieval**: `Admin.js` fires a GET request to the GAS `photos` endpoint, which returns all submissions logged into the Google Sheet.
5. **Admin Action (Emailing)**: If the admin clicks "Send Email", a request is pushed to the GAS `email` endpoint, which triggers an email sequence using predefined templates ("Confirmation", "Rename Request", etc.).

## 6. Project Summary
The UIUPC application is a monolithic frontend setup with a uniquely fragmented backend strategy. It elegantly uses Firebase for strict security/login requirements, while leveraging cheap, serverless Google tools (Apps Scripts connecting to Google Sheets) to construct a robust, flexible, database and CRMs for tracking student memberships and complicated contest submissions.
