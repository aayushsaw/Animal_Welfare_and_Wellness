<div align="center">

# 🐾 Animal Welfare & Wellness Platform

**A production-ready, full-stack platform that connects animal rescuers, volunteers, adopters, and administrators to improve animal welfare through secure, scalable, and transparent collaborative workflows.**

Every day, thousands of stray and abandoned animals struggle to survive on city streets with no shelter, food, or care. This platform gives rescuers, volunteers, and adopters a single, structured system — replacing scattered WhatsApp groups and viral social posts — to report, manage, and adopt animals through an accountable, role-based workflow.

[![Java](https://img.shields.io/badge/Java-21-orange?style=flat-square&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.2-brightgreen?style=flat-square&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)](https://docs.docker.com/compose/)
[![Vercel](https://img.shields.io/badge/Frontend-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com/)
[![Render](https://img.shields.io/badge/Backend-Render-46E3B7?style=flat-square&logo=render&logoColor=black)](https://render.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)
[![Last Commit](https://img.shields.io/github/last-commit/aayushsaw/Animal_Welfare_and_Wellness?style=flat-square)](https://github.com/aayushsaw/Animal_Welfare_and_Wellness/commits/master)
[![Stars](https://img.shields.io/github/stars/aayushsaw/Animal_Welfare_and_Wellness?style=flat-square)](https://github.com/aayushsaw/Animal_Welfare_and_Wellness/stargazers)

[**Live Frontend**](https://animal-welfare-frontend.vercel.app) · [**Backend API**](https://animal-welfare-and-wellness.onrender.com/actuator/health) · [**GitHub**](https://github.com/aayushsaw/Animal_Welfare_and_Wellness)

</div>

---

## 📸 Screenshots

| Home | Browse Animals |
|---|---|
| ![Home Page](.github/screenshots/home.png) | ![Browse Animals](.github/screenshots/animals.png) |

| Animal Details | Dashboard |
|---|---|
| ![Animal Detail](.github/screenshots/animal-detail.png) | ![Dashboard](.github/screenshots/dashboard.png) |

| Admin Panel | About Page |
|---|---|
| ![Admin](.github/screenshots/admin.png) | ![About](.github/screenshots/about.png) |

> Screenshots are captured from the live production deployment. The platform is fully responsive across mobile, tablet, and desktop viewports.

---

## ✨ Features

### 🔐 Authentication & Security
- Stateless **JWT authentication** with short-lived access tokens and long-lived refresh tokens
- **BCrypt** password hashing (Spring Security default cost factor)
- **Role-Based Access Control (RBAC)** with three tiers: `USER`, `VOLUNTEER`, `ADMIN`
- **Bucket4j rate limiting** — 5 authentication attempts per minute per IP
- **Production boot guard** — application refuses to start if `JWT_SECRET` is set to a default fallback value
- **HSTS** and `X-Frame-Options: DENY` enforced in the production Spring profile
- Correlation ID logging — unhandled exceptions return a UUID reference, not a stack trace

### 🐾 Animal Management
- Full CRUD lifecycle for animal listings
- Multi-image upload with **Cloudinary CDN** integration (falls back to local storage in development)
- **MIME type and extension whitelist validation** on all file uploads (prevents RCE via malicious file execution)
- Search by name, species, and breed; filter by status, gender, and vaccination state
- Listing status lifecycle: `AVAILABLE → PENDING → ADOPTED / ARCHIVED`
- Admin archive and restore without permanent deletion

### 📋 Adoption Workflow
- Authenticated users submit adoption requests with a personal message
- Requests enter a `PENDING` state; the animal is locked to prevent duplicate adoptions
- Admins/Volunteers review, approve, or reject requests with an optional review note
- On approval, all competing pending requests for the same animal are automatically rejected
- Users can cancel their own pending requests; ownership is enforced server-side

### 👤 User & Admin Dashboard
- Per-user dashboard showing submitted animal listings and adoption request history
- Admin moderation panel: creator metadata, listing status, timestamps, approve/reject/archive/delete controls
- Admin user management: suspend, restore, promote, and GDPR-compliant account deletion (in-place PII anonymisation)
- Volunteer auto-approval for listing submissions

### 🗞️ News & Awareness
- Editorial news articles seeded and manageable via the admin panel
- News detail pages with full article content and metadata

### 🎨 UI/UX
- Premium design with a curated colour palette, glassmorphism, and micro-animations
- Fully responsive — mobile-first, tested across viewport sizes
- Skeleton loaders and optimistic UI during data fetching (TanStack Query)
- Professional fullscreen image lightbox with fade animation, ESC/backdrop-close, and body scroll lock
- Relative timestamps (time-ago formatting) throughout
- Custom 404 Not Found page
- `usePageTitle` hook for dynamic document titles and SEO-friendly head management

### ♿ Accessibility
- Semantic HTML5 landmarks (`<header>`, `<main>`, `<section>` with `aria-labelledby`)
- All interactive icons include `aria-hidden` or descriptive `aria-label`
- Keyboard-navigable throughout
- Colour contrast ratios meet WCAG AA standards
- Reduced motion support via CSS `@media (prefers-reduced-motion)`

---

## 🏗️ Architecture

```mermaid
graph TD
    subgraph Client["Client (Vercel)"]
        FE["React 19 SPA"]
        ZS["Zustand Auth Store"]
        RQ["TanStack Query Cache"]
        FE --> ZS
        FE --> RQ
    end

    subgraph Security["Security Layer"]
        RL["Bucket4j Rate Limiter"]
        JWT["JWT Auth Filter"]
        MDC["MDC Correlation Filter"]
    end

    subgraph API["Spring Boot API (Render)"]
        CTL["REST Controllers"]
        SVC["Transactional Services"]
        FLY["Flyway Migrations"]
        CTL --> SVC
        SVC --> FLY
    end

    subgraph Data["Data Layer"]
        PG[("PostgreSQL (Neon)")]
        CDN(("Cloudinary CDN"))
        SVC -->|JPA/Hibernate| PG
        SVC -->|Image Upload| CDN
    end

    subgraph Obs["Observability"]
        ACT["Spring Actuator"]
        PROM["Prometheus"]
        GRAF["Grafana"]
        ACT --> PROM --> GRAF
    end

    FE -->|HTTPS REST| RL
    RL --> JWT
    JWT --> MDC
    MDC --> CTL
    CTL --> ACT
```

---

## 🗄️ Database Schema

Managed by **Flyway** with 5 versioned migrations. The schema is automatically applied on startup.

| Entity | Key Fields | Relationships |
|---|---|---|
| **User** | `id`, `username`, `email`, `password_hash`, `enabled`, `created_at` | Has many `Animal`, `AdoptionRequest`; Many-to-Many `Role` |
| **Role** | `id`, `name` (`ROLE_USER`, `ROLE_VOLUNTEER`, `ROLE_ADMIN`) | Many-to-Many `User` |
| **Animal** | `id`, `name`, `species`, `breed`, `status`, `posted_by_id`, `approved_by_id` | Has many `AnimalImage`; Belongs to `User` |
| **AnimalImage** | `id`, `url`, `public_id`, `is_primary`, `display_order` | Belongs to `Animal` |
| **AdoptionRequest** | `id`, `status`, `message`, `review_note`, `reviewed_at` | Belongs to `Animal`, `User` (requester), `User` (reviewer) |
| **RefreshToken** | `id`, `token`, `expiry_date` | Belongs to `User` |
| **NewsArticle** | `id`, `title`, `content`, `author`, `published_at`, `image_url` | Standalone |

---

## 🔑 Role-Based Access Control

| Action | `USER` | `VOLUNTEER` | `ADMIN` |
|---|:---:|:---:|:---:|
| Browse animal listings | ✅ | ✅ | ✅ |
| Submit adoption request | ✅ | ✅ | ✅ |
| Cancel own adoption request | ✅ | ✅ | ✅ |
| Post animal listing | ✅ | ✅ | ✅ |
| Edit / delete own listing | ✅ | ✅ | ✅ |
| Auto-approve own listings | ❌ | ✅ | ✅ |
| Approve / reject any listing | ❌ | ✅ | ✅ |
| Review adoption requests | ❌ | ✅ | ✅ |
| Edit / delete any listing | ❌ | ❌ | ✅ |
| Archive / restore any listing | ❌ | ❌ | ✅ |
| Manage users (suspend, promote) | ❌ | ❌ | ✅ |
| GDPR account deletion | ❌ | ❌ | ✅ |

---

## 🛠️ Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Java | 21 LTS | Runtime |
| Spring Boot | 3.2.2 | Application framework |
| Spring Security | 6.x | Authentication & authorisation |
| JJWT | 0.12.3 | JWT token generation and validation |
| Spring Data JPA + Hibernate | 6.x | ORM and database access |
| Flyway | 9.x | Database schema versioning |
| Bucket4j | 8.7.0 | In-memory rate limiting |
| Cloudinary SDK | 1.37.0 | Image storage and CDN |
| SpringDoc OpenAPI | 2.3.0 | Swagger UI documentation |
| Micrometer + Prometheus | — | Metrics and observability |
| H2 | — | In-memory database for development/testing |
| PostgreSQL | 16 | Production database |
| Maven | 3.9.6 (wrapper) | Build system |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| TypeScript | 5.6 | Type safety |
| Vite | 5.4 | Build tool and dev server |
| TanStack Query | 5 | Server state management and caching |
| Zustand | 5 | Client auth state management |
| React Router DOM | 6 | Client-side routing |
| React Hook Form + Zod | — | Form management and validation |
| Tailwind CSS | 3.4 | Utility-first styling |
| Radix UI | — | Accessible headless component primitives |
| Lucide React | — | Icon system |
| Axios | 1.7 | HTTP client |
| Sonner | — | Toast notifications |
| Framer Motion | 11 | Animation library |

### Testing
| Tool | Layer | Coverage |
|---|---|---|
| JUnit 5 + Mockito | Backend unit tests | `AnimalService`, `AuthService` |
| Spring Boot Test | Backend integration tests | Full security filter chain, JWT, CORS |
| Vitest | Frontend unit tests | Auth store logic, routing, Footer component |
| Playwright | E2E tests | Critical user journeys |

### Infrastructure & Cloud
| Service | Role |
|---|---|
| Render | Backend containerised deployment |
| Vercel | Frontend static SPA hosting |
| Neon (PostgreSQL) | Managed serverless PostgreSQL database |
| Cloudinary | Image storage, CDN, and optimisation |
| Docker + Compose | Local full-stack development and containerised builds |
| Grafana + Prometheus + Loki | Observability stack (self-hosted via Docker Compose) |

---

## 📂 Project Structure

```
Animal Welfare and Wellness/        ← Monorepo root
│
├── animal-welfare-java/            ← Spring Boot REST API
│   ├── src/main/java/com/animalwelfare/
│   │   ├── api/                    ← REST controllers, DTOs, response wrappers
│   │   ├── config/                 ← SecurityConfig, OpenAPI, Cloudinary config
│   │   ├── domain/                 ← JPA entities, repositories
│   │   ├── exception/              ← GlobalExceptionHandler, custom exceptions
│   │   ├── infrastructure/         ← ImageStorageService (Cloudinary / local)
│   │   ├── security/               ← JwtService, JwtAuthFilter, RateLimitingFilter
│   │   └── service/                ← Business logic services
│   ├── src/main/resources/
│   │   ├── application.properties  ← Default configuration
│   │   ├── application-prod.properties  ← Production overrides
│   │   └── db/migration/           ← Flyway SQL migrations (V1–V5)
│   ├── src/test/                   ← JUnit + Mockito unit tests
│   └── pom.xml
│
├── animal-welfare-frontend/        ← React + TypeScript SPA
│   ├── src/
│   │   ├── api/                    ← Axios API layer (animals, auth, users, news)
│   │   ├── components/             ← Reusable UI components
│   │   ├── lib/                    ← Utilities, hooks (usePageTitle, utils)
│   │   ├── pages/                  ← Route-level page components
│   │   ├── routes/                 ← React Router configuration
│   │   ├── store/                  ← Zustand auth store
│   │   └── types/                  ← TypeScript type definitions
│   ├── src/test/                   ← Vitest unit + Playwright E2E tests
│   ├── package.json
│   └── vite.config.ts
│
├── database/                       ← Backup and restore scripts
├── observability/                  ← Grafana, Prometheus, Loki, Promtail configs
├── docs/                           ← Additional documentation
├── docker-compose.yml              ← Full local stack orchestration
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

| Requirement | Version |
|---|---|
| JDK | 21+ |
| Node.js | 20+ |
| Maven | 3.9+ (wrapper included) |
| Docker Desktop | Latest (optional, for containerised stack) |

### 1. Clone the Repository

```bash
git clone https://github.com/aayushsaw/Animal_Welfare_and_Wellness.git
cd Animal_Welfare_and_Wellness
```

### 2. Start the Backend

The backend uses an **H2 in-memory database by default** — no database installation required for development.

```bash
cd animal-welfare-java

# macOS / Linux
./mvnw spring-boot:run

# Windows
.mvn\wrapper\maven\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run
```

The REST API starts at **`http://localhost:8080`**.  
Swagger UI is available at **`http://localhost:8080/swagger-ui.html`**.

### 3. Start the Frontend

```bash
cd animal-welfare-frontend
npm install
npm run dev
```

The Vite dev server starts at **`http://localhost:5173`**.  
All API requests are automatically proxied to port `8080`.

### 4. Docker Compose (Full Stack)

To start the entire production-equivalent stack in containers:

```bash
# From the monorepo root
docker compose up -d --build
```

| Service | URL |
|---|---|
| Frontend SPA | http://localhost |
| Backend REST API | http://localhost:8080 |
| PostgreSQL | localhost:5432 |

---

## ⚙️ Environment Variables

### Backend (`animal-welfare-java`)

Create an `.env` file or set the following environment variables on your deployment platform:

| Variable | Description | Example |
|---|---|---|
| `DB_URL` | PostgreSQL JDBC connection string | `jdbc:postgresql://host:5432/dbname` |
| `DB_USERNAME` | Database username | `db_user` |
| `DB_PASSWORD` | Database password | `your_secure_password` |
| `JWT_SECRET` | HS256 signing secret (≥ 256 bits) | `your-256-bit-secret-key` |
| `JWT_EXPIRATION_MS` | Access token lifetime in milliseconds | `900000` (15 min) |
| `JWT_REFRESH_EXPIRATION_MS` | Refresh token lifetime in milliseconds | `604800000` (7 days) |
| `SPRING_PROFILES_ACTIVE` | Active Spring profile | `prod` |
| `CLOUDINARY_URL` | Unified Cloudinary credentials | `cloudinary://api_key:api_secret@cloud_name` |
| `APP_CORS_ALLOWED_ORIGINS` | Comma-separated allowed frontend origins | `https://animal-welfare-frontend.vercel.app` |

> [!IMPORTANT]
> The application **will refuse to start** in the `prod` profile if `JWT_SECRET` matches the default development fallback. Set a real secret before deploying.

### Frontend (`animal-welfare-frontend`)

Create a `.env.local` file:

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Base URL of the deployed backend | `https://animal-welfare-and-wellness.onrender.com` |

> [!CAUTION]
> Never commit `.env`, `.env.local`, or any file containing real credentials to version control. Both are included in `.gitignore`.

---

## 🧪 Testing

### Backend Tests (JUnit + Spring Boot Test)

```bash
cd animal-welfare-java

# macOS / Linux
./mvnw test

# Windows
.mvn\wrapper\maven\apache-maven-3.9.6\bin\mvn.cmd test
```

**Suites:**
- `SecurityIntegrationTest` — full Spring Security filter chain, JWT validation, CORS, protected route enforcement
- `AnimalServiceTest` — animal CRUD, ownership assertion, status transitions
- `AuthServiceTest` — user registration, login, duplicate handling, BCrypt verification

### Frontend Tests (Vitest)

```bash
cd animal-welfare-frontend
npm run test
```

**Suites:**
- `auth.test.ts` — Zustand auth store state management
- `Footer.test.tsx` — Footer component rendering
- `routes.test.tsx` — React Router route resolution

### End-to-End Tests (Playwright)

Ensure both backend and frontend dev servers are running, then:

```bash
cd animal-welfare-frontend
npx playwright test
```

### Production Build Validation

```bash
cd animal-welfare-frontend
npm run build   # tsc -b && vite build — must produce 0 TypeScript errors
```

---

## ☁️ Deployment

### Backend → Render

1. Connect the GitHub repository to [Render](https://render.com).
2. Create a new **Web Service** pointing to the `animal-welfare-java` directory.
3. Set the build command: `./mvnw clean package -DskipTests`
4. Set the start command: `java -jar target/animal-welfare-1.0.0.jar`
5. Add all backend environment variables in the Render dashboard.
6. Set `SPRING_PROFILES_ACTIVE=prod`.

**Health check:** `https://animal-welfare-and-wellness.onrender.com/actuator/health`

### Frontend → Vercel

1. Connect the GitHub repository to [Vercel](https://vercel.com).
2. Set the **root directory** to `animal-welfare-frontend`.
3. Vercel auto-detects Vite. Build command: `npm run build`. Output: `dist`.
4. Add `VITE_API_URL` pointing to the Render backend URL.
5. Every push to `master` triggers an automatic deployment.

**Live URL:** `https://animal-welfare-frontend.vercel.app`

### Database → Neon (PostgreSQL)

1. Create a free PostgreSQL database at [neon.tech](https://neon.tech).
2. Copy the connection string and set it as `DB_URL` in your Render environment.
3. Flyway migrations run automatically on first startup.

### Media → Cloudinary

1. Create a free account at [cloudinary.com](https://cloudinary.com).
2. Copy the `CLOUDINARY_URL` from the dashboard and add it to your environment variables.
3. Images are automatically optimised (`q_auto,f_auto`) and served via CDN.

---

## 🔒 Security

| Concern | Implementation |
|---|---|
| Authentication | Stateless JWT (HS256) with access + refresh token rotation |
| Authorisation | Spring Security `@PreAuthorize` + method-level ownership checks |
| Password storage | BCrypt with Spring Security default cost factor |
| Rate limiting | Bucket4j — 5 auth attempts/minute/IP |
| File uploads | MIME type validation + extension whitelist (jpg, jpeg, png, webp, gif) |
| Input validation | Jakarta Bean Validation on all DTOs |
| Error responses | Generic messages + UUID correlation ID; no stack traces returned to client |
| Transport security | HSTS enforced in production profile |
| Clickjacking | `X-Frame-Options: DENY` in production profile |
| CORS | Configurable allowed-origins; no wildcard `*` in production |
| Secrets | Environment variables only; application refuses to boot on default secrets |
| GDPR | Self-service account deletion with in-place PII anonymisation |

---

## ⚡ Performance

| Technique | Implementation |
|---|---|
| Code splitting | Vite lazy-loads each page as a separate chunk |
| Server state caching | TanStack Query with configurable `staleTime` per query |
| Image optimisation | Cloudinary `q_auto,f_auto` transformation on upload |
| Skeleton loaders | Shimmer placeholders while data fetches |
| Database | JPA-managed connection pool (HikariCP); indexed foreign keys |
| Bundle analysis | Vite produces per-chunk gzip size report on every build |

---

## 🛣️ Roadmap

| Feature | Status |
|---|---|
| Redis-backed rate limiting (distributed) | 🔲 Planned |
| Email notifications (adoption approved/rejected) | 🔲 Planned |
| WebSocket real-time status updates | 🔲 Planned |
| Map view for nearby animal listings | 🔲 Planned |
| Push notifications (PWA) | 🔲 Planned |
| Analytics dashboard (adoption rates, rescue trends) | 🔲 Planned |
| React Native mobile application | 🔲 Planned |
| NGO partner portal | 🔲 Planned |

---

## 🤝 Contributing

Contributions are welcome. Please follow these steps:

1. **Fork** the repository and create a new branch from `master`:
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Implement** your changes, following the existing code style and conventions.

3. **Test** your changes:
   ```bash
   # Backend
   ./mvnw test

   # Frontend
   npm run test
   npm run build
   ```

4. **Commit** using [Conventional Commits](https://www.conventionalcommits.org/):
   ```
   feat(animals): add geolocation filter
   fix(auth): handle expired refresh token gracefully
   docs(readme): update deployment section
   ```

5. **Push** your branch and open a **Pull Request** against `master`.

Please ensure your PR:
- Has a clear description of what was changed and why
- Passes all existing tests
- Includes new tests for new functionality
- Does not introduce TypeScript errors (`npm run build`)

---

## 📄 License

This project is licensed under the **MIT License**.  
See the [LICENSE](LICENSE) file for full terms.

---

## 📬 Contact

**Aayush Saw**

[![GitHub](https://img.shields.io/badge/GitHub-aayushsaw-181717?style=flat-square&logo=github)](https://github.com/aayushsaw)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0077B5?style=flat-square&logo=linkedin)](https://linkedin.com/in/aayushsaw)

---

<div align="center">

Made with ❤️ for every stray animal that deserves a second chance.

**[⭐ Star this repository](https://github.com/aayushsaw/Animal_Welfare_and_Wellness)** if you find it useful.

</div>
