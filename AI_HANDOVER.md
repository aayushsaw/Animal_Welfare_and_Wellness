# AI Handover Document — Animal Welfare and Wellness Platform

> **For the next AI agent:** Read this entire document before touching any file.
> This project is mid-migration. The backend is production-ready and running.
> The React frontend has NOT been started yet — that is the next priority.

---

## 1. Project Overview

**Name:** Animal Welfare and Wellness Platform
**Original name:** BhootDaya (renamed/rebranded)
**Purpose:** Connect people who find stray animals with adopters. Platform for
animal welfare NGOs, volunteers, rescuers, and the general public.

**Target Users:**
- General public (browse and adopt animals)
- Volunteers (post stray animals, assist with reviews)
- NGO partners (manage campaigns, rescues)
- Admins (moderate content, approve/reject adoptions)

**Major Features:**
- JWT authentication with refresh token rotation
- Post stray animals with multiple image uploads
- Browse and filter available animals with pagination
- Full adoption request workflow (submit → review → approve/reject)
- Welfare news and campaign content (seeded from original assets)
- User dashboard (My Contributions — posted + adopted animals)
- Role-based access control (USER, ADMIN, VOLUNTEER)
- REST API with Swagger/OpenAPI documentation

**Current Status:**
- ✅ Backend complete and running on port 8080
- ✅ Database schema with Flyway migrations (V1–V5)
- ✅ All APIs verified working
- ❌ React frontend not started
- ❌ Admin panel not started
- ❌ Production deployment not configured

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

| Layer | Technology | Version |
|-------|-----------|---------|
| Language | Java | 25 (runtime), 21 (source target) |
| Framework | Spring Boot | 3.2.2 |
| Security | Spring Security + JWT (jjwt) | 6.x / 0.12.3 |
| Data | Spring Data JPA + Hibernate | 3.2.x / 6.4.x |
| Database | H2 (dev) / PostgreSQL (prod) | H2 2.x / PG 15+ |
| Migrations | Flyway | 9.x |
| Image Storage | Cloudinary (prod) / Local (dev) | 1.37.0 |
| API Docs | SpringDoc OpenAPI / Swagger UI | 2.3.0 |
| Build | Maven | 3.9.6 (bundled in .mvn/wrapper) |
| Testing | JUnit 5 + Mockito | 5.x |
| Frontend | **NOT STARTED** — React + Tailwind + shadcn/ui planned | — |

---

## 4. Architecture Overview

### Backend Architecture (Strict Layered)
```
Controller (api/controller/)
    ↓  Request DTOs (api/dto/)
Service (service/)
    ↓  Domain Models (domain/model/)
Repository (domain/repository/)
    ↓
Database (H2/PostgreSQL via Flyway)
```

### Package Structure
```
src/main/java/com/animalwelfare/
├── AnimalWelfareApplication.java     ← Spring Boot entry point
├── api/
│   ├── controller/                   ← 5 REST controllers
│   │   ├── AuthApiController         ← /api/v1/auth/**
│   │   ├── AnimalApiController       ← /api/v1/animals/**
│   │   ├── AdoptionApiController     ← /api/v1/adoptions/**
│   │   ├── NewsApiController         ← /api/v1/news/**
│   │   └── UserApiController         ← /api/v1/users/**
│   ├── dto/
│   │   ├── auth/      ← LoginRequest, RegisterRequest, AuthResponse
│   │   ├── animal/    ← AnimalRequest, AnimalResponse
│   │   ├── adoption/  ← AdoptionRequest, AdoptionReviewRequest, AdoptionResponse
│   │   ├── news/      ← NewsResponse
│   │   └── user/      ← UserProfileResponse
│   └── response/
│       ├── ApiResponse.java          ← {success, message, data, timestamp}
│       └── PagedResponse.java        ← {content, page, size, totalElements...}
├── config/
│   ├── SecurityConfig.java           ← JWT stateless, CORS, route rules
│   ├── CloudinaryConfig.java         ← Image upload config
│   └── OpenApiConfig.java            ← Swagger UI setup
├── domain/
│   ├── model/
│   │   ├── User.java                 ← users table
│   │   ├── Role.java                 ← roles table
│   │   ├── Animal.java               ← animals table
│   │   ├── AnimalImage.java          ← animal_images table
│   │   ├── AdoptionRequest.java      ← adoption_requests table
│   │   ├── NewsArticle.java          ← news_articles table
│   │   └── RefreshToken.java         ← refresh_tokens table
│   └── repository/                   ← 6 Spring Data JPA repos
├── exception/
│   ├── GlobalExceptionHandler.java   ← @RestControllerAdvice
│   ├── ResourceNotFoundException     ← 404
│   ├── DuplicateResourceException    ← 409
│   └── BusinessException             ← 400
├── infrastructure/
│   └── ImageStorageService.java      ← Cloudinary or local filesystem
├── security/
│   ├── JwtService.java               ← token generation + validation
│   ├── JwtAuthFilter.java            ← OncePerRequestFilter
│   └── UserDetailsServiceImpl.java   ← loads user+roles from DB
└── service/
    ├── AuthService.java              ← register, login, refresh, logout
    ├── AnimalService.java            ← CRUD + image upload + stats
    ├── AdoptionService.java          ← request, review, cancel workflow
    └── NewsService.java              ← featured, paginated, by category
```

