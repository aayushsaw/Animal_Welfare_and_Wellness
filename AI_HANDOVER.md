# AI Handover Document — Animal Welfare and Wellness Platform

> **For the next AI agent:** Read this entire document before touching any file.
> This project is fully structured as a monorepo.
> Both the Spring Boot REST API backend and the React + Vite + TS + Tailwind frontend are complete and ready for execution.

---

## 1. Project Overview

**Name:** Animal Welfare and Wellness Platform
**Original name:** BhootDaya (renamed/rebranded)
**Purpose:** Connect people who find stray animals with adopters. Platform for animal welfare NGOs, volunteers, rescuers, and the general public.

**Target Users:**
- General public (browse and adopt animals)
- Volunteers (post stray animals, assist with reviews)
- NGO partners (manage campaigns, rescues)
- Admins (moderate content, approve/reject adoptions)

**Major Features:**
- JWT authentication with refresh token rotation and queue synchronization
- Post stray animals with temporary name, category, health, breed, and location details
- Multiple image uploads per animal (supports drag-n-drop file previews)
- Filterable animal grid with client-side category pills and server-side pagination
- Full adoption request workflow with reviewer notes and status tracking
- Welfare news banner carousel auto-advancing with custom indicator dots
- Static About Us and Initiative overview page reusing original assets
- Fully unified, role-based User & Volunteer Dashboard (My listings, My adoptions, and Pending reviews)
- Swagger/OpenAPI interactive interface at `/swagger-ui.html`

**Current Status:**
- ✅ Backend complete and running on port 8080 (in `animal-welfare-java/`)
- ✅ Database schema with Flyway migrations (V1–V5)
- ✅ All REST APIs verified working
- ✅ Frontend complete, fully styled, compiles cleanly, and runs on port 5173 (in `animal-welfare-frontend/`)
- ✅ Hardened Security (CSP, HSTS, Referrer-Policy, FrameOptions, secure CORS)
- ✅ API Rate Limiting (Bucket4j, 100 req/min per IP)
- ✅ Multi-stage Dockerization (separate Dockerfiles, orchestrated via `docker-compose.yml`)
- ✅ GitHub Actions CI/CD pipeline (`ci.yml`)
- ✅ Automated Test Suites passing successfully (15 backend tests, 8 frontend tests)

---

## 2. Original Tech Stack (Pre-Migration)

**Framework:** Angular 15 (TypeScript SPA)
**Backend:** None — purely frontend with JSON file data
**Data:** `src/shared/list_adopt.json` (12 animals), `src/shared/userData.json` (4 users)
**Server:** Apache Tomcat 10.1.8 (served compiled Angular static files)
**Auth:** Browser localStorage with hardcoded credentials
**Images:** Local static assets in `src/assets/`

**Problems that drove migration:**
- No real backend — data lost on refresh
- Hardcoded credentials in JSON files
- No auth security whatsoever
- No adoption workflow — single click changed status in memory
- Not deployable, not scalable, not maintainable
- Angular with no API = impossible to extend

---

## 3. Current Tech Stack

### Backend Stack (`animal-welfare-java/`)
- **Language:** Java 21 (source/target), compiled on Java 25 compatibility
- **Framework:** Spring Boot 3.2.2 + Spring Security 6 (stateless JWT configuration)
- **Database:** H2 (dev) / PostgreSQL (prod, Flyway migrations managed)
- **Image Storage:** Cloudinary CDN (prod) / Local file system (dev fallback)
- **API Docs:** SpringDoc OpenAPI 2.3.0
- **Rate Limiting:** Bucket4j 8.7.0 (per-IP rate limiting filter)

### Frontend Stack (`animal-welfare-frontend/`)
- **Language:** TypeScript 5.6.3 + React 19.2.7
- **Framework & Bundler:** Vite 5.4.8
- **Testing:** Vitest 4.1.10 + React Testing Library + JSDom
- **Styling:** Tailwind CSS v3.4.13 + custom brand HSL theme colors (Forest green, sage, cream, brown, orange)
- **Components:** Radix UI primitives (`radix-ui/react-*`) + Lucide icons
- **State Management:** Zustand 5.0.0
- **Data Fetching:** TanStack React Query v5.56.2 + Axios 1.7.7 client (handles token refresh interceptors)
- **Validation:** React Hook Form 7.53.0 + Zod 3.23.8
- **Notifications:** Sonner toasts

---

## 4. Architecture Overview

### Monorepo Structure
```
Animal Welfare and Wellness/
├── .github/
│   └── workflows/
│       └── ci.yml                     ← GitHub Actions validation CI pipeline
├── .git/
├── .gitignore                         ← Configured for monorepo paths
├── README.md                          ← Monorepo documentation
├── docker-compose.yml                 ← Full stack container orchestration (Postgres, API, Nginx Web)
├── AI_HANDOVER.md                     ← This document
├── animal-welfare-java/               ← Backend Spring Boot project
└── animal-welfare-frontend/           ← Frontend Vite + React project
```

