77202ba5d5c34d11f762629535ea8137b2837b1f69fd03f6d25255101f9dabc2671af3301bc78ba38a40a7294f66206de15eb09f844906700d9de445f00e6e67
pocketledger/
├── backend/
│   ├── src/
│   │   ├── config/
<!-- │   │   │   ├── database.js -->
<!-- │   │   │   └── rateLimit.js/ -->
│   │   ├── controllers/
<!-- │   │   │   ├── auth.controller.js -->
<!-- │   │   │   ├── section.controller.js -->
<!-- │   │   │   └── bill.controller.js -->
│   │   ├── models/
<!-- │   │   │   ├── User.js -->
<!-- │   │   │   ├── Section.js -->
<!-- │   │   │   └── Bill.js -->
│   │   ├── routes/
<!-- │   │   │   ├── auth.routes.js -->
<!-- │   │   │   ├── section.routes.js -->
<!-- │   │   │   └── bill.routes.js -->
│   │   ├── middleware/
<!-- │   │   │   ├── auth.js -->
<!-- │   │   │   └── validate.js -->
│   │   ├── utils/
<!-- │   │   │   └── generateToken.js -->
<!-- │   │   └── index.js -->
│   ├── package.json
<!-- │   └── .env -->
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/           # Shadcn components
│   │   │   ├── layout/
<!-- │   │   │   │   ├── Navbar.tsx -->
<!-- │   │   │   │   ├── Footer.tsx -->
<!-- │   │   │   │   └── Layout.tsx -->
│   │   │   ├── auth/
<!-- │   │   │   │   ├── LoginModal.tsx -->
<!-- │   │   │   │   └── RegisterModal.tsx -->
│   │   │   ├── dashboard/
<!-- │   │   │   │   ├──CreateSectionModal.tsx -->
<!-- │   │   │   │   ├── SectionCard.tsx -->
<!-- │   │   │   │   └── ProfileDropdown.tsx -->
│   │   │   └── section/
<!-- │   │   │       ├── BillCard.tsx -->
<!-- │   │   │       ├── BillFormModal.tsx -->
<!-- │   │   │       ├── CalculatorPopover.tsx -->
<!-- │   │   │       ├── PieChart.tsx -->
<!-- │   │   │       ├── TagFilter.tsx -->
<!-- │   │   │       ├── ViewToggle.tsx -->
<!-- │   │   │       └── CalendarPicker.tsx -->
│   │   ├── pages/
<!-- │   │   │   ├── Home.tsx -->
<!-- │   │   │   ├── Dashboard.tsx -->
<!-- │   │   │   └── SectionPage.tsx -->
│   │   ├── hooks/
<!-- │   │   │   ├── useAuth.ts -->
<!-- │   │   │   └── useBills.ts -->
 <!-- usetheme.ts -->



<!-- │   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   └── utils.ts -->
│   │   ├── types/
<!-- │   │   │   └── index.ts -->
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── public/
│   ├── package.json
│   ├── tailwind.config.js
│   ├── components.json       # Shadcn config
│   └── tsconfig.json
│
├── package.json             # (Optional: Root for monorepo scripts)
└── README.md





PocketLedger - Development Phase Plan
PHASE 1: BACKEND FOUNDATION (Week 1)
Goal: Working API with auth, sections, and bills
Step 1.1: Setup & Database

Initialize Node.js/Express project

Setup MongoDB connection

Create User, Section, Bill Mongoose schemas

Add basic validation

Step 1.2: Authentication System

Implement token generation (crypto.randomBytes)

Hash tokens before storing

Create /register endpoint (generates token)

Create /login endpoint (verifies token)

Add rate limiting to auth routes

Auth middleware to protect routes

Step 1.3: Core CRUD Endpoints

Sections: POST /sections, GET /sections, GET /sections/:id, DELETE /sections/:id

Bills: POST /bills, GET /bills (with filters by section, tag, date), PATCH /bills/:id, DELETE /bills/:id

Add budget calculation logic to sections

Step 1.4: Testing & Documentation

Test all endpoints with Postman/Insomnia

Document API routes

Deploy backend (Render/Railway)

PHASE 2: FRONTEND CORE (Week 2)
Goal: Basic UI with authentication
Step 2.1: Project Setup

Initialize React + TypeScript + Vite

Configure Tailwind and shadcn

Setup project structure and routing

Create API service layer

Step 2.2: Authentication UI

Create Home page with logo

Build Login/Register modals

Implement token copy functionality

Setup auth context/store

Step 2.3: Layout & Navigation

Create responsive Layout component

Build Navbar with profile dropdown

Implement dark mode toggle

Setup protected routes

PHASE 3: DASHBOARD & SECTIONS (Week 3)
Goal: Section management
Step 3.1: User Onboarding

Create username/avatar setup modal

Implement profile update logic

Step 3.2: Dashboard Page

Build "Create Section" modal with theme preview

Display sections as cards with budget info

Implement section card dropdown (description/budget)

Add search functionality

Step 3.3: Section Creation Flow

Complete form with name, budget, description, theme

Connect to backend API

Add validation and error handling

PHASE 4: BILLS MANAGEMENT (Week 4)
Goal: Complete section page functionality
Step 4.1: Section Page Layout

Create tag filter chips

Build view toggle (grid/table)

Add time filters (All/Daily/Weekly/Monthly)

Implement calendar date picker

Step 4.2: Bills CRUD

Build Bill form modal with calculator integration

Create bill cards with expand/collapse

Implement edit/delete functionality

Add emoji tag selector with recent tags

Step 4.3: Analytics & Summary

Build pie chart component (Chart.js/Recharts)

Create summary cards (Total, Remaining, Overspent)

Implement real-time updates on bill changes

PHASE 5: POLISH & DEPLOYMENT (Week 5)
Goal: Refinement and launch
Step 5.1: Responsive Design

Test on mobile/tablet/desktop

Fix responsive issues

Optimize touch interactions

Step 5.2: Performance & UX

Add loading states

Implement optimistic updates

Add toast notifications

Cache frequent requests

Step 5.3: Testing & Deployment

Test complete user flow

Deploy frontend (Vercel/Netlify)

Configure environment variables

Final security check

PHASE 6: ENHANCEMENTS (Future)
Goal: Additional features
Data export/import

Recurring bills

Budget alerts/notifications

Data visualization improvements

Offline support with PWA

PROGRESS METRICS
Phase 1 Complete: API working with auth

Phase 2 Complete: User can login and see dashboard

Phase 3 Complete: User can create and manage sections

Phase 4 Complete: Full bill tracking with analytics

Phase 5 Complete: Deployed and usable

PRIORITY ORDER
Minimum Viable Product: Phases 1-4 (User can track expenses)

Polish: Phase 5 (Good UX, responsive)

Extra Features: Phase 6 (Nice-to-haves)