### Authentication Flow
```
Client → POST /api/v1/auth/login (username+password)
       ← { accessToken (15min JWT), refreshToken (7 days, stored in DB) }

Client → Any protected endpoint with: Authorization: Bearer <accessToken>
       ← JwtAuthFilter validates, sets SecurityContext

Client → POST /api/v1/auth/refresh { refreshToken }
       ← New accessToken + new refreshToken (old one revoked)

Client → POST /api/v1/auth/logout
       ← All refresh tokens for user revoked in DB
```

### Database Architecture
- **Dev:** H2 in-memory, schema via Flyway migrations
- **Prod:** PostgreSQL, same Flyway migrations apply
- All tables created by Flyway V1–V5 (never use ddl-auto=create)
- `spring.jpa.hibernate.ddl-auto=validate` — Hibernate only validates

### Image Storage
- Dev (no Cloudinary keys): saves to `src/main/resources/static/assets/uploads/`
- Prod (CLOUDINARY_API_KEY set): uploads to Cloudinary CDN
- Detection: `ImageStorageService.isCloudinaryConfigured()` checks API key

---

## 5. Completed Work Checklist

### Foundation
- [x] Java 21 + Spring Boot 3.2.2 project setup
- [x] Maven wrapper bundled (`.mvn/wrapper/`)
- [x] Proper package structure (api/domain/service/security/config/exception/infrastructure)
- [x] Environment-variable-based configuration (`application.properties`)
- [x] Dev profile (H2) + Prod profile (`application-prod.properties`)
- [x] Flyway database migrations (V1–V5)

### Database Schema
- [x] V1: roles, users, user_roles, refresh_tokens tables + indexes
- [x] V2: animals, animal_images tables + indexes
- [x] V3: adoption_requests table + indexes
- [x] V4: Demo data seeded (admin, aayush, manthan + 3 animals)
- [x] V5: news_articles table + 8 articles from original content + animal images

### Security / Auth
- [x] BCrypt password hashing
- [x] JWT access token generation (JwtService)
- [x] JWT validation filter (JwtAuthFilter — OncePerRequestFilter)
- [x] Refresh token DB storage + rotation
- [x] Logout = revoke all refresh tokens
- [x] RBAC: ROLE_USER, ROLE_ADMIN, ROLE_VOLUNTEER
- [x] CORS configured for React frontend (localhost:3000, localhost:5173)
- [x] Stateless session (no HttpSession)
- [x] POST /api/v1/auth/register
- [x] POST /api/v1/auth/login
- [x] POST /api/v1/auth/refresh
- [x] POST /api/v1/auth/logout

### Animal Module
- [x] Animal entity with full fields (name, category, breed, age, gender, health, etc.)
- [x] AnimalImage entity (multi-image support)
- [x] GET /api/v1/animals (paginated, filterable by category)
- [x] GET /api/v1/animals/{id}
- [x] GET /api/v1/animals/stats
- [x] POST /api/v1/animals (create — authenticated)
- [x] PUT /api/v1/animals/{id} (update — owner or admin)
- [x] DELETE /api/v1/animals/{id} (delete — owner or admin)
- [x] POST /api/v1/animals/{id}/images (upload image)
- [x] POST /api/v1/animals/{id}/adopt (submit adoption request)
- [x] GET /api/v1/animals/my-listings
- [x] GET /api/v1/animals/my-adoptions