### Frontend Module Layout (`animal-welfare-frontend/src/`)
```
src/
├── api/
│   ├── adoptions.api.ts              ← My requests, review submit, lists
│   ├── animals.api.ts                ← Get, detail, post, upload, adopt
│   ├── auth.api.ts                   ← Login, register, token refresh
│   └── users.api.ts                  ← Fetch user profile stats
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx                ← Navigation with transparent scroll & auth dropdown
│   │   ├── Footer.tsx                ← Corporate NGO footer links
│   │   └── RootLayout.tsx            ← App layout container
│   ├── animals/
│   │   └── AnimalCard.tsx            ← Grid card with zoom hover and badge indicators
│   └── news/
│       └── NewsBanner.tsx            ← Featured news carousel
├── lib/
│   ├── axios.ts                      ← Shared client + automatic silent refresh
│   └── utils.ts                      ← cn(), formatters, image URL resolver
├── pages/
│   ├── HomePage.tsx                  ← Hero, stats, listing strip, featured carousel
│   ├── AboutPage.tsx                 ← Mission, values, volunteer network layout
│   ├── AnimalsPage.tsx               ← Filters, paginated grid list, skeletons
│   ├── AnimalDetailPage.tsx          ← Thumbnail slider, detail sheet, adoption request form
│   ├── LoginPage.tsx                 ← Auth login form with split page layout
│   ├── RegisterPage.tsx              ← Signup form matching style guidelines
│   └── DashboardPage.tsx             ← Dynamic lists + Admin review panel
├── routes/
│   ├── index.tsx                     ← Browser router setup
│   ├── ProtectedRoute.tsx            ← Redirects guests to login page
│   └── AdminRoute.tsx                ← Protects dashboard review options
├── store/
│   └── auth.store.ts                 ← Zustand auth persistence (user info & refresh token)
├── test/
│   ├── setup.ts                      ← Testing library extensions imports
│   ├── auth.test.ts                  ← Zustand store state & authentication flow tests
│   ├── Footer.test.tsx               ← Footer elements, links, contact verification test
│   └── routes.test.tsx               ← Client-side routing path assertions
└── types/                            ← Type declarations mapping backend DTO wrappers
```

---

## 5. Completed Work Checklist

### Backend
- [x] Java 21 REST API architecture with Flyway schema migration tracking (V1-V5)
- [x] Spring Security + JWT access & refresh token storage and DB rotation
- [x] CORS allowed with configurable environment variable overrides
- [x] Hardened Security headers (CSP, FrameOptions, HSTS, Referrer-Policy)
- [x] Rate limiting filter rejecting requests above 100/min per IP with 429 Too Many Requests
- [x] Complete REST controllers, services, repositories, and OpenAPI definition
- [x] Mockito extensions subclassing configured to support mocking on JDK 25

### Frontend
- [x] Clean monorepo folder division structure setup
- [x] Styled Tailwind theme incorporating the exact forest green, sage green, cream, brown, and orange palette
- [x] Central Axios interceptor handling queued requests during active token refreshes
- [x] Navbar transparent-to-solid transitions, active navigation highlights, and mobile menu toggles
- [x] Homepage with live stats counter from the database, recent available animals, and auto-advancing news carousel
- [x] Animals page with category pill filter toggles, grid layout, loading skeletons, and custom pagination buttons
- [x] Animal detail page with active thumbnail selector, health status labels, and toggleable adoption description form
- [x] LoginPage & RegisterPage form validators, demo notices, and password toggle switches
- [x] Dashboard page displaying user listings, user request cards, and admin/volunteer request review fields
- [x] About page reusing the original team photos and mission statement graphics
- [x] Tab favicon set using paw print graphic
- [x] Vitest framework configured with JSDom environment support

---

## 6. Pending Tasks

### Feature Additions
- [ ] Password reset email templates and service mail sender
- [ ] Verified Email account link flows
- [ ] Bookmark / Save animal list option

---

## 7. Next Recommended Steps (Execution Order)

1. Verify environment variable configuration matches docker-compose settings when deploying to production.
2. Implement password reset flow via a secure temporary token verification system.
3. Integrate real SMTP mail sender to replace system output mock logging for emails.

---

## 8. Instructions For Next AI Agent

### Files You Must NOT Modify
- Do not edit or touch Flyway SQL migrations: `animal-welfare-java/src/main/resources/db/migration/V1__*.sql`
- Do not modify or replace static files under assets: `animal-welfare-java/src/main/resources/static/assets/`

### Architectural Standards
- Always resolve image URLs using `resolveImageUrl()` utility in `src/lib/utils.ts` to properly handle local static assets and Cloudinary CDN URLs.
- Always wrap page routes inside `RootLayout` using path definitions in `src/routes/index.tsx`.
- Keep access tokens exclusively in memory (Zustand state) — only persist the refresh token to localStorage to avoid security leakage.
- Enforce request rate limiting compliance during API extensions.
- Ensure all new features are covered by unit and integration tests under the existing test structure.
