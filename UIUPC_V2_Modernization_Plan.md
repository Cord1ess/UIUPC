# 🚀 UIUPC Modernization Plan: The "Hybrid Enterprise" Stack

This document is the finalized master blueprint for the UIU Photography Club's digital infrastructure upgrade.

---

## 📄 User Requirements & Context (Source of Truth)

### 1. Administrative Hierarchy & Access
- **CORE**: `photographyclub@dccsa.uiu.ac.bd`. Highest privilege. Manages committees, deletes data, views logs.
- **Level 2 Admins**: HR, PR, Event, Organizer, Design, Visual. Use official department gmails.
- **Backup**: One giant master Spreadsheet with multiple tabs for non-tech access.

### 2. The Email Selection Engine
- Admin selects members via the website UI.
- Pressing "Send" opens a native Gmail window with selected emails in the BCC.
- Allows for professional formatting and attachments via the Gmail editor for $0 cost.

### 3. Digital Asset Management
- **Primary Source**: Organized Google Drive folders.
- **Exhibition Workflow**: Photos collected off-site, judges select winners, CORE manually updates the website status (Selected/Winner).

### 4. Database & Financials
- **Supabase (PostgreSQL)**: Relational database for Members, Alumni, Committees, Events, and Achievements.
- **Financial Ledger**: Tracks funds, event spending, sponsor income, and membership fees.

### 5. Scale & Auth
- **Volume**: Hundreds of historical records.
- **Traffic**: Handles spikes of 100+ concurrent users during exhibitions.
- **Security**: Supabase Auth with top-tier encryption. Admin-controlled passwords.

### 6. Sync Logic
- **Website -> Sheets**: Automatic updates.
- **Sheets -> Website**: Silent audit logs. CORE can review background logs to verify manual spreadsheet changes.

---

## 🛠️ Technical Solution Stack

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Framework** | **Next.js (App Router)** | Core Application. |
| **Database** | **Supabase (PostgreSQL)** | Relational Source of Truth. |
| **Auth** | **Supabase Auth** | Secure RBAC & Encryption. |
| **Storage** | **Google Drive** | Unlimited High-Res Storage. |
| **Delivery** | **Next.js Image Opt.** | CDN-Speed WebP Delivery. |

---

## 📅 Transition Roadmap

### Phase 1: The Foundation (Immediate)
- [ ] **Database Schema**: SQL implementation of all 6 tables.
- [ ] **Security**: Supabase Auth setup with Departmental roles.
- [ ] **Image Proxy**: Building the `/api/image/[fileId]` high-speed cache.

### Phase 2: Data Migration
- [ ] **Relational Import**: Moving Committees (JSON), Achievements (JSON), and Events (Firebase) into Supabase.
- [ ] **Sync Engine**: Building the direct link to the Master Google Sheet.

### Phase 3: The Communicator & Finance
- [ ] **Mass Mailer**: Building the selection UI for BCC routing.
- [ ] **Finance Dashboard**: CORE-only ledger for club funds.
- [ ] **Historic Archive**: Explorer for the digitized club history.