### Adoption Module
- [x] AdoptionRequest entity with full workflow fields
- [x] Submit adoption request (PENDING)
- [x] Review: APPROVE or REJECT (ADMIN/VOLUNTEER)
- [x] Cancel pending request (requester)
- [x] GET /api/v1/adoptions/my
- [x] GET /api/v1/adoptions (admin — filterable by status)
- [x] PUT /api/v1/adoptions/{id}/review

### News Module
- [x] NewsArticle entity (title, summary, content, imageUrl, category, tags)
- [x] 8 articles seeded from original Angular project news1-8 images
- [x] Original Pyaar Foundation testimonial preserved
- [x] GET /api/v1/news/featured (homepage carousel)
- [x] GET /api/v1/news (paginated)
- [x] GET /api/v1/news/{id}
- [x] GET /api/v1/news/category/{category}

### User Module
- [x] User entity with email, roles, accountLocked
- [x] GET /api/v1/users/me (profile + stats)

### Infrastructure
- [x] GlobalExceptionHandler (@RestControllerAdvice)
- [x] Consistent ApiResponse wrapper {success, message, data, timestamp}
- [x] PagedResponse wrapper
- [x] ImageStorageService (Cloudinary + local fallback)
- [x] OpenAPI/Swagger at /swagger-ui.html
- [x] All existing assets copied to static/assets/ with proper names

### Assets Preserved
- [x] 12 stray animal photos (stray1-12.jpg) → /assets/stray_animals/
- [x] 8 news images (news1-8) → /assets/news/
- [x] About Us images → /assets/about/
- [x] Welfare campaign images → /assets/welfare/
- [x] Hero images → /assets/hero/

---

## 6. Pending Tasks (Priority Order)

### Priority 1 — React Frontend (Immediate)
| Task | Complexity | Notes |
|------|-----------|-------|
| React + Vite + Tailwind + shadcn/ui setup | Low | `npm create vite@latest` |
| Axios API client with JWT interceptor | Medium | Auto-attach Bearer token, handle 401 refresh |
| Auth pages: Login, Register | Low | Use existing API |
| Home page with news carousel | Medium | Use /api/v1/news/featured + existing news images |
| Animal listing page (cards, filter, pagination) | Medium | Use /api/v1/animals |
| Animal detail page | Low | Use /api/v1/animals/{id} |
| Post Animal form (multi-image upload) | Medium | Multipart form |
| My Contributions dashboard | Medium | Use /my-listings + /my-adoptions |
| Adoption request submission + status | Medium | Use /api/v1/animals/{id}/adopt |

### Priority 2 — Admin Panel
| Task | Complexity | Notes |
|------|-----------|-------|
| Admin dashboard with stats | Low | /api/v1/animals/stats |
| Adoption request review UI | Medium | PUT /api/v1/adoptions/{id}/review |
| User management | Medium | Need admin user list API (not built yet) |
| Animal moderation | Low | Reuse animal CRUD |

### Priority 3 — Production Readiness
| Task | Complexity | Notes |
|------|-----------|-------|
| Docker + docker-compose | Low | Spring Boot + PostgreSQL + React |
| Switch to PostgreSQL | Low | Change app properties, run Flyway on real DB |
| Cloudinary integration test | Low | Set env vars, test image upload |
| GitHub Actions CI/CD | Medium | Build + test on PR |
| Integration tests | Medium | Spring Boot test with H2 |
| Password reset flow | Medium | Email service needed |
| Email verification | Medium | Email service needed |
| Saved animals feature | Low | New entity + API endpoint |

---

## 7. Current Working Branch

**Branch:** `master`
**Remote:** https://github.com/aayushsaw/Animal_Welfare_and_Wellness

**Status at handover:** All new architecture code committed in logical groups (see Section 18 — Commit History).

### What was committed (in order)
1. `chore(config): add .env.example template and update .gitignore`
2. `refactor(arch): remove Thymeleaf MVC layer — migrate to REST API architecture`
3. `feat(domain): add entity models and JPA repositories`
4. `feat(security): implement JWT authentication with refresh token rotation`
5. `feat(config): add Cloudinary image storage and OpenAPI configuration`
6. `feat(exception): add global exception handler and custom exception types`
7. `feat(infrastructure): add image storage service with Cloudinary and local fallback`
8. `feat(service): implement all business logic services`
9. `feat(api): implement REST controllers and request/response DTOs`
10. `feat(db): add Flyway migrations V1-V5 and database configuration`
11. `feat(assets): preserve all original project images in static resources`
12. `docs(handover): add AI handover document and update README`

---

## 8. Known Issues

| Issue | Severity | Notes |
|-------|---------|-------|
| Lombok not working on Java 25 | Low | All entities use explicit getters/setters. Lombok is removed from pom.xml. Do not add it back without testing annotation processing first. |
| MapStruct removed | Low | Was declared but caused Java 25 TypeTag crash. Removed. Manual mapping used. |
| `com.sun.tools.javac.code.TypeTag :: UNKNOWN` | Fixed | Was MapStruct annotation processor incompatibility with Java 25 |
| Old controller/dto/model packages deleted | Fixed | Replaced by new domain/* api/* structure |
| Partial unique index in V3 migration | Fixed | H2 doesn't support partial indexes. Removed, business logic handles duplicates in service. |
| java.version in pom = 21 but runtime = 25 | Known | Java 25 is backwards-compatible. Source/target set to 21. Works fine. |
| Thymeleaf still in dependency | Needs fix | Remove it — we are API-first now, no server-side templates needed |

---

## 9. Important Architectural Decisions

| Decision | Reason |
|---------|--------|
| **JWT over sessions** | React frontend needs stateless auth. Sessions don't work across CORS. JWT enables mobile/React/SPA clients without coupling. |
| **Refresh tokens in DB** | Enables logout (revocation). Stateless refresh = no way to invalidate. Stored refresh tokens = security without sacrificing UX. |
| **Cloudinary over S3** | Simpler setup for portfolio/demo. Built-in image transformations (resize, quality auto, format auto). Free tier sufficient. No IAM complexity. |
| **PostgreSQL over MySQL** | Better JSON support for future, better indexing, open source, standard SQL. H2 used for dev to remove external dependency. |
| **Flyway over ddl-auto** | Migrations are versioned, reproducible, and safe in production. `create-drop` was destroying data on restart — unacceptable. |
| **Thymeleaf removed** | Tight coupling to server-side rendering blocks React migration. API-first design allows any frontend without backend changes. |
| **Partial index removed** | H2 doesn't support `WHERE status = 'PENDING'` partial indexes. Business logic in `AdoptionService` prevents duplicates instead. |
| **`proc=none` in compiler** | Annotation processors (Lombok, MapStruct) crash on Java 25. `proc=none` disables them. Explicit getters/setters used instead. |
| **Existing assets reused** | Original 12 animal photos + 8 news images are real project assets with history. Replacing them with stock photos would lose the project's identity. |

---

## 10. Existing Assets Usage

### Location
```
animal-welfare-java/src/main/resources/static/assets/
├── stray_animals/     stray1.jpg through stray12.jpg  ← Original 12 adoption animals
├── news/              news1.jpg through news8.jpg/PNG  ← Original welfare news carousel
├── about/             about-us-team.jpg, about-us-mission.jpg
├── welfare/           animal-welfare-campaign-1/2/3.jpg
└── hero/              adopt-animal-hero.jpg, stray-dog-hero.jpg
```

### Usage Map
| Asset | Where Used |
|-------|-----------|
| `/assets/stray_animals/stray1-12.jpg` | Seeded as AnimalImage records in V5 migration. Displayed on animal listing/detail pages. |
| `/assets/news/news1.jpg` | NewsArticle #1 — "Community Comes Together for Buffalo Rescue" |
| `/assets/news/news2.PNG` | NewsArticle #2 — "Vaccination Camp" |
| `/assets/news/news3.PNG` | NewsArticle #3 — "Adoption Success Story" |
| `/assets/news/news4.PNG` | NewsArticle #4 — "NGO Partnership" |
| `/assets/news/news5.PNG` | NewsArticle #5 — "Awareness Campaign" |
| `/assets/news/news6.PNG` | NewsArticle #6 — "World Animal Day" (featured) |
| `/assets/news/news7.PNG` | NewsArticle #7 — "5 Kittens Rescued" |
| `/assets/news/news8.jpg` | NewsArticle #8 — "Volunteer Spotlight" |
| `/assets/about/` | About Us page — team photo + mission image |
| `/assets/hero/` | Home page hero section images |
| `/assets/welfare/` | Awareness campaign banners |

### Rules for Next AI
- **DO NOT replace** stray1-12.jpg with stock photos — they are the original project animals
- **DO NOT replace** news images — they represent real welfare events
- Original testimonial text ("Pyaar Foundation: I diptish s dhongade...") is preserved in NewsArticle #1
- All images served as Spring Boot static resources at `/assets/**` path

---

## 11. Database Documentation

### Entity Relationships
```
users (1) ──────────────── (M) user_roles ──── (M) roles
users (1) ──────────────── (M) animals [posted_by_id]
users (1) ──────────────── (M) adoption_requests [requester_id]
users (1) ──────────────── (M) adoption_requests [reviewer_id]
users (1) ──────────────── (M) refresh_tokens
animals (1) ─────────────── (M) animal_images
animals (1) ─────────────── (M) adoption_requests
```

### Migration History
| Version | Description |
|---------|-------------|
| V1 | roles, users, user_roles, refresh_tokens + seed roles |
| V2 | animals, animal_images + indexes |
| V3 | adoption_requests + indexes |
| V4 | Demo data: admin/aayush/manthan users + 3 animals (Bruno, Whiskers, Max) |
| V5 | news_articles table + 8 seeded articles + link animal images to stray photos |

### Demo Credentials (password: `password123` for all)
- `admin` / `password123` — has ROLE_ADMIN + ROLE_USER
- `aayush` / `password123` — has ROLE_USER
- `manthan` / `password123` — has ROLE_USER

---

## 12. API Documentation

**Swagger UI:** http://localhost:8080/swagger-ui.html
**OpenAPI JSON:** http://localhost:8080/api-docs

### Key Endpoints
```
POST /api/v1/auth/register          { firstName, lastName, username, email, password }
POST /api/v1/auth/login             { username, password }
POST /api/v1/auth/refresh           { refreshToken }
POST /api/v1/auth/logout            (Bearer token required)

GET  /api/v1/animals                ?category=DOG&page=0&size=12
GET  /api/v1/animals/{id}
GET  /api/v1/animals/stats
POST /api/v1/animals                (Bearer) { name, category, breed, location, ... }
PUT  /api/v1/animals/{id}           (Bearer, owner/admin)
DELETE /api/v1/animals/{id}         (Bearer, owner/admin)
POST /api/v1/animals/{id}/images    (Bearer, multipart/form-data, field: "image")
POST /api/v1/animals/{id}/adopt     (Bearer) { message }
GET  /api/v1/animals/my-listings    (Bearer)
GET  /api/v1/animals/my-adoptions   (Bearer)

GET  /api/v1/adoptions/my           (Bearer)
DELETE /api/v1/adoptions/{id}/cancel (Bearer)
GET  /api/v1/adoptions              (ADMIN/VOLUNTEER) ?status=PENDING
PUT  /api/v1/adoptions/{id}/review  (ADMIN/VOLUNTEER) { decision: "APPROVED"|"REJECTED", reviewNote }

GET  /api/v1/news/featured
GET  /api/v1/news                   ?page=0&size=9
GET  /api/v1/news/{id}
GET  /api/v1/news/category/{cat}

GET  /api/v1/users/me               (Bearer)
```

### Response Format
```json
{ "success": true, "message": "...", "data": {...}, "timestamp": "..." }
```

---

## 13. Environment Configuration

### Required Environment Variables

| Variable | Default (dev) | Required for Prod | Description |
|----------|--------------|-------------------|-------------|
| `SERVER_PORT` | 8080 | No | Server port |
| `DB_URL` | `jdbc:h2:mem:animalwelfaredb` | Yes | JDBC connection URL |
| `DB_DRIVER` | `org.h2.Driver` | Yes | JDBC driver class |
| `DB_USERNAME` | `sa` | Yes | Database username |
| `DB_PASSWORD` | *(empty)* | Yes | Database password |
| `JWT_SECRET` | Long hardcoded string | **Yes — change it** | Min 256-bit key for HS256 |
| `JWT_EXPIRATION_MS` | `900000` (15 min) | No | Access token TTL |
| `JWT_REFRESH_EXPIRATION_MS` | `604800000` (7 days) | No | Refresh token TTL |
| `CLOUDINARY_CLOUD_NAME` | `demo` | Yes (for uploads) | Cloudinary account name |
| `CLOUDINARY_API_KEY` | *(empty)* | Yes (for uploads) | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | *(empty)* | Yes (for uploads) | Cloudinary API secret |
| `H2_CONSOLE_ENABLED` | `true` | No (set false in prod) | H2 web console |

### .env.example (create this file for contributors)
```properties
DB_URL=jdbc:postgresql://localhost:5432/animalwelfaredb
DB_DRIVER=org.postgresql.Driver
DB_USERNAME=postgres
DB_PASSWORD=yourpassword
JWT_SECRET=YourVeryLongSecretKeyThatIsAtLeast256BitsForHS256AlgorithmSecurity
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
H2_CONSOLE_ENABLED=false
```

### Local Development Setup
```bash
# 1. Clone
git clone https://github.com/aayushsaw/Animal_Welfare_and_Wellness.git
cd Animal_Welfare_and_Wellness/animal-welfare-java

# 2. Run (H2 in-memory, no setup needed)
.mvn\wrapper\maven\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run

# 3. Verify
curl http://localhost:8080/api/v1/animals/stats
# Expected: {"success":true,"message":"Success","data":{"available":3,"adopted":0,"total":3},...}

# 4. Swagger UI
# Open: http://localhost:8080/swagger-ui.html

# 5. H2 Console
# Open: http://localhost:8080/h2-console
# JDBC URL: jdbc:h2:mem:animalwelfaredb
# Username: sa  Password: (empty)
```

---

## 14. Deployment Information

### Docker Setup (Not yet created — Priority 3)
```yaml
# docker-compose.yml to be created
services:
  api:
    build: ./animal-welfare-java
    ports: ["8080:8080"]
    environment:
      - DB_URL=jdbc:postgresql://db:5432/animalwelfaredb
      - DB_USERNAME=postgres
      - DB_PASSWORD=secret
      - JWT_SECRET=changeme
    depends_on: [db]
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: animalwelfaredb
      POSTGRES_PASSWORD: secret
  frontend:
    build: ./animal-welfare-frontend  # not created yet
    ports: ["3000:3000"]
```

### Production Profile
- Set `SPRING_PROFILES_ACTIVE=prod`
- `application-prod.properties` uses PostgreSQL, disables H2 console
- Flyway runs automatically on startup

---

## 15. GitHub Repository

**URL:** https://github.com/aayushsaw/Animal_Welfare_and_Wellness
**Branch:** `master`
**Branch Strategy:**
- `master` — stable, working code only
- Feature branches: `feat/react-frontend`, `feat/admin-panel`, etc.
- Never commit directly to master for new features — use PRs

---

## 16. Next 10 Recommended Steps (Execution Order)

| # | Task | Status | Command/Notes |
|---|------|--------|---------------|
| 1 | ~~Remove Thymeleaf dependency from pom.xml~~ | ✅ Done | Already removed — pom.xml is clean |
| 2 | ~~Create `.env.example` file~~ | ✅ Done | `.env.example` committed at root |
| 3 | Initialize React frontend | ❌ TODO | `npm create vite@latest animal-welfare-frontend -- --template react-ts` |
| 4 | Build React API client | ❌ TODO | Axios + JWT interceptor + auto-refresh on 401 |
| 5 | Build Login + Register pages | ❌ TODO | Use `/api/v1/auth/login` and `/register` |
| 6 | Build Home page | ❌ TODO | News carousel using `/api/v1/news/featured` + existing news images |
| 7 | Build Animal listing page | ❌ TODO | Cards with filter, pagination using `/api/v1/animals` |
| 8 | Build Post Animal form | ❌ TODO | Multi-image upload, uses `/api/v1/animals` POST |
| 9 | Build My Contributions dashboard | ❌ TODO | `/api/v1/animals/my-listings` + `/my-adoptions` |
| 10 | Create docker-compose.yml | ❌ TODO | Spring Boot + PostgreSQL + React |

---

## 17. Instructions For the Next AI Agent

### Files You Must NOT Modify
- `src/main/resources/db/migration/V1__*.sql` through `V5__*.sql` — migrations are immutable once applied
- `src/main/resources/static/assets/` — all original project images, do not replace
- `domain/model/*.java` — entities match the database schema exactly

### Architecture Rules to Follow
1. **NEVER expose entities directly** in API responses — always use Response DTOs
2. **NEVER use `@Transactional` in controllers** — only in services
3. **NEVER use `ddl-auto=create` or `create-drop`** — Flyway manages schema
4. **ALL new features get a Flyway migration** if they need schema changes
5. **ALL new endpoints must follow** `ApiResponse<T>` wrapper pattern
6. **ALL exceptions must be handled** by `GlobalExceptionHandler` — no raw exceptions to clients
7. **Lombok is disabled** (`proc=none`) — write explicit getters/setters
8. **MapStruct is removed** — write manual mapping in static factory methods

### Naming Conventions
- Controllers: `*ApiController.java` in `api/controller/`
- Request DTOs: `*Request.java` in `api/dto/{module}/`
- Response DTOs: `*Response.java` in `api/dto/{module}/`
- Services: `*Service.java` in `service/`
- Entities: plain name in `domain/model/`
- Repositories: `*Repository.java` in `domain/repository/`
- URL pattern: `/api/v1/{resource}/{action}`

### Existing Patterns to Maintain
```java
// Service pattern
@Transactional(readOnly = true)
public AnimalResponse getById(Long id) {
    Animal animal = animalRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Animal", id));
    return AnimalResponse.from(animal);
}

// Controller pattern
@GetMapping("/{id}")
public ResponseEntity<ApiResponse<AnimalResponse>> getAnimal(@PathVariable Long id) {
    return ResponseEntity.ok(ApiResponse.success(animalService.getById(id)));
}
```

### UI/UX Rules (for React frontend)
- **Color palette:** Forest Green (#2D6A4F), Sage Green (#74C69D), Earth Brown (#8B5E3C), Warm Cream (#FFF8F0), Soft Orange (#F4A261)
- **Do NOT use:** neon gradients, generic blue corporate themes, typical AI dashboard templates
- **Design feel:** Modern NGO platform — warm, trustworthy, compassionate
- **Reuse existing assets** for hero sections and news — do not replace with stock photos
- **Mobile-first** responsive layout

### Areas Requiring Caution
- Java 25 + annotation processors crash — do not add Lombok/MapStruct without testing
- H2 partial unique indexes not supported — use service-layer duplicate checks instead
- `JwtAuthFilter` catches all exceptions silently — if auth is broken, check this filter first
- Flyway migrations are append-only — never edit existing V*.sql files
- `AnimalService.assertCanModify()` queries DB for roles — this is intentional for security

### Git Commit Message Format
```
feat(module): description
fix(module): description
refactor(module): description
docs(module): description
chore(config): description
test(module): description
style(ui): description
```

---

## 18. Commit History Summary

| Hash | Message | What it covers |
|------|---------|----------------|
| `8255dbe` | Convert Angular project to full-stack Java Spring Boot application | Initial migration scaffold — Thymeleaf MVC era |
| `0fabe0d` | Remove all bhootdaya references, rebrand to Animal Welfare and Wellness | Renamed classes, packages, config |
| (new) | `chore(config): add .env.example and update .gitignore` | Secrets template, .env ignored, Maven zip ignored |
| (new) | `refactor(arch): remove Thymeleaf MVC layer` | Deletes old controller/, dto/, model/, service/, templates/ |
| (new) | `feat(domain): add entity models and JPA repositories` | 7 entities + 6 repositories in domain/model and domain/repository |
| (new) | `feat(security): implement JWT auth with refresh token rotation` | JwtService, JwtAuthFilter, UserDetailsServiceImpl |
| (new) | `feat(config): add Cloudinary and OpenAPI configuration` | CloudinaryConfig, OpenApiConfig, updated SecurityConfig |
| (new) | `feat(exception): add global exception handler` | GlobalExceptionHandler + 3 custom exception types |
| (new) | `feat(infrastructure): add image storage service` | Cloudinary + local filesystem fallback |
| (new) | `feat(service): implement all business logic services` | AuthService, AnimalService, AdoptionService, NewsService |
| (new) | `feat(api): implement REST controllers and DTOs` | 5 controllers + all request/response DTOs + ApiResponse/PagedResponse |
| (new) | `feat(db): add Flyway migrations V1-V5` | Schema creation + seed data |
| (new) | `feat(assets): preserve original project images` | stray1-12, news1-8, hero, about, welfare images |
| (new) | `docs(handover): add AI handover document and update README` | AI_HANDOVER.md + README.md |

---

*Document last updated: 2026-07-06*
*Backend status: RUNNING ✅ | Frontend: NOT STARTED ❌ | Docker: NOT STARTED ❌*
